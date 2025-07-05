const express = require('express');
const RollingService = require('../services/rollingService.js');
const { requireUser } = require('./middleware/auth.js');

const router = express.Router();

// POST /api/rolling-opportunities - Create a new rolling opportunity
router.post('/', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const opportunityData = req.body;

    console.log(`Creating rolling opportunity for user ${userId}`);

    const opportunity = await RollingService.createRollingOpportunity(userId, opportunityData);

    res.status(201).json({
      success: true,
      message: 'Rolling opportunity created successfully',
      data: opportunity,
    });
  } catch (error) {
    console.error(`Error in POST /rolling-opportunities: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/rolling-opportunities - Get all rolling opportunities for the user
router.get('/', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const filters = {
      status: req.query.status,
      symbol: req.query.symbol,
      strategy: req.query.strategy,
      expirationStart: req.query.expirationStart,
      expirationEnd: req.query.expirationEnd,
    };

    console.log(`Fetching rolling opportunities for user ${userId}`);

    const opportunities = await RollingService.getRollingOpportunities(userId, filters);

    res.status(200).json({
      success: true,
      data: opportunities,
    });
  } catch (error) {
    console.error(`Error in GET /rolling-opportunities: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/rolling-opportunities/summary - Get rolling opportunities summary statistics
router.get('/summary', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;

    console.log(`Fetching rolling opportunities summary for user ${userId}`);

    const summary = await RollingService.getRollingOpportunitiesSummary(userId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error(`Error in GET /rolling-opportunities/summary: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/rolling-opportunities/:id - Get a specific rolling opportunity
router.get('/:id', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const opportunityId = req.params.id;

    console.log(`Fetching rolling opportunity ${opportunityId} for user ${userId}`);

    const opportunity = await RollingService.getRollingOpportunityById(opportunityId, userId);

    res.status(200).json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    console.error(`Error in GET /rolling-opportunities/${req.params.id}: ${error.message}`);
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/rolling-opportunities/:id - Update a rolling opportunity
router.put('/:id', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const opportunityId = req.params.id;
    const updateData = req.body;

    console.log(`Updating rolling opportunity ${opportunityId} for user ${userId}`);

    const opportunity = await RollingService.updateRollingOpportunity(opportunityId, userId, updateData);

    res.status(200).json({
      success: true,
      message: 'Rolling opportunity updated successfully',
      data: opportunity,
    });
  } catch (error) {
    console.error(`Error in PUT /rolling-opportunities/${req.params.id}: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /api/rolling-opportunities/:id - Delete a rolling opportunity
router.delete('/:id', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const opportunityId = req.params.id;

    console.log(`Deleting rolling opportunity ${opportunityId} for user ${userId}`);

    await RollingService.deleteRollingOpportunity(opportunityId, userId);

    res.status(200).json({
      success: true,
      message: 'Rolling opportunity deleted successfully',
    });
  } catch (error) {
    console.error(`Error in DELETE /rolling-opportunities/${req.params.id}: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;