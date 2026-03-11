import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Play, Pause, RotateCcw, X, Image, ArrowRight,
  Lightbulb, Eye, DollarSign, Percent, TrendingUp, Calendar, BarChart3,
  PanelLeftClose, PanelLeftOpen, BookOpen, Timer, Presentation,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideGuideData {
  slideNumber: number;
  title: string;
  keyTalkingPoints: string[];
  transitionStatement: string;
  emphasisTopic: string;
  keywords: string[];
  stats?: string[];
  visualCue?: string;
  speakerReminder: {
    timing: string;
    energy: string;
  };
}

interface SpeakerGuideViewProps {
  guides: SlideGuideData[];
  deckTitle: string;
  slideImages?: string[];
  onBack: () => void;
}

// Highlight numbers, currencies, and percentages
function highlightNumbers(text: string): JSX.Element[] {
  const parts = text.split(/(\$[\d,.]+[KMBT]?|[\d,.]+%|\b\d+(?:\.\d+)?[KMBT]\b)/g);
  return parts.map((part, i) => {
    if (/^\$|[KMBT%]$|^\d/.test(part.trim()) && /\d/.test(part)) {
      return <span key={i} className="font-bold font-mono text-foreground">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

function getStatIcon(stat: string): LucideIcon {
  if (/\$|ARR|revenue|valuation/i.test(stat)) return DollarSign;
  if (/%|margin|ratio/i.test(stat)) return Percent;
  if (/grow|break.?even|EBITDA|LTV|CAC|payback/i.test(stat)) return TrendingUp;
  if (/year|20\d{2}/i.test(stat)) return Calendar;
  return BarChart3;
}

// Color coding for slide categories
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'VISION & HOOK': { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  'THE PROBLEM': { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20' },
  'OUR SOLUTION': { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20' },
  'PRODUCT DEMO': { bg: 'bg-info/10', text: 'text-info', border: 'border-info/20' },
  'DATA & METRICS': { bg: 'bg-secondary/10', text: 'text-secondary', border: 'border-secondary/20' },
  'BUSINESS MODEL': { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
  'THE TEAM': { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  'CALL TO ACTION': { bg: 'bg-secondary/10', text: 'text-secondary', border: 'border-secondary/20' },
};

const getSlideCategory = (slideNumber: number, total: number): string => {
  const position = slideNumber / total;
  if (slideNumber === 1) return 'VISION & HOOK';
  if (position <= 0.2) return 'THE PROBLEM';
  if (position <= 0.35) return 'OUR SOLUTION';
  if (position <= 0.5) return 'PRODUCT DEMO';
  if (position <= 0.65) return 'DATA & METRICS';
  if (position <= 0.8) return 'BUSINESS MODEL';
  if (position <= 0.9) return 'THE TEAM';
  return 'CALL TO ACTION';
};

// Parse timing string like "1-2 minutes" to seconds for comparison
function parseTimingToSeconds(timing: string): number {
  const match = timing.match(/(\d+)/);
  if (!match) return 60;
  return parseInt(match[1]) * 60;
}

export default function SpeakerGuideView({ guides, deckTitle, slideImages, onBack }: SpeakerGuideViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showThumbnail, setShowThumbnail] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mode, setMode] = useState<'study' | 'practice'>('study');
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const guide = guides[currentSlide];
  const totalSlides = guides.length;
  const progress = ((currentSlide + 1) / totalSlides) * 100;
  const estimatedSeconds = parseTimingToSeconds(guide.speakerReminder.timing);

  // Timer state: green -> amber -> red based on elapsed vs estimated
  const timerState = elapsedTime < estimatedSeconds * 0.8
    ? 'on-pace'
    : elapsedTime < estimatedSeconds
    ? 'warning'
    : 'over';

  const timerColorClass = {
    'on-pace': 'text-success',
    'warning': 'text-warning',
    'over': 'text-destructive',
  }[timerState];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => setElapsedTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < totalSlides) {
      setSlideDirection(index > currentSlide ? 'right' : 'left');
      setCurrentSlide(index);
      if (mode === 'practice') {
        setElapsedTime(0);
        setIsPlaying(true);
      }
      // Scroll main content to top
      mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalSlides, currentSlide, mode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showShortcuts && e.key === 'Escape') {
        setShowShortcuts(false);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToSlide(currentSlide + 1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goToSlide(currentSlide - 1);
      if (e.key === ' ') { e.preventDefault(); setIsPlaying(!isPlaying); }
      if (e.key === 'Escape') onBack();
      if (e.key === '?') setShowShortcuts(s => !s);
      if (e.key === 'm' || e.key === 'M') setMode(m => m === 'study' ? 'practice' : 'study');
      if (e.key === 's' || e.key === 'S') setSidebarOpen(s => !s);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, isPlaying, onBack, goToSlide, showShortcuts]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar — timer & controls */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label="Back to dashboard"
          >
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Presentation className="h-4 w-4 text-primary-foreground" />
            </div>
          </button>
          <div className="hidden md:block">
            <p className="text-sm font-display font-semibold text-foreground truncate max-w-[200px]">{deckTitle}</p>
            <p className="text-xs text-muted-foreground">Slide {currentSlide + 1} of {totalSlides}</p>
          </div>
        </div>

        {/* Timer control strip */}
        <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-1.5">
          {/* Mode toggle */}
          <button
            onClick={() => setMode(m => m === 'study' ? 'practice' : 'study')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200',
              mode === 'practice'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {mode === 'practice' ? <Timer className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
            {mode === 'practice' ? 'Practice' : 'Study'}
          </button>

          <div className="h-5 w-px bg-border mx-1" />

          {/* Timer display */}
          <div className="flex items-center gap-2">
            <span className={cn('font-mono text-lg font-bold tabular-nums', timerColorClass)}>
              {formatTime(elapsedTime)}
            </span>
            <span className="text-xs text-muted-foreground font-mono">/ {guide.speakerReminder.timing}</span>
          </div>

          <div className="h-5 w-px bg-border mx-1" />

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={cn(
              'h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200',
              isPlaying
                ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                : 'bg-success/10 text-success hover:bg-success/20'
            )}
            aria-label={isPlaying ? 'Pause timer' : 'Start timer'}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setElapsedTime(0)}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
            aria-label="Reset timer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Right side: sidebar toggle + shortcut hint */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShortcuts(true)}
            className="hidden md:flex text-xs text-muted-foreground hover:text-foreground items-center gap-1 px-2 py-1 rounded-md border border-transparent hover:border-border transition-all"
          >
            <kbd className="font-mono text-[10px] bg-muted px-1 rounded">?</kbd>
            <span>Shortcuts</span>
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-0.5 bg-muted flex-shrink-0">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out-expo"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — slide navigator */}
        <aside
          className={cn(
            'border-r border-border bg-card overflow-y-auto custom-scrollbar flex-shrink-0 transition-all duration-300 ease-out-expo',
            sidebarOpen ? 'w-60' : 'w-0 border-r-0'
          )}
        >
          <div className={cn('transition-opacity duration-200', sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-overline text-muted-foreground uppercase tracking-widest">Slides</span>
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                  {currentSlide + 1}/{totalSlides}
                </span>
              </div>
            </div>

            <div className="p-2 space-y-1">
              {guides.map((g, index) => {
                const isActive = currentSlide === index;
                const slideCategory = getSlideCategory(g.slideNumber, totalSlides);
                const colors = CATEGORY_COLORS[slideCategory] || CATEGORY_COLORS['VISION & HOOK'];

                return (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={cn(
                      'w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 group',
                      isActive
                        ? 'bg-primary/8 border border-primary/20 shadow-sm'
                        : 'hover:bg-muted/60 border border-transparent'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Slide number */}
                      <div className={cn(
                        'h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors',
                        isActive ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm font-medium truncate transition-colors',
                          isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                        )}>
                          {g.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={cn('text-[10px] font-semibold', colors.text)}>{slideCategory}</span>
                          <span className="text-[10px] text-muted-foreground/60">·</span>
                          <span className="text-[10px] text-muted-foreground">{g.speakerReminder.timing}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Keyboard hint at bottom */}
            <div className="p-3 border-t border-border mt-2">
              <div className="text-[10px] text-muted-foreground/60 space-y-0.5">
                <p><kbd className="font-mono bg-muted px-1 rounded text-[9px]">↑↓</kbd> Navigate</p>
                <p><kbd className="font-mono bg-muted px-1 rounded text-[9px]">Space</kbd> Timer</p>
                <p><kbd className="font-mono bg-muted px-1 rounded text-[9px]">Esc</kbd> Back</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8"
          key={currentSlide}
        >
          <div className={cn(
            'max-w-4xl mx-auto',
            slideDirection === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'
          )}>
            {/* Slide header */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex-1">
                <span className="text-overline text-muted-foreground mb-2 block">
                  Slide {currentSlide + 1}
                </span>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground leading-tight">
                  {guide.title}
                </h1>
              </div>
              <div className="flex-shrink-0 ml-4">
                <div className={cn(
                  'rounded-xl px-4 py-2.5 text-center border',
                  timerState === 'over' ? 'bg-destructive/5 border-destructive/20' :
                  timerState === 'warning' ? 'bg-warning/5 border-warning/20' :
                  'bg-muted/50 border-border'
                )}>
                  <span className="text-overline text-muted-foreground block mb-0.5">Est. Time</span>
                  <span className={cn('text-lg font-bold font-mono', timerColorClass)}>
                    {guide.speakerReminder.timing}
                  </span>
                </div>
              </div>
            </div>

            {/* Core Message — elevated callout */}
            <div className="bg-primary/[0.04] border-l-4 border-primary rounded-r-xl p-5 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                <span className="text-overline text-primary uppercase tracking-widest">Core Message</span>
              </div>
              <p className="text-lg text-foreground leading-relaxed font-medium">
                {guide.emphasisTopic}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Talking Points — left 2 cols */}
              <div className="lg:col-span-2">
                <h3 className="text-overline text-muted-foreground uppercase tracking-widest mb-4">
                  Talking Points
                </h3>
                <div className="space-y-3">
                  {guide.keyTalkingPoints.map((point, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/15 transition-colors"
                    >
                      <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary-foreground">{i + 1}</span>
                      </div>
                      <p className="text-[1.05rem] text-foreground leading-relaxed pt-0.5">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right rail — Key Figures + Visual Cue */}
              <div className="space-y-6">
                {/* Slide preview */}
                <div>
                  <h3 className="text-overline text-muted-foreground uppercase tracking-widest mb-3">
                    Slide Preview
                  </h3>
                  {guide.visualCue && (
                    <div className="bg-primary/[0.04] border border-primary/15 rounded-xl p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <Eye className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground">{guide.visualCue}</p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setShowThumbnail(true)}
                    className="w-full aspect-[16/10] rounded-xl border border-border bg-muted/30 hover:border-primary/30 transition-all duration-200 flex items-center justify-center group overflow-hidden"
                  >
                    {slideImages?.[currentSlide] ? (
                      <img
                        src={slideImages[currentSlide]}
                        alt={`Slide ${currentSlide + 1}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Image className="h-6 w-6 text-muted-foreground/40 group-hover:text-primary/50 mx-auto mb-1.5 transition-colors" />
                        <span className="text-xs text-muted-foreground/50">Click to preview</span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Key Figures — stat cards */}
                {guide.stats && guide.stats.length > 0 && (
                  <div>
                    <h3 className="text-overline text-muted-foreground uppercase tracking-widest mb-3">
                      Key Figures
                    </h3>
                    <div className="space-y-2">
                      {guide.stats.map((stat, i) => {
                        const Icon = getStatIcon(stat);
                        return (
                          <div
                            key={i}
                            className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/[0.06] border border-secondary/15"
                          >
                            <div className="h-7 w-7 rounded-lg bg-secondary/15 flex items-center justify-center flex-shrink-0">
                              <Icon className="h-3.5 w-3.5 text-secondary" />
                            </div>
                            <span className="text-sm text-foreground font-medium leading-relaxed pt-0.5">
                              {highlightNumbers(stat)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Keywords */}
            <div className="mb-8">
              <h3 className="text-overline text-muted-foreground uppercase tracking-widest mb-3">
                Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {guide.keywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="px-3.5 py-1.5 rounded-lg bg-primary/8 text-primary font-semibold text-sm border border-primary/15 hover:bg-primary/12 transition-colors cursor-default"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Transition — prominent bridge card */}
            {currentSlide < totalSlides - 1 && (
              <div className={cn(
                'rounded-2xl p-5 md:p-6 transition-all duration-500',
                // In practice mode, pulse when timer hits 80% of estimated
                mode === 'practice' && elapsedTime >= estimatedSeconds * 0.8
                  ? 'bg-secondary/10 border-2 border-secondary/30 shadow-glow-accent'
                  : 'bg-muted/40 border border-border'
              )}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center -space-x-1.5">
                    <ArrowRight className="h-4 w-4 text-secondary" />
                    <ArrowRight className="h-4 w-4 text-secondary/60" />
                  </div>
                  <span className="text-overline text-secondary uppercase tracking-widest">
                    Transition to Next Slide
                  </span>
                </div>
                <p className="text-lg text-foreground font-serif italic leading-relaxed">
                  "{guide.transitionStatement}"
                </p>
              </div>
            )}

            {/* Bottom navigation */}
            <div className="flex items-center justify-center gap-4 mt-10 pt-6 border-t border-border">
              <button
                onClick={() => goToSlide(currentSlide - 1)}
                disabled={currentSlide === 0}
                className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center disabled:opacity-30 hover:bg-muted/80 transition-all duration-200"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-1.5">
                {guides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={cn(
                      'rounded-full transition-all duration-300',
                      i === currentSlide
                        ? 'h-2 w-6 gradient-primary'
                        : 'h-2 w-2 bg-muted hover:bg-muted-foreground/30'
                    )}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => goToSlide(currentSlide + 1)}
                disabled={currentSlide === totalSlides - 1}
                className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center disabled:opacity-30 hover:shadow-md transition-all duration-200"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5 text-primary-foreground" />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Thumbnail Modal */}
      {showThumbnail && (
        <div
          className="fixed inset-0 bg-background/70 backdrop-blur-md flex items-center justify-center z-50 p-8 animate-fade-in"
          onClick={() => setShowThumbnail(false)}
        >
          <div className="relative max-w-4xl w-full animate-scale-in" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowThumbnail(false)}
              className="absolute -top-3 -right-3 h-9 w-9 rounded-xl bg-card border border-border shadow-md flex items-center justify-center hover:bg-muted z-10 transition-colors"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="bg-card rounded-2xl p-4 border border-border shadow-2xl">
              {slideImages?.[currentSlide] ? (
                <img
                  src={slideImages[currentSlide]}
                  alt={`Slide ${currentSlide + 1}`}
                  className="w-full rounded-xl"
                />
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <h2 className="text-3xl font-display font-bold text-foreground mb-4">{guide.title}</h2>
                    <p className="text-xl text-muted-foreground">{guide.emphasisTopic}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div
          className="fixed inset-0 bg-background/70 backdrop-blur-md flex items-center justify-center z-50 p-8 animate-fade-in"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="max-w-sm w-full bg-card rounded-2xl border border-border shadow-2xl p-6 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-foreground text-lg">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { keys: ['←', '→'], label: 'Navigate slides' },
                { keys: ['↑', '↓'], label: 'Navigate slides' },
                { keys: ['Space'], label: 'Toggle timer' },
                { keys: ['M'], label: 'Toggle Study/Practice mode' },
                { keys: ['S'], label: 'Toggle sidebar' },
                { keys: ['Esc'], label: 'Back to dashboard' },
                { keys: ['?'], label: 'Show shortcuts' },
              ].map(({ keys, label }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <div className="flex items-center gap-1">
                    {keys.map(k => (
                      <kbd key={k} className="min-w-[28px] h-7 px-2 rounded-md bg-muted border border-border text-xs font-mono text-foreground flex items-center justify-center">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
