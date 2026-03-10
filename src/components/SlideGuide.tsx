import React from 'react';
import { Clock, Zap, ArrowRight, Lightbulb, BarChart3, DollarSign, Percent, TrendingUp, Calendar, Eye, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideGuideData {
  slideNumber: number;
  thumbnail?: string;
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

function getStatIcon(stat: string): LucideIcon {
  if (/\$|ARR|revenue|valuation/i.test(stat)) return DollarSign;
  if (/%|margin|ratio/i.test(stat)) return Percent;
  if (/grow|break.?even|EBITDA|LTV|CAC|payback/i.test(stat)) return TrendingUp;
  if (/year|20\d{2}/i.test(stat)) return Calendar;
  return BarChart3;
}

interface SlideGuideProps {
  guide: SlideGuideData;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const SlideGuide: React.FC<SlideGuideProps> = ({
  guide,
  isActive = false,
  onClick,
  className,
}) => {
  const energyColor = {
    high: 'text-secondary bg-secondary/10',
    medium: 'text-warning bg-warning/10',
    low: 'text-muted-foreground bg-muted',
  }[guide.speakerReminder.energy.toLowerCase()] || 'text-muted-foreground bg-muted';

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border bg-card p-5 transition-all duration-300 cursor-pointer',
        isActive
          ? 'border-primary shadow-lg ring-2 ring-primary/20'
          : 'border-border hover:border-primary/30 hover:shadow-md',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Thumbnail */}
        <div className="w-24 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
          {guide.thumbnail ? (
            <img src={guide.thumbnail} alt={`Slide ${guide.slideNumber}`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
              {guide.slideNumber}
            </div>
          )}
        </div>

        {/* Title & Meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Slide {guide.slideNumber}
            </span>
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', energyColor)}>
              <Zap className="h-3 w-3 inline mr-1" />
              {guide.speakerReminder.energy}
            </span>
          </div>
          <h3 className="font-semibold text-foreground truncate">{guide.title}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3" />
            <span>{guide.speakerReminder.timing}</span>
          </div>
        </div>
      </div>

      {/* Key Talking Points */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Key Talking Points
        </h4>
        <ul className="space-y-2">
          {guide.keyTalkingPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <span className="h-5 w-5 rounded-full bg-secondary/10 text-secondary text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Emphasis */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 mb-4">
        <div className="flex items-center gap-2 text-primary mb-1">
          <Lightbulb className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Main Takeaway</span>
        </div>
        <p className="text-sm text-foreground">{guide.emphasisTopic}</p>
      </div>

      {/* Visual Cue */}
      {guide.visualCue && (
        <div className="mb-4 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-start gap-2">
            <Eye className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-xs text-foreground font-medium">{guide.visualCue}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      {guide.stats && guide.stats.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Key Stats</span>
          </div>
          <div className="space-y-1.5">
            {guide.stats.map((stat, i) => {
              const Icon = getStatIcon(stat);
              return (
                <div key={i} className="flex items-start gap-2 bg-success/5 border-l-2 border-success rounded-r-md px-2.5 py-1.5">
                  <Icon className="h-3.5 w-3.5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-success font-medium">{stat}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Keywords */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {guide.keywords.map((keyword, i) => (
          <span
            key={i}
            className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs"
          >
            {keyword}
          </span>
        ))}
      </div>

      {/* Transition */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-secondary">
          <ArrowRight className="h-4 w-4" />
          <span className="text-sm italic">"{guide.transitionStatement}"</span>
        </div>
      </div>
    </div>
  );
};

export default SlideGuide;
