// Load environment variables
require("dotenv").config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require('connect-mongo');

const { connectDB } = require("./config/database");
const basicRoutes = require("./routes/index");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const userPreferenceRoutes = require("./routes/userPreferenceRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const premiumRoutes = require("./routes/premiumRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const rollingRoutes = require("./routes/rollingRoutes");
const greeksRoutes = require("./routes/greeksRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const riskAlertRoutes = require("./routes/riskAlertRoutes");
const plaidRoutes = require("./routes/plaidRoutes");

// Analytics middleware
const { trackPerformance, trackUserEngagement, startSystemMetricsCollection } = require('./middleware/analytics');

console.log('Loading premium routes...');
console.log('Premium routes loaded:', typeof premiumRoutes);

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL variables in .env missing.");
  process.exit(-1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Start system metrics collection
startSystemMetricsCollection();

// Middleware
app.use(cors());
app.use(express.json());

// Add logging middleware to see all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  if (req.method === 'POST' && req.url.includes('/auth/login')) {
    console.log('SERVER: Login request detected - body:', { email: req.body?.email, hasPassword: !!req.body?.password });
  }
  next();
});

// Analytics middleware - track performance for all requests
app.use(trackPerformance);

// Analytics middleware - track user engagement (only for authenticated requests)
app.use('/api', trackUserEngagement);

// Add middleware to log responses for auth routes
app.use('/api/auth', (req, res, next) => {
  console.log('SERVER: Auth route middleware - URL:', req.url, 'Method:', req.method);
  
  const originalSend = res.send;
  res.send = function(data) {
    console.log('SERVER: Auth route response being sent:', {
      url: req.url,
      method: req.method,
      statusCode: res.statusCode,
      dataType: typeof data,
      dataPreview: typeof data === 'string' ? data.substring(0, 100) : 'not string'
    });
    return originalSend.call(this, data);
  };
  
  next();
});

// Routes
console.log('Setting up routes...');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', userPreferenceRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/premium-tracker', premiumRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/rolling-opportunities', rollingRoutes);
app.use('/api/greeks', greeksRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/risk-alerts', riskAlertRoutes);
app.use('/api/plaid', plaidRoutes);
console.log('Routes setup complete');

// Only serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app build directory
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Catch-all handler: send back React's index.html file for any non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  console.log(`404 - API endpoint not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});