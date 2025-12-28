import React, { useMemo, useState, memo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { PortfolioPoint } from '@/services/simulationService';

interface EfficientFrontierChartProps {
  portfolios: PortfolioPoint[];
  enabledModels: string[];
}

const modelConfig: Record<string, { color: string; name: string; zIndex: number }> = {
  M7_Cloud: { color: 'hsl(220, 15%, 55%)', name: 'M7 Fuzzy Space', zIndex: 1 },
  M1: { color: 'hsl(220, 90%, 56%)', name: 'Markowitz (M1)', zIndex: 3 },
  M2: { color: 'hsl(192, 95%, 50%)', name: 'Max Entropy (M2)', zIndex: 2 },
  M3: { color: 'hsl(280, 80%, 60%)', name: 'Hybrid (M3)', zIndex: 4 },
  M6: { color: 'hsl(38, 92%, 50%)', name: 'Fuzzy Return (M6)', zIndex: 4 },
  COMP: { color: 'hsl(340, 80%, 55%)', name: 'Comparatif', zIndex: 2 },
  M7_Best: { color: 'hsl(152, 76%, 50%)', name: 'M7 Optimal ⭐', zIndex: 10 },
};

// Max points per model for performance
const MAX_POINTS_PER_MODEL: Record<string, number> = {
  M7_Cloud: 500,  // Heavy reduction for cloud
  M1: 150,
  M2: 100,
  M3: 100,
  M6: 100,
  COMP: 80,
  M7_Best: 150,
};

// Downsample array to max n elements with even distribution
function downsample<T>(arr: T[], maxN: number): T[] {
  if (arr.length <= maxN) return arr;
  const step = arr.length / maxN;
  const result: T[] = [];
  for (let i = 0; i < maxN; i++) {
    result.push(arr[Math.floor(i * step)]);
  }
  return result;
}

const CustomTooltip = memo(({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  
  const data = payload[0].payload;
  const config = modelConfig[data.model];
  
  return (
    <div className="glass-card p-4 min-w-[200px] shadow-xl">
      <div className="flex items-center gap-2 mb-3">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: config?.color }}
        />
        <span className="font-semibold text-sm">{config?.name}</span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Rendement</span>
          <span className="font-mono font-semibold text-success">
            {(data.return * 100).toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Risque (σ²)</span>
          <span className="font-mono font-semibold text-warning">
            {(data.variance * 100).toFixed(3)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Entropie</span>
          <span className="font-mono font-semibold text-primary">
            {data.entropy.toFixed(3)}
          </span>
        </div>
        {data.alpha !== undefined && (
          <div className="flex justify-between pt-2 border-t border-border">
            <span className="text-muted-foreground">α / β</span>
            <span className="font-mono text-accent">
              {data.alpha.toFixed(2)} / {data.beta?.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

CustomTooltip.displayName = 'CustomTooltip';

function EfficientFrontierChart({ portfolios, enabledModels }: EfficientFrontierChartProps) {
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);
  
  // Group and downsample data for performance
  const { groupedData, sortedModels } = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    // First group by model
    const tempGroups: Record<string, PortfolioPoint[]> = {};
    for (const p of portfolios) {
      if (!enabledModels.includes(p.model)) continue;
      if (!tempGroups[p.model]) tempGroups[p.model] = [];
      tempGroups[p.model].push(p);
    }
    
    // Downsample each group
    for (const model of Object.keys(tempGroups)) {
      const maxPoints = MAX_POINTS_PER_MODEL[model] || 100;
      const sampled = downsample(tempGroups[model], maxPoints);
      groups[model] = sampled.map(p => ({
        ...p,
        x: p.variance * 100,
        y: p.return * 100,
      }));
    }
    
    const sorted = Object.keys(groups).sort(
      (a, b) => (modelConfig[a]?.zIndex || 0) - (modelConfig[b]?.zIndex || 0)
    );
    
    return { groupedData: groups, sortedModels: sorted };
  }, [portfolios, enabledModels]);

  const getOpacity = (model: string) => {
    if (!hoveredModel) return model === 'M7_Cloud' ? 0.4 : 0.85;
    return model === hoveredModel ? 1 : 0.15;
  };

  const getSize = (model: string) => {
    if (model === 'M7_Best') return 80;
    if (model === 'M7_Cloud') return 20;
    return 35;
  };

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0 chart-grid opacity-30 pointer-events-none" />
      
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 70 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))" 
            opacity={0.5}
          />
          <XAxis 
            dataKey="x" 
            type="number"
            name="Variance"
            domain={['dataMin - 0.1', 'dataMax + 0.1']}
            tickFormatter={(v) => v.toFixed(2)}
            label={{ 
              value: 'Risque (Variance %)', 
              position: 'insideBottom', 
              offset: -10,
              style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 }
            }}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            dataKey="y" 
            type="number"
            name="Return"
            domain={['dataMin - 0.2', 'dataMax + 0.2']}
            tickFormatter={(v) => v.toFixed(1)}
            label={{ 
              value: 'Rendement (%)', 
              angle: -90, 
              position: 'insideLeft',
              offset: 5,
              style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 }
            }}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="5 5" />
          
          {sortedModels.map(model => (
            <Scatter
              key={model}
              name={modelConfig[model]?.name || model}
              data={groupedData[model]}
              fill={modelConfig[model]?.color || '#888'}
              fillOpacity={getOpacity(model)}
              onMouseEnter={() => setHoveredModel(model)}
              onMouseLeave={() => setHoveredModel(null)}
              shape={(props: any) => {
                const size = getSize(model) / 10;
                return (
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    r={size}
                    fill={modelConfig[model]?.color}
                    fillOpacity={getOpacity(model)}
                    style={{
                      filter: model === 'M7_Best' ? 'drop-shadow(0 0 6px hsl(152 76% 50% / 0.8))' : undefined,
                    }}
                  />
                );
              }}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-4 px-4">
        {enabledModels.map(model => (
          <button
            key={model}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              hoveredModel === model 
                ? 'bg-secondary scale-105' 
                : 'bg-card/50 hover:bg-secondary/50'
            }`}
            onMouseEnter={() => setHoveredModel(model)}
            onMouseLeave={() => setHoveredModel(null)}
          >
            <span 
              className={`w-2.5 h-2.5 rounded-full ${model === 'M7_Best' ? 'animate-pulse-glow' : ''}`}
              style={{ backgroundColor: modelConfig[model]?.color }}
            />
            {modelConfig[model]?.name || model}
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(EfficientFrontierChart);
