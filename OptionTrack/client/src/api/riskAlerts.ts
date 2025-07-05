import api from './api';

export interface RiskAlert {
  _id: string;
  alertType: 'assignment_risk' | 'margin_usage' | 'expiration_reminder' | 'profit_target' | 'loss_limit' | 'volatility_change';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  symbol?: string;
  strike?: number;
  expiration?: string;
  threshold?: number;
  currentValue?: number;
  isActive: boolean;
  isRead: boolean;
  triggeredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRiskAlertData {
  alertType: string;
  title: string;
  description: string;
  severity: string;
  symbol?: string;
  strike?: number;
  expiration?: string;
  threshold?: number;
  currentValue?: number;
}

export interface RiskAlertsSummary {
  total: number;
  critical: number;
  warning: number;
  info: number;
}

// Mock data storage
let mockAlerts: RiskAlert[] = [
  {
    _id: '1',
    alertType: 'assignment_risk',
    title: 'AAPL Assignment Risk',
    description: 'AAPL $150 put option has high assignment probability',
    severity: 'warning',
    symbol: 'AAPL',
    strike: 150,
    expiration: '2024-01-19',
    threshold: 0.8,
    currentValue: 0.85,
    isActive: true,
    isRead: false,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    _id: '2',
    alertType: 'margin_usage',
    title: 'High Margin Usage',
    description: 'Margin utilization has exceeded 80% threshold',
    severity: 'critical',
    threshold: 80,
    currentValue: 85,
    isActive: true,
    isRead: false,
    createdAt: '2024-01-09T14:30:00Z',
    updatedAt: '2024-01-09T14:30:00Z'
  }
];

// Description: Create a new risk alert
// Endpoint: POST /api/risk-alerts
// Request: { alertType: string, title: string, description: string, severity: string, symbol?: string, strike?: number, expiration?: string, threshold?: number, currentValue?: number }
// Response: { success: boolean, message: string, data: RiskAlert }
export const createRiskAlert = async (data: CreateRiskAlertData) => {
  console.log('API: createRiskAlert called with data:', data);
  
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      const newAlert: RiskAlert = {
        _id: (mockAlerts.length + 1).toString(),
        alertType: data.alertType as any,
        title: data.title,
        description: data.description,
        severity: data.severity as any,
        symbol: data.symbol,
        strike: data.strike,
        expiration: data.expiration,
        threshold: data.threshold,
        currentValue: data.currentValue,
        isActive: true,
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockAlerts.push(newAlert);
      console.log('API: createRiskAlert mocked response:', { success: true, message: 'Risk alert created successfully', data: newAlert });
      
      resolve({
        data: {
          success: true,
          message: 'Risk alert created successfully',
          data: newAlert
        }
      });
    }, 500);
  });
  
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.post('/api/risk-alerts', data);
  //   console.log('API: createRiskAlert response:', response);
  //   return response;
  // } catch (error: any) {
  //   console.error('API: createRiskAlert error:', error);
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Get all risk alerts for the current user
// Endpoint: GET /api/risk-alerts
// Request: { isActive?: boolean, severity?: string, alertType?: string }
// Response: { success: boolean, data: RiskAlert[] }
export const getRiskAlerts = async (params?: { isActive?: boolean; severity?: string; alertType?: string }) => {
  console.log('API: getRiskAlerts called with params:', params);
  
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredAlerts = [...mockAlerts];
      
      if (params?.isActive !== undefined) {
        filteredAlerts = filteredAlerts.filter(alert => alert.isActive === params.isActive);
      }
      if (params?.severity) {
        filteredAlerts = filteredAlerts.filter(alert => alert.severity === params.severity);
      }
      if (params?.alertType) {
        filteredAlerts = filteredAlerts.filter(alert => alert.alertType === params.alertType);
      }
      
      console.log('API: getRiskAlerts mocked response:', { success: true, data: filteredAlerts });
      
      resolve({
        data: {
          success: true,
          data: filteredAlerts
        }
      });
    }, 300);
  });
  
  // Uncomment the below lines to make an actual API call
  // try {
  //   const queryParams = new URLSearchParams();
  //   if (params?.isActive !== undefined) {
  //     queryParams.append('isActive', params.isActive.toString());
  //   }
  //   if (params?.severity) {
  //     queryParams.append('severity', params.severity);
  //   }
  //   if (params?.alertType) {
  //     queryParams.append('alertType', params.alertType);
  //   }

  //   const url = `/api/risk-alerts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  //   console.log('API: getRiskAlerts making request to URL:', url);
  //   const response = await api.get(url);
  //   console.log('API: getRiskAlerts response:', response);
  //   return response;
  // } catch (error: any) {
  //   console.error('API: getRiskAlerts error:', error);
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Get risk alerts summary
// Endpoint: GET /api/risk-alerts/summary
// Request: {}
// Response: { success: boolean, data: RiskAlertsSummary }
export const getRiskAlertsSummary = async () => {
  console.log('API: getRiskAlertsSummary called');
  
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      const activeAlerts = mockAlerts.filter(alert => alert.isActive);
      const summary = {
        total: activeAlerts.length,
        critical: activeAlerts.filter(alert => alert.severity === 'critical').length,
        warning: activeAlerts.filter(alert => alert.severity === 'warning').length,
        info: activeAlerts.filter(alert => alert.severity === 'info').length
      };
      
      console.log('API: getRiskAlertsSummary mocked response:', { success: true, data: summary });
      
      resolve({
        data: {
          success: true,
          data: summary
        }
      });
    }, 200);
  });
  
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get('/api/risk-alerts/summary');
  //   console.log('API: getRiskAlertsSummary response:', response);
  //   return response;
  // } catch (error: any) {
  //   console.error('API: getRiskAlertsSummary error:', error);
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Get a specific risk alert by ID
// Endpoint: GET /api/risk-alerts/:alertId
// Request: {}
// Response: { success: boolean, data: RiskAlert }
export const getRiskAlert = async (alertId: string) => {
  console.log('API: getRiskAlert called with alertId:', alertId);
  
  // Mocking the response
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const alert = mockAlerts.find(alert => alert._id === alertId);
      if (alert) {
        console.log('API: getRiskAlert mocked response:', { success: true, data: alert });
        resolve({
          data: {
            success: true,
            data: alert
          }
        });
      } else {
        console.log('API: getRiskAlert alert not found');
        reject(new Error('Risk alert not found'));
      }
    }, 200);
  });
  
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get(`/api/risk-alerts/${alertId}`);
  //   console.log('API: getRiskAlert response:', response);
  //   return response;
  // } catch (error: any) {
  //   console.error('API: getRiskAlert error:', error);
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Update a risk alert
// Endpoint: PUT /api/risk-alerts/:alertId
// Request: { alertType?: string, title?: string, description?: string, severity?: string, symbol?: string, strike?: number, expiration?: string, threshold?: number, currentValue?: number, isActive?: boolean, isRead?: boolean }
// Response: { success: boolean, message: string, data: RiskAlert }
export const updateRiskAlert = async (alertId: string, data: Partial<CreateRiskAlertData & { isActive?: boolean; isRead?: boolean }>) => {
  console.log('API: updateRiskAlert called with alertId:', alertId, 'data:', data);
  
  // Mocking the response
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const alertIndex = mockAlerts.findIndex(alert => alert._id === alertId);
      if (alertIndex !== -1) {
        mockAlerts[alertIndex] = {
          ...mockAlerts[alertIndex],
          ...data,
          updatedAt: new Date().toISOString()
        };
        
        console.log('API: updateRiskAlert mocked response:', { success: true, message: 'Risk alert updated successfully', data: mockAlerts[alertIndex] });
        
        resolve({
          data: {
            success: true,
            message: 'Risk alert updated successfully',
            data: mockAlerts[alertIndex]
          }
        });
      } else {
        console.log('API: updateRiskAlert alert not found');
        reject(new Error('Risk alert not found'));
      }
    }, 300);
  });
  
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.put(`/api/risk-alerts/${alertId}`, data);
  //   console.log('API: updateRiskAlert response:', response);
  //   return response;
  // } catch (error: any) {
  //   console.error('API: updateRiskAlert error:', error);
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};

// Description: Delete a risk alert
// Endpoint: DELETE /api/risk-alerts/:alertId
// Request: {}
// Response: { success: boolean, message: string }
export const deleteRiskAlert = async (alertId: string) => {
  console.log('API: deleteRiskAlert called with alertId:', alertId);
  
  // Mocking the response
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const alertIndex = mockAlerts.findIndex(alert => alert._id === alertId);
      if (alertIndex !== -1) {
        const deletedAlert = mockAlerts.splice(alertIndex, 1)[0];
        console.log('API: deleteRiskAlert mocked response:', { success: true, message: 'Risk alert deleted successfully' });
        
        resolve({
          data: {
            success: true,
            message: 'Risk alert deleted successfully'
          }
        });
      } else {
        console.log('API: deleteRiskAlert alert not found');
        reject(new Error('Risk alert not found'));
      }
    }, 300);
  });
  
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.delete(`/api/risk-alerts/${alertId}`);
  //   console.log('API: deleteRiskAlert response:', response);
  //   return response;
  // } catch (error: any) {
  //   console.error('API: deleteRiskAlert error:', error);
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};