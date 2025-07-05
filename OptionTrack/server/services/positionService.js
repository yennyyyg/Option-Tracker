const Position = require('../models/Position');
const Option = require('../models/Option');
const BrokerageAccount = require('../models/BrokerageAccount');

class PositionService {
  async getUserPositions(userId) {
    try {
      console.log(`PositionService: Getting positions for user ${userId}`);
      const positions = await Position.find({ user: userId }).sort({ createdAt: -1 });
      console.log(`PositionService: Found ${positions.length} positions for user ${userId}`);
      return positions;
    } catch (error) {
      console.error('PositionService: Error getting user positions:', error);
      throw new Error(`Failed to get user positions: ${error.message}`);
    }
  }

  async getUserOptions(userId) {
    try {
      console.log(`PositionService: Getting options for user ${userId}`);
      const options = await Option.find({ user: userId }).sort({ createdAt: -1 });
      console.log(`PositionService: Found ${options.length} options for user ${userId}`);
      return options;
    } catch (error) {
      console.error('PositionService: Error getting user options:', error);
      throw new Error(`Failed to get user options: ${error.message}`);
    }
  }

  async getBrokerageAccounts(userId) {
    try {
      console.log(`PositionService: Getting brokerage accounts for user ${userId}`);
      const accounts = await BrokerageAccount.find({ user: userId }).sort({ createdAt: -1 });
      console.log(`PositionService: Found ${accounts.length} brokerage accounts for user ${userId}`);
      return accounts;
    } catch (error) {
      console.error('PositionService: Error getting brokerage accounts:', error);
      throw new Error(`Failed to get brokerage accounts: ${error.message}`);
    }
  }

  async getExpiringOptions(userId, days = 7) {
    try {
      console.log(`PositionService: Getting expiring options for user ${userId} within ${days} days`);

      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + days);

      const expiringOptions = await Option.find({
        user: userId,
        expiration: { $lte: expirationDate },
        status: { $ne: 'closed' }
      }).sort({ expiration: 1 });

      console.log(`PositionService: Found ${expiringOptions.length} expiring options for user ${userId}`);
      return expiringOptions;
    } catch (error) {
      console.error('PositionService: Error getting expiring options:', error);
      throw new Error(`Failed to get expiring options: ${error.message}`);
    }
  }

  async createSampleData(userId) {
    try {
      console.log(`PositionService: Creating sample data for user ${userId}`);

      // Create sample positions
      const samplePositions = [
        {
          user: userId,
          symbol: 'AAPL',
          shares: 100,
          averageCost: 150.00,
          currentPrice: 155.00,
          marketValue: 15500,
          unrealizedPnL: 500,
          dayChange: 2.5
        },
        {
          user: userId,
          symbol: 'TSLA',
          shares: 50,
          averageCost: 240.00,
          currentPrice: 245.00,
          marketValue: 12250,
          unrealizedPnL: 250,
          dayChange: 5.0
        }
      ];

      // Create sample options
      const sampleOptions = [
        {
          user: userId,
          symbol: 'AAPL',
          strategy: 'Covered Call',
          strike: 160,
          expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          contracts: 1,
          premiumCollected: 250,
          currentValue: 150,
          delta: -0.3,
          theta: 0.05,
          gamma: 0.02,
          vega: 0.1,
          rho: 0.01
        },
        {
          user: userId,
          symbol: 'TSLA',
          strategy: 'Cash Secured Put',
          strike: 230,
          expiration: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          contracts: 1,
          premiumCollected: 400,
          currentValue: 300,
          delta: 0.4,
          theta: 0.08,
          gamma: 0.03,
          vega: 0.15,
          rho: 0.02
        }
      ];

      // Create sample brokerage account
      const sampleAccount = {
        user: userId,
        accountName: 'Sample Trading Account',
        brokerageName: 'Sample Brokerage',
        accountType: 'Individual',
        totalValue: 50000,
        availableCash: 15000,
        buyingPower: 30000
      };

      // Insert sample data
      const createdPositions = await Position.insertMany(samplePositions);
      const createdOptions = await Option.insertMany(sampleOptions);
      const createdAccount = await BrokerageAccount.create(sampleAccount);

      console.log(`PositionService: Created ${createdPositions.length} positions, ${createdOptions.length} options, and 1 account`);

      return {
        positions: createdPositions.length,
        options: createdOptions.length,
        accounts: 1
      };
    } catch (error) {
      console.error('PositionService: Error creating sample data:', error);
      throw new Error(`Failed to create sample data: ${error.message}`);
    }
  }
}

module.exports = new PositionService();