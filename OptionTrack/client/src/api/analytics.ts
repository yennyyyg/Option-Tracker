import api from './api';

// Performance Metrics Interface
export interface PerformanceMetrics {
  responseTime: {
    average: number;
    maximum: number;
    minimum: number;
  };
  errorRate: number;
  systemLoad: {
    average: number;
    maximum: number;
  };
  totalRequests: number;
  totalErrors: number;
  timeRange: string;
}

// Engagement Metrics Interface
export interface EngagementMetrics {
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  maxSessionDuration: number;
  topPages: Array<{
    page: string;
    views: number;
  }>;
  interactionTypes: Array<{
    type: string;
    count: number;
  }>;
  timeRange: string;
}

// Resource Metrics Interface
export interface ResourceMetrics {
  cpu: {
    average: number;
    maximum: number;
    minimum: number;
  };
  memory: {
    average: number;
    maximum: number;
    minimum: number;
  };
  storage: {
    used: number;
    available: number;
  };
  timeRange: string;
}

// Description: Get system performance metrics
// Endpoint: GET /api/analytics/performance
// Request: { timeRange?: string }
// Response: { success: boolean, data: PerformanceMetrics }
export const getPerformanceMetrics = async (timeRange: string = '24h') => {
  try {
    const response = await api.get(`/api/analytics/performance?timeRange=${timeRange}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get user engagement analytics
// Endpoint: GET /api/analytics/engagement
// Request: { timeRange?: string }
// Response: { success: boolean, data: EngagementMetrics }
export const getEngagementMetrics = async (timeRange: string = '24h') => {
  try {
    const response = await api.get(`/api/analytics/engagement?timeRange=${timeRange}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get resource utilization metrics
// Endpoint: GET /api/analytics/resources
// Request: { timeRange?: string }
// Response: { success: boolean, data: ResourceMetrics }
export const getResourceMetrics = async (timeRange: string = '24h') => {
  try {
    const response = await api.get(`/api/analytics/resources?timeRange=${timeRange}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};