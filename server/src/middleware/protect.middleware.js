const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const User = require('../models/User');

// ─── Asgardeo JWKS client ──────────────────────────────────────────────────
const jwks = jwksClient({
  jwksUri: `https://api.asgardeo.io/t/${process.env.ASGARDEO_ORG_NAME}/oauth2/jwks`,
  cache: true,
  rateLimit: true,
});

function getSigningKey(header, callback) {
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

// ─── Map Asgardeo groups to app roles ─────────────────────────────────────
function mapGroupsToRole(groups = []) {
  if (groups.includes('admin'))  return 'admin';
  if (groups.includes('owner'))  return 'owner';
  if (groups.includes('staff'))  return 'staff';
  if (groups.includes('driver')) return 'driver';
  return 'customer';
}

// ─── Verify an Asgardeo RS256 token (promisified) ─────────────────────────
function verifyAsgardeoToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getSigningKey, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
}

// ─── Unified protect middleware ────────────────────────────────────────────
// Handles BOTH Asgardeo (RS256) tokens and local HS256 JWTs.
// After this middleware runs, req.user is ALWAYS a full Mongoose User document.
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  const token = authHeader.split(' ')[1];

  // Peek at the JWT header to determine the algorithm without verifying
  let alg;
  try {
    const headerJson = Buffer.from(token.split('.')[0], 'base64url').toString();
    alg = JSON.parse(headerJson).alg;
  } catch {
    return res.status(401).json({ success: false, message: 'Malformed token' });
  }

  // ── Path 1: Asgardeo RS256 token ────────────────────────────────────────
  if (alg === 'RS256') {
    try {
      const decoded = await verifyAsgardeoToken(token);
      const groups  = decoded['http://wso2.org/claims/groups'] || [];
      const role    = mapGroupsToRole(groups);

      // Upsert: create the DB user on first Asgardeo login, or update role
      const user = await User.findOneAndUpdate(
        { asgardeoSub: decoded.sub },
        {
          $setOnInsert: {
            name:  decoded.name || decoded.username || decoded.email || 'User',
            email: decoded.email,
          },
          $set: { role },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      req.user = user;
      return next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired Asgardeo token' });
    }
  }

  // ── Path 2: Local HS256 JWT (Admin / Owner / Staff email+password login) ─
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// ─── Role-based authorization (works for both auth paths) ─────────────────
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user?.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
