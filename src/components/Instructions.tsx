import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FileText, Link as LinkIcon, Code, Info } from 'lucide-react';
export function Instructions() {
  return (
    <div className="w-full animate-fade-in" style={{ animationDelay: '200ms' }}>
      <Accordion type="single" collapsible className="w-full" defaultValue="instructions">
        <AccordionItem value="instructions" className="border rounded-lg px-4 bg-card">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center">
              <Info className="mr-3 h-5 w-5 text-primary" />
              How to Use LinkIntel
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 text-muted-foreground pt-4">
            <p>
              LinkIntel requires two CSV files to analyze your website's internal linking opportunities. Follow the format instructions below for each file to ensure a successful analysis.
            </p>
            <div className="space-y-4">
              <h4 className="flex items-center font-semibold text-foreground">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                1. Embeddings CSV File
              </h4>
              <p>
                This file maps your page URLs to their corresponding text embeddings. Text embeddings are numerical representations of your content that allow us to find semantically similar pages.
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>**Required Headers:** `URL`, `Embeddings`</li>
                <li>The `URL` column should contain the full URL of the page.</li>
                <li>The `Embeddings` column must be a comma-separated string of numbers (e.g., <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">0.123,-0.456,0.789,...</code>).</li>
              </ul>
              <div className="p-4 bg-muted/50 rounded-md text-sm">
                <p className="font-semibold mb-2 flex items-center"><Code className="mr-2 h-4 w-4" />Example:</p>
                <pre className="font-mono text-xs overflow-x-auto">
                  <code>
                    URL,Embeddings<br />
                    https://example.com/page-a,"0.1,-0.2,0.3,..."<br />
                    https://example.com/page-b,"0.4,0.5,-0.6,..."
                  </code>
                </pre>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="flex items-center font-semibold text-foreground">
                <LinkIcon className="mr-2 h-5 w-5 text-primary" />
                2. Internal Links CSV File
              </h4>
              <p>
                This file details your website's existing internal link structure. It's used to check which of the recommended contextual links are already in place.
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>**Required Headers:** `Type`, `Source`, `Destination`</li>
                <li>The `Source` column is the URL of the page containing the link.</li>
                <li>The `Destination` column is the URL of the page being linked to.</li>
                <li>The analysis specifically processes rows where the `Type` is exactly <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">Hyperlink</code>.</li>
              </ul>
              <div className="p-4 bg-muted/50 rounded-md text-sm">
                <p className="font-semibold mb-2 flex items-center"><Code className="mr-2 h-4 w-4" />Example:</p>
                <pre className="font-mono text-xs overflow-x-auto">
                  <code>
                    Type,Source,Destination<br />
                    Hyperlink,https://example.com/page-a,https://example.com/page-c<br />
                    Image,https://example.com/page-a,https://example.com/logo.png
                  </code>
                </pre>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}