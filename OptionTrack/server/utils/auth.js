const jwt = require('jsonwebtoken');

const generateAccessToken = (userId, email) => {
  console.log('Auth Utils: Generating access token for userId:', userId, 'email:', email);
  const payload = {
    userId: userId.toString(),
    email: email
  };
  console.log('Auth Utils: Access token payload:', payload);
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
  console.log('Auth Utils: Access token generated:', token ? `${token.substring(0, 20)}...` : 'null');
  return token;
};

const generateRefreshToken = (userId, email) => {
  console.log('Auth Utils: Generating refresh token for userId:', userId, 'email:', email);
  const payload = {
    userId: userId.toString(),
    email: email
  };
  console.log('Auth Utils: Refresh token payload:', payload);
  const token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  console.log('Auth Utils: Refresh token generated:', token ? `${token.substring(0, 20)}...` : 'null');
  return token;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};