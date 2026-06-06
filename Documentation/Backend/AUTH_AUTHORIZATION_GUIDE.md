# Store Management System - Authentication & Authorization Guide

This guide details how user authentication, passwords, tokens, and role-based flows are managed in the backend system.

---

## 🔒 Password Security & Hashing

To protect user credentials, passwords are hashed before storage and checked during login using the `bcrypt` library.

### 1. Password Requirements & Constraints
The application enforces strict policies at the registration layer:
- **Length:** Password must be between **8 and 16 characters** long.
- **Complexity:** Must contain at least **one uppercase letter** and **one special character** (e.g., `!`, `@`, `#`, `$`, `%`, `^`, `&`, `*`).
- **Additional Data Constraints:**
  - **User Name:** Length must be between **20 and 60 characters** (enforced by frontend validation).
  - **User Address:** Length must not exceed **400 characters**.
  - **User Email:** Must be unique in the `users` table.

### 2. Password Hashing (Registration)
When a user registers via `/users/register`, `/store-owners/register`, or `/admins/register`, the backend hashes their plain-text password.
- **Cost Factor:** 10 rounds (`SALT_ROUND: 10` is loaded from `utils/config.js`).

**Code Pattern:**
```javascript
const bcrypt = require('bcrypt')
const config = require('../utils/config')

bcrypt.hash(password, config.SALT_ROUND, (err, hashedPassword) => {
    if (hashedPassword) {
        // Save hashedPassword in the database
    }
})
```

### 3. Password Verification (Login)
During login requests, `bcrypt.compare` is invoked to verify the input password against the hashed string stored in the database.

**Code Pattern:**
```javascript
bcrypt.compare(password, data[0].password, (err, passwordStatus) => {
    if (passwordStatus) {
        // Login Successful - Proceed to token generation
    } else {
        // Login Failed - Return 'Invalid Password' error
    }
})
```

---

## 🔑 JSON Web Tokens (JWT)

Once a user successfully authenticates, the server generates a JSON Web Token to represent the session.

### 1. Token Signature Configuration
- **Library:** `jsonwebtoken`
- **Signing Secret:** Loaded from `utils/config.js` (`SECRET: 'dbwqondewu9bbfsdcdbcknsubdfisbczjvcwuecuivjsdcbjhdhcdw'`).
- **Token Payload:** Contains the authenticated user's ID as `uid`.
  ```json
  {
    "uid": 12,
    "iat": 1717651200
  }
  ```

### 2. Token Generation Code
```javascript
const jwt = require('jsonwebtoken')
const config = require('../utils/config')

const payload = { uid: data[0].id }
const token = jwt.sign(payload, config.SECRET)
```

---

## 🛡️ Authentication Middleware (`utils/authuser.js`)

The codebase includes an authorization middleware helper located in `Backend/utils/authuser.js`.

### 1. Middleware Structure
```javascript
const jwt = require('jsonwebtoken')
const result = require('./result')
const config = require('./config')

function authorizeUser(req, res, next) {
    const url = req.url
    if (url == '/user/signin' || url == '/user/signup')
        next()
    else if (url == '/store' && req.method == 'GET')
        next()
    else {
        const token = req.headers.token
        if (token) {
            try {
                const payload = jwt.verify(token, config.SECRET)
                req.headers.uid = payload.uid
                next()
            } catch (ex) {
                res.send(result.createResult('Invalid Token'))
            }
        } else
            res.send(result.createResult('Token is Missing'))
    }
}

module.exports = authorizeUser
```

### 2. Current Status & Integration Note

> [!WARNING]
> The `authorizeUser` middleware checks routes against paths like `/user/signin` or `/store`. However, the current Express application mounts routes under `/users`, `/store-owners`, etc.
>
> As a result:
> - **The middleware is NOT globally registered in `server.js`** (i.e. there is no `app.use(authorizeUser)`).
> - Access control and role restrictions are managed client-side by the React frontend (`AuthContext.jsx`).
> - The backend routers identify users by receiving query parameters (e.g. `?uid=12`), body fields (e.g. `user_id`, `owner_id`), or path parameters (e.g. `/owner/:owner_id`).

---

## 👥 Roles & Authorization Rules

The backend defines three roles inside the `users` table's MySQL ENUM:

1. **`Admin`:**
   - Permissions: Reads dashboard metrics (total counts of users, stores, ratings) and views complete tables of users and stores.
   - Endpoint mount: `/admins/*`
2. **`Store Owner`:**
   - Permissions: Registers store owners, logs in, sets up a store profile (only 1 store profile per owner), updates their store profile, and views averages and user ratings specifically for their store.
   - Endpoint mount: `/store-owners/*`, `/stores/add`, `/stores/update/*`
3. **`Normal` (Normal User):**
   - Permissions: Registers users, logs in, changes passwords, retrieves stores with ratings, and submits/updates ratings (maximum 1 rating per store).
   - Endpoint mount: `/users/*`, `/ratings/*`
