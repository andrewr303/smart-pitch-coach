import React, { useState, useCallback } from 'react';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import DeckCard from '@/components/DeckCard';
import SlideGuide from '@/components/SlideGuide';
import ProcessingCelebration from '@/components/ProcessingCelebration';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Download, Share2 } from 'lucide-react';

// Mock data for demonstration
const mockGuides = [
  {
    slideNumber: 1,
    title: 'Welcome & Introduction',
    keyTalkingPoints: [
      'Greet your audience with energy and confidence',
      'Introduce yourself and establish credibility',
      'Preview what you will cover in 3 key points',
    ],
    transitionStatement: "Now that we've set the stage, let's dive into the problem...",
    emphasisTopic: 'First impressions matter - make it count!',
    keywords: ['introduction', 'welcome', 'overview'],
    speakerReminder: { timing: '90 seconds', energy: 'High' },
  },
  {
    slideNumber: 2,
    title: 'The Problem We Solve',
    keyTalkingPoints: [
      'Paint a vivid picture of the pain point',
      'Use specific numbers to quantify the issue',
      'Connect emotionally with your audience',
    ],
    transitionStatement: 'So how do we tackle this massive challenge?',
    emphasisTopic: '$2.3B lost annually due to inefficient presentations',
    keywords: ['problem', 'pain point', 'market gap'],
    stats: ['$2.3B annual loss', '73% feel unprepared', '4.2 hours wasted weekly'],
    speakerReminder: { timing: '2 minutes', energy: 'Medium' },
  },
  {
    slideNumber: 3,
    title: 'Our Solution',
    keyTalkingPoints: [
      'Introduce SmartPitch Coach as the answer',
      'Highlight the AI-powered guide generation',
      'Demonstrate the teleprompter experience',
    ],
    transitionStatement: "Let me show you exactly how it works...",
    emphasisTopic: 'AI transforms your slides into confidence-boosting guides',
    keywords: ['solution', 'AI', 'smart guides', 'teleprompter'],
    speakerReminder: { timing: '2 minutes', energy: 'High' },
  },
];

interface Deck {
  id: string;
  title: string;
  slideCount: number;
  createdAt: string;
}

const Index = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  const [viewingGuide, setViewingGuide] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleFileSelect = useCallback((file: File) => {
    setIsProcessing(true);
    setProgress(0);

    // Simulate processing with progress updates
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    // Complete processing after simulation
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      const newDeck: Deck = {
        id: Date.now().toString(),
        title: file.name.replace(/\.(pdf|pptx)$/i, ''),
        slideCount: mockGuides.length,
        createdAt: 'Just now',
      };
      
      setCurrentDeck(newDeck);
      setIsProcessing(false);
      setShowCelebration(true);
    }, 3500);
  }, []);

  const handleViewGuide = () => {
    if (currentDeck) {
      setDecks((prev) => [currentDeck, ...prev]);
    }
    setShowCelebration(false);
    setViewingGuide(true);
  };

  const handleBackToDashboard = () => {
    setViewingGuide(false);
    setCurrentDeck(null);
    setActiveSlide(0);
  };

  const handleNewDeck = () => {
    setViewingGuide(false);
    setCurrentDeck(null);
    setDecks([]);
  };

  // Guide View
  if (viewingGuide && currentDeck) {
    return (
      <div className="min-h-screen bg-background">
        <Header onNewDeck={handleNewDeck} />
        
        <div className="container py-6 px-4 md:px-6">
          {/* Back & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button size="sm" className="gap-2">
                <Play className="h-4 w-4" />
                Live Mode
              </Button>
            </div>
          </div>

          {/* Deck Title */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {currentDeck.title}
            </h1>
            <p className="text-muted-foreground">
              {currentDeck.slideCount} slides • Created {currentDeck.createdAt}
            </p>
          </div>

          {/* Guide Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockGuides.map((guide, index) => (
              <SlideGuide
                key={guide.slideNumber}
                guide={guide}
                isActive={activeSlide === index}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onNewDeck={handleNewDeck} showNewButton={decks.length > 0} />
      
      <main className="flex-1 container py-6 px-4 md:px-6">
        {decks.length === 0 ? (
          <EmptyState
            onFileSelect={handleFileSelect}
            isProcessing={isProcessing}
            progress={Math.min(progress, 100)}
          />
        ) : (
          <div>
            {/* Recent Decks */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Recent Decks</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {decks.map((deck) => (
                  <DeckCard
                    key={deck.id}
                    title={deck.title}
                    slideCount={deck.slideCount}
                    createdAt={deck.createdAt}
                    onClick={() => {
                      setCurrentDeck(deck);
                      setViewingGuide(true);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Upload New */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Upload New Deck</h2>
              <EmptyState
                onFileSelect={handleFileSelect}
                isProcessing={isProcessing}
                progress={Math.min(progress, 100)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Celebration Modal */}
      {showCelebration && currentDeck && (
        <ProcessingCelebration
          deckTitle={currentDeck.title}
          slideCount={currentDeck.slideCount}
          onViewGuide={handleViewGuide}
        />
      )}
    </div>
  );
};

export default Index;
