const express = require('express');
const router = express.Router();
const plaidService = require('../services/plaidService');
const { requireUser } = require('./middleware/auth');

// Apply authentication middleware to all routes
router.use(requireUser);

// Create link token
router.post('/create-link-token', async (req, res) => {
  try {
    console.log(`PlaidRoutes: Creating link token for user ${req.user.id}`);
    
    const linkTokenData = await plaidService.createLinkToken(req.user.id);
    
    res.json({
      success: true,
      data: linkTokenData
    });
  } catch (error) {
    console.error('PlaidRoutes: Error creating link token:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Exchange public token for access token
router.post('/exchange-public-token', async (req, res) => {
  try {
    const { public_token } = req.body;
    
    if (!public_token) {
      return res.status(400).json({
        success: false,
        error: 'Public token is required'
      });
    }

    console.log(`PlaidRoutes: Exchanging public token for user ${req.user.id}`);
    console.log(`PlaidRoutes: Public token received: ${public_token ? public_token.substring(0, 20) + '...' : 'undefined'}`);

    const result = await plaidService.exchangePublicToken(public_token, req.user.id);
    
    console.log(`PlaidRoutes: Exchange public token result:`, result);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('PlaidRoutes: Error exchanging public token:', error);
    console.error('PlaidRoutes: Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get investment holdings
router.get('/investments', async (req, res) => {
  try {
    console.log(`PlaidRoutes: Getting investments for user ${req.user.id}`);
    
    const investments = await plaidService.getInvestmentHoldings(req.user.id);
    
    res.json({
      success: true,
      data: investments
    });
  } catch (error) {
    console.error('PlaidRoutes: Error getting investments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get connected accounts
router.get('/connected-accounts', async (req, res) => {
  try {
    console.log(`PlaidRoutes: Getting connected accounts for user ${req.user.id}`);
    
    const accounts = await plaidService.getConnectedAccounts(req.user.id);
    
    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    console.error('PlaidRoutes: Error getting connected accounts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Disconnect account
router.delete('/disconnect-account/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    console.log(`PlaidRoutes: Disconnecting account ${tokenId} for user ${req.user.id}`);
    
    const result = await plaidService.disconnectAccount(req.user.id, tokenId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('PlaidRoutes: Error disconnecting account:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;