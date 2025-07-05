const UserPreference = require('../models/UserPreference.js');

class UserPreferenceService {
  static async createOrUpdatePreferences(userId, preferencesData) {
    try {
      console.log(`Creating/updating preferences for user ${userId}`);
      
      const updatedPreferences = await UserPreference.findOneAndUpdate(
        { userId },
        { 
          ...preferencesData,
          userId,
          updatedAt: Date.now(),
        },
        { 
          new: true, 
          upsert: true, 
          runValidators: true 
        }
      );

      console.log(`Preferences updated successfully for user ${userId}`);
      return updatedPreferences;
    } catch (error) {
      console.error(`Error creating/updating preferences for user ${userId}: ${error.message}`);
      throw new Error(`Database error while saving preferences: ${error.message}`);
    }
  }

  static async getPreferences(userId) {
    try {
      console.log(`Fetching preferences for user ${userId}`);
      
      let preferences = await UserPreference.findOne({ userId }).exec();
      
      // If no preferences exist, create default ones
      if (!preferences) {
        console.log(`No preferences found for user ${userId}, creating defaults`);
        preferences = await UserPreference.create({ userId });
      }

      console.log(`Preferences retrieved successfully for user ${userId}`);
      return preferences;
    } catch (error) {
      console.error(`Error fetching preferences for user ${userId}: ${error.message}`);
      throw new Error(`Database error while fetching preferences: ${error.message}`);
    }
  }

  static async deletePreferences(userId) {
    try {
      console.log(`Deleting preferences for user ${userId}`);
      
      const result = await UserPreference.deleteOne({ userId }).exec();
      
      console.log(`Preferences deleted for user ${userId}, deleted count: ${result.deletedCount}`);
      return result.deletedCount > 0;
    } catch (error) {
      console.error(`Error deleting preferences for user ${userId}: ${error.message}`);
      throw new Error(`Database error while deleting preferences: ${error.message}`);
    }
  }

  static async updateSpecificPreference(userId, category, field, value) {
    try {
      console.log(`Updating specific preference for user ${userId}: ${category}.${field} = ${value}`);
      
      const updatePath = category ? `${category}.${field}` : field;
      const updateData = { 
        [updatePath]: value,
        updatedAt: Date.now(),
      };

      const updatedPreferences = await UserPreference.findOneAndUpdate(
        { userId },
        updateData,
        { 
          new: true, 
          upsert: true, 
          runValidators: true 
        }
      );

      console.log(`Specific preference updated successfully for user ${userId}`);
      return updatedPreferences;
    } catch (error) {
      console.error(`Error updating specific preference for user ${userId}: ${error.message}`);
      throw new Error(`Database error while updating specific preference: ${error.message}`);
    }
  }
}

module.exports = UserPreferenceService;