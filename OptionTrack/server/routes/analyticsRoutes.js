const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const { requireUser } = require('./middleware/auth');

// Get system performance metrics
router.get('/performance', requireUser, async (req, res) => {
  console.log('Analytics: GET /performance endpoint called');
  
  try {
    const timeRange = req.query.timeRange || '24h';
    console.log(`Analytics: Fetching performance metrics for timeRange: ${timeRange}`);
    
    const metrics = await analyticsService.getPerformanceMetrics(timeRange);
    
    res.json({
      success: true,
      data: metrics
    });
    
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch performance metrics'
    });
  }
});

// Get user engagement metrics
router.get('/engagement', requireUser, async (req, res) => {
  console.log('Analytics: GET /engagement endpoint called');
  
  try {
    const timeRange = req.query.timeRange || '24h';
    console.log(`Analytics: Fetching engagement metrics for timeRange: ${timeRange}`);
    
    const metrics = await analyticsService.getEngagementMetrics(timeRange);
    
    res.json({
      success: true,
      data: metrics
    });
    
  } catch (error) {
    console.error('Error fetching engagement metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch engagement metrics'
    });
  }
});

// Get resource utilization metrics
router.get('/resources', requireUser, async (req, res) => {
  console.log('Analytics: GET /resources endpoint called');
  
  try {
    const timeRange = req.query.timeRange || '24h';
    console.log(`Analytics: Fetching resource metrics for timeRange: ${timeRange}`);
    
    const metrics = await analyticsService.getResourceMetrics(timeRange);
    
    res.json({
      success: true,
      data: metrics
    });
    
  } catch (error) {
    console.error('Error fetching resource metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch resource metrics'
    });
  }
});

module.exports = router;