const express = require('express');
const UserPreferenceService = require('../services/userPreferenceService.js');
const { requireUser } = require('./middleware/auth.js');

const router = express.Router();

// POST /api/user/preferences - Create or update user preferences
router.post('/preferences', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const preferencesData = req.body;

    console.log(`Creating/updating preferences for user ${userId}`);

    const preferences = await UserPreferenceService.createOrUpdatePreferences(userId, preferencesData);

    res.status(200).json({
      success: true,
      message: 'Preferences saved successfully',
      data: preferences,
    });
  } catch (error) {
    console.error(`Error in POST /preferences: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/user/preferences - Get user preferences
router.get('/preferences', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;

    console.log(`Fetching preferences for user ${userId}`);

    const preferences = await UserPreferenceService.getPreferences(userId);

    res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error(`Error in GET /preferences: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/user/preferences - Update user preferences
router.put('/preferences', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const preferencesData = req.body;

    console.log(`Updating preferences for user ${userId}`);

    const preferences = await UserPreferenceService.createOrUpdatePreferences(userId, preferencesData);

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: preferences,
    });
  } catch (error) {
    console.error(`Error in PUT /preferences: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// PATCH /api/user/preferences/:category/:field - Update specific preference field
router.patch('/preferences/:category/:field', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const { category, field } = req.params;
    const { value } = req.body;

    console.log(`Updating specific preference for user ${userId}: ${category}.${field}`);

    const preferences = await UserPreferenceService.updateSpecificPreference(userId, category, field, value);

    res.status(200).json({
      success: true,
      message: 'Preference updated successfully',
      data: preferences,
    });
  } catch (error) {
    console.error(`Error in PATCH /preferences/${req.params.category}/${req.params.field}: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /api/user/preferences - Delete user preferences (reset to defaults)
router.delete('/preferences', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;

    console.log(`Deleting preferences for user ${userId}`);

    const deleted = await UserPreferenceService.deletePreferences(userId);

    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'Preferences reset to defaults successfully',
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'No preferences found to delete',
      });
    }
  } catch (error) {
    console.error(`Error in DELETE /preferences: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;