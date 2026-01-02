import React from 'react';
import { FileText, Calendar, ArrowRight, Presentation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeckCardProps {
  title: string;
  slideCount: number;
  createdAt: string;
  thumbnailUrl?: string;
  onClick?: () => void;
  className?: string;
}

const DeckCard: React.FC<DeckCardProps> = ({
  title,
  slideCount,
  createdAt,
  thumbnailUrl,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-xl bg-card border border-border p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="aspect-video rounded-lg bg-muted overflow-hidden mb-4">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <Presentation className="h-12 w-12 text-primary/30" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            <span>{slideCount} slides</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{createdAt}</span>
          </div>
        </div>
      </div>

      {/* Hover Arrow */}
      <div className="absolute right-4 bottom-4 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
          <ArrowRight className="h-4 w-4 text-secondary-foreground" />
        </div>
      </div>
    </div>
  );
};

export default DeckCard;
