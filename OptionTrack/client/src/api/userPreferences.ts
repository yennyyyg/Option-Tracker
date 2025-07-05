import api from './api';

export interface UserPreferences {
  _id?: string;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: 'English' | 'Spanish' | 'French' | 'German';
  notifications: {
    enabled: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  display: {
    compactView: boolean;
    showGreeks: boolean;
    chartTheme: 'dark' | 'light' | 'auto';
    defaultTimeframe: '1 Month' | '3 Months' | '6 Months' | '1 Year';
  };
  trading: {
    deltaTarget: number;
    dteTarget: string;
    profitTarget: number;
    lossLimit: number;
    maxPositionSize: number;
    maxMarginUsage: number;
    maxConcentration: number;
    monthlyTarget: number;
  };
  security: {
    twoFactorEnabled: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPreferencesRequest {
  theme?: 'light' | 'dark' | 'auto';
  language?: 'English' | 'Spanish' | 'French' | 'German';
  notifications?: {
    enabled?: boolean;
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
  display?: {
    compactView?: boolean;
    showGreeks?: boolean;
    chartTheme?: 'dark' | 'light' | 'auto';
    defaultTimeframe?: '1 Month' | '3 Months' | '6 Months' | '1 Year';
  };
  trading?: {
    deltaTarget?: number;
    dteTarget?: string;
    profitTarget?: number;
    lossLimit?: number;
    maxPositionSize?: number;
    maxMarginUsage?: number;
    maxConcentration?: number;
    monthlyTarget?: number;
  };
  security?: {
    twoFactorEnabled?: boolean;
  };
}

// Description: Create or update user preferences
// Endpoint: POST /api/user/preferences
// Request: CreateUserPreferencesRequest
// Response: { success: boolean, message: string, data: UserPreferences }
export const createUserPreferences = async (data: CreateUserPreferencesRequest) => {
  try {
    return await api.post('/api/user/preferences', data);
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get user preferences
// Endpoint: GET /api/user/preferences
// Request: {}
// Response: { success: boolean, data: UserPreferences }
export const getUserPreferences = async () => {
  try {
    return await api.get('/api/user/preferences');
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update user preferences
// Endpoint: PUT /api/user/preferences
// Request: CreateUserPreferencesRequest
// Response: { success: boolean, message: string, data: UserPreferences }
export const updateUserPreferences = async (data: CreateUserPreferencesRequest) => {
  try {
    return await api.put('/api/user/preferences', data);
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update specific preference field
// Endpoint: PATCH /api/user/preferences/:category/:field
// Request: { value: any }
// Response: { success: boolean, message: string, data: UserPreferences }
export const updateSpecificPreference = async (category: string, field: string, value: any) => {
  try {
    return await api.patch(`/api/user/preferences/${category}/${field}`, { value });
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete user preferences (reset to defaults)
// Endpoint: DELETE /api/user/preferences
// Request: {}
// Response: { success: boolean, message: string }
export const deleteUserPreferences = async () => {
  try {
    return await api.delete('/api/user/preferences');
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};