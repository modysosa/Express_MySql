# Admin Setup Guide

## What Changed

1. **Database**: Added `admin` boolean field to the `users` table (defaults to `false`)
2. **User Model**: Updated to handle admin field in user creation and queries
3. **User Controller**:
   - Added `admin` field to JWT token payload
   - Added `makeAdmin` function to promote users to admin
4. **User Routes**: Added `/make-admin` endpoint (requires authentication)

## Setup Instructions

### 1. Run the Setup Script

Execute the setup script to:

- Add the `admin` field to the users table
- Create a default admin user

```bash
node scripts/setupAdmin.js
```

**Default Admin Credentials:**

- Email: `admin@admin.com`
- Password: `123456`

⚠️ **IMPORTANT**: Change this password immediately after first login!

### 2. (Alternative) Manual Database Setup

If you prefer to set up manually, run this SQL query:

```sql
ALTER TABLE users ADD COLUMN admin BOOLEAN DEFAULT 0;
```

Then manually insert an admin user with a secure password.

## API Endpoints

### Make User Admin

**Endpoint:** `POST /users/make-admin`

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "userId": 1
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "User promoted to admin successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "admin": true
  }
}
```

**Response (Error - Not Admin):**

```json
{
  "success": false,
  "message": "Only admins can make other users admins"
}
```

## Login Response with Admin Field

After login, the response now includes the admin status:

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "tokenPayload": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin",
    "admin": true
  },
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@example.com",
    "admin": true
  }
}
```

## Usage

1. Run `npm run dev` to start the server
2. Execute `node scripts/setupAdmin.js` to set up the admin user
3. Login with admin credentials to get an admin token
4. Use the admin token to promote other users:
   ```
   POST /users/make-admin
   Authorization: Bearer <admin-token>
   Body: { "userId": 2 }
   ```
