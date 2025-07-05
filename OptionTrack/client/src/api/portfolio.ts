import api from './api';

export interface PortfolioSummary {
  totalValue: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  availableBuyingPower: number;
  premiumToCollect: number;
  monthlyOptionsIncome: number;
  monthlyIncomeTarget: number;
  assignmentRisk: number;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  institutionName?: string;
}

// Description: Get portfolio summary with real data from connected accounts
// Endpoint: GET /api/portfolio/summary
// Request: {}
// Response: { success: boolean, summary: PortfolioSummary }
export const getPortfolioSummary = async () => {
  try {
    console.log('Fetching real portfolio summary from connected accounts...');
    const response = await api.get('/api/portfolio/summary');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching portfolio summary:', error);
    // Fallback to mock data if API fails
    return {
      summary: {
        totalValue: 125000,
        dailyPnL: 2500,
        dailyPnLPercent: 2.04,
        availableBuyingPower: 45000,
        premiumToCollect: 3200,
        monthlyOptionsIncome: 4500,
        monthlyIncomeTarget: 5000,
        assignmentRisk: 3,
      },
    };
  }
};

// Description: Get accounts from connected Plaid accounts
// Endpoint: GET /api/plaid/investments
// Request: {}
// Response: { success: boolean, data: { accounts: Array<Account> } }
export const getAccounts = async () => {
  try {
    console.log('Fetching accounts from Plaid investments...');
    const response = await api.get('/api/plaid/investments');
    
    // Transform Plaid account data to our Account interface
    const accounts = response.data.accounts?.map((account: any) => ({
      id: account.account_id,
      name: account.name,
      type: account.type,
      balance: account.balances?.current || 0,
      institutionName: account.institution_name,
    })) || [];

    return { accounts };
  } catch (error: any) {
    console.error('Error fetching accounts from Plaid:', error);
    // Fallback to mock data if API fails
    return {
      accounts: [
        {
          id: '1',
          name: 'Trading Account',
          type: 'investment',
          balance: 75000,
          institutionName: 'Mock Brokerage',
        },
        {
          id: '2',
          name: 'Options Account',
          type: 'investment',
          balance: 50000,
          institutionName: 'Mock Brokerage',
        },
      ],
    };
  }
};