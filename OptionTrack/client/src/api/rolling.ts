import api from './api';

export interface RollingOpportunity {
  _id: string;
  user: string;
  symbol: string;
  currentStrike: number;
  currentExpiration: string;
  suggestedStrike: number;
  suggestedExpiration: string;
  strategy: 'covered_call' | 'cash_secured_put' | 'protective_put' | 'naked_put' | 'naked_call';
  contracts: number;
  currentPremium: number;
  suggestedPremium: number;
  creditReceived: number;
  profitability: number;
  status: 'pending' | 'executed' | 'expired' | 'cancelled';
  daysToExpiration: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RollingOpportunityFormData {
  symbol: string;
  currentStrike: number;
  currentExpiration: string;
  suggestedStrike: number;
  suggestedExpiration: string;
  strategy: string;
  contracts: number;
  currentPremium: number;
  suggestedPremium: number;
  profitability?: number;
  notes?: string;
}

export interface RollingOpportunitySummary {
  totalOpportunities: number;
  pendingOpportunities: number;
  expiringThisWeek: number;
  potentialCredit: number;
}

// Description: Get all rolling opportunities for the user
// Endpoint: GET /api/rolling-opportunities
// Request: { status?: string, symbol?: string, strategy?: string, expirationStart?: string, expirationEnd?: string }
// Response: { success: boolean, data: RollingOpportunity[] }
export const getRollingOpportunities = async (filters?: {
  status?: string;
  symbol?: string;
  strategy?: string;
  expirationStart?: string;
  expirationEnd?: string;
}) => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.symbol) params.append('symbol', filters.symbol);
    if (filters?.strategy) params.append('strategy', filters.strategy);
    if (filters?.expirationStart) params.append('expirationStart', filters.expirationStart);
    if (filters?.expirationEnd) params.append('expirationEnd', filters.expirationEnd);

    const queryString = params.toString();
    const url = `/api/rolling-opportunities${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get rolling opportunities summary statistics
// Endpoint: GET /api/rolling-opportunities/summary
// Request: {}
// Response: { success: boolean, data: RollingOpportunitySummary }
export const getRollingOpportunitiesSummary = async () => {
  try {
    const response = await api.get('/api/rolling-opportunities/summary');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get a specific rolling opportunity by ID
// Endpoint: GET /api/rolling-opportunities/:id
// Request: {}
// Response: { success: boolean, data: RollingOpportunity }
export const getRollingOpportunityById = async (id: string) => {
  try {
    const response = await api.get(`/api/rolling-opportunities/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create a new rolling opportunity
// Endpoint: POST /api/rolling-opportunities
// Request: RollingOpportunityFormData
// Response: { success: boolean, message: string, data: RollingOpportunity }
export const createRollingOpportunity = async (data: RollingOpportunityFormData) => {
  try {
    const response = await api.post('/api/rolling-opportunities', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update a rolling opportunity
// Endpoint: PUT /api/rolling-opportunities/:id
// Request: Partial<RollingOpportunityFormData>
// Response: { success: boolean, message: string, data: RollingOpportunity }
export const updateRollingOpportunity = async (id: string, data: Partial<RollingOpportunityFormData>) => {
  try {
    const response = await api.put(`/api/rolling-opportunities/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete a rolling opportunity
// Endpoint: DELETE /api/rolling-opportunities/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteRollingOpportunity = async (id: string) => {
  try {
    const response = await api.delete(`/api/rolling-opportunities/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};