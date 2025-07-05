const express = require('express');
const GreeksService = require('../services/greeksService.js');
const { requireUser } = require('./middleware/auth.js');

const router = express.Router();

// Validation middleware for Greeks parameters
const validateGreeksParams = (req, res, next) => {
  const { S, K, T, r, sigma, optionType } = req.body;
  
  if (!S || !K || !T || !r || !sigma || !optionType) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters: S (current price), K (strike price), T (time to expiration), r (risk-free rate), sigma (volatility), optionType'
    });
  }
  
  if (S <= 0 || K <= 0 || T <= 0 || sigma <= 0) {
    return res.status(400).json({
      success: false,
      error: 'S, K, T, and sigma must be positive numbers'
    });
  }
  
  if (!['call', 'put'].includes(optionType.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: 'optionType must be either "call" or "put"'
    });
  }
  
  next();
};

// POST /api/greeks/delta - Calculate Delta
router.post('/delta', requireUser, validateGreeksParams, async (req, res) => {
  try {
    const { S, K, T, r, sigma, optionType } = req.body;
    console.log(`Delta calculation requested by user ${req.user._id}`);
    
    const delta = GreeksService.calculateDelta(
      parseFloat(S), 
      parseFloat(K), 
      parseFloat(T), 
      parseFloat(r), 
      parseFloat(sigma), 
      optionType
    );
    
    res.status(200).json({
      success: true,
      data: {
        delta,
        parameters: { S, K, T, r, sigma, optionType }
      }
    });
  } catch (error) {
    console.error(`Error in POST /greeks/delta: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/greeks/gamma - Calculate Gamma
router.post('/gamma', requireUser, validateGreeksParams, async (req, res) => {
  try {
    const { S, K, T, r, sigma, optionType } = req.body;
    console.log(`Gamma calculation requested by user ${req.user._id}`);
    
    const gamma = GreeksService.calculateGamma(
      parseFloat(S), 
      parseFloat(K), 
      parseFloat(T), 
      parseFloat(r), 
      parseFloat(sigma), 
      optionType
    );
    
    res.status(200).json({
      success: true,
      data: {
        gamma,
        parameters: { S, K, T, r, sigma, optionType }
      }
    });
  } catch (error) {
    console.error(`Error in POST /greeks/gamma: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/greeks/theta - Calculate Theta
router.post('/theta', requireUser, validateGreeksParams, async (req, res) => {
  try {
    const { S, K, T, r, sigma, optionType } = req.body;
    console.log(`Theta calculation requested by user ${req.user._id}`);
    
    const theta = GreeksService.calculateTheta(
      parseFloat(S), 
      parseFloat(K), 
      parseFloat(T), 
      parseFloat(r), 
      parseFloat(sigma), 
      optionType
    );
    
    res.status(200).json({
      success: true,
      data: {
        theta,
        parameters: { S, K, T, r, sigma, optionType }
      }
    });
  } catch (error) {
    console.error(`Error in POST /greeks/theta: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/greeks/vega - Calculate Vega
router.post('/vega', requireUser, validateGreeksParams, async (req, res) => {
  try {
    const { S, K, T, r, sigma, optionType } = req.body;
    console.log(`Vega calculation requested by user ${req.user._id}`);
    
    const vega = GreeksService.calculateVega(
      parseFloat(S), 
      parseFloat(K), 
      parseFloat(T), 
      parseFloat(r), 
      parseFloat(sigma), 
      optionType
    );
    
    res.status(200).json({
      success: true,
      data: {
        vega,
        parameters: { S, K, T, r, sigma, optionType }
      }
    });
  } catch (error) {
    console.error(`Error in POST /greeks/vega: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/greeks/rho - Calculate Rho
router.post('/rho', requireUser, validateGreeksParams, async (req, res) => {
  try {
    const { S, K, T, r, sigma, optionType } = req.body;
    console.log(`Rho calculation requested by user ${req.user._id}`);
    
    const rho = GreeksService.calculateRho(
      parseFloat(S), 
      parseFloat(K), 
      parseFloat(T), 
      parseFloat(r), 
      parseFloat(sigma), 
      optionType
    );
    
    res.status(200).json({
      success: true,
      data: {
        rho,
        parameters: { S, K, T, r, sigma, optionType }
      }
    });
  } catch (error) {
    console.error(`Error in POST /greeks/rho: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/greeks/all - Calculate all Greeks at once
router.post('/all', requireUser, validateGreeksParams, async (req, res) => {
  try {
    const { S, K, T, r, sigma, optionType } = req.body;
    console.log(`All Greeks calculation requested by user ${req.user._id}`);
    
    const greeks = GreeksService.calculateAllGreeks(
      parseFloat(S), 
      parseFloat(K), 
      parseFloat(T), 
      parseFloat(r), 
      parseFloat(sigma), 
      optionType
    );
    
    res.status(200).json({
      success: true,
      data: {
        ...greeks,
        parameters: { S, K, T, r, sigma, optionType }
      }
    });
  } catch (error) {
    console.error(`Error in POST /greeks/all: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;