const express = require('express');
const { requireUser } = require('./middleware/auth.js');

console.log('Premium routes file loaded');

const router = express.Router();

// Add middleware logging for this router
router.use((req, res, next) => {
  console.log(`Premium route hit: ${req.method} ${req.url}`);
  next();
});

// GET /api/premium-tracker/summary - Get premium summary (mock for now)
router.get('/summary', requireUser, async (req, res) => {
  try {
    console.log(`Fetching premium summary for user ${req.user._id}`);
    
    // Mock data to prevent frontend errors
    const mockSummary = {
      thisWeek: 0,
      thisMonth: 0,
      thisQuarter: 0,
      yearToDate: 0,
      totalCollected: 0
    };

    res.status(200).json({
      success: true,
      data: mockSummary,
    });
  } catch (error) {
    console.error(`Error in GET /premium-tracker/summary: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/premium-tracker/trades - Get premium trades (mock for now)
router.get('/trades', requireUser, async (req, res) => {
  try {
    console.log(`Fetching premium trades for user ${req.user._id}`);
    
    // Mock data to prevent frontend errors
    const mockTrades = [];

    res.status(200).json({
      success: true,
      data: mockTrades,
    });
  } catch (error) {
    console.error(`Error in GET /premium-tracker/trades: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/premium-tracker/strategy-breakdown - Get strategy breakdown (mock for now)
router.get('/strategy-breakdown', requireUser, async (req, res) => {
  try {
    console.log(`Fetching strategy breakdown for user ${req.user._id}`);
    
    // Mock data to prevent frontend errors
    const mockBreakdown = [];

    res.status(200).json({
      success: true,
      data: mockBreakdown,
    });
  } catch (error) {
    console.error(`Error in GET /premium-tracker/strategy-breakdown: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/premium-tracker/trades - Create premium trade (mock for now)
router.post('/trades', requireUser, async (req, res) => {
  try {
    console.log(`Creating premium trade for user ${req.user._id}`);
    
    res.status(201).json({
      success: true,
      message: 'Premium trade created successfully',
      data: { _id: 'mock-id', ...req.body },
    });
  } catch (error) {
    console.error(`Error in POST /premium-tracker/trades: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /api/premium-tracker/trades/:id - Delete premium trade (mock for now)
router.delete('/trades/:id', requireUser, async (req, res) => {
  try {
    console.log(`Deleting premium trade ${req.params.id} for user ${req.user._id}`);
    
    res.status(200).json({
      success: true,
      message: 'Premium trade deleted successfully',
    });
  } catch (error) {
    console.error(`Error in DELETE /premium-tracker/trades/${req.params.id}: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

console.log('Premium routes configured');
module.exports = router;