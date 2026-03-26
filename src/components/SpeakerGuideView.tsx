import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, X, Image, ArrowRight, Lightbulb, MessageCircle, Eye, DollarSign, Percent, TrendingUp, Calendar, BarChart3, Menu, type LucideIcon } from 'lucide-react';

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

// Highlight numbers, currencies, and percentages in stat strings
function highlightNumbers(text: string): JSX.Element[] {
  const parts = text.split(/(\$[\d,.]+[KMBT]?|[\d,.]+%|\b\d+(?:\.\d+)?[KMBT]\b)/g);
  return parts.map((part, i) => {
    if (/^\$|[KMBT%]$|^\d/.test(part.trim()) && /\d/.test(part)) {
      return <span key={i} className="font-bold font-mono text-foreground">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

// Pick an icon for a stat based on keyword heuristics
function getStatIcon(stat: string): LucideIcon {
  if (/\$|ARR|revenue|valuation/i.test(stat)) return DollarSign;
  if (/%|margin|ratio/i.test(stat)) return Percent;
  if (/grow|break.?even|EBITDA|LTV|CAC|payback/i.test(stat)) return TrendingUp;
  if (/year|20\d{2}/i.test(stat)) return Calendar;
  return BarChart3;
}

// Map slide number to category based on position
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

export default function SpeakerGuideView({ guides, deckTitle, slideImages, onBack }: SpeakerGuideViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showThumbnail, setShowThumbnail] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const guide = guides[currentSlide];
  const totalSlides = guides.length;
  const progress = ((currentSlide + 1) / totalSlides) * 100;
  const category = getSlideCategory(guide.slideNumber, totalSlides);

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
      setCurrentSlide(index);
      setSidebarOpen(false);
    }
  }, [totalSlides]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
      if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
      if (e.key === ' ') { e.preventDefault(); setIsPlaying(!isPlaying); }
      if (e.key === 'Escape') sidebarOpen ? setSidebarOpen(false) : onBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, isPlaying, onBack, goToSlide, sidebarOpen]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1.5 hover:bg-muted rounded-lg transition-colors"
            aria-label="Toggle slide list"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button onClick={onBack} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-primary flex items-center justify-center">
              <MessageCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground text-sm md:text-base hidden sm:inline">SpeakerGuide</span>
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-3 bg-muted rounded-full px-3 md:px-4 py-1.5 md:py-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="font-mono text-foreground text-sm md:text-base">{formatTime(elapsedTime)}</span>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 hover:bg-accent/20 rounded transition-colors"
            aria-label={isPlaying ? 'Pause timer' : 'Start timer'}
            title={isPlaying ? 'Pause timer' : 'Start timer'}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <Play className="h-3.5 w-3.5 md:h-4 md:w-4" />}
          </button>
          <button
            onClick={() => setElapsedTime(0)}
            className="p-1 hover:bg-accent/20 rounded transition-colors"
            aria-label="Reset timer"
            title="Reset timer"
          >
            <RotateCcw className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">STATUS:</span>
          <span className="text-xs md:text-sm font-medium text-success">LIVE</span>
          <div className="h-2 w-2 rounded-full bg-success" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — hidden on mobile, slides in when toggled */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-40 md:z-auto
          w-64 md:w-56 border-r border-border bg-card overflow-y-auto flex-shrink-0
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          top-[49px] md:top-0
        `}>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">SLIDES</span>
            <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">{currentSlide + 1}/{totalSlides}</span>
          </div>
          <div className="p-2">
            {guides.map((g, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                  currentSlide === index
                    ? 'bg-primary/10 border border-primary/30'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground">Slide {index + 1}</span>
                  {currentSlide === index && (
                    <div className="h-2 w-2 rounded-full bg-success ml-auto mt-1" />
                  )}
                </div>
                <p className="text-sm text-foreground font-medium truncate mt-1">{g.title}</p>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Progress Bar */}
          <div className="h-1 bg-muted rounded-full mb-4 md:mb-6 overflow-hidden">
            <div
              className="h-full bg-success transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="flex items-start justify-between gap-3 mb-4 md:mb-6">
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-success tracking-wider">{category}</span>
                <h1 className="text-xl md:text-3xl font-bold text-foreground mt-1 leading-tight">{guide.title}</h1>
              </div>
              <div className="bg-muted rounded-xl px-3 md:px-4 py-2 md:py-3 text-center flex-shrink-0">
                <span className="text-[10px] md:text-xs text-muted-foreground block">EST. TIME</span>
                <span className="text-base md:text-xl font-bold text-foreground">{guide.speakerReminder.timing}</span>
              </div>
            </div>

            {/* Core Message */}
            <div className="bg-card border-l-4 border-success rounded-lg p-3 md:p-5 mb-4 md:mb-6">
              <div className="flex items-center gap-2 text-success mb-1.5 md:mb-2">
                <Lightbulb className="h-4 w-4" />
                <span className="text-xs font-semibold tracking-wider">CORE MESSAGE</span>
              </div>
              <p className="text-sm md:text-lg text-foreground">{guide.emphasisTopic}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
              {/* Talking Points */}
              <div className="lg:col-span-2">
                <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-3 md:mb-4">TALKING POINTS</h3>
                <ul className="space-y-2.5 md:space-y-3">
                  {guide.keyTalkingPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2.5 md:gap-3">
                      <div className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="h-2 w-2 rounded-full bg-success" />
                      </div>
                      <span className="text-sm md:text-base text-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Figures & Visual Cue */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-3 md:mb-4">KEY FIGURES</h3>

                {/* Visual Cue */}
                <div className="mb-3 md:mb-4">
                  <span className="text-xs text-muted-foreground block mb-2">VISUAL CUE</span>
                  {guide.visualCue ? (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5 md:p-3 mb-2">
                      <div className="flex items-start gap-2">
                        <Eye className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-xs md:text-sm text-foreground font-medium">{guide.visualCue}</p>
                      </div>
                    </div>
                  ) : null}
                  <button
                    onClick={() => setShowThumbnail(true)}
                    className="w-full aspect-[2/1] bg-muted rounded-lg border border-border hover:border-primary/50 transition-colors flex items-center justify-center group overflow-hidden"
                  >
                    {slideImages?.[currentSlide] ? (
                      <img
                        src={slideImages[currentSlide]}
                        alt={`Slide ${currentSlide + 1}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center p-3">
                        <Image className="h-6 w-6 text-muted-foreground group-hover:text-primary mx-auto mb-1" />
                        <span className="text-xs text-muted-foreground italic">Preview Slide</span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Stats */}
                {guide.stats && guide.stats.length > 0 && (
                  <div className="space-y-1.5 md:space-y-2">
                    {guide.stats.map((stat, i) => {
                      const Icon = getStatIcon(stat);
                      return (
                        <div key={i} className="flex items-start gap-2 md:gap-2.5 bg-success/5 border-l-2 border-success rounded-r-lg px-2.5 md:px-3 py-1.5 md:py-2">
                          <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-success flex-shrink-0 mt-0.5" />
                          <span className="text-xs md:text-sm text-success">{highlightNumbers(stat)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Keywords */}
            <div className="mb-4 md:mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-2 md:mb-3">KEYWORDS</h3>
              <div className="flex flex-wrap gap-1.5 md:gap-3">
                {guide.keywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="px-2.5 md:px-4 py-1 md:py-2 rounded-full bg-primary/10 text-primary font-semibold text-xs md:text-base border border-primary/20"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Transition */}
            <div className="border-t border-border pt-4 md:pt-6">
              <div className="flex items-center gap-2 text-warning mb-1.5 md:mb-2">
                <ArrowRight className="h-4 w-4" />
                <ArrowRight className="h-4 w-4 -ml-3" />
                <span className="text-xs font-semibold tracking-wider">TRANSITION TO NEXT SLIDE</span>
              </div>
              <p className="text-sm md:text-lg text-foreground italic">"{guide.transitionStatement}"</p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-3 md:gap-4 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-border pb-4">
              <button
                onClick={() => goToSlide(currentSlide - 1)}
                disabled={currentSlide === 0}
                className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-muted flex items-center justify-center disabled:opacity-40 hover:bg-accent/20 transition-colors"
                aria-label="Previous slide"
                title="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="bg-muted rounded-full px-4 md:px-6 py-2 md:py-3">
                <span className="text-sm md:text-base text-foreground">
                  Slide <span className="font-bold">{currentSlide + 1}</span> / {totalSlides}
                </span>
              </div>

              <button
                onClick={() => goToSlide(currentSlide + 1)}
                disabled={currentSlide === totalSlides - 1}
                className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-success flex items-center justify-center disabled:opacity-40 hover:bg-success/80 transition-colors"
                aria-label="Next slide"
                title="Next slide"
              >
                <ChevronRight className="h-5 w-5 text-success-foreground" />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Thumbnail Modal */}
      {showThumbnail && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-8">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowThumbnail(false)}
              className="absolute -top-4 -right-4 h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-accent/20 z-10"
              aria-label="Close thumbnail preview"
              title="Close thumbnail preview"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="bg-card rounded-xl p-4 border border-border shadow-xl">
              {slideImages?.[currentSlide] ? (
                <img
                  src={slideImages[currentSlide]}
                  alt={`Slide ${currentSlide + 1}`}
                  className="w-full rounded-lg"
                />
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                  <div className="text-center p-8">
                    <h2 className="text-3xl font-bold text-foreground mb-4">{guide.title}</h2>
                    <p className="text-xl text-muted-foreground">{guide.emphasisTopic}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
