import React from 'react';
import { Link2, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FileUpload } from '@/components/FileUpload';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { useAnalysisStore } from '@/stores/useAnalysisStore';
import { Instructions } from '@/components/Instructions';
export function HomePage() {
  const embeddingsFile = useAnalysisStore(s => s.embeddingsFile);
  const setEmbeddingsFile = useAnalysisStore(s => s.setEmbeddingsFile);
  const internalLinksFile = useAnalysisStore(s => s.internalLinksFile);
  const setInternalLinksFile = useAnalysisStore(s => s.setInternalLinksFile);
  const status = useAnalysisStore(s => s.status);
  const startAnalysis = useAnalysisStore(s => s.startAnalysis);
  const isProcessing = status === 'processing';
  const canAnalyze = !!embeddingsFile && !!internalLinksFile && !isProcessing;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ThemeToggle className="fixed top-4 right-4" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24">
          <div className="text-center space-y-4">
            <div className="inline-block p-3 bg-primary/10 rounded-lg">
              <Link2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              LinkIntel
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              A minimalist web tool to analyze and discover contextual internal linking opportunities on your website using semantic embeddings.
            </p>
          </div>
          <div className="mt-12 max-w-4xl mx-auto space-y-12">
            <Instructions />
            <Card className="w-full animate-fade-in" style={{ animationDelay: '400ms' }}>
              <CardHeader>
                <CardTitle>Start Your Analysis</CardTitle>
                <CardDescription>Upload your two CSV files to begin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUpload
                    title="Upload Embeddings CSV"
                    description="Drag & drop or click to upload"
                    file={embeddingsFile}
                    onFileChange={setEmbeddingsFile}
                  />
                  <FileUpload
                    title="Upload Internal Links CSV"
                    description="Drag & drop or click to upload"
                    file={internalLinksFile}
                    onFileChange={setInternalLinksFile}
                  />
                </div>
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={startAnalysis}
                    disabled={!canAnalyze}
                    className="w-full md:w-auto px-8 transition-all duration-200"
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Zap className="mr-2 h-5 w-5" />
                    )}
                    {isProcessing ? 'Analyzing...' : 'Analyze Links'}
                  </Button>
                </div>
              </CardContent>
            </Card>
            <ResultsDisplay />
          </div>
        </div>
      </main>
      <footer className="text-center py-8 text-muted-foreground text-sm">
        <p>Built with ❤️ at Cloudflare</p>
      </footer>
      <Toaster richColors closeButton />
    </div>
  );
}