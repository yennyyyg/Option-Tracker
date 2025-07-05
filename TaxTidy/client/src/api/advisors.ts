import api from './api';

export interface Advisor {
  _id: string;
  email: string;
  name: string;
  permissions: 'view' | 'comment';
  invitedDate: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface AdvisorComment {
  _id: string;
  documentId: string;
  advisorId: string;
  advisorName: string;
  comment: string;
  createdDate: string;
  replies?: AdvisorComment[];
}

// Description: Get all advisors
// Endpoint: GET /api/advisors
// Request: {}
// Response: { advisors: Advisor[] }
export const getAdvisors = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        advisors: [
          {
            _id: '1',
            email: 'john.advisor@taxfirm.com',
            name: 'John Smith, CPA',
            permissions: 'comment',
            invitedDate: '2024-01-10T00:00:00Z',
            status: 'accepted'
          },
          {
            _id: '2',
            email: 'sarah.tax@consultants.com',
            name: 'Sarah Johnson',
            permissions: 'view',
            invitedDate: '2024-01-15T00:00:00Z',
            status: 'pending'
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/advisors');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Invite an advisor
// Endpoint: POST /api/advisors/invite
// Request: { email: string, permissions: string, message?: string }
// Response: { success: boolean }
export const inviteAdvisor = (data: { email: string; permissions: 'view' | 'comment'; message?: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/advisors/invite', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get comments for a document
// Endpoint: GET /api/advisors/comments/:documentId
// Request: {}
// Response: { comments: AdvisorComment[] }
export const getDocumentComments = (documentId: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        comments: [
          {
            _id: '1',
            documentId,
            advisorId: '1',
            advisorName: 'John Smith, CPA',
            comment: 'This W-2 looks good. Make sure to double-check the state tax withholding amount.',
            createdDate: '2024-01-20T10:30:00Z'
          },
          {
            _id: '2',
            documentId,
            advisorId: '1',
            advisorName: 'John Smith, CPA',
            comment: 'You might want to organize these receipts by category for easier processing.',
            createdDate: '2024-01-22T14:15:00Z'
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get(`/api/advisors/comments/${documentId}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Add a comment to a document
// Endpoint: POST /api/advisors/comments
// Request: { documentId: string, comment: string }
// Response: { success: boolean, comment: AdvisorComment }
export const addDocumentComment = (data: { documentId: string; comment: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        comment: {
          _id: Date.now().toString(),
          ...data,
          advisorId: '1',
          advisorName: 'Current User',
          createdDate: new Date().toISOString()
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/advisors/comments', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};