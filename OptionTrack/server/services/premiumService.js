const PremiumTrade = require('../models/PremiumTrade');

class PremiumService {
  
  // Create a new premium trade
  static async createTrade(userId, tradeData) {
    console.log(`Creating new premium trade for user ${userId}:`, tradeData);
    
    try {
      const trade = new PremiumTrade({
        userId,
        ...tradeData
      });
      
      const savedTrade = await trade.save();
      console.log(`Premium trade created successfully with ID: ${savedTrade._id}`);
      
      return savedTrade;
    } catch (error) {
      console.error(`Error creating premium trade: ${error.message}`);
      throw new Error(`Failed to create premium trade: ${error.message}`);
    }
  }
  
  // Get all premium trades for a user
  static async getUserTrades(userId, options = {}) {
    console.log(`Fetching premium trades for user ${userId} with options:`, options);
    
    try {
      const {
        startDate,
        endDate,
        limit = 50,
        offset = 0,
        symbol,
        strategy,
        outcome
      } = options;
      
      // Build query
      const query = { userId };
      
      if (startDate || endDate) {
        query.tradeDate = {};
        if (startDate) query.tradeDate.$gte = new Date(startDate);
        if (endDate) query.tradeDate.$lte = new Date(endDate);
      }
      
      if (symbol) query.symbol = symbol.toUpperCase();
      if (strategy) query.strategy = strategy;
      if (outcome) query.outcome = outcome;
      
      const trades = await PremiumTrade.find(query)
        .sort({ tradeDate: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset));
      
      console.log(`Found ${trades.length} premium trades for user ${userId}`);
      return trades;
    } catch (error) {
      console.error(`Error fetching premium trades: ${error.message}`);
      throw new Error(`Failed to fetch premium trades: ${error.message}`);
    }
  }
  
  // Delete a premium trade
  static async deleteTrade(userId, tradeId) {
    console.log(`Deleting premium trade ${tradeId} for user ${userId}`);
    
    try {
      const trade = await PremiumTrade.findOne({ _id: tradeId, userId });
      
      if (!trade) {
        throw new Error('Premium trade not found or unauthorized');
      }
      
      await PremiumTrade.deleteOne({ _id: tradeId, userId });
      console.log(`Premium trade ${tradeId} deleted successfully`);
      
      return { success: true, message: 'Premium trade deleted successfully' };
    } catch (error) {
      console.error(`Error deleting premium trade: ${error.message}`);
      throw new Error(`Failed to delete premium trade: ${error.message}`);
    }
  }
  
  // Get premium summary statistics
  static async getPremiumSummary(userId) {
    console.log(`Calculating premium summary for user ${userId}`);
    
    try {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      
      // Get trades for different periods
      const [weekTrades, monthTrades, quarterTrades, yearTrades] = await Promise.all([
        PremiumTrade.find({ userId, tradeDate: { $gte: startOfWeek } }),
        PremiumTrade.find({ userId, tradeDate: { $gte: startOfMonth } }),
        PremiumTrade.find({ userId, tradeDate: { $gte: startOfQuarter } }),
        PremiumTrade.find({ userId, tradeDate: { $gte: startOfYear } })
      ]);
      
      const thisWeek = weekTrades.reduce((sum, trade) => sum + trade.premium, 0);
      const thisMonth = monthTrades.reduce((sum, trade) => sum + trade.premium, 0);
      const thisQuarter = quarterTrades.reduce((sum, trade) => sum + trade.premium, 0);
      const yearToDate = yearTrades.reduce((sum, trade) => sum + trade.premium, 0);
      
      // Calculate average premium per day (based on year data)
      const daysInYear = Math.ceil((now - startOfYear) / (1000 * 60 * 60 * 24));
      const averagePremiumPerDay = daysInYear > 0 ? yearToDate / daysInYear : 0;
      
      const summary = {
        thisWeek,
        thisMonth,
        thisQuarter,
        yearToDate,
        monthlyTarget: 15000, // This could be stored in user preferences
        averagePremiumPerDay
      };
      
      console.log(`Premium summary calculated for user ${userId}:`, summary);
      return summary;
    } catch (error) {
      console.error(`Error calculating premium summary: ${error.message}`);
      throw new Error(`Failed to calculate premium summary: ${error.message}`);
    }
  }
  
  // Get strategy breakdown
  static async getStrategyBreakdown(userId) {
    console.log(`Calculating strategy breakdown for user ${userId}`);
    
    try {
      const trades = await PremiumTrade.find({ userId });
      
      // Group by strategy
      const strategyMap = {};
      let totalPremium = 0;
      
      trades.forEach(trade => {
        if (!strategyMap[trade.strategy]) {
          strategyMap[trade.strategy] = {
            strategy: trade.strategy,
            totalPremium: 0,
            count: 0
          };
        }
        strategyMap[trade.strategy].totalPremium += trade.premium;
        strategyMap[trade.strategy].count += 1;
        totalPremium += trade.premium;
      });
      
      // Calculate percentages
      const breakdown = Object.values(strategyMap).map(item => ({
        ...item,
        percentage: totalPremium > 0 ? (item.totalPremium / totalPremium) * 100 : 0
      }));
      
      // Sort by total premium descending
      breakdown.sort((a, b) => b.totalPremium - a.totalPremium);
      
      console.log(`Strategy breakdown calculated for user ${userId}:`, breakdown);
      return breakdown;
    } catch (error) {
      console.error(`Error calculating strategy breakdown: ${error.message}`);
      throw new Error(`Failed to calculate strategy breakdown: ${error.message}`);
    }
  }
}

module.exports = PremiumService;