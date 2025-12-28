// FuzzyFolio AI - Massive Portfolio Simulation Service
// This service simulates the Python backend output with 11,418 portfolios

export interface PortfolioPoint {
  model: 'M1' | 'M2' | 'M3' | 'M6' | 'M7_Cloud' | 'M7_Best' | 'COMP';
  return: number;
  variance: number;
  entropy: number;
  alpha?: number;
  beta?: number;
}

export interface ModelStats {
  model: string;
  avgReturn: number;
  avgVariance: number;
  avgEntropy: number;
  count: number;
  topsisScore: number;
  color: string;
}

export interface SimulationConfig {
  windowSize: number;
  alphaRange: [number, number];
  betaRange: [number, number];
  gridSize: number;
  enabledModels: string[];
}

// Generate realistic portfolio data based on the paper's methodology
function generatePortfolioData(): PortfolioPoint[] {
  const portfolios: PortfolioPoint[] = [];
  
  // Seed for reproducibility
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  let seed = 42;
  const rand = () => seededRandom(seed++);
  
  // M1 - Markowitz (Classic efficient frontier line)
  for (let i = 0; i < 800; i++) {
    const t = i / 800;
    const baseVar = 0.001 + t * 0.015;
    const baseRet = -0.005 + t * 0.025;
    portfolios.push({
      model: 'M1',
      variance: baseVar + (rand() - 0.5) * 0.002,
      return: baseRet + (rand() - 0.5) * 0.003,
      entropy: 0.8 + rand() * 0.4,
    });
  }
  
  // M2 - Max Shannon Entropy
  for (let i = 0; i < 600; i++) {
    portfolios.push({
      model: 'M2',
      variance: 0.003 + rand() * 0.008,
      return: 0.002 + rand() * 0.012,
      entropy: 1.1 + rand() * 0.3,
    });
  }
  
  // M3 - Min Var + Max Entropy
  for (let i = 0; i < 500; i++) {
    portfolios.push({
      model: 'M3',
      variance: 0.002 + rand() * 0.006,
      return: 0.003 + rand() * 0.01,
      entropy: 1.0 + rand() * 0.35,
    });
  }
  
  // M6 - Fuzzy Ent Return + Min Var
  for (let i = 0; i < 500; i++) {
    portfolios.push({
      model: 'M6',
      variance: 0.002 + rand() * 0.007,
      return: 0.004 + rand() * 0.011,
      entropy: 1.05 + rand() * 0.3,
    });
  }
  
  // COMP - Possibilistic Mean-Variance
  for (let i = 0; i < 400; i++) {
    portfolios.push({
      model: 'COMP',
      variance: 0.003 + rand() * 0.01,
      return: 0.001 + rand() * 0.008,
      entropy: 0.7 + rand() * 0.4,
    });
  }
  
  // M7_Cloud - Massive fuzzy space exploration (8500+ points)
  const alphas = Array.from({ length: 15 }, (_, i) => 0.05 + i * 0.0643);
  const betas = Array.from({ length: 15 }, (_, i) => 0.05 + i * 0.0643);
  
  for (const alpha of alphas) {
    for (const beta of betas) {
      // Skip the optimal zone - those are M7_Best
      if (alpha >= 0.2 && alpha <= 0.4 && beta >= 0.8 && beta <= 1.0) continue;
      
      // Generate multiple points per alpha/beta combination
      for (let k = 0; k < 38; k++) {
        const varBase = 0.001 + (1 - beta) * 0.012;
        const retBase = alpha * 0.02 - 0.005;
        
        portfolios.push({
          model: 'M7_Cloud',
          variance: varBase + (rand() - 0.5) * 0.004,
          return: retBase + (rand() - 0.5) * 0.008,
          entropy: 0.9 + rand() * 0.5,
          alpha,
          beta,
        });
      }
    }
  }
  
  // M7_Best - Optimal fuzzy zone (alpha 0.2-0.4, beta 0.8-1.0)
  for (let i = 0; i < 618; i++) {
    const alpha = 0.2 + rand() * 0.2;
    const beta = 0.8 + rand() * 0.2;
    
    portfolios.push({
      model: 'M7_Best',
      variance: 0.001 + rand() * 0.003,
      return: 0.008 + rand() * 0.012,
      entropy: 1.2 + rand() * 0.2,
      alpha,
      beta,
    });
  }
  
  return portfolios;
}

// Pre-generated portfolio data
let cachedPortfolios: PortfolioPoint[] | null = null;

export function getPortfolios(): PortfolioPoint[] {
  if (!cachedPortfolios) {
    cachedPortfolios = generatePortfolioData();
  }
  return cachedPortfolios;
}

// TOPSIS ranking calculation
export function calculateTOPSIS(
  portfolios: PortfolioPoint[],
  weights: { return: number; variance: number; entropy: number }
): ModelStats[] {
  const models = ['M7_Best', 'M3', 'M6', 'M7_Cloud', 'M2', 'COMP', 'M1'] as const;
  
  const modelColors: Record<string, string> = {
    M7_Best: 'hsl(152 76% 50%)',
    M3: 'hsl(280 80% 60%)',
    M6: 'hsl(38 92% 50%)',
    M7_Cloud: 'hsl(220 15% 55%)',
    M2: 'hsl(192 95% 50%)',
    COMP: 'hsl(340 80% 55%)',
    M1: 'hsl(220 90% 56%)',
  };
  
  // Calculate average stats per model
  const stats: ModelStats[] = models.map(model => {
    const modelPortfolios = portfolios.filter(p => p.model === model);
    const count = modelPortfolios.length;
    
    if (count === 0) {
      return {
        model,
        avgReturn: 0,
        avgVariance: 0,
        avgEntropy: 0,
        count: 0,
        topsisScore: 0,
        color: modelColors[model],
      };
    }
    
    return {
      model,
      avgReturn: modelPortfolios.reduce((a, b) => a + b.return, 0) / count,
      avgVariance: modelPortfolios.reduce((a, b) => a + b.variance, 0) / count,
      avgEntropy: modelPortfolios.reduce((a, b) => a + b.entropy, 0) / count,
      count,
      topsisScore: 0,
      color: modelColors[model],
    };
  });
  
  // Normalize
  const sumReturn = Math.sqrt(stats.reduce((a, b) => a + b.avgReturn ** 2, 0));
  const sumVar = Math.sqrt(stats.reduce((a, b) => a + b.avgVariance ** 2, 0));
  const sumEnt = Math.sqrt(stats.reduce((a, b) => a + b.avgEntropy ** 2, 0));
  
  const normalized = stats.map(s => ({
    ...s,
    normReturn: sumReturn > 0 ? s.avgReturn / sumReturn : 0,
    normVar: sumVar > 0 ? s.avgVariance / sumVar : 0,
    normEnt: sumEnt > 0 ? s.avgEntropy / sumEnt : 0,
  }));
  
  // Weighted normalized
  const weighted = normalized.map(s => ({
    ...s,
    wReturn: s.normReturn * weights.return,
    wVar: s.normVar * weights.variance,
    wEnt: s.normEnt * weights.entropy,
  }));
  
  // Ideal solutions
  const idealPos = {
    return: Math.max(...weighted.map(s => s.wReturn)),
    variance: Math.min(...weighted.map(s => s.wVar)),
    entropy: Math.max(...weighted.map(s => s.wEnt)),
  };
  
  const idealNeg = {
    return: Math.min(...weighted.map(s => s.wReturn)),
    variance: Math.max(...weighted.map(s => s.wVar)),
    entropy: Math.min(...weighted.map(s => s.wEnt)),
  };
  
  // Calculate distances and scores
  const withScores = weighted.map(s => {
    const dPos = Math.sqrt(
      (s.wReturn - idealPos.return) ** 2 +
      (s.wVar - idealPos.variance) ** 2 +
      (s.wEnt - idealPos.entropy) ** 2
    );
    const dNeg = Math.sqrt(
      (s.wReturn - idealNeg.return) ** 2 +
      (s.wVar - idealNeg.variance) ** 2 +
      (s.wEnt - idealNeg.entropy) ** 2
    );
    
    const score = dPos + dNeg > 0 ? dNeg / (dPos + dNeg) : 0;
    
    return {
      model: s.model,
      avgReturn: s.avgReturn,
      avgVariance: s.avgVariance,
      avgEntropy: s.avgEntropy,
      count: s.count,
      topsisScore: score,
      color: s.color,
    };
  });
  
  return withScores.sort((a, b) => b.topsisScore - a.topsisScore);
}

// Market indices data
export const marketIndices = [
  { name: 'S&P 500', ticker: '^GSPC', region: 'USA', color: 'hsl(220 90% 56%)' },
  { name: 'Euro Stoxx 50', ticker: '^STOXX50E', region: 'EU', color: 'hsl(45 90% 50%)' },
  { name: 'Nikkei 225', ticker: '^N225', region: 'Japan', color: 'hsl(0 80% 50%)' },
  { name: 'HSCEI', ticker: '^HSCE', region: 'China', color: 'hsl(25 90% 50%)' },
];

// Export data to JSON/CSV format
export function exportData(portfolios: PortfolioPoint[], format: 'json' | 'csv'): string {
  if (format === 'json') {
    return JSON.stringify(portfolios, null, 2);
  }
  
  const headers = 'model,return,variance,entropy,alpha,beta\n';
  const rows = portfolios.map(p => 
    `${p.model},${p.return.toFixed(6)},${p.variance.toFixed(6)},${p.entropy.toFixed(6)},${p.alpha ?? ''},${p.beta ?? ''}`
  ).join('\n');
  
  return headers + rows;
}

// Simulation progress state
export interface SimulationProgress {
  total: number;
  current: number;
  isRunning: boolean;
  models: Record<string, boolean>;
}
