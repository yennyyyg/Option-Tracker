import api from './api';

export interface Reminder {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  notificationSettings: {
    email: boolean;
    inApp: boolean;
    advanceNotice: number; // days before
  };
  createdDate: string;
}

// Description: Get all reminders
// Endpoint: GET /api/reminders
// Request: {}
// Response: { reminders: Reminder[] }
export const getReminders = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        reminders: [
          {
            _id: '1',
            title: 'Tax Filing Deadline',
            description: 'File federal and state tax returns',
            dueDate: '2024-04-15T23:59:59Z',
            completed: false,
            notificationSettings: {
              email: true,
              inApp: true,
              advanceNotice: 7
            },
            createdDate: '2024-01-01T00:00:00Z'
          },
          {
            _id: '2',
            title: 'Gather W-2 Forms',
            description: 'Collect all W-2 forms from employers',
            dueDate: '2024-02-15T23:59:59Z',
            completed: true,
            notificationSettings: {
              email: true,
              inApp: false,
              advanceNotice: 3
            },
            createdDate: '2024-01-15T00:00:00Z'
          },
          {
            _id: '3',
            title: 'Q1 Estimated Tax Payment',
            description: 'Make first quarter estimated tax payment',
            dueDate: '2024-04-15T23:59:59Z',
            completed: false,
            notificationSettings: {
              email: true,
              inApp: true,
              advanceNotice: 14
            },
            createdDate: '2024-01-01T00:00:00Z'
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/reminders');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Create a new reminder
// Endpoint: POST /api/reminders
// Request: { title: string, description: string, dueDate: string, notificationSettings: object }
// Response: { success: boolean, reminder: Reminder }
export const createReminder = (data: Omit<Reminder, '_id' | 'completed' | 'createdDate'>) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        reminder: {
          _id: Date.now().toString(),
          ...data,
          completed: false,
          createdDate: new Date().toISOString()
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/reminders', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Update reminder
// Endpoint: PUT /api/reminders/:id
// Request: Partial<Reminder>
// Response: { success: boolean }
export const updateReminder = (id: string, data: Partial<Reminder>) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put(`/api/reminders/${id}`, data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Delete reminder
// Endpoint: DELETE /api/reminders/:id
// Request: {}
// Response: { success: boolean }
export const deleteReminder = (id: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.delete(`/api/reminders/${id}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};