import React from 'react';
import { useAnalysisStore } from '@/stores/useAnalysisStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable, DataTableColumnHeader } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { AnalysisResult } from '@/lib/analysis';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
const StatCard = ({ title, value, isLoading }: { title: string; value: string | number; isLoading: boolean }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
);
const columns: ColumnDef<AnalysisResult>[] = [
  {
    accessorKey: 'url',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Source URL" />,
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue('url')}</div>,
  },
  {
    accessorKey: 'relatedUrl',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Related URL" />,
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue('relatedUrl')}</div>,
  },
  {
    accessorKey: 'isActiveLink',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Link Active" />,
    cell: ({ row }) => {
      const isActive = row.getValue('isActiveLink');
      return (
        <Badge variant={isActive ? 'default' : 'secondary'} className={isActive ? 'bg-green-500/20 text-green-700 border-green-500/30' : ''}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
];
const downloadCSV = (results: AnalysisResult[]) => {
  if (!results || results.length === 0) {
    toast.error("No data to download.");
    return;
  }
  const header = ['URL', 'Related URL', 'Active Link'];
  const rows = results.map(row => [row.url, row.relatedUrl, row.isActiveLink]);
  const csvContent = [header.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'related_pages_with_links.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success("CSV downloaded successfully.");
};
export function ResultsDisplay() {
  const status = useAnalysisStore(s => s.status);
  const results = useAnalysisStore(s => s.results);
  const stats = useAnalysisStore(s => s.stats);
  const isLoading = status === 'processing';
  if (status === 'idle') {
    return null;
  }
  return (
    <div className="w-full space-y-8 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total URL Pairs" value={stats?.totalPairs ?? 0} isLoading={isLoading} />
        <StatCard title="Active Internal Links" value={stats?.activeLinks ?? 0} isLoading={isLoading} />
        <StatCard title="Active Link Percentage" value={stats?.percentage ?? '0%'} isLoading={isLoading} />
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Analysis Results</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => results && downloadCSV(results)}
            disabled={isLoading || !results || results.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <DataTable columns={columns} data={results || []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}