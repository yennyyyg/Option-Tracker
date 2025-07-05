const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/auth');

const router = express.Router();

// Add middleware to log all requests to auth routes
router.use((req, res, next) => {
  console.log(`AuthRoutes: ${req.method} ${req.url} - ${new Date().toISOString()}`);
  console.log('AuthRoutes: Request body keys:', Object.keys(req.body || {}));
  if (req.body && req.body.email) {
    console.log('AuthRoutes: Email in request:', req.body.email);
  }
  next();
});

// Register route
router.post('/register', async (req, res) => {
  console.log('AuthRoutes: Register endpoint called with body:', { email: req.body.email });
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('AuthRoutes: Register - missing email or password');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('AuthRoutes: Register - user already exists');
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
    });

    await user.save();
    console.log('AuthRoutes: Register - user created successfully');

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.email);
    console.log('AuthRoutes: Register - tokens generated');

    const response = {
      success: true,
      data: {
        accessToken,
        user: {
          id: user._id,
          email: user.email
        }
      }
    };
    console.log('AuthRoutes: Register - sending response:', { success: response.success, hasData: !!response.data });
    res.status(201).json(response);
  } catch (error) {
    console.error('AuthRoutes: Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  console.log('AuthRoutes: Login endpoint called with body:', { email: req.body.email });
  console.log('AuthRoutes: Login - full request details:', {
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    path: req.path
  });
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('AuthRoutes: Login - missing email or password');
      const errorResponse = {
        success: false,
        error: 'Email and password are required'
      };
      console.log('AuthRoutes: Login - sending error response:', errorResponse);
      return res.status(400).json(errorResponse);
    }

    // Find user
    console.log('AuthRoutes: Login - searching for user:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('AuthRoutes: Login - user not found');
      const errorResponse = {
        success: false,
        error: 'Invalid credentials'
      };
      console.log('AuthRoutes: Login - sending user not found response:', errorResponse);
      return res.status(401).json(errorResponse);
    }

    console.log('AuthRoutes: Login - user found, checking password');
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('AuthRoutes: Login - invalid password');
      const errorResponse = {
        success: false,
        error: 'Invalid credentials'
      };
      console.log('AuthRoutes: Login - sending invalid password response:', errorResponse);
      return res.status(401).json(errorResponse);
    }

    console.log('AuthRoutes: Login - password valid, generating tokens');
    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.email);
    const refreshToken = generateRefreshToken(user._id, user.email);
    console.log('AuthRoutes: Login - tokens generated successfully');

    // Update user with refresh token and last login
    user.refreshToken = refreshToken;
    user.lastLoginAt = new Date();
    await user.save();
    console.log('AuthRoutes: Login - user updated with refresh token');

    const response = {
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email
        }
      }
    };
    console.log('AuthRoutes: Login - preparing to send response:', { 
      success: response.success, 
      hasData: !!response.data, 
      hasTokens: !!(response.data.accessToken && response.data.refreshToken),
      accessTokenLength: response.data.accessToken ? response.data.accessToken.length : 0,
      refreshTokenLength: response.data.refreshToken ? response.data.refreshToken.length : 0
    });
    
    console.log('AuthRoutes: Login - about to call res.json()');
    res.json(response);
    console.log('AuthRoutes: Login - res.json() called successfully');
  } catch (error) {
    console.error('AuthRoutes: Login error - full error object:', error);
    console.error('AuthRoutes: Login error - stack trace:', error.stack);
    const errorResponse = {
      success: false,
      error: 'Internal server error'
    };
    console.log('AuthRoutes: Login - sending server error response:', errorResponse);
    res.status(500).json(errorResponse);
  }
});

// Refresh token route
router.post('/refresh', async (req, res) => {
  console.log('AuthRoutes: Refresh endpoint called');
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      console.log('AuthRoutes: Refresh - missing refresh token');
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    console.log('AuthRoutes: Refresh - token decoded for user:', decoded.userId);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      console.log('AuthRoutes: Refresh - invalid refresh token or user not found');
      return res.status(403).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id, user.email);
    const newRefreshToken = generateRefreshToken(user._id, user.email);

    // Update user with new refresh token
    user.refreshToken = newRefreshToken;
    await user.save();
    console.log('AuthRoutes: Refresh - new tokens generated and saved');

    const response = {
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    };
    console.log('AuthRoutes: Refresh - sending response:', { success: response.success, hasData: !!response.data });
    res.json(response);
  } catch (error) {
    console.error('AuthRoutes: Token refresh error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        error: 'Refresh token expired'
      });
    }
    res.status(403).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  console.log('AuthRoutes: Logout endpoint called');
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Find user and clear refresh token
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) {
        user.refreshToken = null;
        await user.save();
        console.log('AuthRoutes: Logout - refresh token cleared for user:', user.email);
      }
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('AuthRoutes: Logout error:', error);
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
});

module.exports = router;