import api from './api';

// Description: Login user with email and password
// Endpoint: POST /api/auth/login
// Request: { email: string, password: string }
// Response: { success: boolean, data: { accessToken: string, refreshToken: string, user: { id: string, email: string } } }
export const login = async (email: string, password: string) => {
  console.log('Auth API: Login called for email:', email);
  console.log('Auth API: About to make POST request to /api/auth/login');
  
  try {
    console.log('Auth API: Making login request to /api/auth/login with data:', { email, password: '***' });
    const response = await api.post('/api/auth/login', { email, password });
    
    console.log('Auth API: Raw response object:', response);
    console.log('Auth API: Response status:', response.status);
    console.log('Auth API: Response headers:', response.headers);
    console.log('Auth API: Response config URL:', response.config?.url);
    console.log('Auth API: Response config method:', response.config?.method);
    console.log('Auth API: Response data type:', typeof response.data);
    console.log('Auth API: Response data keys:', response.data ? Object.keys(response.data) : 'no data');
    console.log('Auth API: Full response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error: any) {
    console.error('Auth API: Login error caught:', error);
    console.error('Auth API: Error response:', error?.response);
    console.error('Auth API: Error response data:', error?.response?.data);
    console.error('Auth API: Error response status:', error?.response?.status);
    console.error('Auth API: Error config URL:', error?.config?.url);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Register new user with email and password
// Endpoint: POST /api/auth/register
// Request: { email: string, password: string }
// Response: { success: boolean, data: { accessToken: string, user: { id: string, email: string } } }
export const register = async (email: string, password: string) => {
  console.log('Auth API: Register called for email:', email);
  try {
    console.log('Auth API: Making register request to /api/auth/register');
    const response = await api.post('/api/auth/register', { email, password });
    console.log('Auth API: Register response received:', { status: response.status, data: response.data });
    return response.data;
  } catch (error: any) {
    console.error('Auth API: Register error:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Logout user
// Endpoint: POST /api/auth/logout
// Request: { refreshToken?: string }
// Response: { success: boolean, message: string }
export const logout = async () => {
  console.log('Auth API: Logout called');
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('Auth API: Making logout request with refreshToken:', refreshToken ? 'present' : 'missing');
    const response = await api.post('/api/auth/logout', { refreshToken });
    console.log('Auth API: Logout response received:', { status: response.status, data: response.data });
    return response.data;
  } catch (error: any) {
    console.error('Auth API: Logout error:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};