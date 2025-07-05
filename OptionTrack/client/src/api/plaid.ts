import api from './api';

// Description: Create a link token for Plaid Link
// Endpoint: POST /api/plaid/create-link-token
// Request: {}
// Response: { success: boolean, data: { link_token: string, expiration: string, request_id: string } }
export const createLinkToken = async () => {
  try {
    const response = await api.post('/api/plaid/create-link-token');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Exchange public token for access token
// Endpoint: POST /api/plaid/exchange-public-token
// Request: { public_token: string }
// Response: { success: boolean, data: { success: boolean, institutionName: string, accountCount: number } }
export const exchangePublicToken = async (publicToken: string) => {
  try {
    const response = await api.post('/api/plaid/exchange-public-token', {
      public_token: publicToken
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get investment holdings from connected accounts
// Endpoint: GET /api/plaid/investments
// Request: {}
// Response: { success: boolean, data: { holdings: Array<any>, accounts: Array<any>, securities: Array<any> } }
export const getInvestmentHoldings = async () => {
  try {
    const response = await api.get('/api/plaid/investments');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get connected accounts
// Endpoint: GET /api/plaid/connected-accounts
// Request: {}
// Response: { success: boolean, data: Array<{ id: string, institutionName: string, institutionId: string, accountCount: number, lastSyncAt: string, createdAt: string }> }
export const getConnectedAccounts = async () => {
  try {
    const response = await api.get('/api/plaid/connected-accounts');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Disconnect a connected account
// Endpoint: DELETE /api/plaid/disconnect-account/:tokenId
// Request: {}
// Response: { success: boolean, data: { success: boolean } }
export const disconnectAccount = async (tokenId: string) => {
  try {
    const response = await api.delete(`/api/plaid/disconnect-account/${tokenId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};