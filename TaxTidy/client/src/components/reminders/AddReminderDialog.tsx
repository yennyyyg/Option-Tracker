import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Reminder } from '@/api/reminders';
import { cn } from '@/lib/utils';

interface AddReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddReminder: (reminderData: Omit<Reminder, '_id' | 'completed' | 'createdDate'>) => void;
}

export function AddReminderDialog({ open, onOpenChange, onAddReminder }: AddReminderDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: new Date(),
    notificationSettings: {
      email: true,
      inApp: true,
      advanceNotice: 7
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.description) {
      onAddReminder({
        ...formData,
        dueDate: formData.dueDate.toISOString()
      });
      setFormData({
        title: '',
        description: '',
        dueDate: new Date(),
        notificationSettings: {
          email: true,
          inApp: true,
          advanceNotice: 7
        }
      });
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: new Date(),
      notificationSettings: {
        email: true,
        inApp: true,
        advanceNotice: 7
      }
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>Add New Reminder</DialogTitle>
          <DialogDescription>
            Create a reminder for important tax deadlines and tasks.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., File Tax Return"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about this reminder..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.dueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? format(formData.dueDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => date && setFormData({ ...formData, dueDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-4">
            <Label>Notification Settings</Label>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="text-sm">
                Email Notifications
              </Label>
              <Switch
                id="email-notifications"
                checked={formData.notificationSettings.email}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    notificationSettings: {
                      ...formData.notificationSettings,
                      email: checked
                    }
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="app-notifications" className="text-sm">
                In-App Notifications
              </Label>
              <Switch
                id="app-notifications"
                checked={formData.notificationSettings.inApp}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    notificationSettings: {
                      ...formData.notificationSettings,
                      inApp: checked
                    }
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="advance-notice">Advance Notice</Label>
              <Select
                value={formData.notificationSettings.advanceNotice.toString()}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    notificationSettings: {
                      ...formData.notificationSettings,
                      advanceNotice: parseInt(value)
                    }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day before</SelectItem>
                  <SelectItem value="3">3 days before</SelectItem>
                  <SelectItem value="7">1 week before</SelectItem>
                  <SelectItem value="14">2 weeks before</SelectItem>
                  <SelectItem value="30">1 month before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Create Reminder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}