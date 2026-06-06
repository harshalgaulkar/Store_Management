# StoreCenter Frontend Documentation

This is the frontend client for the **StoreCenter Store Management System**, built using **React 19** and **Vite**, and styled with a custom premium **Pitch Black and Vibrant Orange** theme.

---

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Directory Structure](#directory-structure)
3. [Authentication & State Management](#authentication--state-management)
4. [Routing & Protected Routes](#routing--protected-routes)
5. [Role-Based Dashboards & Workflows](#role-based-dashboards--workflows)
6. [Design System & Aesthetics](#design-system--asthetics)
7. [API Integration](#api-integration)
8. [Setup & Running Locally](#setup--running-locally)

---

## Tech Stack

- **Core**: React 19 (Functional Components, Hooks)
- **Build Tool**: Vite 7
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4 (with PostCSS configurations)
- **HTTP Client**: Axios (configured with interceptors)
- **Icons**: Lucide React

---

## Directory Structure

```
Storewebv1/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images, fonts, and global assets
│   ├── context/
│   │   └── AuthContext.jsx # Global Authentication and Toast state
│   ├── pages/              # Primary route pages
│   │   ├── Home.jsx             # Marketing Landing Page
│   │   ├── Login.jsx            # Dynamic Login Form
│   │   ├── Register.jsx         # User Registration Form
│   │   ├── AdminDashboard.jsx   # Administrator Console
│   │   ├── OwnerDashboard.jsx   # Store Owner Console
│   │   └── UserDashboard.jsx    # Customer Console
│   ├── App.css             # Component-level styles
│   ├── App.jsx             # Root layout and routes config
│   ├── api.js              # Axios custom client and interceptors
│   ├── index.css           # Tailwind CSS directives
│   └── main.jsx            # React mounting entrypoint
├── index.html              # HTML shell template
├── package.json            # NPM dependencies and scripts
├── postcss.config.js       # PostCSS plugins configuration
├── tailwind.config.js      # Custom Tailwind styling tokens
└── vite.config.js          # Vite configuration
```

---

## Authentication & State Management

Authentication state is managed globally using React Context in [AuthContext.jsx](file:///d:/Store_Management/Frontend/Storewebv1/src/context/AuthContext.jsx).

### AuthProvider
Provides the following variables and methods globally:
- `user`: The currently logged-in user object (`{ id, name, email, role, address, phone }`).
- `isAuthenticated`: A boolean check of the user session state.
- `loading`: A boolean indicating if session restoration from storage is in progress.
- `login(userData, token)`: Saves the JWT token and user payload in `sessionStorage` and updates state.
- `logout()`: Clears `sessionStorage` and resets user state to `null`.
- `updateUser(updatedData)`: Merges updated user profile details (e.g., after password modifications) into the active session.
- `showToast(message, type)`: Triggers the global toast notification system in the bottom-right corner.

*Note: All functions inside the `AuthProvider` are wrapped in `useCallback` to ensure reference stability across renders, preventing infinite re-render loops.*

---

## Routing & Protected Routes

Routes are defined in [App.jsx](file:///d:/Store_Management/Frontend/Storewebv1/src/App.jsx) and are wrapper-guarded for security:

### Route Wrappers
1. **ProtectedRoute (`<ProtectedRoute allowedRoles={[...]}>`)**:
   - Ensures only authenticated users can access the child page.
   - Redirects to `/login` if not signed in.
   - Verifies the user's role against the `allowedRoles` array. If unauthorized, it redirects them to their own authorized dashboard.
2. **PublicOnlyRoute (`<PublicOnlyRoute>`)**:
   - Restricts authenticated users from navigating back to public entry screens (like `/login` or `/register`).
   - If an active session is detected, it redirects the user to their appropriate role-based dashboard.

### Route Map
- `/` - **Public Marketing Page** ([Home.jsx](file:///d:/Store_Management/Frontend/Storewebv1/src/pages/Home.jsx))
- `/login` - **Sign In Screen** ([Login.jsx](file:///d:/Store_Management/Frontend/Storewebv1/src/pages/Login.jsx))
- `/register` - **Create Account Screen** ([Register.jsx](file:///d:/Store_Management/Frontend/Storewebv1/src/pages/Register.jsx))
- `/admin` - **System Admin Console** ([AdminDashboard.jsx](file:///d:/Store_Management/Frontend/Storewebv1/src/pages/AdminDashboard.jsx))
- `/owner` - **Store Owner Console** ([OwnerDashboard.jsx](file:///d:/Store_Management/Frontend/Storewebv1/src/pages/OwnerDashboard.jsx))
- `/user` - **Customer Ratings Console** ([UserDashboard.jsx](file:///d:/Store_Management/Frontend/Storewebv1/src/pages/UserDashboard.jsx))

---

## Role-Based Dashboards & Workflows

### 1. Normal User (Customer) Dashboard
Allows users to discover, browse, search, and submit rating scores (1 to 5 stars) for registered stores.
- **Search & Sort**: Filter stores in real-time by name or address, and sort them dynamically by Store Name or Average Rating.
- **Yelp-style Store Details Modal**:
  - Displays a visual **Rating Breakdown** graph showing the percentage distribution of star scores (5, 4, 3, 2, 1 stars).
  - Displays a scrollable timeline of recent reviews with reviewer details (initials, email, date, rating value).
  - Integrates the star rating widget allowing customers to submit a new rating or modify their existing rating.
- **Change Password**: Change account password via a validated form matching strict validation rules (8-16 chars, 1 uppercase, 1 special character).

### 2. Store Owner Dashboard
Designed for store owners to track their store's performance.
- **Conditional Profile Setup**:
  - If the logged-in owner has no store profile created, the dashboard renders a **Setup Your Store Profile** form asking for Store Name, Store Email, and Store Address.
  - Submitting this form automatically maps the new store profile to the owner's ID and unlocks the dashboard.
- **Metrics Card**: Displays overall store average rating and total ratings count.
- **Customer Reviews Table**: Displays a sortable list of all customers who rated the store (Name, Email, Rating Value, Date Submitted).
- **Change Password**: Change login credentials securely from the dashboard header.

### 3. System Administrator Dashboard
Designed for platform oversight. It includes a sidebar navigation layout with multiple views:
- **Overview Tab**: Displays total counters for Normal Users, Stores, and Ratings.
- **Users Directory Tab**: Search, filter by role (Normal, Owner, Admin), and sort a table of all registered accounts. Clicking "View Details" opens a modal displaying their contact information.
- **Stores Directory Tab**: Search and sort a table of all registered stores on the platform, showing their name, email, address, and overall rating.
- **Add User Tab**: Register a new user with strict form validations:
  - **Full Name**: 20 to 60 characters.
  - **Email**: Standard email format validation.
  - **Address**: Under 400 characters.
  - **Password**: 8-16 characters, 1 uppercase, 1 special character.
  - **Role Selection**: Admin, Store Owner, or Normal User.
- **Add Store Tab**: Add a new store profile and assign it to an existing Store Owner from a dynamic dropdown of owners who don't have stores.

---

## Design System & Aesthetics

The UI utilizes a **premium dark mode interface** to deliver an exceptional first impression.

### Color Tokens
- **Primary Background**: Pure pitch black (`bg-black`).
- **Surface Panels**: Dark charcoal cards and panels (`bg-zinc-900/60`, `bg-zinc-900/40`, `bg-zinc-900`) with subtle gray borders (`border-zinc-800`, `border-zinc-850`).
- **Brand Accents**: Vibrant orange and amber highlights (`bg-orange-600`, `hover:bg-orange-500`, `text-orange-400`, `text-amber-400`).
- **Glow Effects**: Floating background mesh circles using blur filters (`bg-orange-600/10 rounded-full blur-3xl animate-pulse`).

### Micro-Animations
- Smooth transitions for hover scales, border highlights, and button actions.
- Spin loaders for fetching states.
- Floating dismissible toast warnings and success states.

---

## API Integration

Axios is configured in [api.js](file:///d:/Store_Management/Frontend/Storewebv1/src/api.js) with a base URL matching the local backend port (`http://localhost:4000`). It automatically attaches the active session token to the request headers matching backend requirements:

```javascript
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.token = token;
  }
  return config;
});
```

### Endpoints Called by Frontend

#### Auth & Registration
- `POST /users/login` | `POST /store-owners/login` | `POST /admins/login` - Authenticate users.
- `POST /users/register` | `POST /store-owners/register` | `POST /admins/register` - Create user accounts.

#### Stores
- `GET /stores/all-with-user-ratings?user_id=X&search=Y` - Fetch store catalog with user rating state.
- `GET /stores/owner/:owner_id` - Check if store owner has a store.
- `POST /stores/add` - Register a store profile.
- `GET /stores/:id` - Fetch individual store profile details.

#### Ratings & Reviews
- `GET /ratings/store/:store_id` - Fetch all reviews and ratings for a store.
- `POST /ratings/add` - Submit a new review rating.
- `PUT /ratings/update/:rating_id` - Modify an existing rating.

#### Admin Logs & Tables
- `GET /admins/users/count` | `GET /admins/stores/count` | `GET /admins/ratings/count` - Get counts metrics.
- `GET /admins/users/all` - Fetch all users list.
- `GET /admins/stores/all` - Fetch all stores list.

#### Password Security
- `PUT /users/update-password` - Update normal user password.
- `PUT /store-owners/update-password` - Update owner password.

---

## Setup & Running Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- The Node.js Backend Server running on port 4000.

### Installation
Open a terminal in the frontend directory (`d:\Store_Management\Frontend\Storewebv1`) and run:
```bash
npm install
```

### Start Development Server
Launch the local dev environment (Vite runs on port 5173, or 5174 if occupied):
```bash
npm run dev
```

### Production Build
Compile and bundle the production files in the `/dist` directory:
```bash
npm run build
```

### Code Quality / Linting
Verify code formatting and syntax rules:
```bash
npm run lint
```
