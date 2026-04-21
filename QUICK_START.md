# Quick Start Guide - New Authentication System

## 🚀 5-Minute Setup

### 1. Verify Structure

All new files are in place:

```
✅ constants/authConstants.js
✅ config/authConfig.js
✅ utils/appError.js
✅ utils/asyncHandler.js
✅ utils/responseHandler.js
✅ services/authService.js
✅ services/userService.js
✅ validators/authValidator.js
✅ validators/userValidator.js
✅ middleware/roleMiddleware.js
✅ middleware/errorHandler.js
✅ controllers/authController.js
✅ controllers/adminController.js
✅ routes/authRoutes.js
✅ routes/adminRoutes.js
```

### 2. Verify Dependencies

Already in your `package.json`:

```json
{
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "jsonwebtoken": "^9.0.3",
    "cookie-parser": "^1.4.7",
    "express": "^5.2.1",
    "dotenv": "^17.4.2"
  }
}
```

No additional packages needed!

### 3. Start Server

```bash
npm run dev
# or
npm start
```

Should see:

```
📋 Auth Configuration: { environment: 'development', jwtExpiry: '7d', ... }
✅ Connected to MySQL
🚀 Server running on http://localhost:5000/login
```

---

## 📱 API EXAMPLES

### Register New User

**Request:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-04-21T10:30:00Z"
    }
  }
}
```

**Notes:**

- ✅ Token returned in response (can be stored for API calls)
- ✅ Cookie set automatically (httpOnly=true in dev, will be secure in prod)
- ✅ Password NOT returned (safe response)
- ✅ Role automatically set to "user"

---

### Login User

**Request:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

**Error - Invalid Credentials:**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### Get User Profile (Protected)

**Request:**

```bash
# Using cookie (browser automatically includes it)
curl -X GET http://localhost:5000/api/users/profile \
  -b cookies.txt

# OR using Bearer token
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response:**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

**Error - No Token:**

```json
{
  "success": false,
  "message": "No token provided"
}
```

**Error - Invalid Token:**

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

### Logout User

**Request:**

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt
```

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Result:**

- Cookie cleared on client
- User can't use token afterward

---

## 👨‍💼 ADMIN OPERATIONS

### Create Admin User (Setup)

First, manually create an admin in database or use a script:

```bash
# Option 1: Use MySQL directly
UPDATE users SET admin = 1 WHERE id = 1;

# Option 2: Use the API with admin token (see below)
```

### Create New User (Admin Only)

**Request:**

```bash
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "pass123",
    "isAdmin": false
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "user",
      "createdAt": "2024-04-21T10:35:00Z"
    }
  }
}
```

**Error - Not Admin:**

```json
{
  "success": false,
  "message": "Only admins can create users"
}
```

---

### Get All Users (Admin Only)

**Request:**

```bash
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer <admin-token>"
```

**Response:**

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin",
        "createdAt": "2024-04-21T10:30:00Z"
      },
      {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "role": "user",
        "createdAt": "2024-04-21T10:35:00Z"
      }
    ]
  }
}
```

---

### Get Single User (Admin Only)

**Request:**

```bash
curl -X GET http://localhost:5000/api/admin/users/2 \
  -H "Authorization: Bearer <admin-token>"
```

**Response:**

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "user"
    }
  }
}
```

---

### Update User (Admin Only)

**Request:**

```bash
curl -X PUT http://localhost:5000/api/admin/users/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@example.com"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": 2,
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "role": "user"
    }
  }
}
```

---

### Promote User to Admin (Admin Only)

**Request:**

```bash
curl -X PUT http://localhost:5000/api/admin/users/2/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "isAdmin": true
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "user": {
      "id": 2,
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "role": "admin"
    }
  }
}
```

---

### Delete User (Admin Only)

**Request:**

```bash
curl -X DELETE http://localhost:5000/api/admin/users/2 \
  -H "Authorization: Bearer <admin-token>"
```

**Response:**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error - Can't Delete Self:**

```json
{
  "success": false,
  "message": "Cannot delete yourself"
}
```

---

## 🌐 WEB VIEWS

### Register Page

```
GET /register
→ Renders auth/register.ejs
```

### Login Page

```
GET /login
→ Renders auth/login.ejs
```

### User Profile

```
GET /profile
→ Requires authentication
→ Renders user/profile.ejs
```

### User Dashboard

```
GET /user/dashboard
→ Requires authentication
→ Renders user/dashboard.ejs
```

### Admin Dashboard

```
GET /admin/dashboard
→ Requires authentication + admin role
→ Renders admin/dashboard.ejs
```

### Create User (Admin)

```
GET /admin/create-user
→ Requires authentication + admin role
→ Renders admin/create-user.ejs

POST /admin/create-user
→ Form submission
→ Redirects to /admin/dashboard on success
```

### Edit User (Admin)

```
GET /admin/edit-user/2
→ Requires authentication + admin role
→ Renders admin/edit-user.ejs with user data

POST /admin/edit-user/2
→ Form submission
→ Redirects to /admin/dashboard on success
```

### Delete User (Admin)

```
POST /admin/delete-user/2
→ Requires authentication + admin role
→ Redirects to /admin/dashboard
```

---

## 🧪 COMMON WORKFLOWS

### User Registration → Login → Access Profile

```
1. POST /api/auth/register
   → User created, token returned

2. Cookie automatically set by browser
   (or store token for API calls)

3. GET /api/users/profile
   → Browser sends cookie
   → Returns user profile

4. GET /profile
   → Browser sends cookie
   → Renders profile page
```

### Admin Creates User → Admin Updates → Admin Deletes

```
1. POST /api/admin/users
   → Admin token required
   → New user created

2. PUT /api/admin/users/1
   → Admin token required
   → User updated

3. DELETE /api/admin/users/1
   → Admin token required
   → User deleted
```

### Admin Promotes User to Admin

```
1. User registers as regular user (role: "user")

2. PUT /api/admin/users/2/role
   → Admin sends: { "isAdmin": true }
   → User's role changed to "admin"

3. User can now:
   - Access /admin/dashboard
   - Create/update/delete other users
   - Manage roles
```

---

## 🔒 TOKEN & COOKIE FLOW

### Development Environment

```
POST /api/auth/login
  ↓
Generate JWT token (payload: { id, role })
  ↓
Set cookie: authToken=<token>
  Options: {
    httpOnly: true,      ✅ JavaScript can't access
    secure: false,       ✅ Works over HTTP (dev)
    sameSite: 'lax',     ✅ CSRF protection
    maxAge: 7 days
  }
  ↓
Return token in response + set cookie in browser

Subsequent Requests:
  ↓
Browser automatically includes: Cookie: authToken=<token>
  ↓
protect middleware extracts token from cookie
  ↓
authService.verifyToken(token)
  ↓
req.user = { id, role }
  ↓
Controller can access req.user
```

### Production Environment

```
Same as above, but:
  ↓
Set cookie: authToken=<token>
  Options: {
    httpOnly: true,      ✅ JavaScript can't access
    secure: true,        ✅ HTTPS only (prevents MITM)
    sameSite: 'strict',  ✅ Strict CSRF protection
    maxAge: 7 days
  }

⚠️ Cookie won't set without HTTPS in production
```

---

## ✅ VALIDATION EXAMPLES

### Valid Registration

```json
{
  "name": "John Doe", // 2-100 chars
  "email": "john@example.com", // Valid format
  "password": "secure123" // 6+ chars
}
```

### Invalid Registration - Too Short Password

```json
{
  "name": "John",
  "email": "john@example.com",
  "password": "123" // ❌ Less than 6 chars
}
```

**Response:**

```json
{
  "success": false,
  "message": "Password must be at least 6 characters"
}
```

### Invalid Registration - Bad Email

```json
{
  "name": "John",
  "email": "invalid-email", // ❌ No @ symbol
  "password": "secure123"
}
```

**Response:**

```json
{
  "success": false,
  "message": "Invalid email format"
}
```

### Invalid Registration - Email Already Exists

```json
{
  "name": "Another John",
  "email": "john@example.com", // ❌ Already registered
  "password": "secure123"
}
```

**Response:**

```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

---

## 🐛 DEBUGGING

### Enable Detailed Logging

Add to .env:

```bash
DEBUG=*
NODE_ENV=development
```

### Check Token Content

```bash
# Decode JWT (online or programmatically)
# Go to https://jwt.io
# Paste your token to see payload:

{
  "id": 1,
  "role": "admin",
  "iat": 1724012345,
  "exp": 1724617145
}
```

### Common Errors

**"No token provided"**

- Cookie not sent with request
- Browser cookies may be blocked
- Check: `curl -b cookies.txt` (to send cookies)

**"Invalid or expired token"**

- Token expired (7 days for default)
- JWT_SECRET changed
- Token tampered with

**"Only admins can..."**

- User is not admin
- Check user role in database: `SELECT * FROM users WHERE id = 1`
- Promote to admin: `UPDATE users SET admin = 1 WHERE id = 1`

---

## 📋 ENDPOINT SUMMARY

| Method | Endpoint                  | Auth | Role  | Purpose           |
| ------ | ------------------------- | ---- | ----- | ----------------- |
| POST   | /api/auth/register        | ❌   | -     | Register new user |
| POST   | /api/auth/login           | ❌   | -     | Login user        |
| POST   | /api/auth/logout          | ✅   | -     | Logout user       |
| GET    | /api/users/profile        | ✅   | -     | Get my profile    |
| POST   | /api/admin/users          | ✅   | admin | Create user       |
| GET    | /api/admin/users          | ✅   | admin | List all users    |
| GET    | /api/admin/users/:id      | ✅   | admin | Get user by ID    |
| PUT    | /api/admin/users/:id      | ✅   | admin | Update user       |
| DELETE | /api/admin/users/:id      | ✅   | admin | Delete user       |
| PUT    | /api/admin/users/:id/role | ✅   | admin | Change user role  |

---

## 🎓 TESTING WITH POSTMAN

1. **Create Collection** - "Auth API"

2. **Create Requests:**
   - Register
   - Login
   - Get Profile
   - Create User
   - List Users
   - Update User
   - Delete User

3. **Set Variables:**

   ```
   {{base_url}} = http://localhost:5000
   {{token}} = (copy from login response)
   {{user_id}} = 2
   {{admin_token}} = (admin's token from login)
   ```

4. **Pre-request Script** (for auth):

   ```javascript
   // For admin requests
   pm.request.headers.add({
     key: "Authorization",
     value: "Bearer " + pm.variables.get("admin_token"),
   });
   ```

5. **Tests** (verify response):

   ```javascript
   pm.test("Status is 200", function () {
     pm.response.to.have.status(200);
   });

   pm.test("Success is true", function () {
     var data = pm.response.json();
     pm.expect(data.success).to.be.true;
   });
   ```
