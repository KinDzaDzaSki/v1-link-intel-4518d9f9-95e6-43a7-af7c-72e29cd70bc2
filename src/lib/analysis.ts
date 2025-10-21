import Papa, { ParseError } from 'papaparse';
// Type Definitions
interface EmbeddingRow {
  URL: string;
  Embeddings: string;
}
interface InternalLinkRow {
  Type: string;
  Source: string;
  Destination: string;
}
export interface AnalysisResult {
  url: string;
  relatedUrl: string;
  isActiveLink: boolean;
}
export interface AnalysisStats {
  totalPairs: number;
  activeLinks: number;
  percentage: string;
}
// Helper Functions
const parseCsv = <T>(file: File): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
        } else {
          resolve(results.data);
        }
      },
      error: (error: ParseError) => {
        reject(new Error(`Failed to parse CSV file: ${error.message}`));
      },
    });
  });
};
const safeConvertEmbedding = (embeddingStr: string): number[] | null => {
  try {
    if (!embeddingStr || typeof embeddingStr !== 'string') return null;
    const arr = embeddingStr.split(',').map(s => parseFloat(s.trim()));
    if (arr.some(isNaN)) return null;
    return arr;
  } catch (e) {
    return null;
  }
};
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
};
// Main Analysis Function
export const runAnalysis = async (
  embeddingsFile: File,
  internalLinksFile: File
): Promise<{ results: AnalysisResult[]; stats: AnalysisStats }> => {
  // 1. Parse Files
  const [embeddingData, internalLinksData] = await Promise.all([
    parseCsv<EmbeddingRow>(embeddingsFile),
    parseCsv<InternalLinkRow>(internalLinksFile),
  ]);
  if (!embeddingData.length) throw new Error("Embeddings CSV is empty or invalid.");
  // Check headers on the first row if it exists.
  const firstEmbeddingRow = embeddingData[0];
  if (!firstEmbeddingRow || typeof firstEmbeddingRow.URL === 'undefined' || typeof firstEmbeddingRow.Embeddings === 'undefined') throw new Error("Embeddings CSV must have 'URL' and 'Embeddings' headers.");
  const firstLinkRow = internalLinksData[0];
  if (internalLinksData.length > 0 && (!firstLinkRow || typeof firstLinkRow.Source === 'undefined' || typeof firstLinkRow.Destination === 'undefined')) throw new Error("Internal Links CSV must have 'Source' and 'Destination' headers.");

  // 2. Process Embeddings
  const validEmbeddings = embeddingData
    .map(row => ({
      url: row.URL,
      embedding: safeConvertEmbedding(row.Embeddings),
    }))
    .filter(item => item.embedding !== null && item.embedding.length > 0);
  if (!validEmbeddings.length) throw new Error("No valid embeddings found in the file.");
  // 3. Find Related Pages (Cosine Similarity)
  const topN = 5;
  const relatedPages: Map<string, string[]> = new Map();
  const embeddings = validEmbeddings.map(v => v.embedding as number[]);
  for (let i = 0; i < validEmbeddings.length; i++) {
    const similarities = [];
    for (let j = 0; j < validEmbeddings.length; j++) {
      if (i === j) continue;
      const sim = cosineSimilarity(embeddings[i], embeddings[j]);
      similarities.push({ index: j, score: sim });
    }
    similarities.sort((a, b) => b.score - a.score);
    const topNIndices = similarities.slice(0, topN).map(s => s.index);
    const relatedUrls = topNIndices.map(idx => validEmbeddings[idx].url);
    relatedPages.set(validEmbeddings[i].url, relatedUrls);
  }
  // 4. Process Internal Links
  const internalLinksSet = new Set(
    internalLinksData
      .filter(link => link.Type === 'Hyperlink')
      .map(link => `${link.Source}__TO__${link.Destination}`)
  );
  // 5. Create Final Output
  const results: AnalysisResult[] = [];
  for (const [url, relatedUrls] of relatedPages.entries()) {
    for (const relatedUrl of relatedUrls) {
      const is_active_link = internalLinksSet.has(`${url}__TO__${relatedUrl}`);
      results.push({
        url: url,
        relatedUrl: relatedUrl,
        isActiveLink: is_active_link,
      });
    }
  }
  // 6. Calculate Stats
  const totalPairs = results.length;
  const activeLinks = results.filter(r => r.isActiveLink).length;
  const percentage = totalPairs > 0 ? ((activeLinks / totalPairs) * 100).toFixed(2) : "0.00";
  const stats: AnalysisStats = {
    totalPairs,
    activeLinks,
    percentage: `${percentage}%`,
  };
  return { results, stats };
};