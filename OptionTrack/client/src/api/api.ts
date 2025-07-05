import axios, { AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig, AxiosInstance } from 'axios';

const localApi = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => {
    return status >= 200 && status < 300;
  }
});

let accessToken: string | null = null;

const getApiInstance = (url: string) => {
  return localApi;
};

const isAuthEndpoint = (url: string): boolean => {
  return url.includes("/api/auth");
};

// Check if the URL is for the refresh token endpoint to avoid infinite loops
const isRefreshTokenEndpoint = (url: string): boolean => {
  return url.includes("/api/auth/refresh");
};

const setupInterceptors = (apiInstance: typeof axios) => {
  apiInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      console.log('API Request Interceptor: Making request to URL:', config.url);
      console.log('API Request Interceptor: Method:', config.method);
      console.log('API Request Interceptor: Base URL:', config.baseURL);
      console.log('API Request Interceptor: Full URL will be:', config.baseURL ? config.baseURL + config.url : config.url);

      if (!accessToken) {
        accessToken = localStorage.getItem('accessToken');
        console.log('API Request Interceptor: Retrieved accessToken from localStorage:', accessToken ? `${accessToken.substring(0, 20)}...` : 'null');
      }
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        console.log('API Request Interceptor: Added Authorization header');
      } else {
        console.log('API Request Interceptor: No accessToken available, skipping Authorization header');
      }

      return config;
    },
    (error: AxiosError): Promise<AxiosError> => {
      console.error('API Request Interceptor Error:', error);
      return Promise.reject(error);
    }
  );

  apiInstance.interceptors.response.use(
    (response) => {
      console.log('API Response Interceptor: Success response for', response.config.url, 'Status:', response.status);
      console.log('API Response Interceptor: Response data type:', typeof response.data);
      console.log('API Response Interceptor: Response data preview:', JSON.stringify(response.data).substring(0, 200));
      return response;
    },
    async (error: AxiosError): Promise<any> => {
      console.log('API Response Interceptor: Error response for', error.config?.url, 'Status:', error.response?.status);
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Only refresh token when we get a 401/403 error (token is invalid/expired)
      if (error.response?.status && [401, 403].includes(error.response.status) &&
          !originalRequest._retry &&
          originalRequest.url && !isRefreshTokenEndpoint(originalRequest.url)) {
        console.log('API Response Interceptor: Attempting token refresh for', originalRequest.url);
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          console.log('API Response Interceptor: Retrieved refreshToken from localStorage:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null');

          if (!refreshToken) {
            console.log('API Response Interceptor: No refresh token available, redirecting to login');
            throw new Error('No refresh token available');
          }

          console.log('API Response Interceptor: Making refresh token request');
          const response = await localApi.post(`/api/auth/refresh`, {
            refreshToken,
          });

          console.log('API Response Interceptor: Refresh token response:', response.status, response.data);

          if (response.data.data) {
            const newAccessToken = response.data.data.accessToken;
            const newRefreshToken = response.data.data.refreshToken;

            console.log('API Response Interceptor: Storing new tokens');
            localStorage.setItem('accessToken', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            accessToken = newAccessToken;

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
          } else {
            console.error('API Response Interceptor: Invalid response from refresh token endpoint');
            throw new Error('Invalid response from refresh token endpoint');
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          console.log('API Response Interceptor: Retrying original request with new token');
          return getApiInstance(originalRequest.url || '')(originalRequest);
        } catch (err) {
          console.error('API Response Interceptor: Token refresh failed:', err);
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('accessToken');
          accessToken = null;
          console.log('API Response Interceptor: Redirecting to login');
          window.location.href = '/login';
          return Promise.reject(err);
        }
      }

      console.log('API Response Interceptor: Not attempting token refresh, rejecting error');
      return Promise.reject(error);
    }
  );
};

setupInterceptors(localApi);

const api = {
  request: (config: AxiosRequestConfig) => {
    console.log('API: request() called with config:', config);
    const apiInstance = getApiInstance(config.url || '');
    return apiInstance(config);
  },
  get: (url: string, config?: AxiosRequestConfig) => {
    console.log('API: get() called with URL:', url);
    const apiInstance = getApiInstance(url);
    return apiInstance.get(url, config);
  },
  post: (url: string, data?: any, config?: AxiosRequestConfig) => {
    console.log('API: post() called with URL:', url, 'data keys:', data ? Object.keys(data) : 'no data');
    const apiInstance = getApiInstance(url);
    return apiInstance.post(url, data, config);
  },
  put: (url: string, data?: any, config?: AxiosRequestConfig) => {
    console.log('API: put() called with URL:', url);
    const apiInstance = getApiInstance(url);
    return apiInstance.put(url, data, config);
  },
  delete: (url: string, config?: AxiosRequestConfig) => {
    console.log('API: delete() called with URL:', url);
    const apiInstance = getApiInstance(url);
    return apiInstance.delete(url, config);
  },
};

export default api;