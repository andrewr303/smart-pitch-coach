import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
  progress?: number;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  isProcessing = false,
  progress = 0,
  className,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragOver(true);
    } else if (e.type === 'dragleave') {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (isValidFile(file)) {
          setSelectedFile(file);
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (isValidFile(file)) {
          setSelectedFile(file);
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const isValidFile = (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];
    const validType = validTypes.includes(file.type) || file.name.endsWith('.pptx') || file.name.endsWith('.pdf');
    if (!validType) {
      toast.error('Invalid file type. Please upload a PDF or PPTX file.');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      return false;
    }
    return true;
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isProcessing) {
    return (
      <div className={cn('w-full', className)}>
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Processing your deck...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Extracting slides and generating your guide
              </p>
            </div>
            <div className="w-full max-w-xs">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">{progress}% complete</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedFile && !isProcessing) {
    return (
      <div className={cn('w-full', className)}>
        <div className="rounded-xl border-2 border-success/30 bg-success/5 p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-success/20 flex items-center justify-center">
              <FileText className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={clearFile}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <label
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-200',
          isDragOver
            ? 'border-secondary bg-secondary/10 scale-[1.02]'
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
        )}
      >
        <input
          type="file"
          onChange={handleFileInput}
          accept=".pdf,.pptx"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className={cn(
            'h-16 w-16 rounded-full flex items-center justify-center transition-all duration-200',
            isDragOver ? 'bg-secondary/20' : 'bg-primary/10'
          )}
        >
          <Upload
            className={cn(
              'h-8 w-8 transition-colors',
              isDragOver ? 'text-secondary' : 'text-primary'
            )}
          />
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">
            {isDragOver ? 'Drop your deck here!' : 'Drop your presentation here'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
            PDF
          </span>
          <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
            PPTX
          </span>
        </div>
      </label>
    </div>
  );
};

export default FileUpload;
