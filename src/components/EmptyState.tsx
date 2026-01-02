import React from 'react';
import { Presentation, Sparkles, Target, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileUpload from '@/components/ui/FileUpload';
interface EmptyStateProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
  progress?: number;
}
const EmptyState: React.FC<EmptyStateProps> = ({
  onFileSelect,
  isProcessing,
  progress
}) => {
  const features = [{
    icon: Sparkles,
    title: 'AI-Powered Guides',
    description: 'Get smart talking points generated for every slide'
  }, {
    icon: Target,
    title: 'Never Miss a Beat',
    description: 'Smooth transitions and key emphasis points'
  }, {
    icon: Mic,
    title: 'Practice & Improve',
    description: 'Record yourself and get AI feedback'
  }];
  return <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-primary/10 mb-6 animate-float">
            <Presentation className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl text-foreground mb-3 font-extrabold text-center">
            Welcome to <span className="text-primary font-extrabold">SmartPitch Coach</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Transform your slides into confident presentations with AI-powered speaker guides
          </p>
        </div>

        {/* Upload Area */}
        <div className="mb-10 animate-slide-up" style={{
        animationDelay: '0.1s'
      }}>
          <FileUpload onFileSelect={onFileSelect} isProcessing={isProcessing} progress={progress} />
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up" style={{
        animationDelay: '0.2s'
      }}>
          {features.map((feature, index) => <div key={feature.title} className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-md">
              <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-3">
                <feature.icon className="h-5 w-5 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>)}
        </div>
      </div>
    </div>;
};
export default EmptyState;