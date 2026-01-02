import React, { useEffect, useState } from 'react';
import { CheckCircle, PartyPopper, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface ProcessingCelebrationProps {
  deckTitle: string;
  slideCount: number;
  onViewGuide: () => void;
}

const ProcessingCelebration: React.FC<ProcessingCelebrationProps> = ({
  deckTitle,
  slideCount,
  onViewGuide,
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Trigger confetti
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#1E3A8A', '#F97316', '#10B981', '#F59E0B'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#1E3A8A', '#F97316', '#10B981', '#F59E0B'],
      });
    }, 250);

    // Show content after a short delay
    setTimeout(() => setShowContent(true), 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div
        className={`max-w-md w-full mx-4 p-8 rounded-2xl bg-card border border-border shadow-2xl text-center transition-all duration-500 ${
          showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Success Icon */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 h-24 w-24 rounded-full bg-success/20 animate-ping" />
          <div className="relative h-24 w-24 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-success" />
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <PartyPopper className="h-5 w-5 text-secondary" />
            <span className="text-sm font-medium text-secondary">All done!</span>
            <PartyPopper className="h-5 w-5 text-secondary transform scale-x-[-1]" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Your Guide is Ready!</h2>
          <p className="text-muted-foreground">
            We've analyzed <span className="font-semibold text-foreground">{deckTitle}</span> and
            generated smart speaker guides for all{' '}
            <span className="font-semibold text-primary">{slideCount} slides</span>.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/5">
            <div className="text-2xl font-bold text-primary">{slideCount}</div>
            <div className="text-xs text-muted-foreground">Slides</div>
          </div>
          <div className="p-3 rounded-lg bg-secondary/5">
            <div className="text-2xl font-bold text-secondary">{slideCount * 3}</div>
            <div className="text-xs text-muted-foreground">Talking Points</div>
          </div>
          <div className="p-3 rounded-lg bg-success/5">
            <div className="text-2xl font-bold text-success">{slideCount}</div>
            <div className="text-xs text-muted-foreground">Transitions</div>
          </div>
        </div>

        {/* Action */}
        <Button onClick={onViewGuide} size="lg" className="w-full gap-2">
          <Sparkles className="h-4 w-4" />
          View Your Guide
        </Button>
      </div>
    </div>
  );
};

export default ProcessingCelebration;
