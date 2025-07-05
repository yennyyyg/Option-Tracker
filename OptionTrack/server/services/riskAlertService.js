const RiskAlert = require('../models/RiskAlert');

class RiskAlertService {
  async createAlert(userId, alertData) {
    try {
      console.log('Creating risk alert for user:', userId, 'with data:', alertData);
      
      const alert = new RiskAlert({
        user: userId,
        ...alertData
      });

      const savedAlert = await alert.save();
      console.log('Risk alert created successfully:', savedAlert._id);
      
      return savedAlert;
    } catch (error) {
      console.error('Error creating risk alert:', error);
      throw new Error(`Failed to create risk alert: ${error.message}`);
    }
  }

  async getUserAlerts(userId, options = {}) {
    try {
      console.log('Fetching risk alerts for user:', userId);
      
      const query = { user: userId };
      
      // Add filters if provided
      if (options.isActive !== undefined) {
        query.isActive = options.isActive;
      }
      
      if (options.severity) {
        query.severity = options.severity;
      }
      
      if (options.alertType) {
        query.alertType = options.alertType;
      }

      const alerts = await RiskAlert.find(query)
        .sort({ createdAt: -1 })
        .lean();

      console.log(`Found ${alerts.length} risk alerts for user:`, userId);
      return alerts;
    } catch (error) {
      console.error('Error fetching risk alerts:', error);
      throw new Error(`Failed to fetch risk alerts: ${error.message}`);
    }
  }

  async getAlertById(alertId, userId) {
    try {
      console.log('Fetching risk alert:', alertId, 'for user:', userId);
      
      const alert = await RiskAlert.findOne({ 
        _id: alertId, 
        user: userId 
      }).lean();

      if (!alert) {
        throw new Error('Risk alert not found');
      }

      return alert;
    } catch (error) {
      console.error('Error fetching risk alert by ID:', error);
      throw new Error(`Failed to fetch risk alert: ${error.message}`);
    }
  }

  async updateAlert(alertId, userId, updateData) {
    try {
      console.log('Updating risk alert:', alertId, 'for user:', userId);
      
      const alert = await RiskAlert.findOneAndUpdate(
        { _id: alertId, user: userId },
        { ...updateData, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      if (!alert) {
        throw new Error('Risk alert not found');
      }

      console.log('Risk alert updated successfully:', alertId);
      return alert;
    } catch (error) {
      console.error('Error updating risk alert:', error);
      throw new Error(`Failed to update risk alert: ${error.message}`);
    }
  }

  async deleteAlert(alertId, userId) {
    try {
      console.log('Deleting risk alert:', alertId, 'for user:', userId);
      
      const alert = await RiskAlert.findOneAndDelete({ 
        _id: alertId, 
        user: userId 
      });

      if (!alert) {
        throw new Error('Risk alert not found');
      }

      console.log('Risk alert deleted successfully:', alertId);
      return alert;
    } catch (error) {
      console.error('Error deleting risk alert:', error);
      throw new Error(`Failed to delete risk alert: ${error.message}`);
    }
  }

  async getAlertsSummary(userId) {
    try {
      console.log('Fetching alerts summary for user:', userId);
      
      const summary = await RiskAlert.aggregate([
        { $match: { user: userId, isActive: true } },
        {
          $group: {
            _id: '$severity',
            count: { $sum: 1 }
          }
        }
      ]);

      const result = {
        total: 0,
        critical: 0,
        warning: 0,
        info: 0
      };

      summary.forEach(item => {
        result[item._id] = item.count;
        result.total += item.count;
      });

      console.log('Alerts summary:', result);
      return result;
    } catch (error) {
      console.error('Error fetching alerts summary:', error);
      throw new Error(`Failed to fetch alerts summary: ${error.message}`);
    }
  }
}

module.exports = new RiskAlertService();