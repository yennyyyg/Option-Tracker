import api from './api';

export interface Assignment {
  _id: string;
  user: {
    _id: string;
    email: string;
  };
  option: {
    _id: string;
    symbol: string;
    strike: number;
    expiration: string;
    strategy: string;
  };
  assignmentDate: string;
  strike: number;
  symbol: string;
  strategy: string;
  contracts: number;
  premiumKept: number;
  stockValue: number;
  totalPnL: number;
  assignmentProbability: number;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentRequest {
  optionId: string;
  strike: number;
  symbol: string;
  strategy: string;
  contracts: number;
  premiumKept: number;
  stockValue: number;
  assignmentProbability?: number;
  notes?: string;
}

export interface AssignmentSummary {
  totalAssignments: number;
  monthlyAssignments: number;
  assignmentRate: number;
  avgProfit: number;
  highRiskAssignments: number;
}

// Description: Create a new assignment
// Endpoint: POST /api/assignments
// Request: { optionId: string, strike: number, symbol: string, strategy: string, contracts: number, premiumKept: number, stockValue: number, assignmentProbability?: number, notes?: string }
// Response: { success: boolean, message: string, data: Assignment }
export const createAssignment = async (data: CreateAssignmentRequest) => {
  try {
    return await api.post('/api/assignments', data);
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get all assignments for the current user
// Endpoint: GET /api/assignments
// Request: { status?: string, symbol?: string, strategy?: string }
// Response: { success: boolean, data: Assignment[] }
export const getAssignments = async (filters?: { status?: string; symbol?: string; strategy?: string }) => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.symbol) params.append('symbol', filters.symbol);
    if (filters?.strategy) params.append('strategy', filters.strategy);
    
    const queryString = params.toString();
    const url = queryString ? `/api/assignments?${queryString}` : '/api/assignments';
    
    return await api.get(url);
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get assignment summary statistics
// Endpoint: GET /api/assignments/summary
// Request: {}
// Response: { success: boolean, data: AssignmentSummary }
export const getAssignmentSummary = async () => {
  try {
    return await api.get('/api/assignments/summary');
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get a specific assignment by ID
// Endpoint: GET /api/assignments/:id
// Request: {}
// Response: { success: boolean, data: Assignment }
export const getAssignmentById = async (id: string) => {
  try {
    return await api.get(`/api/assignments/${id}`);
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete an assignment
// Endpoint: DELETE /api/assignments/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteAssignment = async (id: string) => {
  try {
    return await api.delete(`/api/assignments/${id}`);
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};