# Store Management System - Complete Documentation Overview

## Quick Reference

**Project Name:** Store Management System  
**Status:** Design Phase - Ready for Implementation  
**Tech Stack:** Express.js/Node.js, React.js, PostgreSQL/MySQL  
**Documentation Created:** 4 comprehensive guides

---

## 📚 Documentation Structure

### 1. **API_ENDPOINTS.md** ✅
Complete REST API specification with all endpoints organized by functionality.

**Contains:**
- Authentication endpoints (login, register, logout, refresh)
- Admin endpoints (dashboard, user management, store management)
- User endpoints (store browsing, ratings, profile)
- Store owner endpoints (dashboard, ratings view)
- Error handling and response formats
- Status codes and authentication flow
- Pagination, sorting, and filtering specifications

**Key Sections:**
- 30+ API endpoints fully documented
- Request/response examples for every endpoint
- Input validations and constraints
- Access control specifications
- 35 status code definitions

**When to Use:** Reference this document when building or consuming API endpoints.

---

### 2. **DATABASE_SCHEMA.md** ✅
Complete database design with schema, relationships, and optimization strategies.

**Contains:**
- Entity-Relationship Diagram (ERD)
- 4 core tables: Users, Stores, Ratings, Audit Logs
- Complete SQL schema for PostgreSQL and MySQL
- Primary keys, foreign keys, unique constraints
- 15+ strategic indexes
- Data integrity constraints
- Sample data insertion scripts
- Performance optimization tips

**Key Tables:**
- **users**: Stores all users (Admins, Normal Users, Store Owners)
- **stores**: Registered stores with denormalized average rating
- **ratings**: Individual 1-5 star ratings with unique user-store constraint
- **audit_logs**: Complete audit trail for compliance

**When to Use:** Reference this document when setting up the database or designing queries.

---

### 3. **IMPLEMENTATION_GUIDE.md** ✅
Step-by-step implementation roadmap and best practices.

**Contains:**
- Complete project structure for backend and frontend
- Setup instructions for development environment
- 5-phase implementation roadmap (12 weeks)
- Code style guidelines and conventions
- Testing strategy (unit, integration, e2e)
- Deployment checklist
- Security best practices
- Performance optimization strategies
- Monitoring and logging setup

**Roadmap Overview:**
- **Phase 1 (Weeks 1-2):** Foundation - Database, Auth, User Model
- **Phase 2 (Weeks 3-4):** Core Features - Stores, Ratings, Admin Dashboard
- **Phase 3 (Weeks 5-6):** Advanced Features - Sorting, Filtering, Auditing
- **Phase 4 (Weeks 7-10):** Frontend Development - UI for all roles
- **Phase 5 (Weeks 11-12):** Testing & Deployment

**When to Use:** Reference this document for project setup, development workflow, and deployment process.

---

### 4. **AUTH_AUTHORIZATION_GUIDE.md** ✅
Comprehensive authentication and authorization implementation guide.

**Contains:**
- JWT token structure and generation
- Access token and refresh token implementation
- Token verification and refresh flow
- User roles and permission matrix
- Password security requirements and validation
- Password hashing with bcrypt
- Session management (login/logout flow)
- Authentication middleware implementation
- Role-based authorization middleware
- Resource ownership verification
- Security best practices
- Complete code examples

**Key Concepts:**
- **JWT Tokens**: 24-hour expiry for access, 7-day for refresh
- **Roles**: ADMIN, STORE_OWNER, NORMAL_USER
- **Password**: 8-16 chars, 1 uppercase, 1 special character
- **Middleware**: Token verification, role checking, resource ownership

**When to Use:** Reference this document when implementing authentication, authorization, or password management.

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React.js)                       │
│  ┌──────────────┬─────────────┬──────────────┬────────────┐ │
│  │ Admin Panel  │ User Portal │Store Owner   │ Auth Pages │ │
│  │              │             │Dashboard     │            │ │
│  └──────────────┴─────────────┴──────────────┴────────────┘ │
└────────────────────────────────────────────────────────────┬─┘
                           │
                    HTTP/REST API
                           │
┌────────────────────────────────────────────────────────────┬─┐
│              Backend (Express.js / Node.js)                │ │
│  ┌──────────────────────────────────────────────────────┐ │ │
│  │            API Layer (30+ endpoints)                │ │ │
│  ├──────────────────────────────────────────────────────┤ │ │
│  │ Auth │ Admin │ User │ Store │ Rating │ StoreOwner │ │ │
│  └──────────────────────────────────────────────────────┘ │ │
│  ┌──────────────────────────────────────────────────────┐ │ │
│  │            Middleware & Security                    │ │ │
│  │ Auth │ RBAC │ Validation │ Error Handler │ Logging  │ │ │
│  └──────────────────────────────────────────────────────┘ │ │
│  ┌──────────────────────────────────────────────────────┐ │ │
│  │            Business Logic (Services)                │ │ │
│  │ Auth │ Admin │ User │ Store │ Rating │ StoreOwner  │ │ │
│  └──────────────────────────────────────────────────────┘ │ │
│  ┌──────────────────────────────────────────────────────┐ │ │
│  │            Data Access (Models/DAOs)                │ │ │
│  │ User │ Store │ Rating │ AuditLog                    │ │ │
│  └──────────────────────────────────────────────────────┘ │ │
└────────────────────────────────────────────────────────────┼─┘
                           │
                      Database Driver
                           │
┌────────────────────────────────────────────────────────────┬─┐
│              Database (PostgreSQL/MySQL)                   │ │
│  ┌────────────────────────────────────────────────────┐   │ │
│  │ Users │ Stores │ Ratings │ Audit Logs │ Indexes   │   │ │
│  └────────────────────────────────────────────────────┘   │ │
└────────────────────────────────────────────────────────────┴─┘
```

---

## 🔑 Key Design Decisions

### 1. **Role-Based Access Control (RBAC)**
- Three distinct user roles with specific permissions
- Middleware-based access control at route level
- Prevents unauthorized access to sensitive endpoints

### 2. **JWT Token Authentication**
- Stateless authentication (no server-side session storage)
- Access tokens for short-term access (24 hours)
- Refresh tokens for long-term validity (7 days)
- Secure HttpOnly cookies for refresh tokens

### 3. **Database Design**
- UUID primary keys for scalability
- Denormalized fields (average_rating) for performance
- Unique constraints to prevent duplicates
- Audit logging table for compliance

### 4. **API Design**
- RESTful endpoints with clear resource paths
- Consistent response format across all endpoints
- Comprehensive error handling with meaningful messages
- Pagination, sorting, and filtering on list endpoints

### 5. **Security**
- Password hashing with bcrypt (10 salt rounds)
- Strict password requirements (8-16 chars, uppercase, special char)
- CORS configuration for controlled access
- Input validation on all endpoints
- Audit logging for sensitive operations

---

## 🚀 Quick Start Checklist

### Backend Setup
```bash
1. Clone repository
2. Navigate to Backend/ directory
3. npm install
4. cp .env.example .env (Configure database credentials)
5. npm run migrate (Create database schema)
6. npm run dev (Start development server)
```

### Frontend Setup
```bash
1. Create React app or navigate to frontend directory
2. npm install
3. cp .env.example .env (Configure API base URL)
4. npm run dev (Start development server)
```

### Database Setup
```bash
# PostgreSQL
createdb store_management
psql store_management < database_schema.sql

# MySQL
mysql -u root -p -e "CREATE DATABASE store_management;"
mysql -u root -p store_management < database_schema.sql
```

---

## 👥 User Roles & Features Matrix

| Feature | Admin | Store Owner | Normal User |
|---------|:-----:|:----------:|:----------:|
| **Authentication** | | | |
| Register | ✗ | ✗ | ✓ |
| Login | ✓ | ✓ | ✓ |
| Logout | ✓ | ✓ | ✓ |
| Change Password | ✓ | ✓ | ✓ |
| **Dashboard** | | | |
| View Statistics | ✓ | ✓ | ✗ |
| Total Users | ✓ | ✗ | ✗ |
| Total Stores | ✓ | ✗ | ✗ |
| Total Ratings | ✓ | ✗ | ✗ |
| **User Management** | | | |
| Create Users | ✓ | ✗ | ✗ |
| View All Users | ✓ | ✗ | ✗ |
| Search/Filter Users | ✓ | ✗ | ✗ |
| Delete Users | ✓ | ✗ | ✗ |
| **Store Management** | | | |
| Add Stores | ✓ | ✗ | ✗ |
| View All Stores | ✓ | ✓ | ✓ |
| Search Stores | ✗ | ✓ | ✓ |
| Filter Stores | ✗ | ✓ | ✓ |
| **Rating Management** | | | |
| Submit Ratings | ✗ | ✓ | ✓ |
| Modify Ratings | ✗ | ✓ | ✓ |
| Delete Ratings | ✗ | ✓ (own) | ✓ (own) |
| View Store Ratings | ✗ | ✓ (own) | ✓ (all) |

---

## 📊 Data Flow Examples

### User Registration Flow
```
1. User submits form (name, email, address, password)
2. Frontend validates input
3. Frontend sends POST /api/auth/register
4. Backend validates password strength
5. Backend checks email uniqueness
6. Backend hashes password with bcrypt
7. Backend creates user in database
8. Backend generates JWT access token
9. Backend generates refresh token
10. Backend returns token + user data
11. Frontend stores access token in memory
12. Frontend stores refresh token in secure cookie
13. Frontend redirects to appropriate dashboard
```

### Rating Submission Flow
```
1. User selects store and rating (1-5)
2. User clicks submit rating
3. Frontend sends POST /api/users/ratings
4. Frontend includes Authorization header with JWT
5. Backend extracts user from JWT token
6. Backend checks if user already rated this store
7. Backend inserts rating into database
8. Backend updates store's average_rating and total_ratings
9. Backend returns success response
10. Frontend updates UI to show submitted rating
11. Frontend allows user to modify or delete rating
```

### Admin Dashboard Flow
```
1. Admin logs in with credentials
2. System verifies admin role
3. Frontend sends GET /api/admin/dashboard
4. Backend extracts user from JWT
5. Backend checks user role = ADMIN
6. Backend calculates statistics:
   - COUNT(users) WHERE is_active = TRUE
   - COUNT(stores) WHERE is_active = TRUE
   - COUNT(ratings)
7. Backend returns statistics
8. Frontend renders dashboard charts
9. Frontend provides links to manage users/stores
```

---

## 🔐 Security Layers

### Layer 1: Network
- HTTPS/TLS encryption
- CORS configured for specific origins

### Layer 2: Authentication
- JWT tokens with expiration
- Refresh token rotation
- Secure cookie storage (HttpOnly, Secure, SameSite)

### Layer 3: Authorization
- Role-based access control (RBAC)
- Resource ownership verification
- Endpoint protection with middleware

### Layer 4: Data Validation
- Input sanitization
- Schema validation (Joi/Yup)
- Type checking
- Constraint enforcement (database level)

### Layer 5: Database
- SQL injection prevention (parameterized queries)
- Password hashing (bcrypt)
- Audit logging
- Foreign key constraints

### Layer 6: Application
- Rate limiting on sensitive endpoints
- Error handling without exposing details
- Logging sensitive operations
- Security headers (Helmet.js)

---

## 📈 Performance Considerations

### Database
- Strategic indexes on frequently queried fields
- Denormalized fields to reduce joins
- Connection pooling
- Query optimization

### API
- Pagination on large datasets
- Response compression (gzip)
- Caching layer (Redis)
- Rate limiting

### Frontend
- Code splitting and lazy loading
- Image optimization
- Component memoization
- Virtual scrolling for large lists

---

## 🧪 Testing Strategy

### Unit Tests
- Service methods
- Middleware functions
- Utility functions
- Target: 70%+ coverage

### Integration Tests
- API endpoints
- Database operations
- Authentication flow
- Target: 50%+ coverage

### End-to-End Tests
- Complete user flows
- All roles and permissions
- Error scenarios

---

## 📋 Implementation Timeline

| Phase | Duration | Key Deliverables |
|-------|----------|-----------------|
| Foundation | Weeks 1-2 | Database, Auth, User Model |
| Core Features | Weeks 3-4 | Stores, Ratings, Admin Dashboard |
| Advanced Features | Weeks 5-6 | Sorting, Filtering, Auditing |
| Frontend Development | Weeks 7-10 | All UI Pages and Components |
| Testing & Deployment | Weeks 11-12 | Tests, Optimization, Production |

---

## 📖 How to Use This Documentation

### For Backend Developers
1. **Start Here:** IMPLEMENTATION_GUIDE.md (Setup & Structure)
2. **Then Read:** DATABASE_SCHEMA.md (Database Design)
3. **Implement:** AUTH_AUTHORIZATION_GUIDE.md (Authentication)
4. **Develop:** API_ENDPOINTS.md (Endpoint Implementation)

### For Frontend Developers
1. **Start Here:** API_ENDPOINTS.md (Understand API)
2. **Learn Auth:** AUTH_AUTHORIZATION_GUIDE.md (Token Management)
3. **Setup:** IMPLEMENTATION_GUIDE.md (Frontend Structure)
4. **Reference:** DATABASE_SCHEMA.md (Data Models)

### For DevOps/Database Administrators
1. **Start Here:** DATABASE_SCHEMA.md (Complete Schema)
2. **Setup:** IMPLEMENTATION_GUIDE.md (Deployment Steps)
3. **Monitor:** IMPLEMENTATION_GUIDE.md (Monitoring Section)
4. **Secure:** AUTH_AUTHORIZATION_GUIDE.md (Security Best Practices)

### For Project Managers
1. **Timeline:** IMPLEMENTATION_GUIDE.md (5-Phase Roadmap)
2. **Architecture:** This Document (System Overview)
3. **Features:** User Roles & Features Matrix (This Document)
4. **Endpoints:** API_ENDPOINTS.md (Complete Specification)

---

## 🔗 Cross-Reference Guide

| Document | Best For | Key Sections |
|----------|----------|--------------|
| API_ENDPOINTS.md | API Development | Endpoints, Responses, Validations |
| DATABASE_SCHEMA.md | Database Setup | Tables, Relationships, Indexes |
| IMPLEMENTATION_GUIDE.md | Project Setup | Structure, Roadmap, Development |
| AUTH_AUTHORIZATION_GUIDE.md | Security | JWT, RBAC, Password Security |

---

## ✅ Validation Checklist Before Development

- [ ] All documentation reviewed by team
- [ ] Database schema approved
- [ ] API endpoints confirmed
- [ ] Authentication flow understood
- [ ] Role permissions clarified
- [ ] Development environment set up
- [ ] Code style guidelines established
- [ ] Testing approach agreed upon
- [ ] Deployment strategy defined
- [ ] Security requirements confirmed

---

## 🆘 Common Questions

**Q: Can a user have multiple roles?**  
A: No, each user has a single role (ADMIN, STORE_OWNER, or NORMAL_USER).

**Q: Can a Store Owner also be a Normal User?**  
A: No, Store Owner and Normal User are separate roles.

**Q: How long do tokens last?**  
A: Access tokens last 24 hours, refresh tokens last 7 days.

**Q: What happens when a store is deleted?**  
A: All associated ratings are cascade-deleted per database design.

**Q: Can a user rate the same store multiple times?**  
A: No, there's a unique constraint on (user_id, store_id).

**Q: How are ratings calculated?**  
A: Average is calculated from all ratings, stored and updated whenever a rating changes.

---

## 📞 Support & Contribution

For questions or clarifications on this documentation:
1. Review the relevant guide document
2. Check the code examples provided
3. Consult the cross-reference sections
4. Escalate to technical lead if needed

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-06-05 | Initial documentation complete |

---

**Last Updated:** June 5, 2024  
**Created By:** GitHub Copilot  
**Status:** ✅ Ready for Implementation

