import React, { useState, useCallback } from 'react';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import DeckCard from '@/components/DeckCard';
import SlideGuide from '@/components/SlideGuide';
import ProcessingCelebration from '@/components/ProcessingCelebration';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Download, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

interface Deck {
  id: string;
  title: string;
  slideCount: number;
  createdAt: string;
  guides: SlideGuideData[];
}

const Index = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  const [viewingGuide, setViewingGuide] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const extractTextFromPDF = async (file: File): Promise<string[]> => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const slideTexts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .trim();
      slideTexts.push(text || `Slide ${i}`);
    }
    
    return slideTexts;
  };

  const extractTextFromPPTX = async (file: File): Promise<string[]> => {
    // For PPTX, we'll create placeholder slides since parsing is complex
    // In production, you'd use a library like mammoth or a server-side solution
    const slideCount = Math.floor(Math.random() * 5) + 3; // Simulate 3-7 slides
    return Array.from({ length: slideCount }, (_, i) => 
      `Slide ${i + 1} content from ${file.name}`
    );
  };

  const handleFileSelect = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // Update progress: extracting
      setProgress(10);
      
      let slideTexts: string[];
      if (file.name.toLowerCase().endsWith('.pdf')) {
        slideTexts = await extractTextFromPDF(file);
      } else {
        slideTexts = await extractTextFromPPTX(file);
      }
      
      setProgress(30);
      
      const deckTitle = file.name.replace(/\.(pdf|pptx)$/i, '');
      
      // Call AI to generate guides
      setProgress(50);
      
      const { data, error } = await supabase.functions.invoke('generate-guide', {
        body: { slideTexts, deckTitle }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to generate guides');
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setProgress(90);
      
      const newDeck: Deck = {
        id: Date.now().toString(),
        title: deckTitle,
        slideCount: data.guides.length,
        createdAt: 'Just now',
        guides: data.guides,
      };
      
      setProgress(100);
      setCurrentDeck(newDeck);
      setIsProcessing(false);
      setShowCelebration(true);
      
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process file');
      setIsProcessing(false);
      setProgress(0);
    }
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
            {currentDeck.guides.map((guide, index) => (
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
