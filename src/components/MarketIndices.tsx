import React from 'react';
import { marketIndices } from '@/services/simulationService';
import { Globe, TrendingUp, TrendingDown } from 'lucide-react';

// Simulated current prices and changes
const indexData = [
  { ...marketIndices[0], price: 4783.45, change: 0.82, volume: '3.2B' },
  { ...marketIndices[1], price: 4428.76, change: -0.34, volume: '1.8B' },
  { ...marketIndices[2], price: 33753.33, change: 1.24, volume: '2.1B' },
  { ...marketIndices[3], price: 6234.12, change: -0.67, volume: '890M' },
];

export default function MarketIndices() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Indices Mondiaux</span>
        <span className="ml-auto text-xs text-muted-foreground">Live</span>
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {indexData.map((index) => (
          <div
            key={index.ticker}
            className="glass-card p-3 hover:border-primary/30 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold"
                style={{ backgroundColor: `${index.color}20`, color: index.color }}
              >
                {index.region}
              </div>
              <span className="text-xs font-medium truncate">{index.name}</span>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <div className="font-mono text-sm font-semibold">
                  {index.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-muted-foreground">Vol: {index.volume}</div>
              </div>
              
              <div className={`flex items-center gap-1 text-xs font-medium ${
                index.change >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {index.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {index.change >= 0 ? '+' : ''}{index.change}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
