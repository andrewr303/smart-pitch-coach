import { useCallback, useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const isValidFile = (file: File) => {
  const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
  const validType = validTypes.includes(file.type) || file.name.endsWith('.pptx') || file.name.endsWith('.pdf') || file.name.endsWith('.ppt');
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

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) onFileSelect(file);
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) onFileSelect(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
        ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
        ${isProcessing ? 'pointer-events-none opacity-60' : ''}
      `}
    >
      <input
        type="file"
        accept=".pdf,.pptx,.ppt"
        onChange={handleChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
        disabled={isProcessing}
      />
      
      <div className="flex flex-col items-center gap-4">
        {isProcessing ? (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <div>
              <p className="text-foreground font-medium">Generating your speaker guide...</p>
              <p className="text-sm text-muted-foreground mt-1">This may take a moment</p>
            </div>
          </>
        ) : (
          <>
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-foreground font-medium">Drop your presentation here</p>
              <p className="text-sm text-muted-foreground mt-1">or click to browse (PDF, PPTX)</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Supports PDF and PowerPoint files</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
