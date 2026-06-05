# Store Management System - Authentication & Authorization Guide

## Table of Contents
1. [Overview](#overview)
2. [JWT Implementation](#jwt-implementation)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Password Security](#password-security)
5. [Session Management](#session-management)
6. [Authorization Middleware](#authorization-middleware)
7. [Security Best Practices](#security-best-practices)
8. [Implementation Examples](#implementation-examples)

---

## Overview

This system uses **JWT (JSON Web Tokens)** for stateless authentication and **Role-Based Access Control (RBAC)** for authorization.

### Key Features
- Stateless authentication (no server-side session storage)
- Token expiration and refresh mechanism
- Role-based access control
- Password hashing and validation
- Secure login/logout flow

---

## JWT Implementation

### Token Structure

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTYiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyb2xlIjoiTk9STUFMX1VTRVIiLCJpYXQiOjE2MjM1MTIwMDAsImV4cCI6MTYyMzU5ODQwMH0.sig
```

**Token Parts:**
1. **Header**: Algorithm and token type
2. **Payload**: User data and claims
3. **Signature**: Verification data

### Access Token Claims

```json
{
  "userId": "uuid-here",
  "email": "user@example.com",
  "name": "User Name",
  "role": "NORMAL_USER",
  "storeId": "uuid-here (if Store Owner)",
  "iat": 1623512000,
  "exp": 1623598400
}
```

### Token Generation

**Backend Implementation (Node.js with JWT):**

```javascript
const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    storeId: user.storeId || null
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h',
    issuer: 'store-management-app',
    audience: 'store-management-users'
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};
```

_Note: the current backend does not expose a dedicated refresh-token route. This is an optional extension pattern._

### Token Verification

```javascript
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};
```

### Token Refresh Flow

Current backend implementation does not include a dedicated refresh-token endpoint.
Access tokens are issued at login, and a refresh flow may be added later if the backend is extended.

---

## User Roles & Permissions

### Role Hierarchy

```
ADMIN
  ├─ Create users
  ├─ Create stores
  ├─ View dashboard
  ├─ Manage users
  └─ Manage stores

STORE_OWNER
  ├─ View own store ratings
  ├─ See store statistics
  ├─ Change password
  └─ View profile

NORMAL_USER
  ├─ Browse stores
  ├─ Submit ratings
  ├─ Modify own ratings
  ├─ Change password
  └─ View profile
```

### Permission Matrix

| Endpoint | ADMIN | STORE_OWNER | NORMAL_USER |
|----------|:-----:|:----------:|:----------:|
| POST /api/users/register | ✗ | ✗ | ✓ |
| POST /api/users/login | ✗ | ✗ | ✓ |
| POST /api/store-owners/register | ✗ | ✓ | ✗ |
| POST /api/store-owners/login | ✗ | ✓ | ✗ |
| POST /api/admins/register | ✓ | ✗ | ✗ |
| POST /api/admins/login | ✓ | ✗ | ✗ |
| GET /api/admins/users/count | ✓ | ✗ | ✗ |
| GET /api/admins/stores/count | ✓ | ✗ | ✗ |
| GET /api/admins/ratings/count | ✓ | ✗ | ✗ |
| GET /api/store-owners/ratings?uid={owner_uid} | ✗ | ✓ | ✗ |
| GET /api/store-owners/ratings/average?uid={owner_uid} | ✗ | ✓ | ✗ |
| PUT /api/store-owners/update-password | ✗ | ✓ | ✗ |
| GET /api/users/ratings?uid={owner_uid} | ✗ | ✓ | ✗ |
| GET /api/stores/all | ✗ | ✓ | ✓ |
| GET /api/stores/search?query={text} | ✗ | ✓ | ✓ |

---

## Password Security

### Password Requirements

```
Minimum Length: 8 characters
Maximum Length: 16 characters
Must Include:
  - At least 1 uppercase letter (A-Z)
  - At least 1 lowercase letter (a-z)
  - At least 1 digit (0-9)
  - At least 1 special character (!@#$%^&*)
```

### Password Validation Implementation

```javascript
const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push('Password is required');
    return errors;
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (password.length > 16) {
    errors.push('Password must be at most 16 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one digit');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return errors;
};
```

### Password Hashing

```javascript
const bcrypt = require('bcrypt');

// Hash password before storing
const hashPassword = async (password) => {
  const saltRounds = 10; // Cost factor
  return await bcrypt.hash(password, saltRounds);
};

// Verify password during login
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Usage in registration
const registerUser = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Validate password
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Password validation failed',
        errors: passwordErrors
      });
    }

    // Check if email exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role: 'NORMAL_USER'
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: accessToken,
      refreshToken: refreshToken
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};
```

### Change Password Implementation

```javascript
const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check new password is different
    const isSamePassword = await verifyPassword(
      newPassword,
      user.password
    );
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be same as current password'
      });
    }

    // Validate new password
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'New password validation failed',
        errors: passwordErrors
      });
    }

    // Hash and update
    const hashedPassword = await hashPassword(newPassword);
    await user.update({ password: hashedPassword });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Password change failed'
    });
  }
};
```

---

## Session Management

### Login Flow

```
1. User submits email + password
2. Validate credentials
3. Generate access token (24h expiry)
4. Generate refresh token (7d expiry)
5. Return both tokens
6. Client stores access token (memory) and refresh token (secure cookie)
```

**Backend Login Implementation:**

```javascript
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required'
      });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Log audit
    await AuditLog.create({
      userId: user.id,
      action: 'LOGIN',
      tableName: 'users',
      status: 'SUCCESS',
      ipAddress: req.ip
    });

    // Send refresh token as HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: user.storeId || null
      },
      token: accessToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};
```

### Logout Flow

```
1. Client clears tokens from storage
2. Server invalidates session
3. Return success response
```

**Backend Logout Implementation:**

```javascript
const logout = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Log audit
    await AuditLog.create({
      userId: userId,
      action: 'LOGOUT',
      tableName: 'users',
      status: 'SUCCESS'
    });

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};
```

---

## Authorization Middleware

### Authentication Middleware

```javascript
const authenticateToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.message === 'Token expired') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};
```

### Role-Based Authorization Middleware

```javascript
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        requiredRole: allowedRoles
      });
    }

    next();
  };
};

// Usage
app.get(
  '/api/admins/users/count',
  authenticateToken,
  authorize('ADMIN'),
  adminController.getUsersCount
);

app.get(
  '/api/admins/stores/count',
  authenticateToken,
  authorize('ADMIN'),
  adminController.getStoresCount
);

app.get(
  '/api/store-owners/ratings',
  authenticateToken,
  authorize('STORE_OWNER'),
  storeOwnerController.getRatings
);

app.get(
  '/api/stores/all',
  authenticateToken,
  authorize('NORMAL_USER', 'STORE_OWNER'),
  storeController.getAllStores
);
```

### Resource Ownership Verification

```javascript
const verifyResourceOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const resourceId = req.params.id;

      if (resourceType === 'rating') {
        const rating = await Rating.findById(resourceId);
        if (!rating) {
          return res.status(404).json({
            success: false,
            message: 'Rating not found'
          });
        }
        
        if (rating.userId !== userId) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to modify this rating'
          });
        }
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Authorization check failed'
      });
    }
  };
};

// Usage
app.put(
  '/api/users/ratings/:id',
  authenticateToken,
  authorize('NORMAL_USER'),
  verifyResourceOwnership('rating'),
  ratingController.updateRating
);
```

---

## Security Best Practices

### 1. Token Storage (Frontend)

```javascript
// ✓ GOOD: Store access token in memory, refresh token in secure cookie
const handleLogin = async (credentials) => {
  const response = await fetch('/api/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    credentials: 'include' // Include cookies
  });
  
  const data = await response.json();
  
  // Store in memory/context (lost on refresh)
  setAccessToken(data.token);
  
  // Refresh token stored as HttpOnly cookie by server
};

// ✗ AVOID: Storing tokens in localStorage (XSS vulnerability)
localStorage.setItem('token', accessToken);

// ✗ AVOID: Storing in sessionStorage without protection
sessionStorage.setItem('token', accessToken);
```

### 2. CORS Configuration

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 3. Security Headers

```javascript
const helmet = require('helmet');

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"]
  }
}));
```

### 4. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

app.post('/api/users/login', loginLimiter, login);
```

### 5. Input Validation

```javascript
const { body, validationResult } = require('express-validator');

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().trim()
];

app.post('/api/users/login', validateLogin, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, login);
```

---

## Implementation Examples

### Complete Route Protection Example

```javascript
// routes/protected.js
const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');

// Admin only
router.get(
  '/admin/users',
  authenticateToken,
  authorize('ADMIN'),
  async (req, res) => {
    try {
      const users = await User.findAll({
        where: { isActive: true }
      });
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Multiple roles
router.get(
  '/stores',
  authenticateToken,
  authorize('NORMAL_USER', 'STORE_OWNER'),
  async (req, res) => {
    try {
      const stores = await Store.findAll({
        where: { isActive: true }
      });
      
      res.json({
        success: true,
        data: stores
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

module.exports = router;
```

