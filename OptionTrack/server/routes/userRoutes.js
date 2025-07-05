const express = require('express');
const UserService = require('../services/userService.js');
const { requireUser } = require('./middleware/auth.js');

const router = express.Router();

// POST /api/users/options-profile - Create/Update options trading profile
router.post('/options-profile', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const { account_balance, risk_tolerance, preferred_strategies } = req.body;

    console.log(`Creating/updating options profile for user ${userId}`);

    const updatedUser = await UserService.updateOptionsProfile(userId, {
      account_balance,
      risk_tolerance,
      preferred_strategies,
    });

    const optionsProfile = {
      account_balance: updatedUser.account_balance,
      risk_tolerance: updatedUser.risk_tolerance,
      preferred_strategies: updatedUser.preferred_strategies,
    };

    res.status(200).json({
      success: true,
      message: 'Options profile updated successfully',
      data: optionsProfile,
    });
  } catch (error) {
    console.error(`Error in POST /options-profile: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/users/options-profile - Retrieve options trading profile
router.get('/options-profile', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;

    console.log(`Fetching options profile for user ${userId}`);

    const optionsProfile = await UserService.getOptionsProfile(userId);

    res.status(200).json({
      success: true,
      data: optionsProfile,
    });
  } catch (error) {
    console.error(`Error in GET /options-profile: ${error.message}`);
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;