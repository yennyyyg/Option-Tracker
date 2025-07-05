import { Button } from '@/components/ui/button';
import { Upload, FileText, Bell, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Upload Documents',
      description: 'Add new tax documents',
      icon: Upload,
      onClick: () => navigate('/documents'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Check Forms',
      description: 'Review required forms',
      icon: FileText,
      onClick: () => navigate('/forms'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Set Reminder',
      description: 'Add deadline reminder',
      icon: Bell,
      onClick: () => navigate('/reminders'),
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'Invite Advisor',
      description: 'Collaborate with CPA',
      icon: Users,
      onClick: () => navigate('/advisors'),
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  return (
    <div className="space-y-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.title}
            variant="ghost"
            className="w-full justify-start h-auto p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            onClick={action.onClick}
          >
            <div className={`p-2 rounded-lg ${action.color} text-white mr-3`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">
                {action.title}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {action.description}
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );
}