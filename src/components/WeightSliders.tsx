import React from 'react';
import { Slider } from '@/components/ui/slider';
import { TrendingUp, Shield, Shuffle } from 'lucide-react';

interface WeightSlidersProps {
  weights: { return: number; variance: number; entropy: number };
  onWeightsChange: (weights: { return: number; variance: number; entropy: number }) => void;
}

export default function WeightSliders({ weights, onWeightsChange }: WeightSlidersProps) {
  const handleChange = (key: 'return' | 'variance' | 'entropy', value: number[]) => {
    onWeightsChange({ ...weights, [key]: value[0] });
  };

  const sliders = [
    {
      key: 'return' as const,
      label: 'Rendement',
      icon: TrendingUp,
      color: 'hsl(var(--success))',
      description: 'Maximiser les gains',
    },
    {
      key: 'variance' as const,
      label: 'Risque',
      icon: Shield,
      color: 'hsl(var(--warning))',
      description: 'Minimiser la volatilité',
    },
    {
      key: 'entropy' as const,
      label: 'Diversification',
      icon: Shuffle,
      color: 'hsl(var(--primary))',
      description: 'Entropie de Shannon',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Pondération TOPSIS</h3>
        <span className="text-xs text-muted-foreground">
          Total: {((weights.return + weights.variance + weights.entropy) * 100).toFixed(0)}%
        </span>
      </div>

      {sliders.map(({ key, label, icon: Icon, color, description }) => (
        <div key={key} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color }} />
              </div>
              <div>
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground block">{description}</span>
              </div>
            </div>
            <span 
              className="font-mono text-sm font-bold min-w-[3rem] text-right"
              style={{ color }}
            >
              {(weights[key] * 100).toFixed(0)}%
            </span>
          </div>
          <div className="relative">
            <Slider
              value={[weights[key]]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={(v) => handleChange(key, v)}
              className="py-2"
            />
            <div 
              className="absolute top-1/2 left-0 h-1 rounded-full -translate-y-1/2 pointer-events-none transition-all"
              style={{ 
                width: `${weights[key] * 100}%`,
                backgroundColor: color,
                opacity: 0.3
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
