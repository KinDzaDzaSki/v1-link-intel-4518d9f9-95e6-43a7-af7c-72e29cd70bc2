import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
interface FileUploadProps {
  title: string;
  description: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  className?: string;
}
export function FileUpload({ title, description, file, onFileChange, className }: FileUploadProps) {
  const [isHovering, setIsHovering] = useState(false);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileChange(acceptedFiles[0]);
    }
  }, [onFileChange]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  });
  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
  };
  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out",
          isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/70"
        )}
      >
        <input {...getInputProps()} />
        {file ? (
          <div 
            className="flex items-center space-x-4 w-full"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="flex-shrink-0 p-3 bg-muted rounded-full">
              <FileIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "opacity-0 transition-opacity duration-200 rounded-full w-8 h-8",
                isHovering && "opacity-100"
              )}
              onClick={handleClearFile}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-semibold text-foreground">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            <p className="mt-2 text-xs text-muted-foreground/80">CSV files only</p>
          </div>
        )}
      </div>
    </div>
  );
}