import React from 'react';
import { ModelStats } from '@/services/simulationService';
import { TrendingUp, TrendingDown, Activity, Sparkles, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TOPSISLeaderboardProps {
  rankings: ModelStats[];
}

const modelIcons: Record<string, React.ReactNode> = {
  M7_Best: <Sparkles className="w-4 h-4" />,
  M3: <Activity className="w-4 h-4" />,
  M6: <TrendingUp className="w-4 h-4" />,
  M7_Cloud: <Activity className="w-4 h-4" />,
  M2: <Activity className="w-4 h-4" />,
  COMP: <TrendingDown className="w-4 h-4" />,
  M1: <TrendingDown className="w-4 h-4" />,
};

const modelDescriptions: Record<string, string> = {
  M7_Best: 'Fuzzy Entropy Optimal',
  M3: 'Min Var + Max Entropy',
  M6: 'Fuzzy Return + Min Var',
  M7_Cloud: 'Fuzzy Exploration Space',
  M2: 'Max Shannon Entropy',
  COMP: 'Possibilistic Mean-Var',
  M1: 'Markowitz Classic',
};

export default function TOPSISLeaderboard({ rankings }: TOPSISLeaderboardProps) {
  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {rankings.map((stat, index) => (
          <motion.div
            key={stat.model}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.05,
              layout: { type: "spring", stiffness: 500, damping: 30 }
            }}
            className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
              index === 0 
                ? 'glass-card border-success/30 glow-success' 
                : 'glass-card hover:border-primary/30'
            }`}
          >
            {/* Rank Badge */}
            <div className={`absolute top-0 left-0 px-2 py-1 text-xs font-bold rounded-br-lg ${
              index === 0 
                ? 'bg-success text-success-foreground' 
                : index < 3 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-muted text-muted-foreground'
            }`}>
              {index === 0 && <Crown className="w-3 h-3 inline mr-1" />}
              #{index + 1}
            </div>

            <div className="p-4 pl-12">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
                  >
                    {modelIcons[stat.model]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{stat.model.replace('_', ' ')}</h4>
                    <p className="text-xs text-muted-foreground">
                      {modelDescriptions[stat.model]}
                    </p>
                  </div>
                </div>
                
                {/* TOPSIS Score */}
                <div className="text-right">
                  <div className="font-mono text-lg font-bold" style={{ color: stat.color }}>
                    {stat.topsisScore.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">Score TOPSIS</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: stat.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.topsisScore * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block">Rendement</span>
                  <span className="font-mono font-semibold text-success">
                    {(stat.avgReturn * 100).toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Risque</span>
                  <span className="font-mono font-semibold text-warning">
                    {(stat.avgVariance * 100).toFixed(3)}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Entropie</span>
                  <span className="font-mono font-semibold text-primary">
                    {stat.avgEntropy.toFixed(3)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Nb. Pts</span>
                  <span className="font-mono font-semibold">
                    {stat.count.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
