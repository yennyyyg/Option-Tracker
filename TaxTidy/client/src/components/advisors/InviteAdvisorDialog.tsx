import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Eye, MessageSquare } from 'lucide-react';

interface InviteAdvisorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteAdvisor: (inviteData: { email: string; permissions: 'view' | 'comment'; message?: string }) => void;
}

export function InviteAdvisorDialog({ open, onOpenChange, onInviteAdvisor }: InviteAdvisorDialogProps) {
  const [formData, setFormData] = useState({
    email: '',
    permissions: 'view' as 'view' | 'comment',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email) {
      onInviteAdvisor(formData);
      setFormData({ email: '', permissions: 'view', message: '' });
    }
  };

  const handleClose = () => {
    setFormData({ email: '', permissions: 'view', message: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>Invite Tax Advisor</DialogTitle>
          <DialogDescription>
            Send an invitation to your tax advisor or CPA to collaborate on your tax documents.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="advisor@taxfirm.com"
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Permission Level</Label>
            <RadioGroup
              value={formData.permissions}
              onValueChange={(value: 'view' | 'comment') => 
                setFormData({ ...formData, permissions: value })
              }
            >
              <div className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <RadioGroupItem value="view" id="view" />
                <div className="flex items-center gap-2 flex-1">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label htmlFor="view" className="font-medium">View Only</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Can view documents but cannot leave comments
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <RadioGroupItem value="comment" id="comment" />
                <div className="flex items-center gap-2 flex-1">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label htmlFor="comment" className="font-medium">View & Comment</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Can view documents and leave comments
                    </p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Add a personal message to your invitation..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Send Invitation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}