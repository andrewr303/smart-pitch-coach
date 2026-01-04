import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, X, Image, ArrowRight, Lightbulb, MessageCircle } from 'lucide-react';

interface SlideGuideData {
  slideNumber: number;
  title: string;
  keyTalkingPoints: string[];
  transitionStatement: string;
  emphasisTopic: string;
  keywords: string[];
  stats?: string[];
  speakerReminder: {
    timing: string;
    energy: string;
  };
}

interface SpeakerGuideViewProps {
  guides: SlideGuideData[];
  deckTitle: string;
  onBack: () => void;
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

export default function SpeakerGuideView({ guides, deckTitle, onBack }: SpeakerGuideViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showThumbnail, setShowThumbnail] = useState(false);

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

  const goToSlide = (index: number) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentSlide(index);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
      if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
      if (e.key === ' ') { e.preventDefault(); setIsPlaying(!isPlaying); }
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, isPlaying, onBack]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">SpeakerGuide</span>
          </button>
        </div>

        <div className="flex items-center gap-3 bg-muted rounded-full px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="font-mono text-foreground">{formatTime(elapsedTime)}</span>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 hover:bg-accent/20 rounded transition-colors"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setElapsedTime(0)}
            className="p-1 hover:bg-accent/20 rounded transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">STATUS:</span>
          <span className="text-sm font-medium text-success">LIVE</span>
          <div className="h-2 w-2 rounded-full bg-success" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 border-r border-border bg-card overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">SLIDES</span>
            <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">{currentSlide + 1}/{totalSlides}</span>
          </div>
          <div className="p-2">
            {guides.map((g, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
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
        <main className="flex-1 overflow-y-auto p-6">
          {/* Progress Bar */}
          <div className="h-1 bg-muted rounded-full mb-6 overflow-hidden">
            <div 
              className="h-full bg-success transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-xs font-semibold text-success tracking-wider">{category}</span>
                <h1 className="text-3xl font-bold text-foreground mt-1">{guide.title}</h1>
              </div>
              <div className="bg-muted rounded-xl px-4 py-3 text-center">
                <span className="text-xs text-muted-foreground block">EST. TIME</span>
                <span className="text-xl font-bold text-foreground">{guide.speakerReminder.timing}</span>
              </div>
            </div>

            {/* Core Message */}
            <div className="bg-card border-l-4 border-success rounded-lg p-5 mb-6">
              <div className="flex items-center gap-2 text-success mb-2">
                <Lightbulb className="h-4 w-4" />
                <span className="text-xs font-semibold tracking-wider">CORE MESSAGE</span>
              </div>
              <p className="text-lg text-foreground">{guide.emphasisTopic}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Talking Points */}
              <div className="lg:col-span-2">
                <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">TALKING POINTS</h3>
                <ul className="space-y-3">
                  {guide.keyTalkingPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="h-2 w-2 rounded-full bg-success" />
                      </div>
                      <span className="text-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual Cue */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-muted-foreground tracking-wider">KEY FIGURES</h3>
                </div>
                
                <div className="mb-4">
                  <span className="text-xs text-muted-foreground block mb-2">VISUAL CUE</span>
                  <button
                    onClick={() => setShowThumbnail(true)}
                    className="w-full aspect-video bg-muted rounded-lg border border-border hover:border-primary/50 transition-colors flex items-center justify-center group overflow-hidden"
                  >
                    <div className="text-center p-4">
                      <Image className="h-8 w-8 text-muted-foreground group-hover:text-primary mx-auto mb-2" />
                      <span className="text-xs text-muted-foreground italic">Audience View</span>
                    </div>
                  </button>
                </div>

                {/* Stats if available */}
                {guide.stats && guide.stats.length > 0 && (
                  <div className="space-y-2">
                    {guide.stats.map((stat, i) => (
                      <div key={i} className="text-sm text-success font-medium">{stat}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Keywords */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-3">KEYWORDS</h3>
              <div className="flex flex-wrap gap-2">
                {guide.keywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-muted text-foreground text-sm border border-border"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Transition */}
            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-2 text-warning mb-2">
                <ArrowRight className="h-4 w-4" />
                <ArrowRight className="h-4 w-4 -ml-3" />
                <span className="text-xs font-semibold tracking-wider">TRANSITION TO NEXT SLIDE</span>
              </div>
              <p className="text-lg text-foreground italic">"{guide.transitionStatement}"</p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-border">
              <button
                onClick={() => goToSlide(currentSlide - 1)}
                disabled={currentSlide === 0}
                className="h-12 w-12 rounded-full bg-muted flex items-center justify-center disabled:opacity-40 hover:bg-accent/20 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="bg-muted rounded-full px-6 py-3">
                <span className="text-foreground">
                  Slide <span className="font-bold">{currentSlide + 1}</span> / {totalSlides}
                </span>
              </div>
              
              <button
                onClick={() => goToSlide(currentSlide + 1)}
                disabled={currentSlide === totalSlides - 1}
                className="h-12 w-12 rounded-full bg-success flex items-center justify-center disabled:opacity-40 hover:bg-success/80 transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-success-foreground" />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Thumbnail Modal */}
      {showThumbnail && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-8">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowThumbnail(false)}
              className="absolute -top-4 -right-4 h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-accent/20 z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="bg-card rounded-xl p-4 border border-border shadow-xl">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                <div className="text-center p-8">
                  <h2 className="text-3xl font-bold text-foreground mb-4">{guide.title}</h2>
                  <p className="text-xl text-muted-foreground">{guide.emphasisTopic}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
