const Assignment = require('../models/Assignment.js');
const Option = require('../models/Option.js');
const User = require('../models/User.js');

class AssignmentService {
  static async createAssignment(userId, assignmentData) {
    const {
      optionId,
      strike,
      symbol,
      strategy,
      contracts,
      premiumKept,
      stockValue,
      assignmentProbability,
      notes
    } = assignmentData;

    try {
      console.log(`Creating assignment for user ${userId}`);

      // Validate that the option exists
      const option = await Option.findById(optionId);
      if (!option) {
        throw new Error('Option not found');
      }

      // Validate that the user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const assignment = new Assignment({
        user: userId,
        option: optionId,
        strike,
        symbol: symbol.toUpperCase(),
        strategy,
        contracts,
        premiumKept,
        stockValue,
        assignmentProbability,
        notes,
      });

      const savedAssignment = await assignment.save();
      
      // Populate the assignment with user and option details
      const populatedAssignment = await Assignment.findById(savedAssignment._id)
        .populate('user', 'email')
        .populate('option', 'symbol strike expiration strategy');

      console.log(`Assignment created successfully with ID: ${savedAssignment._id}`);
      return populatedAssignment;
    } catch (error) {
      console.error(`Error creating assignment: ${error.message}`);
      throw new Error(`Failed to create assignment: ${error.message}`);
    }
  }

  static async getAssignments(userId, filters = {}) {
    try {
      console.log(`Fetching assignments for user ${userId}`);

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

      const assignments = await Assignment.find(query)
        .populate('user', 'email')
        .populate('option', 'symbol strike expiration strategy')
        .sort({ assignmentDate: -1 });

      console.log(`Found ${assignments.length} assignments for user ${userId}`);
      return assignments;
    } catch (error) {
      console.error(`Error fetching assignments: ${error.message}`);
      throw new Error(`Failed to fetch assignments: ${error.message}`);
    }
  }

  static async getAssignmentById(assignmentId, userId) {
    try {
      console.log(`Fetching assignment ${assignmentId} for user ${userId}`);

      const assignment = await Assignment.findOne({ _id: assignmentId, user: userId })
        .populate('user', 'email')
        .populate('option', 'symbol strike expiration strategy');

      if (!assignment) {
        throw new Error('Assignment not found');
      }

      console.log(`Assignment ${assignmentId} found`);
      return assignment;
    } catch (error) {
      console.error(`Error fetching assignment ${assignmentId}: ${error.message}`);
      throw new Error(`Failed to fetch assignment: ${error.message}`);
    }
  }

  static async deleteAssignment(assignmentId, userId) {
    try {
      console.log(`Deleting assignment ${assignmentId} for user ${userId}`);

      const result = await Assignment.deleteOne({ _id: assignmentId, user: userId });

      if (result.deletedCount === 0) {
        throw new Error('Assignment not found or you do not have permission to delete it');
      }

      console.log(`Assignment ${assignmentId} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Error deleting assignment ${assignmentId}: ${error.message}`);
      throw new Error(`Failed to delete assignment: ${error.message}`);
    }
  }

  static async getAssignmentSummary(userId) {
    try {
      console.log(`Fetching assignment summary for user ${userId}`);

      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const [
        totalAssignments,
        monthlyAssignments,
        totalOptions,
        highRiskAssignments
      ] = await Promise.all([
        Assignment.countDocuments({ user: userId }),
        Assignment.countDocuments({ 
          user: userId, 
          assignmentDate: { $gte: currentMonth } 
        }),
        Option.countDocuments({ user: userId }),
        Assignment.countDocuments({ 
          user: userId, 
          assignmentProbability: { $gte: 70 },
          status: 'active'
        })
      ]);

      const assignmentRate = totalOptions > 0 ? ((totalAssignments / totalOptions) * 100).toFixed(1) : '0.0';

      // Calculate average profit
      const assignments = await Assignment.find({ user: userId });
      const avgProfit = assignments.length > 0 
        ? assignments.reduce((sum, a) => sum + a.totalPnL, 0) / assignments.length
        : 0;

      const summary = {
        totalAssignments,
        monthlyAssignments,
        assignmentRate: parseFloat(assignmentRate),
        avgProfit: Math.round(avgProfit),
        highRiskAssignments
      };

      console.log(`Assignment summary calculated for user ${userId}`);
      return summary;
    } catch (error) {
      console.error(`Error calculating assignment summary: ${error.message}`);
      throw new Error(`Failed to calculate assignment summary: ${error.message}`);
    }
  }
}

module.exports = AssignmentService;