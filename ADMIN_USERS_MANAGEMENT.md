# Admin User Management Guide

## Overview

This guide covers the new admin functionality that allows administrators to:

- Create new users
- Edit existing users
- Delete users
- Manage user admin status

## Features Added

### 1. Admin Dashboard (View)

**Route:** `GET /admin/dashboard`

- Displays list of all users with their details
- Shows user ID, name, email, admin status, and creation date
- Provides quick action buttons to edit or delete users
- Only accessible to admin users

### 2. Create User (View & API)

**View Route:** `GET /admin/create-user`
**Form Route:** `POST /admin/create-user`
**API Route:** `POST /users/admin/create`

**Features:**

- Create new users with name, email, password
- Option to make the new user an admin during creation
- Form validation on both client and server
- Password must be at least 6 characters

**Create User Form Example:**

```
Name: John Doe
Email: john@example.com
Password: secure123
Make Admin: [checkbox]
```

### 3. Edit User (View & API)

**View Route:** `GET /admin/edit-user/:userId`
**Form Route:** `POST /admin/edit-user/:userId`
**API Route:** `PUT /users/admin/update/:userId`

**Features:**

- Update user name and email
- Change user password (optional)
- Displays current user information
- Cannot update admin status from edit page (use dashboard)
- Email validation to prevent duplicates

### 4. Delete User (API)

**Form Route:** `POST /admin/delete-user/:userId`
**API Route:** `DELETE /users/admin/delete/:userId`

**Features:**

- Delete users from the system
- Confirmation prompt to prevent accidental deletion
- Cannot delete yourself (admin) protection
- Soft delete not implemented (permanent deletion)

### 5. Make Admin (API)

**Route:** `POST /users/make-admin`

- Promote existing users to admin status
- Only accessible to current admins

---

## API Endpoints

### Create User

```
POST /users/admin/create
Authorization: Bearer <admin-token>

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "isAdmin": false
}

Response:
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 5,
    "name": "John Doe",
    "email": "john@example.com",
    "admin": false
  }
}
```

### Update User

```
PUT /users/admin/update/:userId
Authorization: Bearer <admin-token>

Request Body:
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}

Response:
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 5,
    "name": "John Updated",
    "email": "john.updated@example.com"
  }
}
```

### Delete User

```
DELETE /users/admin/delete/:userId
Authorization: Bearer <admin-token>

Response:
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Make Admin

```
POST /users/make-admin
Authorization: Bearer <admin-token>

Request Body:
{
  "userId": 5
}

Response:
{
  "success": true,
  "message": "User promoted to admin successfully",
  "data": {
    "id": 5,
    "name": "John Doe",
    "email": "john@example.com",
    "admin": true
  }
}
```

---

## View Files Created

1. **views/admin/dashboard.ejs**
   - Main admin panel showing all users
   - Table with user details and action buttons
   - Edit and Delete buttons for each user

2. **views/admin/create-user.ejs**
   - Form to create a new user
   - Optional admin checkbox
   - Input validation

3. **views/admin/edit-user.ejs**
   - Form to edit user name, email, password
   - Displays current user information
   - Shows admin status (read-only)

---

## Access Control

All admin routes check if the user has admin privileges:

```javascript
if (!req.user.admin) {
  return res.status(403).json({
    success: false,
    message: "Only admins can perform this action",
  });
}
```

---

## Usage Examples

### Via Web Interface

1. **Login as admin** with token
2. **Navigate to** `/admin/dashboard`
3. **Click "Create User"** to add new users
4. **Click "Edit"** to modify user details
5. **Click "Delete"** to remove users

### Via API (cURL)

**Create User:**

```bash
curl -X POST http://localhost:5000/users/admin/create \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "pass123456",
    "isAdmin": false
  }'
```

**Update User:**

```bash
curl -X PUT http://localhost:5000/users/admin/update/5 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@example.com"
  }'
```

**Delete User:**

```bash
curl -X DELETE http://localhost:5000/users/admin/delete/5 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Database Schema

Users table includes:

- `id` - User ID (Primary Key)
- `name` - User name
- `email` - User email (Unique)
- `password` - Hashed password
- `admin` - Boolean (0 = user, 1 = admin)
- `created_at` - Account creation timestamp

---

## Security Considerations

1. ✅ Admin-only access verification on all endpoints
2. ✅ Email uniqueness check to prevent duplicates
3. ✅ Password hashing with bcryptjs
4. ✅ Prevention of self-deletion
5. ✅ Confirmation prompts before deletion
6. ✅ JWT token-based authentication

---

## Troubleshooting

### "Access denied" error

- Make sure your user is an admin
- Check if your token is valid and includes `admin: true`
- Re-login if needed

### "User already exists with this email"

- The email is already registered
- Use a different email or update the existing user

### "Failed to update user"

- Check database connection
- Verify user ID exists
- Check query syntax in logs

---

## Related Files Modified

- `models/userModel.js` - Added `updateUser()` and `deleteUser()` methods
- `controllers/userController.js` - Added 8 new functions for admin operations
- `routes/viewRoutes.js` - Added 6 view routes
- `routes/userRoutes.js` - Added 3 API routes
- `views/admin/` - Created new admin directory with 3 views

---

## Next Steps

Consider implementing:

1. Role-based access control (RBAC)
2. User soft deletes
3. Audit logging for admin actions
4. Email verification for new users
5. Password reset functionality
6. User search and filtering
