import React from 'react';
import { Brain, Sparkles, Github, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 glass-card border-t-0 border-x-0 rounded-none">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <Sparkles className="w-4 h-4 text-success absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                <span className="gradient-text">FuzzyFolio</span>
                <span className="text-muted-foreground ml-1">AI</span>
              </h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">
                Fuzzy Entropy Portfolio Optimization
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Méthodologie
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              API
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex">
              <FileText className="w-4 h-4" />
              <span className="text-xs">Bonacic et al. 2024</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">Source</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
