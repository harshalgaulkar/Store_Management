# Store Rating Platform Database Documentation

## Overview
This document explains the MySQL schema defined in `store.sql` for a store rating web application built with:
- Backend: Express.js
- Database: MySQL
- Frontend: React.js

The system supports three user roles: System Administrator, Normal User, and Store Owner. It enables role-based access, store registration, rating submission, and dashboard summaries.

## Database Design Goals
The schema is designed to:
- Enforce role-based user management
- Keep store and rating data normalized
- Protect relationships with referential integrity
- Support query filtering, sorting, and dashboard metrics
- Enable easy integration with Express.js CRUD APIs and React UI pages

## Tables and Relationships

### `users`
Stores every person who can log in to the application.

Columns:
- `id`: Primary key, auto-increment integer
- `name`: User name, up to 60 characters
- `email`: Unique login email
- `password`: Hashed password string
- `address`: User address, up to 400 characters
- `role`: ENUM('Admin', 'Normal', 'Store Owner') with default `Normal`
- `created_at`: Timestamp when the user was created
- `updated_at`: Timestamp when the user was last updated
- `null_1`, `null_2`, `null_3`: Nullable placeholder columns present in the provided schema; these are not part of the application requirements and can be removed or repurposed.

Why this table exists:
- Provides a single login system for all users
- Supports role-based functionality
- Stores profile details required for registration, administration, and ownership

### `stores`
Stores registered on the platform.

Columns:
- `id`: Primary key, auto-increment
- `owner_id`: Foreign key to `users(id)` for the Store Owner
- `name`: Store name, up to 100 characters
- `email`: Store contact email, unique
- `address`: Store address, up to 400 characters
- `created_at` / `updated_at`: Timestamps for record lifecycle
- `null_1`, `null_2`, `null_3`: Nullable placeholder columns in the schema

Relationships and purpose:
- `owner_id` links each store to a store owner
- Admin users can add and view stores
- Normal users can list and rate stores
- Store owners can see ratings for their own store

### `ratings`
Captures reviews submitted by Normal Users for stores.

Columns:
- `id`: Primary key, auto-increment
- `user_id`: Foreign key to `users(id)`
- `store_id`: Foreign key to `stores(id)`
- `rating_value`: TINYINT constrained between 1 and 5
- `created_at` / `updated_at`: Timestamps
- `unique_user_store_rating`: Composite uniqueness ensures one rating per user per store
- `null_1`, `null_2`, `null_3`: Nullable placeholder columns in the schema

Why this table exists:
- Records user-submitted ratings for stores
- Supports per-store average rating calculation
- Enables each normal user to submit or update exactly one rating per store

## Role-Based Functionality Mapping

### System Administrator
The admin role is supported by the `users.role = 'Admin'` value. Admin functionality includes:
- Add new stores and users
- View dashboards using counts from `users`, `stores`, and `ratings`
- Filter users and stores using searchable fields such as `name`, `email`, `address`, and `role`
- Display store listings with average rating derived from `ratings`
- View user details and store owner ratings where applicable

### Normal User
Normal users use `users.role = 'Normal'` and can:
- Sign up with `name`, `email`, `address`, and `password`
- Log in using email/password
- Update their password after login
- View all stores and search by name/address
- See their submitted rating and overall store rating
- Submit or modify a rating for each store

### Store Owner
Store owners use `users.role = 'Store Owner'` and can:
- Log in with the same user table
- Update passwords after login
- Access a dashboard showing ratings for stores they own
- View the average rating for their store based on `ratings`

## Validation and Best Practices
The schema supports the following application-level validation rules:
- Name: 20–60 characters
- Address: Up to 400 characters
- Password: 8–16 characters, at least one uppercase and one special character
- Email: Standard email format
- Rating: Integer 1–5 enforced by SQL `CHECK`

Practical backend handling in Express.js should include:
- Hashing passwords before storage
- Validating role values and email uniqueness
- Returning sorted/paginated listings for tables
- Exposing API endpoints for dashboards and filters

React.js frontend should use this schema to build:
- Authentication and registration pages
- Role-aware dashboards for admin, normal users, and store owners
- Store listing pages with search, submit rating, and update rating actions
- Tables that support ascending/descending sorting on Name, Email, and Address

## Implementation Notes

### Referential integrity
- `stores.owner_id` -> `users(id)` ensures each store is linked to a Store Owner
- `ratings.user_id` -> `users(id)` and `ratings.store_id` -> `stores(id)` ensure data consistency
- `ON DELETE CASCADE` removes dependent records if a user or store is deleted, which is useful for cleanup

### Indexing and performance
- `UNIQUE` constraints on emails prevent duplicate accounts/stores
- Composite unique key on `ratings(user_id, store_id)` enforces one rating per user-store pair
- Sorting and filtering should be implemented on indexed fields where possible

## Recommended Schema Cleanup
The extra nullable columns `null_1`, `null_2`, and `null_3` appear in each table but are not required by the application requirements. For a cleaner production schema, remove them or rename them to meaningful fields only if they serve a future need.

## Summary
This MySQL schema is aligned with the planned Express.js backend and React.js frontend. It supports:
- Single authentication system for all roles
- Store registration and ownership
- User-submitted ratings constrained to 1–5
- Admin and owner dashboards
- Searchable, sortable listings
- Clean relational design with referential integrity

With this schema, the backend API can expose role-based endpoints and the frontend can render the required workflows cleanly and consistently.