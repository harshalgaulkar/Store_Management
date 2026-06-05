# Store Management System - Database Schema Design

## Table of Contents
1. [Database Overview](#database-overview)
2. [Entity-Relationship Diagram](#entity-relationship-diagram)
3. [Table Structures](#table-structures)
4. [Indexes](#indexes)
5. [Constraints and Relationships](#constraints-and-relationships)
6. [Best Practices](#best-practices)

---

## Database Overview

**Database Name:** `store_management`

**DBMS:** PostgreSQL/MySQL

**Character Set:** UTF-8

**Tables:** 5 core tables + 1 audit table

---

## Entity-Relationship Diagram

```
┌─────────────┐
│   Users     │
├─────────────┤
│ user_id (PK)│◄──────┐
│ name        │       │
│ email (U)   │       │
│ password    │       │
│ address     │       │
│ role        │       │ 1:Many
│ created_at  │       │
│ updated_at  │       │
└─────────────┘       │
                      │
        ┌─────────────┴─────────────┐
        │                           │
   ┌────────────┐          ┌──────────────┐
   │   Stores   │          │   Ratings    │
   ├────────────┤          ├──────────────┤
   │ store_id   │◄─────────│ rating_id(PK)│
   │ name       │          │ user_id (FK) │
   │ email (U)  │  1:Many  │ store_id(FK) │
   │ address    │          │ rating       │
   │ created_at │          │ created_at   │
   │ updated_at │          │ updated_at   │
   └────────────┘          └──────────────┘
        ▲
        │ 1:1
   ┌────┴─────────┐
   │ store_id (FK)│
   │ (in Users)   │
   └──────────────┘
   (for Store Owners)
```

---

## Table Structures

### 1. Users Table

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL,
    
    -- Role and Store Association
    role ENUM('ADMIN', 'NORMAL_USER', 'STORE_OWNER') NOT NULL DEFAULT 'NORMAL_USER',
    store_id UUID UNIQUE REFERENCES stores(store_id) ON DELETE SET NULL,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    CONSTRAINT name_length CHECK (CHAR_LENGTH(name) >= 20 AND CHAR_LENGTH(name) <= 60),
    CONSTRAINT address_length CHECK (CHAR_LENGTH(address) <= 400)
);

-- MySQL Alternative
CREATE TABLE users (
    user_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL,
    
    role ENUM('ADMIN', 'NORMAL_USER', 'STORE_OWNER') NOT NULL DEFAULT 'NORMAL_USER',
    store_id CHAR(36) UNIQUE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    CONSTRAINT name_length CHECK (CHAR_LENGTH(name) >= 20 AND CHAR_LENGTH(name) <= 60),
    CONSTRAINT address_length CHECK (CHAR_LENGTH(address) <= 400),
    CONSTRAINT fk_store FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE SET NULL
);
```

**Purpose:** Stores all user information (Admins, Normal Users, Store Owners)

**Key Fields:**
- `user_id`: Unique identifier (UUID)
- `role`: Determines access level and available features
- `store_id`: NULL for Admins and Normal Users, contains store_id for Store Owners
- `is_active`: Soft delete indicator

---

### 2. Stores Table

```sql
CREATE TABLE stores (
    store_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    address VARCHAR(400) NOT NULL,
    
    -- Calculated Fields (Denormalized for Performance)
    total_ratings INT DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT address_length CHECK (CHAR_LENGTH(address) <= 400)
);

-- MySQL Alternative
CREATE TABLE stores (
    store_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    address VARCHAR(400) NOT NULL,
    
    total_ratings INT DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT address_length CHECK (CHAR_LENGTH(address) <= 400)
);
```

**Purpose:** Stores all registered stores information

**Key Fields:**
- `store_id`: Unique identifier (UUID)
- `total_ratings`: Cached count of ratings for performance
- `average_rating`: Cached average for quick display

---

### 3. Ratings Table

```sql
CREATE TABLE ratings (
    rating_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
    
    -- Rating Data
    rating INT NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT rating_range CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT unique_user_store UNIQUE(user_id, store_id)
);

-- MySQL Alternative
CREATE TABLE ratings (
    rating_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    user_id CHAR(36) NOT NULL,
    store_id CHAR(36) NOT NULL,
    
    rating INT NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT rating_range CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT unique_user_store UNIQUE(user_id, store_id),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_store FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);
```

**Purpose:** Stores individual user ratings for stores

**Key Fields:**
- `rating_id`: Unique identifier (UUID)
- `rating`: Integer value between 1-5
- Unique constraint on (user_id, store_id) prevents duplicate ratings

---

### 4. Audit Log Table (Optional but Recommended)

```sql
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User Information
    user_id UUID,
    
    -- Action Information
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT
    table_name VARCHAR(50) NOT NULL,
    record_id UUID,
    
    -- Change Details
    old_values JSON,
    new_values JSON,
    
    -- Metadata
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'SUCCESS',
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- MySQL Alternative
CREATE TABLE audit_logs (
    log_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    
    user_id CHAR(36),
    
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id CHAR(36),
    
    old_values JSON,
    new_values JSON,
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'SUCCESS',
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);
```

**Purpose:** Tracks all critical system operations for audit and compliance

---

## Indexes

### Users Table Indexes
```sql
-- PostgreSQL
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_store_id ON users(store_id);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_name ON users(name);

-- MySQL (identical syntax)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_store_id ON users(store_id);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_name ON users(name);
```

### Stores Table Indexes
```sql
CREATE INDEX idx_stores_email ON stores(email);
CREATE INDEX idx_stores_name ON stores(name);
CREATE INDEX idx_stores_is_active ON stores(is_active);
CREATE INDEX idx_stores_average_rating ON stores(average_rating DESC);
CREATE INDEX idx_stores_created_at ON stores(created_at DESC);
```

### Ratings Table Indexes
```sql
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_store_id ON ratings(store_id);
CREATE INDEX idx_ratings_user_store ON ratings(user_id, store_id);
CREATE INDEX idx_ratings_created_at ON ratings(created_at DESC);
CREATE INDEX idx_ratings_rating ON ratings(rating);
```

### Audit Logs Table Indexes
```sql
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
```

---

## Constraints and Relationships

### Primary Keys
- All tables use UUID as primary key for scalability and security

### Foreign Keys
- `ratings.user_id` → `users.user_id` (CASCADE DELETE)
- `ratings.store_id` → `stores.store_id` (CASCADE DELETE)
- `users.store_id` → `stores.store_id` (SET NULL on delete)

### Unique Constraints
- `users.email` - One email per user
- `stores.email` - One email per store
- `ratings(user_id, store_id)` - One rating per user per store

### Check Constraints
- `users.name` - Between 20 and 60 characters
- `users.address` - Maximum 400 characters
- `stores.address` - Maximum 400 characters
- `ratings.rating` - Between 1 and 5

---

## Best Practices Implemented

### 1. Data Integrity
- Foreign key constraints ensure referential integrity
- Unique constraints prevent duplicate data
- Check constraints validate data values

### 2. Performance
- Strategic indexing on frequently queried fields
- Denormalized fields (average_rating, total_ratings) for quick queries
- UUID for primary keys (distributed system ready)

### 3. Scalability
- UUID as primary key instead of auto-increment
- Soft deletes support (is_active flag)
- Audit logging for compliance

### 4. Security
- Email field is unique and indexed
- Password should be hashed before storage (application layer)
- Audit logs track all critical operations

### 5. Maintainability
- Clear field naming conventions
- Timestamps for tracking creation/update
- Active flags for logical deletion

---

## Database Creation Scripts

### PostgreSQL Setup
```sql
CREATE DATABASE store_management;

\c store_management;

-- Create ENUM types
CREATE TYPE user_role AS ENUM('ADMIN', 'NORMAL_USER', 'STORE_OWNER');

-- Create tables (as defined above)
-- Create indexes
-- Create audit log triggers (optional)
```

### MySQL Setup
```sql
CREATE DATABASE store_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE store_management;

-- Create tables (as defined above)
-- Create indexes
-- Set up triggers for audit logging (optional)
```

---

## Sample Data Population

### Insert Sample Admin
```sql
INSERT INTO users (name, email, password, address, role, is_active)
VALUES (
    'Admin User Name', 
    'admin@example.com', 
    'hashed_password_here', 
    '123 Admin Street, City, Country',
    'ADMIN',
    TRUE
);
```

### Insert Sample Stores
```sql
INSERT INTO stores (name, email, address, total_ratings, average_rating, is_active)
VALUES 
    ('Coffee Shop', 'coffee@example.com', '123 Main St, City', 0, 0.00, TRUE),
    ('Bookstore', 'books@example.com', '456 Oak Ave, City', 0, 0.00, TRUE),
    ('Pizza Place', 'pizza@example.com', '789 Elm St, City', 0, 0.00, TRUE);
```

### Insert Sample Store Owners
```sql
INSERT INTO users (name, email, password, address, role, store_id, is_active)
VALUES (
    'Coffee Shop Owner',
    'owner@coffee.com',
    'hashed_password_here',
    '123 Main St, City',
    'STORE_OWNER',
    (SELECT store_id FROM stores WHERE name = 'Coffee Shop'),
    TRUE
);
```

---

## Maintenance Scripts

### Calculate Average Ratings (Run Periodically)
```sql
UPDATE stores s
SET average_rating = (
    SELECT AVG(rating) FROM ratings WHERE store_id = s.store_id
),
total_ratings = (
    SELECT COUNT(*) FROM ratings WHERE store_id = s.store_id
)
WHERE s.is_active = TRUE;
```

### Soft Delete User
```sql
UPDATE users SET is_active = FALSE WHERE user_id = 'uuid_here';
```

### Archive Old Audit Logs (Keep last 1 year)
```sql
DELETE FROM audit_logs 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

### Get Store Statistics
```sql
SELECT 
    s.store_id,
    s.name,
    COUNT(r.rating_id) as total_ratings,
    AVG(r.rating) as average_rating,
    MIN(r.rating) as min_rating,
    MAX(r.rating) as max_rating
FROM stores s
LEFT JOIN ratings r ON s.store_id = r.store_id
WHERE s.is_active = TRUE
GROUP BY s.store_id, s.name
ORDER BY average_rating DESC;
```

---

## Performance Optimization Tips

1. **Connection Pooling**: Implement connection pooling in application
2. **Query Optimization**: Use EXPLAIN to analyze slow queries
3. **Caching Layer**: Consider Redis for frequently accessed data
4. **Read Replicas**: For high-traffic systems, use read replicas
5. **Partitioning**: Partition audit_logs by date for large datasets
6. **Batch Operations**: Use batch inserts for bulk rating submissions

