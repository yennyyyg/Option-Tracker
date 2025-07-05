import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send } from 'lucide-react';
import { AdvisorComment } from '@/api/advisors';
import { formatDistanceToNow } from 'date-fns';

interface CommentsListProps {
  comments: AdvisorComment[];
  onAddComment: (documentId: string, comment: string) => void;
}

export function CommentsList({ comments, onAddComment }: CommentsListProps) {
  const [newComment, setNewComment] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddComment = async () => {
    if (newComment.trim()) {
      setIsAdding(true);
      try {
        await onAddComment('sample-doc-id', newComment);
        setNewComment('');
      } finally {
        setIsAdding(false);
      }
    }
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No comments yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Comments from your advisors will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comments List */}
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment._id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {comment.advisorName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {comment.advisorName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(comment.createdDate), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {comment.comment}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Comment */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment or question for your advisor..."
            rows={2}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleAddComment}
              disabled={!newComment.trim() || isAdding}
            >
              <Send className="h-4 w-4 mr-1" />
              {isAdding ? 'Adding...' : 'Add Comment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}