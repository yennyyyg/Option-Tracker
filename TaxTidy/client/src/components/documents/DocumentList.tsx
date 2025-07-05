import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Image, Trash2, Eye, Download } from 'lucide-react';
import { Document } from '@/api/documents';
import { formatDistanceToNow } from 'date-fns';

interface DocumentListProps {
  documents: Document[];
  onDelete: (documentId: string) => void;
}

const getFileIcon = (type: string) => {
  if (type.includes('image')) return Image;
  return FileText;
};

const getFileTypeColor = (type: string) => {
  if (type.includes('pdf')) return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  if (type.includes('image')) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No documents found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Upload your first document to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((document) => {
        const Icon = getFileIcon(document.type);
        return (
          <div
            key={document._id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <Icon className="h-8 w-8 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {document.name}
                  </h4>
                  <Badge className={getFileTypeColor(document.type)}>
                    {document.type.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{formatFileSize(document.size)}</span>
                  <span>•</span>
                  <span>{document.category}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(document.uploadDate), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(document._id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}