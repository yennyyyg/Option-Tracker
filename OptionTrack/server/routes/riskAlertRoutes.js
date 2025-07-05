const express = require('express');
const router = express.Router();
const riskAlertService = require('../services/riskAlertService');
const { requireUser } = require('./middleware/auth');

// Apply authentication middleware to all routes
router.use(requireUser);

// Create a new risk alert
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/risk-alerts - Creating new alert for user:', req.user.userId);
    
    const {
      alertType,
      title,
      description,
      severity,
      symbol,
      strike,
      expiration,
      threshold,
      currentValue
    } = req.body;

    // Validate required fields
    if (!alertType || !title || !description || !severity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: alertType, title, description, and severity are required'
      });
    }

    // Validate enum values
    const validAlertTypes = ['assignment_risk', 'margin_usage', 'expiration_reminder', 'profit_target', 'loss_limit', 'volatility_change'];
    const validSeverities = ['info', 'warning', 'critical'];

    if (!validAlertTypes.includes(alertType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid alert type'
      });
    }

    if (!validSeverities.includes(severity)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid severity level'
      });
    }

    const alertData = {
      alertType,
      title,
      description,
      severity,
      symbol,
      strike,
      expiration: expiration ? new Date(expiration) : undefined,
      threshold,
      currentValue
    };

    const alert = await riskAlertService.createAlert(req.user.userId, alertData);

    res.status(201).json({
      success: true,
      message: 'Risk alert created successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error in POST /api/risk-alerts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all risk alerts for the user
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/risk-alerts - Fetching alerts for user:', req.user.userId);
    
    const { isActive, severity, alertType } = req.query;
    
    const options = {};
    if (isActive !== undefined) {
      options.isActive = isActive === 'true';
    }
    if (severity) {
      options.severity = severity;
    }
    if (alertType) {
      options.alertType = alertType;
    }

    const alerts = await riskAlertService.getUserAlerts(req.user.userId, options);

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error in GET /api/risk-alerts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get alerts summary
router.get('/summary', async (req, res) => {
  try {
    console.log('GET /api/risk-alerts/summary - Fetching summary for user:', req.user.userId);
    
    const summary = await riskAlertService.getAlertsSummary(req.user.userId);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error in GET /api/risk-alerts/summary:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get a specific risk alert
router.get('/:alertId', async (req, res) => {
  try {
    console.log('GET /api/risk-alerts/:alertId - Fetching alert:', req.params.alertId);
    
    const alert = await riskAlertService.getAlertById(req.params.alertId, req.user.userId);

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error in GET /api/risk-alerts/:alertId:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

// Update a risk alert
router.put('/:alertId', async (req, res) => {
  try {
    console.log('PUT /api/risk-alerts/:alertId - Updating alert:', req.params.alertId);
    
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updateData.user;
    delete updateData.createdAt;
    delete updateData._id;

    const alert = await riskAlertService.updateAlert(req.params.alertId, req.user.userId, updateData);

    res.json({
      success: true,
      message: 'Risk alert updated successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error in PUT /api/risk-alerts/:alertId:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

// Delete a risk alert
router.delete('/:alertId', async (req, res) => {
  try {
    console.log('DELETE /api/risk-alerts/:alertId - Deleting alert:', req.params.alertId);
    
    await riskAlertService.deleteAlert(req.params.alertId, req.user.userId);

    res.json({
      success: true,
      message: 'Risk alert deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/risk-alerts/:alertId:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;