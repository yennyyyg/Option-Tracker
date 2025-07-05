import api from './api';

export interface PremiumSummary {
  thisWeek: number;
  thisMonth: number;
  thisQuarter: number;
  yearToDate: number;
  totalCollected: number;
}

export interface PremiumTrade {
  _id: string;
  symbol: string;
  strategy: string;
  strike: number;
  expiration: string;
  contracts: number;
  premium: number;
  outcome: string;
  daysHeld: number;
  annualizedReturn: number;
  openDate: string;
  closeDate: string;
}

export interface StrategyBreakdown {
  strategy: string;
  totalPremium: number;
  count: number;
  percentage: number;
}

export interface CreateTradeRequest {
  symbol: string;
  strategy: string;
  strike: number;
  expiration: string;
  contracts: number;
  premium: number;
  outcome?: string;
  notes?: string;
}

// Description: Get premium summary statistics
// Endpoint: GET /api/premium-tracker/summary
// Request: {}
// Response: { success: boolean, data: PremiumSummary }
export const getPremiumSummary = async () => {
  console.log('Fetching premium summary...');
  try {
    const response = await api.get('/api/premium-tracker/summary');
    console.log('Premium summary response:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in getPremiumSummary:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get premium trade history
// Endpoint: GET /api/premium-tracker/trades
// Request: { limit?: number, offset?: number }
// Response: { success: boolean, data: PremiumTrade[] }
export const getPremiumHistory = async (params?: { limit?: number; offset?: number }) => {
  console.log('Fetching premium history...', params);
  try {
    const response = await api.get('/api/premium-tracker/trades', { params });
    console.log('Premium history response:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in getPremiumHistory:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get strategy breakdown
// Endpoint: GET /api/premium-tracker/strategy-breakdown
// Request: {}
// Response: { success: boolean, data: StrategyBreakdown[] }
export const getStrategyBreakdown = async () => {
  console.log('Fetching strategy breakdown...');
  try {
    const response = await api.get('/api/premium-tracker/strategy-breakdown');
    console.log('Strategy breakdown response:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in getStrategyBreakdown:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create a new premium trade
// Endpoint: POST /api/premium-tracker/trades
// Request: CreateTradeRequest
// Response: { success: boolean, message: string, data: PremiumTrade }
export const createPremiumTrade = async (data: CreateTradeRequest) => {
  console.log('Creating premium trade...', data);
  try {
    const response = await api.post('/api/premium-tracker/trades', data);
    console.log('Create trade response:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in createPremiumTrade:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete a premium trade
// Endpoint: DELETE /api/premium-tracker/trades/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deletePremiumTrade = async (id: string) => {
  console.log('Deleting premium trade...', id);
  try {
    const response = await api.delete(`/api/premium-tracker/trades/${id}`);
    console.log('Delete trade response:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in deletePremiumTrade:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};