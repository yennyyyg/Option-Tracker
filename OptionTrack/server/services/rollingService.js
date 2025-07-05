const RollingOpportunity = require('../models/RollingOpportunity.js');
const User = require('../models/User.js');

class RollingService {
  static async createRollingOpportunity(userId, opportunityData) {
    const {
      symbol,
      currentStrike,
      currentExpiration,
      suggestedStrike,
      suggestedExpiration,
      strategy,
      contracts,
      currentPremium,
      suggestedPremium,
      profitability,
      notes
    } = opportunityData;

    try {
      console.log(`Creating rolling opportunity for user ${userId}`);

      // Validate that the user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate dates
      const currentExp = new Date(currentExpiration);
      const suggestedExp = new Date(suggestedExpiration);
      
      if (suggestedExp <= currentExp) {
        throw new Error('Suggested expiration must be after current expiration');
      }

      const opportunity = new RollingOpportunity({
        user: userId,
        symbol: symbol.toUpperCase(),
        currentStrike,
        currentExpiration: currentExp,
        suggestedStrike,
        suggestedExpiration: suggestedExp,
        strategy,
        contracts,
        currentPremium,
        suggestedPremium,
        profitability,
        notes,
      });

      const savedOpportunity = await opportunity.save();

      // Populate the opportunity with user details
      const populatedOpportunity = await RollingOpportunity.findById(savedOpportunity._id)
        .populate('user', 'email');

      console.log(`Rolling opportunity created successfully with ID: ${savedOpportunity._id}`);
      return populatedOpportunity;
    } catch (error) {
      console.error(`Error creating rolling opportunity: ${error.message}`);
      throw new Error(`Failed to create rolling opportunity: ${error.message}`);
    }
  }

  static async getRollingOpportunities(userId, filters = {}) {
    try {
      console.log(`Fetching rolling opportunities for user ${userId}`);

      const query = { user: userId };

      // Add filters if provided
      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.symbol) {
        query.symbol = filters.symbol.toUpperCase();
      }

      if (filters.strategy) {
        query.strategy = filters.strategy;
      }

      // Filter by expiration date range
      if (filters.expirationStart || filters.expirationEnd) {
        query.currentExpiration = {};
        if (filters.expirationStart) {
          query.currentExpiration.$gte = new Date(filters.expirationStart);
        }
        if (filters.expirationEnd) {
          query.currentExpiration.$lte = new Date(filters.expirationEnd);
        }
      }

      const opportunities = await RollingOpportunity.find(query)
        .populate('user', 'email')
        .sort({ currentExpiration: 1, createdAt: -1 });

      console.log(`Found ${opportunities.length} rolling opportunities for user ${userId}`);
      return opportunities;
    } catch (error) {
      console.error(`Error fetching rolling opportunities: ${error.message}`);
      throw new Error(`Failed to fetch rolling opportunities: ${error.message}`);
    }
  }

  static async getRollingOpportunityById(opportunityId, userId) {
    try {
      console.log(`Fetching rolling opportunity ${opportunityId} for user ${userId}`);

      const opportunity = await RollingOpportunity.findOne({ _id: opportunityId, user: userId })
        .populate('user', 'email');

      if (!opportunity) {
        throw new Error('Rolling opportunity not found');
      }

      console.log(`Rolling opportunity ${opportunityId} found`);
      return opportunity;
    } catch (error) {
      console.error(`Error fetching rolling opportunity ${opportunityId}: ${error.message}`);
      throw new Error(`Failed to fetch rolling opportunity: ${error.message}`);
    }
  }

  static async updateRollingOpportunity(opportunityId, userId, updateData) {
    try {
      console.log(`Updating rolling opportunity ${opportunityId} for user ${userId}`);

      const opportunity = await RollingOpportunity.findOneAndUpdate(
        { _id: opportunityId, user: userId },
        { ...updateData, updatedAt: Date.now() },
        { new: true, runValidators: true }
      ).populate('user', 'email');

      if (!opportunity) {
        throw new Error('Rolling opportunity not found');
      }

      console.log(`Rolling opportunity ${opportunityId} updated successfully`);
      return opportunity;
    } catch (error) {
      console.error(`Error updating rolling opportunity ${opportunityId}: ${error.message}`);
      throw new Error(`Failed to update rolling opportunity: ${error.message}`);
    }
  }

  static async deleteRollingOpportunity(opportunityId, userId) {
    try {
      console.log(`Deleting rolling opportunity ${opportunityId} for user ${userId}`);

      const result = await RollingOpportunity.deleteOne({ _id: opportunityId, user: userId });

      if (result.deletedCount === 0) {
        throw new Error('Rolling opportunity not found or you do not have permission to delete it');
      }

      console.log(`Rolling opportunity ${opportunityId} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Error deleting rolling opportunity ${opportunityId}: ${error.message}`);
      throw new Error(`Failed to delete rolling opportunity: ${error.message}`);
    }
  }

  static async getRollingOpportunitiesSummary(userId) {
    try {
      console.log(`Fetching rolling opportunities summary for user ${userId}`);

      const currentDate = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(currentDate.getDate() + 7);

      const [
        totalOpportunities,
        pendingOpportunities,
        expiringThisWeek,
        totalPotentialCredit
      ] = await Promise.all([
        RollingOpportunity.countDocuments({ user: userId }),
        RollingOpportunity.countDocuments({ user: userId, status: 'pending' }),
        RollingOpportunity.countDocuments({
          user: userId,
          status: 'pending',
          currentExpiration: { $lte: nextWeek }
        }),
        RollingOpportunity.aggregate([
          { $match: { user: userId, status: 'pending' } },
          { $group: { _id: null, total: { $sum: '$creditReceived' } } }
        ])
      ]);

      const potentialCredit = totalPotentialCredit.length > 0 ? totalPotentialCredit[0].total : 0;

      const summary = {
        totalOpportunities,
        pendingOpportunities,
        expiringThisWeek,
        potentialCredit: Math.round(potentialCredit)
      };

      console.log(`Rolling opportunities summary calculated for user ${userId}`);
      return summary;
    } catch (error) {
      console.error(`Error calculating rolling opportunities summary: ${error.message}`);
      throw new Error(`Failed to calculate rolling opportunities summary: ${error.message}`);
    }
  }
}

module.exports = RollingService;