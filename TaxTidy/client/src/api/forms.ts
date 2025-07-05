import api from './api';

export interface TaxForm {
  _id: string;
  name: string;
  description: string;
  required: boolean;
  completed: boolean;
  category: string;
  notes?: string;
}

// Description: Get tax forms checklist
// Endpoint: GET /api/forms
// Request: {}
// Response: { forms: TaxForm[] }
export const getTaxForms = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        forms: [
          {
            _id: '1',
            name: 'W-2 Forms',
            description: 'Wage and Tax Statement from all employers',
            required: true,
            completed: true,
            category: 'Income',
            notes: 'Received from ABC Corp'
          },
          {
            _id: '2',
            name: '1099-INT',
            description: 'Interest Income statements',
            required: true,
            completed: false,
            category: 'Income'
          },
          {
            _id: '3',
            name: '1099-DIV',
            description: 'Dividend Income statements',
            required: true,
            completed: false,
            category: 'Income'
          },
          {
            _id: '4',
            name: 'Receipts for Deductions',
            description: 'Medical, charitable, business expense receipts',
            required: false,
            completed: true,
            category: 'Deductions',
            notes: 'Organized by month'
          },
          {
            _id: '5',
            name: 'Previous Year Tax Return',
            description: 'Last year\'s complete tax return',
            required: true,
            completed: true,
            category: 'Reference'
          },
          {
            _id: '6',
            name: 'Bank Statements',
            description: 'Year-end statements from all accounts',
            required: false,
            completed: false,
            category: 'Reference'
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/forms');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Update tax form completion status
// Endpoint: PUT /api/forms/:id
// Request: { completed: boolean, notes?: string }
// Response: { success: boolean }
export const updateTaxForm = (id: string, data: { completed: boolean; notes?: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put(`/api/forms/${id}`, data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Add custom tax form
// Endpoint: POST /api/forms
// Request: { name: string, description: string, category: string }
// Response: { success: boolean, form: TaxForm }
export const addCustomTaxForm = (data: { name: string; description: string; category: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        form: {
          _id: Date.now().toString(),
          ...data,
          required: false,
          completed: false
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/forms', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};