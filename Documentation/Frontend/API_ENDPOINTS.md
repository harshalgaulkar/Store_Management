# Store Management System - API Endpoints Documentation

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Admin Endpoints](#admin-endpoints)
3. [User Endpoints](#user-endpoints)
4. [Store Owner Endpoints](#store-owner-endpoints)
5. [Common Response Formats](#common-response-formats)
6. [Error Handling](#error-handling)
7. [Status Codes](#status-codes)

---

## Authentication Endpoints (actual routes)

Note: the backend exposes separate registration/login routes for Normal Users, Store Owners, and Admins. All routes are mounted under `/api` as follows:

- Normal users: `/api/users`
- Store owners: `/api/store-owners`
- Admins: `/api/admins`

### 1. Normal User - Register
**POST** `/api/users/register`

Description: Register a new Normal user.

Request Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "address": "123 Main St",
  "phone": "0123456789"
}
```

Response (standard):
```json
{ "success": true, "data": { /* insert result */ } }
```

### 2. Normal User - Login
**POST** `/api/users/login`

Description: Authenticate normal users. (Implementation currently queries `users` table.)

Request Body:
```json
{ "email": "john@example.com", "password": "SecurePass@123" }
```

Response (on success):
```json
{
  "success": true,
  "data": {
    "token": "jwt",
    "name": "John Doe",
    "email": "john@example.com",
    "address": "...",
    "phone": "...",
    "role": "Normal"
  }
}
```

### 3. Store Owner - Register
**POST** `/api/store-owners/register`

Request Body: same fields as Normal user, with role assigned to `Store Owner`.

### 4. Store Owner - Login
**POST** `/api/store-owners/login`

Response format: same as user login; role will be `Store Owner` on success.

### 5. Admin - Register
**POST** `/api/admins/register`

### 6. Admin - Login
**POST** `/api/admins/login`

Notes:
- The project currently uses JWT via `jsonwebtoken` and returns a `token` inside the response body.
- Passwords are hashed with `bcrypt` before insertion.

---

## Admin Endpoints (actual routes)

All admin routes are mounted under `/api/admins`.

### 1. Count Normal Users
**GET** `/api/admins/users/count`

Response:
```json
{ "success": true, "data": { "userCount": 123 } }
```

### 2. Count Stores
**GET** `/api/admins/stores/count`

Response:
```json
{ "success": true, "data": { "storeCount": 25 } }
```

### 3. Count Ratings
**GET** `/api/admins/ratings/count`

Response:
```json
{ "success": true, "data": { "ratingCount": 450 } }
```

### 4. Count Unique Users Who Rated
**GET** `/api/admins/users/ratings/count`

Response:
```json
{ "success": true, "data": { "userRatingCount": 120 } }
```

### 5. Get All Users (non-normal/admin filter in current code)
**GET** `/api/admins/users/all`

Response: list of users (fields: `uid`, `name`, `email`, `address`, `phone`).

### 6. Get All Stores (admin view)
**GET** `/api/admins/stores/all`

Response: list of stores (fields: `store_id`, `store_name`, `store_email`, `store_address`).

Notes:
- These endpoints directly query the database and return results via the common `result.createResult` wrapper.
- Access control is assumed to be applied at a higher layer (not present in route files).

---

### 7. Get Store Details (Admin)
**GET** `/api/admin/stores/{storeId}`

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "storeId": "uuid",
    "name": "Store Name",
    "email": "store@example.com",
    "address": "123 Store St, City",
    "rating": 4.5,
    "totalRatings": 45,
    "createdAt": "2024-06-05T10:30:00Z"
  }
}
```

**Access Control:** Admin only

---

### 8. Get All Users (Admin View)
**GET** `/api/admin/users`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page`: Integer (default: 1)
- `limit`: Integer (default: 10)
- `sortBy`: "name" | "email" | "address" | "role" (default: "name")
- `sortOrder`: "asc" | "desc" (default: "asc")
- `role`: "ADMIN" | "NORMAL_USER" | "STORE_OWNER" (optional filter)
- `search`: String (filter by name, email, address)
- `filterName`: String (exact filter)
- `filterEmail`: String (exact filter)
- `filterRole`: String (exact filter)

**Example:** `/api/admin/users?page=1&limit=10&sortBy=name&sortOrder=asc&role=NORMAL_USER`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "userId": "uuid",
        "name": "User Name",
        "email": "user@example.com",
        "address": "User Address",
        "role": "NORMAL_USER",
        "createdAt": "2024-06-05T10:30:00Z"
      },
      {
        "userId": "uuid",
        "name": "Store Owner Name",
        "email": "owner@example.com",
        "address": "Owner Address",
        "role": "STORE_OWNER",
        "storeName": "Store Name",
        "rating": 4.2,
        "createdAt": "2024-06-05T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalRecords": 150,
      "totalPages": 15
    }
  }
}
```

**Access Control:** Admin only

---

### 9. Get User Details (Admin)
**GET** `/api/admin/users/{userId}`

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "name": "User Name",
    "email": "user@example.com",
    "address": "User Address",
    "role": "NORMAL_USER",
    "createdAt": "2024-06-05T10:30:00Z"
  }
}
```

**Or for Store Owner:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "name": "Store Owner Name",
    "email": "owner@example.com",
    "address": "Owner Address",
    "role": "STORE_OWNER",
    "storeId": "uuid",
    "storeName": "Store Name",
    "rating": 4.5,
    "createdAt": "2024-06-05T10:30:00Z"
  }
}
```

**Access Control:** Admin only

---

### 10. Delete User
**DELETE** `/api/admin/users/{userId}`

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Access Control:** Admin only

---

### 11. Delete Store
**DELETE** `/api/admin/stores/{storeId}`

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "Store deleted successfully"
}
```

**Access Control:** Admin only

---

## User Endpoints (actual routes)

All user routes are mounted under `/api/users`.

### 1. Register
**POST** `/api/users/register` — creates a Normal user (see Authentication section)

### 2. Login
**POST** `/api/users/login` — authenticates a Normal user (see Authentication section)

### 3. Get Ratings (for stores owned by a user)
**GET** `/api/users/ratings?uid={user_uid}`

Response sample:
```json
[{ "rating_id": 1, "rating_value": 5, "review": "Great", "store_name": "Coffee Shop" }]
```

---

## Store Endpoints (actual routes)

All store routes are mounted under `/api/stores`.

### 1. Add a new store
**POST** `/api/stores/add`

Request body (fields used in code): `owner_id`, `store_name`, `store_email`, `store_address`.

### 2. Get all stores
**GET** `/api/stores/all`

### 3. Get store by ID
**GET** `/api/stores/:id`

### 4. Update store
**PUT** `/api/stores/update/:id`

### 5. Delete store
**DELETE** `/api/stores/delete/:id`

### 6. Get rating counts and averages per store
**GET** `/api/stores/ratings/count`

Response sample:
```json
[{ "store_id": 1, "store_name": "Coffee Shop", "rating_count": 45, "avg_rating": 4.50 }]
```

### 7. List store ratings
**GET** `/api/stores/ratings/list`

Returns rows of `store_id`, `store_name`, `rating_value`, `review_text`, `created_at`.

### 8. Search stores by name or address
**GET** `/api/stores/search?query={searchTerm}`

Response: list of matching stores.

---

## Store Owner Endpoints

All store-owner routes are mounted under `/api/store-owners`.

### 1. Register
**POST** `/api/store-owners/register`

### 2. Login
**POST** `/api/store-owners/login`

### 3. Get Ratings for Owner's Stores
**GET** `/api/store-owners/ratings?uid={owner_uid}`

Returns `store_id`, `store_name`, `rating_value`, `review_text`, `created_at` for stores owned by the given owner.

### 4. Get Average Rating for Owner's Stores
**GET** `/api/store-owners/ratings/average?uid={owner_uid}`

Response sample:
```json
[{ "store_id": 1, "store_name": "Coffee Shop", "avg_rating": 4.5 }]
```

### 5. Update Store Owner Password
**PUT** `/api/store-owners/update-password`

Request Body:
```json
{ "uid": 1, "old_password": "OldPass", "new_password": "NewPass@123" }
```

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ]
}
```

---

## Error Handling

### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name must be between 20 and 60 characters"
    },
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter and one special character"
    }
  ]
}
```

### Authentication Errors (401)
```json
{
  "success": false,
  "message": "Unauthorized: Invalid or expired token"
}
```

### Authorization Errors (403)
```json
{
  "success": false,
  "message": "Forbidden: You do not have permission to access this resource"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Conflict Errors (409)
```json
{
  "success": false,
  "message": "Email already exists in the system"
}
```

### Server Errors (500)
```json
{
  "success": false,
  "message": "Internal server error. Please try again later."
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input/validation failed |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Authenticated but no permission |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists (duplicate) |
| 500 | Internal Server Error - Server-side error |

---

## Authentication Flow

### JWT Token
- All protected endpoints require `Authorization: Bearer {token}` header
- Token should be included in every request to protected routes
- Token expires after 24 hours (configurable)
- Use `/api/auth/refresh` to get a new token

### Role-Based Access Control (RBAC)
- **ADMIN**: Full access to admin endpoints
- **NORMAL_USER**: Access to user endpoints and store browsing
- **STORE_OWNER**: Access to store owner endpoints and user endpoints

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (1-indexed, default: 1)
- `limit`: Records per page (default: 10, max: 100)

**Response:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalRecords": 150,
    "totalPages": 15
  }
}
```

---

## Sorting

List endpoints support sorting:

**Query Parameters:**
- `sortBy`: Field to sort by (varies by endpoint)
- `sortOrder`: "asc" (ascending) or "desc" (descending), default: "asc"

**Example:** `/api/admin/users?sortBy=name&sortOrder=desc`

---

## Search and Filtering

List endpoints support search and filtering:

**Search:**
- `search`: General search across multiple fields
- `searchName`, `searchEmail`, etc.: Field-specific search

**Filter:**
- `filterName`, `filterEmail`, `filterRole`: Exact filters
- Filters work with sorting and pagination

**Example:** `/api/admin/stores?search=coffee&sortBy=name&page=2&limit=20`

---

## Implementation Notes

1. **Database Indexing**: Index frequently queried fields (email, name, storeId, userId)
2. **Rate Limiting**: Implement rate limiting to prevent abuse (e.g., 100 requests/hour per IP)
3. **CORS**: Configure CORS appropriately for frontend domain
4. **Input Sanitization**: Sanitize all user inputs to prevent SQL injection
5. **Password Hashing**: Use bcrypt or similar for password hashing
6. **Logging**: Log all sensitive operations for audit trail
7. **API Versioning**: Consider versioning API for future changes (e.g., /api/v1/)
8. **Caching**: Cache frequently accessed data (stores, ratings aggregates)
9. **Transaction Safety**: Use database transactions for operations affecting multiple tables
10. **Soft Deletes**: Consider soft deletes for critical data like users and stores

