import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, Plus, Clock, CheckCircle } from 'lucide-react';
import { getReminders, createReminder, updateReminder, deleteReminder, Reminder } from '@/api/reminders';
import { useToast } from '@/hooks/useToast';
import { ReminderList } from '@/components/reminders/ReminderList';
import { AddReminderDialog } from '@/components/reminders/AddReminderDialog';
import { ReminderCalendar } from '@/components/reminders/ReminderCalendar';

export function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const { toast } = useToast();

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        console.log('Fetching reminders...');
        const response = await getReminders();
        setReminders((response as any).reminders);
        console.log('Reminders loaded successfully');
      } catch (error) {
        console.error('Error fetching reminders:', error);
        toast({
          title: 'Error',
          description: 'Failed to load reminders',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, [toast]);

  const handleAddReminder = async (reminderData: Omit<Reminder, '_id' | 'completed' | 'createdDate'>) => {
    try {
      console.log('Adding reminder:', reminderData);
      const response = await createReminder(reminderData);
      setReminders([...reminders, (response as any).reminder]);
      setShowAddReminder(false);
      toast({
        title: 'Success',
        description: 'Reminder created successfully'
      });
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to create reminder',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateReminder = async (reminderId: string, updates: Partial<Reminder>) => {
    try {
      console.log('Updating reminder:', reminderId, updates);
      await updateReminder(reminderId, updates);
      setReminders(reminders.map(reminder =>
        reminder._id === reminderId ? { ...reminder, ...updates } : reminder
      ));
      toast({
        title: 'Success',
        description: 'Reminder updated successfully'
      });
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to update reminder',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      console.log('Deleting reminder:', reminderId);
      await deleteReminder(reminderId);
      setReminders(reminders.filter(reminder => reminder._id !== reminderId));
      toast({
        title: 'Success',
        description: 'Reminder deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete reminder',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const upcomingReminders = reminders.filter(r => !r.completed && new Date(r.dueDate) >= new Date());
  const completedReminders = reminders.filter(r => r.completed);
  const overdueReminders = reminders.filter(r => !r.completed && new Date(r.dueDate) < new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reminders & Deadlines
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Stay on top of important tax deadlines and tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <Bell className="h-4 w-4 mr-1" />
              List
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Calendar
            </Button>
          </div>
          <Button onClick={() => setShowAddReminder(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Reminder
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="backdrop-blur-sm bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  Overdue
                </p>
                <p className="text-2xl font-bold text-orange-800 dark:text-orange-300">
                  {overdueReminders.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Upcoming
                </p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                  {upcomingReminders.length}
                </p>
              </div>
              <Bell className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Completed
                </p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                  {completedReminders.length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <ReminderList
          reminders={reminders}
          onUpdateReminder={handleUpdateReminder}
          onDeleteReminder={handleDeleteReminder}
        />
      ) : (
        <ReminderCalendar
          reminders={reminders}
          onUpdateReminder={handleUpdateReminder}
        />
      )}

      <AddReminderDialog
        open={showAddReminder}
        onOpenChange={setShowAddReminder}
        onAddReminder={handleAddReminder}
      />
    </div>
  );
}