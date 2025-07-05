const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const requireUser = async (req, res, next) => {
  console.log('Auth Middleware: Processing request for', req.method, req.url);
  
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth Middleware: Authorization header:', authHeader ? `Bearer ${authHeader.substring(7, 27)}...` : 'missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth Middleware: No valid authorization header found');
      return res.status(403).json({ error: 'Access token required' });
    }

    const token = authHeader.substring(7);
    console.log('Auth Middleware: Extracted token:', token ? `${token.substring(0, 20)}...` : 'empty');

    if (!token) {
      console.log('Auth Middleware: Empty token after extraction');
      return res.status(403).json({ error: 'Access token required' });
    }

    console.log('Auth Middleware: Verifying token with JWT_SECRET');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth Middleware: Token decoded successfully:', { userId: decoded.userId, email: decoded.email });

    console.log('Auth Middleware: Looking up user in database:', decoded.userId);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.log('Auth Middleware: User not found in database for ID:', decoded.userId);
      return res.status(403).json({ error: 'User not found' });
    }

    console.log('Auth Middleware: User found, attaching to request:', { id: user._id, email: user.email });
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware: Token verification failed:', error.message);
    console.error('Auth Middleware: Error type:', error.name);
    
    if (error.name === 'TokenExpiredError') {
      console.log('Auth Middleware: Token expired');
      return res.status(401).json({ error: 'Token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      console.log('Auth Middleware: Invalid token');
      return res.status(403).json({ error: 'Invalid token' });
    } else {
      console.log('Auth Middleware: Other authentication error');
      return res.status(403).json({ error: 'Authentication failed' });
    }
  }
};

module.exports = { requireUser };