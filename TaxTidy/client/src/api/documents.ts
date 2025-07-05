import api from './api';

export interface Document {
  _id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  category: string;
  url: string;
  thumbnail?: string;
}

export interface DocumentFolder {
  _id: string;
  name: string;
  documentCount: number;
  createdDate: string;
}

// Description: Get all documents for the current user
// Endpoint: GET /api/documents
// Request: {}
// Response: { documents: Document[] }
export const getDocuments = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        documents: [
          {
            _id: '1',
            name: 'W-2_2023.pdf',
            type: 'pdf',
            size: 245760,
            uploadDate: '2024-01-15T10:30:00Z',
            category: 'W-2s',
            url: '/documents/w2-2023.pdf',
            thumbnail: '/thumbnails/w2-2023.jpg'
          },
          {
            _id: '2',
            name: '1099-INT_Bank.pdf',
            type: 'pdf',
            size: 156432,
            uploadDate: '2024-01-20T14:22:00Z',
            category: '1099s',
            url: '/documents/1099-int.pdf',
            thumbnail: '/thumbnails/1099-int.jpg'
          },
          {
            _id: '3',
            name: 'Receipt_Office_Supplies.jpg',
            type: 'image',
            size: 89234,
            uploadDate: '2024-02-01T09:15:00Z',
            category: 'Receipts',
            url: '/documents/receipt-office.jpg',
            thumbnail: '/thumbnails/receipt-office.jpg'
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/documents');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Upload a new document
// Endpoint: POST /api/documents/upload
// Request: FormData with file and metadata
// Response: { success: boolean, document: Document }
export const uploadDocument = (formData: FormData) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        document: {
          _id: Date.now().toString(),
          name: 'new-document.pdf',
          type: 'pdf',
          size: 123456,
          uploadDate: new Date().toISOString(),
          category: 'Uncategorized',
          url: '/documents/new-document.pdf'
        }
      });
    }, 1000);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/documents/upload', formData, {
  //     headers: { 'Content-Type': 'multipart/form-data' }
  //   });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Delete a document
// Endpoint: DELETE /api/documents/:id
// Request: { id: string }
// Response: { success: boolean }
export const deleteDocument = (id: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.delete(`/api/documents/${id}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get document folders
// Endpoint: GET /api/documents/folders
// Request: {}
// Response: { folders: DocumentFolder[] }
export const getDocumentFolders = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        folders: [
          { _id: '1', name: 'W-2s', documentCount: 3, createdDate: '2024-01-01T00:00:00Z' },
          { _id: '2', name: '1099s', documentCount: 5, createdDate: '2024-01-01T00:00:00Z' },
          { _id: '3', name: 'Receipts', documentCount: 12, createdDate: '2024-01-01T00:00:00Z' },
          { _id: '4', name: 'Bank Statements', documentCount: 8, createdDate: '2024-01-01T00:00:00Z' }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/documents/folders');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};