import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Reminder } from '@/api/reminders';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface ReminderCalendarProps {
  reminders: Reminder[];
  onUpdateReminder: (reminderId: string, updates: Partial<Reminder>) => void;
}

export function ReminderCalendar({ reminders, onUpdateReminder }: ReminderCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const getRemindersForDate = (date: Date) => {
    return reminders.filter(reminder => 
      isSameDay(new Date(reminder.dueDate), date)
    );
  };

  const selectedDateReminders = getRemindersForDate(selectedDate);

  const handleToggleComplete = (reminder: Reminder) => {
    onUpdateReminder(reminder._id, { completed: !reminder.completed });
  };

  // Get all days with reminders for the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysWithReminders = eachDayOfInterval({ start: monthStart, end: monthEnd })
    .filter(day => getRemindersForDate(day).length > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={{
                hasReminders: daysWithReminders
              }}
              modifiersStyles={{
                hasReminders: {
                  backgroundColor: 'rgb(59 130 246 / 0.1)',
                  color: 'rgb(59 130 246)',
                  fontWeight: 'bold'
                }
              }}
              className="rounded-md border-0"
            />
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Details */}
      <div>
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedDate, 'MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateReminders.length > 0 ? (
              <div className="space-y-3">
                {selectedDateReminders.map((reminder) => (
                  <div
                    key={reminder._id}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {reminder.title}
                      </h4>
                      <Badge
                        variant={reminder.completed ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {reminder.completed ? 'Done' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {reminder.description}
                    </p>
                    <Button
                      size="sm"
                      variant={reminder.completed ? 'outline' : 'default'}
                      onClick={() => handleToggleComplete(reminder)}
                      className="w-full"
                    >
                      {reminder.completed ? 'Mark as Pending' : 'Mark as Complete'}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No reminders for this date
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}