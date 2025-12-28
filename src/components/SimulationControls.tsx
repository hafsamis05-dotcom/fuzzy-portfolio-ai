import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Download, Settings2 } from 'lucide-react';

interface SimulationControlsProps {
  isRunning: boolean;
  progress: { current: number; total: number };
  enabledModels: string[];
  windowSize: number;
  onToggleModel: (model: string) => void;
  onWindowSizeChange: (size: number) => void;
  onStart: () => void;
  onReset: () => void;
  onExport: (format: 'json' | 'csv') => void;
}

const models = [
  { id: 'M1', name: 'Markowitz', color: 'hsl(220, 90%, 56%)' },
  { id: 'M3', name: 'Hybrid M3', color: 'hsl(280, 80%, 60%)' },
  { id: 'M6', name: 'Fuzzy M6', color: 'hsl(38, 92%, 50%)' },
  { id: 'M7_Cloud', name: 'M7 Cloud', color: 'hsl(220, 15%, 55%)' },
  { id: 'M7_Best', name: 'M7 Best', color: 'hsl(152, 76%, 50%)' },
];

export default function SimulationControls({
  isRunning,
  progress,
  enabledModels,
  windowSize,
  onToggleModel,
  onWindowSizeChange,
  onStart,
  onReset,
  onExport,
}: SimulationControlsProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    const target = (progress.current / progress.total) * 100;
    const timer = setInterval(() => {
      setAnimatedProgress(prev => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.5) return target;
        return prev + diff * 0.1;
      });
    }, 16);
    return () => clearInterval(timer);
  }, [progress]);

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Circular Progress */}
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300"
              style={{
                filter: isRunning ? 'drop-shadow(0 0 8px hsl(var(--primary)))' : undefined
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-bold">
              {progress.current.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">
              / {progress.total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={onStart}
          className="flex-1 gap-2"
          variant={isRunning ? "secondary" : "default"}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? 'Pause' : 'Simuler'}
        </Button>
        <Button onClick={onReset} variant="outline" size="icon">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Window Size Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Fenêtre glissante</span>
          </div>
          <span className="font-mono text-sm text-primary">{windowSize} mois</span>
        </div>
        <Slider
          value={[windowSize]}
          min={12}
          max={36}
          step={1}
          onValueChange={(v) => onWindowSizeChange(v[0])}
        />
      </div>

      {/* Model Toggles */}
      <div className="space-y-3">
        <span className="text-sm font-medium">Modèles actifs</span>
        <div className="grid grid-cols-1 gap-2">
          {models.map(model => (
            <div
              key={model.id}
              className="flex items-center justify-between p-2 rounded-lg bg-card/50 hover:bg-card transition-colors"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: model.color }}
                />
                <span className="text-sm">{model.name}</span>
              </div>
              <Switch
                checked={enabledModels.includes(model.id)}
                onCheckedChange={() => onToggleModel(model.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Export Buttons */}
      <div className="space-y-2">
        <span className="text-sm font-medium">Smart Export</span>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onExport('csv')}
            className="gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onExport('json')}
            className="gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            JSON
          </Button>
        </div>
      </div>
    </div>
  );
}
