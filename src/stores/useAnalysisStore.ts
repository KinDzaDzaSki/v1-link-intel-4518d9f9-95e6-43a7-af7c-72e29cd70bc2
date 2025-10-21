import { create } from 'zustand';
import { runAnalysis, AnalysisResult, AnalysisStats } from '@/lib/analysis';
import { toast } from 'sonner';
type AnalysisStatus = 'idle' | 'parsing' | 'processing' | 'success' | 'error';
interface AnalysisState {
  embeddingsFile: File | null;
  internalLinksFile: File | null;
  status: AnalysisStatus;
  results: AnalysisResult[] | null;
  stats: AnalysisStats | null;
  error: string | null;
  setEmbeddingsFile: (file: File | null) => void;
  setInternalLinksFile: (file: File | null) => void;
  startAnalysis: () => Promise<void>;
  reset: () => void;
}
export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  embeddingsFile: null,
  internalLinksFile: null,
  status: 'idle',
  results: null,
  stats: null,
  error: null,
  setEmbeddingsFile: (file) => set({ embeddingsFile: file, status: 'idle', results: null, stats: null, error: null }),
  setInternalLinksFile: (file) => set({ internalLinksFile: file, status: 'idle', results: null, stats: null, error: null }),
  startAnalysis: async () => {
    const { embeddingsFile, internalLinksFile } = get();
    if (!embeddingsFile || !internalLinksFile) {
      set({ status: 'error', error: 'Both files must be uploaded.' });
      toast.error('Missing Files', { description: 'Please upload both embeddings and internal links CSV files.' });
      return;
    }
    set({ status: 'processing', error: null, results: null, stats: null });
    toast.info('Analysis Started', { description: 'Processing your files... This may take a moment for large datasets.' });
    try {
      // Use a timeout to allow the UI to update to the loading state before the heavy computation blocks the main thread.
      await new Promise(resolve => setTimeout(resolve, 100));
      const { results, stats } = await runAnalysis(embeddingsFile, internalLinksFile);
      set({ status: 'success', results, stats });
      toast.success('Analysis Complete', { description: `Found ${stats.activeLinks} active links out of ${stats.totalPairs} potential pairs.` });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during analysis.';
      set({ status: 'error', error: errorMessage, results: null, stats: null });
      toast.error('Analysis Failed', { description: errorMessage });
    }
  },
  reset: () => set({
    embeddingsFile: null,
    internalLinksFile: null,
    status: 'idle',
    results: null,
    stats: null,
    error: null,
  }),
}));