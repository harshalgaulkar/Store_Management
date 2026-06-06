# Store Management System - Backend Implementation Guide

This guide describes how to configure, deploy, run, and maintain the Express.js & MySQL backend server.

---

## 🛠️ Prerequisites

To run this backend project, you must have the following installed on your host system:
- **Node.js** (v16.0.0 or higher)
- **npm** (comes bundled with Node.js)
- **MySQL Server** (configured with port `3306`)

---

## ⚙️ Configuration & Connection Pooling

### 1. Database Configuration (`utils/db.js`)
The backend connects to the MySQL server using the `mysql2` client library. To optimize query performance, it establishes a connection pool.
The connection credentials are hardcoded as follows:

- **Host:** `localhost`
- **User:** `root`
- **Password:** `manager`
- **Database:** `store`

**Database Pool Setup Code:**
```javascript
const mysql2 = require('mysql2')

const pool = mysql2.createPool({
    host: 'localhost',
    user: 'root',
    password: 'manager',
    database: 'store'
})

module.exports = pool
```

### 2. Port and Host Binding (`server.js`)
The application listens on port `4000` bound to localhost.
```javascript
app.listen(4000, 'localhost', () => {
    console.log('Server started at port 4000')
})
```

---

## 🗄️ Database Initialization & Seeding

### 1. Importing the Database Schema
Before running the application, make sure to import the schema definition in `store.sql` to initialize the database:
```powershell
# Create the database 'store' if it does not exist
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS store;"

# Import tables and foreign key constraints
mysql -u root -p store < d:/Store_Management/store.sql
```

### 2. Running the Seeder Script (`seed.js`)
The backend includes a database seeder script to inject mock records for normal users, store owners, stores, and ratings.
To run the seed script:
```powershell
npm run seed
```

> [!IMPORTANT]
> The database schema enforces a constraint checks:
> - **User Names:** must be 20 to 60 characters long.
> - **User Addresses:** must not exceed 400 characters.
>
> The seeder automatically appends padding characters and timestamps (e.g. `Alice Seed User Account [timestamp]`) to satisfy these requirements.

---

## 💡 Troubleshooting & Implementation Rules

### 1. Express Router Route Shadowing (Wildcard Routes)
In Express.js, routers match requests top-to-bottom in the order they are registered. Wildcard parameters (like `/:id`) will capture static route requests if declared before them.

For example, in `routes/store.js`:
```javascript
// ✓ CORRECT: Specific routes are registered BEFORE wildcard routes
router.get('/all-with-user-ratings', (req, res) => { ... })
router.get('/owner/:owner_id', (req, res) => { ... })
router.get('/:id', (req, res) => { ... }) // Wildcard declared last
```
If `/:id` was declared first, a request to `/stores/all-with-user-ratings` would be intercepted as if `id` were the string `"all-with-user-ratings"`. Always group specific endpoints above wildcard endpoints.

### 2. Payload Consistency in Auth Responses
When implementing login endpoints, ensure the returned payload contains the user's primary key as `id` in the JSON data.
```javascript
const user = {
    token,
    id: data[0].id, // Enforce returning 'id'
    name: data[0].name,
    email: data[0].email,
    role: data[0].role
}
res.send(result.createResult(null, user))
```
This enables the frontend's authentication context to map the user's ID properly for role actions like dashboard lookups or store registrations.
