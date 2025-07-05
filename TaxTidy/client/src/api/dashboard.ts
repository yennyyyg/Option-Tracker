import api from './api';

export interface DashboardStats {
  totalDocuments: number;
  completedForms: number;
  totalForms: number;
  upcomingDeadlines: number;
  pendingComments: number;
}

export interface RecentActivity {
  _id: string;
  type: 'upload' | 'form_completed' | 'comment' | 'reminder';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

// Description: Get dashboard statistics
// Endpoint: GET /api/dashboard/stats
// Request: {}
// Response: { stats: DashboardStats }
export const getDashboardStats = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        stats: {
          totalDocuments: 23,
          completedForms: 4,
          totalForms: 8,
          upcomingDeadlines: 3,
          pendingComments: 2
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/dashboard/stats');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get recent activity
// Endpoint: GET /api/dashboard/activity
// Request: {}
// Response: { activities: RecentActivity[] }
export const getRecentActivity = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        activities: [
          {
            _id: '1',
            type: 'upload',
            title: 'Document Uploaded',
            description: 'W-2_2023.pdf uploaded successfully',
            timestamp: '2024-01-20T10:30:00Z',
            icon: 'upload'
          },
          {
            _id: '2',
            type: 'form_completed',
            title: 'Form Completed',
            description: 'W-2 Forms marked as complete',
            timestamp: '2024-01-20T09:15:00Z',
            icon: 'check'
          },
          {
            _id: '3',
            type: 'comment',
            title: 'New Comment',
            description: 'John Smith, CPA left a comment on your 1099-INT',
            timestamp: '2024-01-19T16:45:00Z',
            icon: 'message'
          },
          {
            _id: '4',
            type: 'reminder',
            title: 'Reminder Set',
            description: 'Tax filing deadline reminder created',
            timestamp: '2024-01-19T14:20:00Z',
            icon: 'bell'
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/dashboard/activity');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};