# Store Management System - API Endpoints Documentation

All routes in the backend are mounted directly on the root of the server (`http://localhost:4000`) and grouped by resource routers.

---

## 📋 Standard Response Wrapper

The backend uses a helper (`utils/result.js`) to ensure all responses follow a standard structure.

### Success Response Format
```json
{
  "status": "success",
  "data": {
    // Response payload containing records or execution details
  }
}
```

### Error Response Format
```json
{
  "status": "error",
  "error": "Error message describing the failure"
}
```

---

## 👤 User Endpoints (`/users`)

These routes handle credentials, authentication, and password updates for Normal users.

### 1. Normal User Registration
- **HTTP Method:** `POST`
- **Path:** `/users/register`
- **Description:** Registers a new Normal user. Hashes the password using `bcrypt` (10 rounds).
- **Request Body (JSON):**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "password": "Password123!",
    "address": "123 Main Street, Cityville",
    "phone": "9876543210",
    "role": "Normal" // Optional. Defaults to "Normal".
  }
}
```
- **Success Response:**
  ```json
  {
    "status": "success",
    "data": {
      "fieldCount": 0,
      "affectedRows": 1,
      "insertId": 12,
      "info": "",
      "serverStatus": 2,
      "warningStatus": 0,
      "changedRows": 0
    }
  }
  ```

### 2. Normal User Login
- **HTTP Method:** `POST`
- **Path:** `/users/login`
- **Description:** Authenticates a Normal user using their email and password. Generates and returns a JWT token.
- **Request Body (JSON):**
  ```json
  {
    "email": "jane.doe@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response:**
  ```json
  {
    "status": "success",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "id": 12,
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "address": "123 Main Street, Cityville",
      "phone": "9876543210",
      "role": "Normal"
    }
  }
  ```
- **Error Response (Invalid Password):**
  ```json
  {
    "status": "error",
    "error": "Invalid Password"
  }
  ```

### 3. Get User Store Reviews
- **HTTP Method:** `GET`
- **Path:** `/users/ratings`
- **Description:** Fetches all ratings and reviews given to stores owned by a specific owner ID.
- **Query Parameters:**
  - `uid` (Integer, Required): The owner's user ID.
- **Success Response:**
  ```json
  {
    "status": "success",
    "data": [
      {
        "rating_id": 1,
        "rating_value": 5,
        "store_name": "Premium Foods"
      }
    ]
  }
  ```

### 4. Update Password (Normal User)
- **HTTP Method:** `PUT`
- **Path:** `/users/update-password`
- **Description:** Allows a normal user to change their password by validating their old password.
- **Request Body (JSON):**
  ```json
  {
    "uid": 12,
    "old_password": "Password123!",
    "new_password": "NewSecurePassword456!"
  }
  ```
- **Success Response:**
  ```json
  {
    "status": "success",
    "data": {
      "fieldCount": 0,
      "affectedRows": 1,
      "insertId": 0,
      "info": "Rows matched: 1  Changed: 1  Warnings: 0",
      "serverStatus": 2,
      "warningStatus": 0,
      "changedRows": 1
    }
  }
  ```

---

## 🏬 Store Owner Endpoints (`/store-owners`)

Routes designed specifically for Store Owners to manage accounts and view store reviews.

### 1. Store Owner Registration
- **HTTP Method:** `POST`
- **Path:** `/store-owners/register`
- **Description:** Registers a new user with the `'Store Owner'` role.
- **Request Body (JSON):** Same fields as `/users/register`.

### 2. Store Owner Login
- **HTTP Method:** `POST`
- **Path:** `/store-owners/login`
- **Description:** Authenticates a Store Owner. Checks that the user has the role `'Store Owner'`.
- **Request Body (JSON):** Same fields as `/users/login`.
- **Success Response:** Same structure as `/users/login` returning user details with `"role": "Store Owner"`.

### 3. Get Store Owner Store Ratings
- **HTTP Method:** `GET`
- **Path:** `/store-owners/ratings`
- **Description:** Fetches all submitted store ratings, reviews, and user details for all stores owned by this owner.
- **Query Parameters:**
  - `uid` (Integer, Required): The owner's user ID.
- **Success Response:**
  ```json
  {
    "status": "success",
    "data": [
      {
        "store_id": 3,
        "store_name": "Premium Seed Store A",
        "rating_value": 5,
        "created_at": "2026-06-06T07:12:00.000Z",
        "user_name": "Alice Seed User Account",
        "user_email": "alice.seed@example.com"
      }
    ]
  }
  ```

### 4. Get Store Average Rating (Store Owner View)
- **HTTP Method:** `GET`
- **Path:** `/store-owners/ratings/average`
- **Description:** Retrieves the overall average rating for stores owned by this owner.
- **Query Parameters:**
  - `uid` (Integer, Required): The owner's user ID.
- **Success Response:**
  ```json
  {
    "status": "success",
    "data": [
      {
        "store_id": 3,
        "store_name": "Premium Seed Store A",
        "avg_rating": 4.5
      }
    ]
  }
  ```

### 5. Update Password (Store Owner)
- **HTTP Method:** `PUT`
- **Path:** `/store-owners/update-password`
- **Description:** Updates the store owner's password after validating the old password.
- **Request Body (JSON):** Same fields as `/users/update-password`.

---

## 👑 Admin Endpoints (`/admins`)

Admin-only endpoints used to fetch counts, view consolidated stores/users lists, and perform admin actions.

### 1. Admin Registration
- **HTTP Method:** `POST`
- **Path:** `/admins/register`
- **Description:** Registers an admin user with the `'Admin'` role.
- **Request Body (JSON):** Same fields as `/users/register`.

### 2. Admin Login
- **HTTP Method:** `POST`
- **Path:** `/admins/login`
- **Description:** Authenticates an admin user. Requires the user to have the role `'Admin'`.
- **Request Body (JSON):** Same fields as `/users/login`.

### 3. Count Normal Users
- **HTTP Method:** `GET`
- **Path:** `/admins/users/count`
- **Description:** Returns the total count of registered users with role `'Normal'`.
- **Success Response:**
  ```json
  {
    "status": "success",
    "data": {
      "userCount": 42
    }
  }
  ```

### 4. Count Registered Stores
- **HTTP Method:** `GET`
- **Path:** `/admins/stores/count`
- **Description:** Returns the total count of store profiles in the database.
- **Success Response:**
  ```json
  {
    "status": "success",
    "data": {
      "storeCount": 18
    }
  }
  ```

### 5. Count Total Ratings Submitted
- **HTTP Method:** `GET`
- **Path:** `/admins/ratings/count`
- **Description:** Returns the total count of ratings across all stores.
- **Success Response:**
  ```json
  {
    "status": "success",
    "data": {
      "ratingCount": 156
    }
  }
  ```

### 6. Count Active Reviewers
- **HTTP Method:** `GET`
- **Path:** `/admins/users/ratings/count`
- **Description:** Returns the count of unique normal users who have submitted at least one rating.
- **Success Response:**
  ```json
  {
    "status": "success",
    "data": {
      "userRatingCount": 29
    }
  }
  ```

### 7. Get All Users (Admin View)
- **HTTP Method:** `GET`
- **Path:** `/admins/users/all`
- **Description:** Fetches all users (Normal, Store Owner, Admin) and computes the average rating of their store if they are a Store Owner.
- **Success Response:**
  ```json
  {
    "status": "success",
    "data": [
      {
        "uid": 1,
        "name": "System Administrator",
        "email": "admin@example.com",
        "address": "Admin HQ",
        "phone": "1234567890",
        "role": "Admin",
        "avg_rating": null
      },
      {
        "uid": 2,
        "name": "Store Owner Account",
        "email": "owner@example.com",
        "address": "456 Market St",
        "phone": "5551112222",
        "role": "Store Owner",
        "avg_rating": "4.50"
      }
    ]
  }
  ```

### 8. Get All Stores (Admin View)
- **HTTP Method:** `GET`
- **Path:** `/admins/stores/all`
- **Description:** Fetches all store profiles with their overall average rating.
- **Success Response:**
  ```json
  {
    "status": "success",
    "data": [
      {
        "store_id": 1,
        "store_name": "Premium Foods",
        "store_email": "foods@example.com",
        "store_address": "789 Pine Ave",
        "avg_rating": "4.67"
      }
    ]
  }
  ```

---

## 🏪 Store Endpoints (`/stores`)

Routes handling store registration, retrieval, updating, deleting, and searching.

### 1. Add Store
- **HTTP Method:** `POST`
- **Path:** `/stores/add`
- **Description:** Creates a store profile. Can only be done by a user with role `'Store Owner'` who does not yet have a store.
- **Request Body (JSON):**
  ```json
  {
    "owner_id": 2,
    "store_name": "Premium Seed Store A",
    "store_email": "store.a@example.com",
    "store_address": "200 Market Street, Cityville"
  }
  ```
- **Success Response:**
  ```json
  {
    "status": "success",
    "data": {
      "affectedRows": 1,
      "insertId": 5
    }
  }
  ```

### 2. Get All Stores (Raw)
- **HTTP Method:** `GET`
- **Path:** `/stores/all`
- **Description:** Fetches all store records (without rating aggregates).
- **Success Response:** List of store records containing `id`, `owner_id`, `store_name`, `store_email`, `store_address`, `created_at`, `updated_at`.

### 3. Get All Stores with User Ratings & Search
- **HTTP Method:** `GET`
- **Path:** `/stores/all-with-user-ratings`
- **Description:** Returns all stores with their average rating, total ratings count, and the specific `user_rating` and `user_rating_id` submitted by the requesting user. Supports text filtering.
- **Query Parameters:**
  - `user_id` (Integer, Required): Used to map whether this user has rated the store.
  - `search` (String, Optional): Searches by store name or address.
- **Success Response:**
  ```json
  {
    "status": "success",
    "data": [
      {
        "store_id": 1,
        "store_name": "Premium Seed Store A",
        "store_email": "store.a@example.com",
        "store_address": "200 Market Street",
        "avg_rating": 4.5,
        "rating_count": 8,
        "user_rating": 5, // Rating given by user_id
        "user_rating_id": 14 // ID of the rating in the ratings table
      }
    ]
  }
  ```

### 4. Get Store by Owner ID
- **HTTP Method:** `GET`
- **Path:** `/stores/owner/:owner_id`
- **Description:** Fetches the store profile owned by a specific owner ID.
- **Path Parameters:**
  - `owner_id` (Integer): The ID of the store owner.
- **Success Response:** Returns store details as an object, or `null` if the owner doesn't have a store.

### 5. Get Store by Store ID
- **HTTP Method:** `GET`
- **Path:** `/stores/:id`
- **Description:** Fetches a store profile by its primary key ID.
- **Path Parameters:**
  - `id` (Integer): The ID of the store.
- **Success Response:** Returns store record array in the `data` wrapper.

### 6. Update Store
- **HTTP Method:** `PUT`
- **Path:** `/stores/update/:id`
- **Description:** Updates store name, email, and address.
- **Path Parameters:**
  - `id` (Integer): Store ID.
- **Request Body (JSON):**
  ```json
  {
    "store_name": "Updated Store Name",
    "store_email": "updated@example.com",
    "store_address": "456 Updated St"
  }
  ```

### 7. Delete Store
- **HTTP Method:** `DELETE`
- **Path:** `/stores/delete/:id`
- **Description:** Deletes a store profile (cascades and deletes all ratings for the store).
- **Path Parameters:**
  - `id` (Integer): Store ID.

### 8. Get Ratings Aggregate Per Store
- **HTTP Method:** `GET`
- **Path:** `/stores/ratings/count`
- **Description:** Returns total rating counts and averages per store, ordered alphabetically by `store_name`.
- **Success Response:**
  ```json
  {
    "status": "success",
    "data": [
      {
        "store_id": 1,
        "store_name": "Gourmet Foods",
        "rating_count": 5,
        "avg_rating": 4.2
      }
    ]
  }
  ```

### 9. List All Store Ratings (Raw)
- **HTTP Method:** `GET`
- **Path:** `/stores/ratings/list`
- **Description:** Fetches a simple flat list linking stores to their rating values and creation timestamps.

### 10. Search Stores by Name/Address
- **HTTP Method:** `GET`
- **Path:** `/stores/search`
- **Description:** Filters store lists.
- **Query Parameters:**
  - `query` (String, Required): Text to match against `store_name` or `store_address` (via SQL `LIKE`).

---

## ⭐ Rating Endpoints (`/ratings`)

Routes handling review submission, editing, deleting, and average calculation.

### 1. Submit Rating
- **HTTP Method:** `POST`
- **Path:** `/ratings/add`
- **Description:** Creates a rating for a store. Prevents duplicate submissions by check-querying existing ratings for the `user_id` and `store_id` combo.
- **Request Body (JSON):**
  ```json
  {
    "user_id": 12,
    "store_id": 1,
    "rating_value": 5
  }
  ```
- **Error Response (User already rated store):**
  ```json
  {
    "status": "error",
    "error": "User has already rated this store"
  }
  ```

### 2. Update Rating
- **HTTP Method:** `PUT`
- **Path:** `/ratings/update/:rating_id`
- **Description:** Updates the rating value for an existing rating ID.
- **Path Parameters:**
  - `rating_id` (Integer): ID of the rating record.
- **Request Body (JSON):**
  ```json
  {
    "rating_value": 4
  }
  ```

### 3. Get Ratings by User ID
- **HTTP Method:** `GET`
- **Path:** `/ratings/user/:user_id`
- **Description:** Fetches all ratings submitted by a specific user.
- **Path Parameters:**
  - `user_id` (Integer): User's primary key ID.
- **Success Response:** Includes `rating_id`, `rating_value`, `created_at`, `store_id`, `store_name`, `store_address`.

### 4. Get Ratings by Store ID
- **HTTP Method:** `GET`
- **Path:** `/ratings/store/:store_id`
- **Description:** Retrieves all user reviews and ratings submitted for a specific store.
- **Path Parameters:**
  - `store_id` (Integer): Store ID.

### 5. Get Store Average Rating
- **HTTP Method:** `GET`
- **Path:** `/ratings/store/:store_id/average`
- **Description:** Calculates the overall average score and total ratings count for a store.
- **Path Parameters:**
  - `store_id` (Integer): Store ID.

### 6. List Ratings with Filters
- **HTTP Method:** `GET`
- **Path:** `/ratings/list`
- **Description:** Consolidated ratings list. Allows filtering by store, user, and rating ranges.
- **Query Parameters (All Optional):**
  - `store_id` (Integer)
  - `user_id` (Integer)
  - `min_rating` (Integer, 1-5)
  - `max_rating` (Integer, 1-5)

### 7. Delete Rating
- **HTTP Method:** `DELETE`
- **Path:** `/ratings/delete/:rating_id`
- **Description:** Deletes a rating from the database.
- **Path Parameters:**
  - `rating_id` (Integer): Rating record ID.
