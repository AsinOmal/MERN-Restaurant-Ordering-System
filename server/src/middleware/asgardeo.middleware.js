const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: `https://api.asgardeo.io/t/${process.env.ASGARDEO_ORG_NAME}/oauth2/jwks`,
  cache: true,
  rateLimit: true,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const verifyAsgardeoToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = {
      sub: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      roles: decoded['http://wso2.org/claims/groups'] || [],
    };
    next();
  });
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const hasRole = roles.some(role => req.user.roles.includes(role));
    if (!hasRole && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: `User is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { verifyAsgardeoToken, authorizeRoles };
