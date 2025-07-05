import api from './api';

export interface OptionsProfile {
  account_balance: number;
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  preferred_strategies: string[];
}

export interface CreateOptionsProfileRequest {
  account_balance?: number;
  risk_tolerance?: 'conservative' | 'moderate' | 'aggressive';
  preferred_strategies?: string[];
}

// Description: Create or update user's options trading profile
// Endpoint: POST /api/users/options-profile
// Request: { account_balance?: number, risk_tolerance?: string, preferred_strategies?: string[] }
// Response: { success: boolean, message: string, data: OptionsProfile }
export const createOptionsProfile = async (data: CreateOptionsProfileRequest) => {
  try {
    return await api.post('/api/users/options-profile', data);
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get user's options trading profile
// Endpoint: GET /api/users/options-profile
// Request: {}
// Response: { success: boolean, data: OptionsProfile }
export const getOptionsProfile = async () => {
  try {
    return await api.get('/api/users/options-profile');
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};