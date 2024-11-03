const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token)
    return res
      .status(401)
      .json({ message: 'Access denied. No token provided.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token with the secret
    req.user = decoded; // Attach user data to the request
    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token.' });
  }
};
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    // Assuming the token payload contains a 'role' field
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

const authenticateTokens = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user; // Save user info to request
    next();
  });
};


module.exports = { authenticateToken, authorizeAdmin, authenticateTokens };
