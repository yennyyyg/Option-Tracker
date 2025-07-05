import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, Calendar, Mail, Trash2, AlertTriangle } from 'lucide-react';
import { Reminder } from '@/api/reminders';
import { formatDistanceToNow, format, isPast } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReminderListProps {
  reminders: Reminder[];
  onUpdateReminder: (reminderId: string, updates: Partial<Reminder>) => void;
  onDeleteReminder: (reminderId: string) => void;
}

export function ReminderList({ reminders, onUpdateReminder, onDeleteReminder }: ReminderListProps) {
  const handleToggleComplete = (reminder: Reminder) => {
    onUpdateReminder(reminder._id, { completed: !reminder.completed });
  };

  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const groupedReminders = sortedReminders.reduce((acc, reminder) => {
    const isOverdue = !reminder.completed && isPast(new Date(reminder.dueDate));
    const isCompleted = reminder.completed;

    let category = 'upcoming';
    if (isCompleted) category = 'completed';
    else if (isOverdue) category = 'overdue';

    if (!acc[category]) acc[category] = [];
    acc[category].push(reminder);
    return acc;
  }, {} as Record<string, Reminder[]>);

  const renderReminderCard = (reminder: Reminder) => {
    const isOverdue = !reminder.completed && isPast(new Date(reminder.dueDate));
    const dueDate = new Date(reminder.dueDate);

    return (
      <Card
        key={reminder._id}
        className={cn(
          'transition-all duration-200 hover:shadow-md',
          reminder.completed && 'opacity-60',
          isOverdue && 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20'
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <Checkbox
                checked={reminder.completed}
                onCheckedChange={() => handleToggleComplete(reminder)}
                className="h-5 w-5"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className={cn(
                  'font-medium',
                  reminder.completed
                    ? 'text-gray-500 dark:text-gray-400 line-through'
                    : isOverdue
                    ? 'text-red-800 dark:text-red-400'
                    : 'text-gray-900 dark:text-white'
                )}>
                  {reminder.title}
                </h4>
                <div className="flex items-center gap-2">
                  {isOverdue && !reminder.completed && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Overdue
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteReminder(reminder._id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {reminder.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(dueDate, 'MMM d, yyyy')}</span>
                  </div>
                  <span>•</span>
                  <span>
                    {reminder.completed
                      ? 'Completed'
                      : formatDistanceToNow(dueDate, { addSuffix: true })
                    }
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {reminder.notificationSettings.email && (
                    <Badge variant="outline" className="text-xs">
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </Badge>
                  )}
                  {reminder.notificationSettings.inApp && (
                    <Badge variant="outline" className="text-xs">
                      <Bell className="h-3 w-3 mr-1" />
                      App
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {groupedReminders.overdue && groupedReminders.overdue.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Overdue ({groupedReminders.overdue.length})
          </h3>
          <div className="space-y-3">
            {groupedReminders.overdue.map(renderReminderCard)}
          </div>
        </div>
      )}

      {groupedReminders.upcoming && groupedReminders.upcoming.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Upcoming ({groupedReminders.upcoming.length})
          </h3>
          <div className="space-y-3">
            {groupedReminders.upcoming.map(renderReminderCard)}
          </div>
        </div>
      )}

      {groupedReminders.completed && groupedReminders.completed.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Completed ({groupedReminders.completed.length})
          </h3>
          <div className="space-y-3">
            {groupedReminders.completed.map(renderReminderCard)}
          </div>
        </div>
      )}

      {reminders.length === 0 && (
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
          <CardContent className="p-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No reminders yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Create your first reminder to stay on top of tax deadlines
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}