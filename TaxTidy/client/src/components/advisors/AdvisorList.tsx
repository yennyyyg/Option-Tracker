import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Eye, MessageSquare, Mail, Clock } from 'lucide-react';
import { Advisor } from '@/api/advisors';
import { formatDistanceToNow } from 'date-fns';

interface AdvisorListProps {
  advisors: Advisor[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'accepted':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'declined':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

const getPermissionIcon = (permission: string) => {
  return permission === 'comment' ? MessageSquare : Eye;
};

export function AdvisorList({ advisors }: AdvisorListProps) {
  if (advisors.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No advisors yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Invite your first tax advisor to start collaborating
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {advisors.map((advisor) => {
        const PermissionIcon = getPermissionIcon(advisor.permissions);
        return (
          <div
            key={advisor._id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {advisor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {advisor.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {advisor.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Invited {formatDistanceToNow(new Date(advisor.invitedDate), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(advisor.status)}>
                {advisor.status}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <PermissionIcon className="h-3 w-3" />
                {advisor.permissions}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}