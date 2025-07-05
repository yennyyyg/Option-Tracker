import api from './api';

export interface GreeksParameters {
  S: number;        // Current stock price
  K: number;        // Strike price
  T: number;        // Time to expiration (in years)
  r: number;        // Risk-free rate
  sigma: number;    // Volatility
  optionType: 'call' | 'put';
}

export interface GreeksResponse {
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
  rho?: number;
  parameters: GreeksParameters;
}

// Description: Calculate Delta for an option
// Endpoint: POST /api/greeks/delta
// Request: { S: number, K: number, T: number, r: number, sigma: number, optionType: 'call' | 'put' }
// Response: { success: boolean, data: { delta: number, parameters: GreeksParameters } }
export const calculateDelta = async (params: GreeksParameters): Promise<GreeksResponse> => {
  try {
    const response = await api.post('/api/greeks/delta', params);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Calculate Gamma for an option
// Endpoint: POST /api/greeks/gamma
// Request: { S: number, K: number, T: number, r: number, sigma: number, optionType: 'call' | 'put' }
// Response: { success: boolean, data: { gamma: number, parameters: GreeksParameters } }
export const calculateGamma = async (params: GreeksParameters): Promise<GreeksResponse> => {
  try {
    const response = await api.post('/api/greeks/gamma', params);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Calculate Theta for an option
// Endpoint: POST /api/greeks/theta
// Request: { S: number, K: number, T: number, r: number, sigma: number, optionType: 'call' | 'put' }
// Response: { success: boolean, data: { theta: number, parameters: GreeksParameters } }
export const calculateTheta = async (params: GreeksParameters): Promise<GreeksResponse> => {
  try {
    const response = await api.post('/api/greeks/theta', params);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Calculate Vega for an option
// Endpoint: POST /api/greeks/vega
// Request: { S: number, K: number, T: number, r: number, sigma: number, optionType: 'call' | 'put' }
// Response: { success: boolean, data: { vega: number, parameters: GreeksParameters } }
export const calculateVega = async (params: GreeksParameters): Promise<GreeksResponse> => {
  try {
    const response = await api.post('/api/greeks/vega', params);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Calculate Rho for an option
// Endpoint: POST /api/greeks/rho
// Request: { S: number, K: number, T: number, r: number, sigma: number, optionType: 'call' | 'put' }
// Response: { success: boolean, data: { rho: number, parameters: GreeksParameters } }
export const calculateRho = async (params: GreeksParameters): Promise<GreeksResponse> => {
  try {
    const response = await api.post('/api/greeks/rho', params);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Calculate all Greeks for an option
// Endpoint: POST /api/greeks/all
// Request: { S: number, K: number, T: number, r: number, sigma: number, optionType: 'call' | 'put' }
// Response: { success: boolean, data: { delta: number, gamma: number, theta: number, vega: number, rho: number, parameters: GreeksParameters } }
export const calculateAllGreeks = async (params: GreeksParameters): Promise<GreeksResponse> => {
  try {
    const response = await api.post('/api/greeks/all', params);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};