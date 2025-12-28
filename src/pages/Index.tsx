import React, { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import EfficientFrontierChart from '@/components/EfficientFrontierChart';
import TOPSISLeaderboard from '@/components/TOPSISLeaderboard';
import WeightSliders from '@/components/WeightSliders';
import SimulationControls from '@/components/SimulationControls';
import StatsCard from '@/components/StatsCard';
import MarketIndices from '@/components/MarketIndices';
import { 
  getPortfolios, 
  calculateTOPSIS, 
  exportData,
  PortfolioPoint 
} from '@/services/simulationService';
import { 
  BarChart3, 
  TrendingUp, 
  Shield, 
  Sparkles, 
  Zap,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  // Portfolio data
  const portfolios = useMemo(() => getPortfolios(), []);
  
  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [windowSize, setWindowSize] = useState(20);
  const [enabledModels, setEnabledModels] = useState([
    'M1', 'M3', 'M6', 'M7_Cloud', 'M7_Best'
  ]);
  
  // TOPSIS weights
  const [weights, setWeights] = useState({
    return: 0.4,
    variance: 0.3,
    entropy: 0.3,
  });
  
  // Calculate rankings based on weights
  const rankings = useMemo(() => {
    return calculateTOPSIS(portfolios, weights);
  }, [portfolios, weights]);
  
  // Filtered portfolios
  const filteredPortfolios = useMemo(() => {
    return portfolios.filter(p => enabledModels.includes(p.model));
  }, [portfolios, enabledModels]);
  
  // Stats calculations
  const stats = useMemo(() => {
    const m7Best = portfolios.filter(p => p.model === 'M7_Best');
    const m1 = portfolios.filter(p => p.model === 'M1');
    
    const avgM7Return = m7Best.reduce((a, b) => a + b.return, 0) / m7Best.length;
    const avgM1Return = m1.reduce((a, b) => a + b.return, 0) / m1.length;
    const avgM7Var = m7Best.reduce((a, b) => a + b.variance, 0) / m7Best.length;
    const avgM1Var = m1.reduce((a, b) => a + b.variance, 0) / m1.length;
    
    return {
      totalPortfolios: portfolios.length,
      m7Advantage: ((avgM7Return - avgM1Return) / Math.abs(avgM1Return) * 100),
      riskReduction: ((avgM1Var - avgM7Var) / avgM1Var * 100),
      topScore: rankings[0]?.topsisScore || 0,
      bestModel: rankings[0]?.model || 'M7_Best',
    };
  }, [portfolios, rankings]);
  
  // Handlers
  const handleToggleModel = useCallback((model: string) => {
    setEnabledModels(prev => 
      prev.includes(model) 
        ? prev.filter(m => m !== model)
        : [...prev, model]
    );
  }, []);
  
  const handleExport = useCallback((format: 'json' | 'csv') => {
    const data = exportData(filteredPortfolios, format);
    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuzzyfolio_${portfolios.length}_portfolios.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Export ${format.toUpperCase()} réussi`, {
      description: `${filteredPortfolios.length} portefeuilles exportés`
    });
  }, [filteredPortfolios, portfolios.length]);
  
  const handleStart = useCallback(() => {
    setIsRunning(prev => !prev);
    if (!isRunning) {
      toast.info('Simulation démarrée', {
        description: 'Génération des portefeuilles en cours...'
      });
    }
  }, [isRunning]);
  
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setWeights({ return: 0.4, variance: 0.3, entropy: 0.3 });
    setEnabledModels(['M1', 'M3', 'M6', 'M7_Cloud', 'M7_Best']);
    toast.success('Réinitialisation effectuée');
  }, []);

  return (
    <>
      <Helmet>
        <title>FuzzyFolio AI - Fuzzy Entropy Portfolio Optimization</title>
        <meta name="description" content="Advanced quantitative finance dashboard implementing fuzzy entropy portfolio optimization methodology from Bonacic et al. 2024" />
      </Helmet>
      
      <div className="min-h-screen bg-background ambient-glow">
        <Header />
        
        <main className="container mx-auto px-4 py-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Portefeuilles Générés"
              value={stats.totalPortfolios.toLocaleString()}
              subtitle="Massive Grid Search"
              icon={BarChart3}
              color="hsl(var(--primary))"
            />
            <StatsCard
              title="Avantage M7"
              value={`+${stats.m7Advantage.toFixed(1)}%`}
              subtitle="vs Markowitz"
              icon={TrendingUp}
              color="hsl(var(--success))"
              trend={{ value: stats.m7Advantage, isPositive: true }}
              glowing
            />
            <StatsCard
              title="Réduction Risque"
              value={`-${stats.riskReduction.toFixed(1)}%`}
              subtitle="Volatilité"
              icon={Shield}
              color="hsl(var(--warning))"
            />
            <StatsCard
              title="Score TOPSIS"
              value={stats.topScore.toFixed(2)}
              subtitle={stats.bestModel.replace('_', ' ')}
              icon={Target}
              color="hsl(var(--success))"
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Efficient Frontier Chart - Main */}
            <div className="xl:col-span-3 glass-card p-4 min-h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-success" />
                    Efficient Frontier Lab
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {filteredPortfolios.length.toLocaleString()} points • Survol pour détails
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium">
                  <Zap className="w-3 h-3" />
                  M7 Dominance
                </div>
              </div>
              
              <div className="h-[520px]">
                <EfficientFrontierChart 
                  portfolios={filteredPortfolios}
                  enabledModels={enabledModels}
                />
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Simulation Controls */}
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Simulation Core
                </h3>
                <SimulationControls
                  isRunning={isRunning}
                  progress={{ current: portfolios.length, total: 40000 }}
                  enabledModels={enabledModels}
                  windowSize={windowSize}
                  onToggleModel={handleToggleModel}
                  onWindowSizeChange={setWindowSize}
                  onStart={handleStart}
                  onReset={handleReset}
                  onExport={handleExport}
                />
              </div>

              {/* Market Indices */}
              <div className="glass-card p-4">
                <MarketIndices />
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* TOPSIS Weights */}
            <div className="glass-card p-5">
              <WeightSliders 
                weights={weights}
                onWeightsChange={setWeights}
              />
            </div>

            {/* TOPSIS Leaderboard */}
            <div className="lg:col-span-2 glass-card p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Classement TOPSIS
                <span className="ml-auto text-xs text-muted-foreground font-normal">
                  Temps réel
                </span>
              </h3>
              <TOPSISLeaderboard rankings={rankings} />
            </div>
          </div>

          {/* Footer Attribution */}
          <footer className="mt-8 py-6 border-t border-border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
              <div>
                Basé sur <span className="text-foreground font-medium">"A Fuzzy Entropy Approach for Portfolio Selection"</span>
                <br className="sm:hidden" />
                <span className="hidden sm:inline"> — </span>
                Bonacic, López-Ospina, Bravo & Pérez (Mathematics, 2024)
              </div>
              <div className="flex items-center gap-4">
                <span>Données: Yahoo Finance</span>
                <span>•</span>
                <span>Période: 2003-2023</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
};

export default Index;
