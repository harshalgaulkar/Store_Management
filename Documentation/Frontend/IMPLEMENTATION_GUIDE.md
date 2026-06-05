# Store Management System - Implementation Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Setup Instructions](#setup-instructions)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Development Guidelines](#development-guidelines)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Checklist](#deployment-checklist)

---

## Project Overview

**Application Name:** Store Management System

**Purpose:** A web application that allows users to submit ratings (1-5 stars) for registered stores with role-based access control.

**User Roles:**
- **System Administrator**: Full system management
- **Normal User**: Browse stores and submit ratings
- **Store Owner**: View ratings for their store

---

## Tech Stack

### Backend
- **Framework**: Express.js / NestJS / LoopBack
- **Runtime**: Node.js (v16+)
- **Language**: JavaScript/TypeScript

### Database
- **Primary**: PostgreSQL (Recommended) or MySQL
- **Port**: 5432 (PostgreSQL) / 3306 (MySQL)

### Frontend
- **Framework**: React.js
- **Build Tool**: Webpack / Vite
- **HTTP Client**: Axios / Fetch API
- **State Management**: Redux / Context API

### Tools & Libraries
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: Joi / Yup
- **API Testing**: Postman / REST Client
- **Version Control**: Git

---

## Project Structure

### Backend Structure (Express.js Recommended)

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── env.js
│   │   └── jwt.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── userController.js
│   │   ├── storeOwnerController.js
│   │   └── storeController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── validationMiddleware.js
│   │   └── errorHandler.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Store.js
│   │   └── Rating.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── userRoutes.js
│   │   ├── storeOwnerRoutes.js
│   │   └── index.js
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── storeService.js
│   │   ├── ratingService.js
│   │   └── adminService.js
│   │
│   ├── utils/
│   │   ├── validators.js
│   │   ├── responseHandler.js
│   │   ├── errorMessages.js
│   │   └── helpers.js
│   │
│   ├── database/
│   │   └── migrations/
│   │       └── 001_initial_schema.sql
│   │
│   └── server.js
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── .env.example
├── .gitignore
├── package.json
├── jest.config.js
└── README.md
```

### Frontend Structure (React.js)

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   └── PasswordChangeForm.jsx
│   │   │
│   │   ├── Admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   ├── StoreManagement.jsx
│   │   │   └── UserDetail.jsx
│   │   │
│   │   ├── User/
│   │   │   ├── StoreListing.jsx
│   │   │   ├── StoreDetail.jsx
│   │   │   ├── RatingForm.jsx
│   │   │   └── MyRatings.jsx
│   │   │
│   │   ├── StoreOwner/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── RatingsList.jsx
│   │   │   └── Statistics.jsx
│   │   │
│   │   └── Common/
│   │       ├── Navbar.jsx
│   │       ├── Sidebar.jsx
│   │       ├── Pagination.jsx
│   │       ├── SearchFilter.jsx
│   │       └── Table.jsx
│   │
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── UserDashboard.jsx
│   │   ├── StoreOwnerDashboard.jsx
│   │   ├── NotFound.jsx
│   │   └── Unauthorized.jsx
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── storeService.js
│   │   ├── ratingService.js
│   │   └── adminService.js
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useFetch.js
│   │   └── useForm.js
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── UIContext.jsx
│   │
│   ├── utils/
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── constants.js
│   │
│   ├── App.jsx
│   ├── App.css
│   └── index.jsx
│
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Node.js v16 or higher
- PostgreSQL v12+ or MySQL v8+
- Git
- npm or yarn

### Backend Setup

**1. Clone Repository**
```bash
git clone <repository-url>
cd Store_Management/Backend
```

**2. Install Dependencies**
```bash
npm install
```

**3. Environment Configuration**
```bash
cp .env.example .env
```

**.env file contents:**
```
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=store_management
DB_USER=postgres
DB_PASSWORD=your_password
DB_TYPE=postgres # or mysql

# JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRE=7d

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

**4. Database Setup**
```bash
# Create database
createdb store_management  # PostgreSQL
# or
mysql -u root -p -e "CREATE DATABASE store_management;"  # MySQL

# Run migrations
npm run migrate
```

**5. Start Server**
```bash
npm start
# or for development with hot reload
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

**1. Navigate to Frontend**
```bash
cd ../frontend  # or create new React app
```

**2. Install Dependencies**
```bash
npm install
```

**3. Environment Configuration**
```bash
cp .env.example .env
```

**.env file contents:**
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Store Management System
```

**4. Start Development Server**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173` (Vite) or `http://localhost:3000` (Webpack)

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Database schema creation and migration setup
- [ ] Authentication system (login, register, JWT)
- [ ] User model and basic CRUD operations
- [ ] Role-based middleware implementation
- [ ] Basic error handling and logging

### Phase 2: Core Features (Week 3-4)
- [ ] Store management endpoints
- [ ] Store listing and search functionality
- [ ] Rating submission system
- [ ] Admin dashboard statistics
- [ ] User profile management

### Phase 3: Advanced Features (Week 5-6)
- [ ] Sorting and filtering on all listings
- [ ] Pagination implementation
- [ ] Store owner dashboard
- [ ] Audit logging
- [ ] Performance optimization

### Phase 4: Frontend Development (Week 7-10)
- [ ] Authentication UI (login, register)
- [ ] Admin dashboard and management pages
- [ ] User store browsing and rating interface
- [ ] Store owner dashboard
- [ ] Responsive design

### Phase 5: Testing & Deployment (Week 11-12)
- [ ] Unit tests (70% coverage minimum)
- [ ] Integration tests
- [ ] End-to-end tests
- [ ] Performance testing
- [ ] Production deployment

---

## Development Guidelines

### Code Style

#### Backend (Node.js)
```javascript
// Use consistent naming conventions
const getUserById = async (userId) => {
  // Use const/let, not var
  // Use arrow functions
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  } catch (error) {
    logger.error('Error fetching user:', error);
    throw error;
  }
};

// Comments for complex logic
// Single responsibility functions
// Async/await over promises
// Error handling in try-catch
```

#### Frontend (React)
```jsx
// Component naming: PascalCase
export const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Hooks at top
  // Descriptive variable names
  // Consistent formatting
  
  return (
    <div className="user-profile">
      {loading ? <Loader /> : <UserDetails user={user} />}
    </div>
  );
};
```

### Commit Message Convention
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** feat, fix, docs, style, refactor, test, chore
**Example:** `feat(auth): implement JWT token refresh mechanism`

### API Response Format
All responses should follow this format:
```javascript
{
  success: true/false,
  message: "Human-readable message",
  data: {},
  errors: []
}
```

### Error Handling
```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Usage
throw new AppError('Invalid credentials', 401);
```

### Input Validation
```javascript
// Use Joi for schema validation
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(16).required(),
  name: Joi.string().min(20).max(60).required()
});

const { error, value } = schema.validate(req.body);
if (error) throw new ValidationError(error.details);
```

---

## Testing Strategy

### Unit Tests
```javascript
// Test individual functions
describe('User Service', () => {
  describe('getUserById', () => {
    it('should return user if exists', async () => {
      const user = await userService.getUserById('uuid');
      expect(user).toBeDefined();
      expect(user.id).toBe('uuid');
    });
    
    it('should throw error if user not found', async () => {
      await expect(userService.getUserById('invalid')).rejects.toThrow();
    });
  });
});
```

### Integration Tests
```javascript
// Test API endpoints
describe('GET /api/users', () => {
  it('should return list of users', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

### Test Coverage Target
- Unit Tests: 70%+
- Integration Tests: 50%+
- Critical Path: 100%

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (npm test)
- [ ] No console errors or warnings
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Security vulnerabilities scanned (npm audit)
- [ ] Code review completed
- [ ] Performance optimized (< 3s page load)
- [ ] API documentation updated

### Backend Deployment
```bash
# Build
npm run build

# Start production
NODE_ENV=production npm start

# Use process manager (PM2)
pm2 start server.js --name "store-management-api"
```

### Frontend Deployment
```bash
# Build
npm run build

# Deploy to static hosting (AWS S3, Vercel, Netlify)
# or serve from backend
npm run serve
```

### Post-Deployment
- [ ] Monitor logs for errors
- [ ] Test all user flows
- [ ] Verify database backups
- [ ] Monitor performance metrics
- [ ] Set up monitoring and alerts

---

## Security Best Practices

1. **Password Security**
   - Hash with bcrypt (salt rounds: 10)
   - Never log passwords
   - Enforce strong password policy

2. **API Security**
   - Use HTTPS only
   - Implement rate limiting
   - Validate all inputs
   - Use CORS appropriately

3. **Authentication**
   - Use JWT with expiration
   - Implement refresh tokens
   - Secure token storage (HttpOnly cookies)

4. **Database**
   - Use parameterized queries (prevent SQL injection)
   - Encrypt sensitive data
   - Regular backups

5. **Deployment**
   - Keep dependencies updated
   - Use environment variables
   - Enable CSRF protection
   - Set security headers (helmet.js)

---

## Performance Optimization

1. **Database**
   - Proper indexing
   - Query optimization
   - Connection pooling
   - Caching layer (Redis)

2. **API**
   - Pagination on large datasets
   - Response compression (gzip)
   - Caching strategies
   - Lazy loading

3. **Frontend**
   - Code splitting
   - Image optimization
   - Component memoization
   - Virtual scrolling for large lists

---

## Monitoring & Logging

```javascript
// Use winston for logging
const logger = require('winston');

logger.info('User logged in', { userId, timestamp });
logger.error('Database error', { error: err.message });

// Monitor with tools like:
// - New Relic
// - Datadog
// - Sentry for error tracking
```

---

## Support & Documentation

- API Documentation: See [API_ENDPOINTS.md](API_ENDPOINTS.md)
- Database Design: See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- Code Repository: [GitHub Link]
- Issue Tracking: [Jira/GitHub Issues Link]

