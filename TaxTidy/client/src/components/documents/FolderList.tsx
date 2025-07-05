import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Folder } from 'lucide-react';
import { DocumentFolder } from '@/api/documents';
import { cn } from '@/lib/utils';

interface FolderListProps {
  folders: DocumentFolder[];
  selectedFolder: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

export function FolderList({ folders, selectedFolder, onSelectFolder }: FolderListProps) {
  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start',
          selectedFolder === null && 'bg-gray-100 dark:bg-gray-800'
        )}
        onClick={() => onSelectFolder(null)}
      >
        <FolderOpen className="h-4 w-4 mr-2" />
        All Documents
      </Button>
      
      {folders.map((folder) => (
        <Button
          key={folder._id}
          variant="ghost"
          className={cn(
            'w-full justify-between',
            selectedFolder === folder.name && 'bg-gray-100 dark:bg-gray-800'
          )}
          onClick={() => onSelectFolder(folder.name)}
        >
          <div className="flex items-center">
            <Folder className="h-4 w-4 mr-2" />
            <span className="truncate">{folder.name}</span>
          </div>
          <Badge variant="secondary" className="ml-2">
            {folder.documentCount}
          </Badge>
        </Button>
      ))}
    </div>
  );
}