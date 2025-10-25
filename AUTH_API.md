# Authentication API Documentation

## Overview

This is a production-ready authentication backend with JWT-based authentication, secure password hashing, and comprehensive security features.

## Base URL

```
http://localhost:3001
```

## Authentication

Most endpoints require a JWT access token. Include it in the Authorization header:

```
Authorization: Bearer <access_token>
```

## API Endpoints

### 1. Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Password Requirements:**
- At least 8 characters long
- Contains at least one uppercase letter
- Contains at least one lowercase letter
- Contains at least one number

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://ui-avatars.com/api/?name=John+Doe",
      "provider": "local",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Error Responses:**
- `400` - Validation error (weak password, invalid email, etc.)
- `409` - User already exists

---

### 2. Login

Authenticate a user and receive tokens.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://ui-avatars.com/api/?name=John+Doe",
      "provider": "local",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Error Responses:**
- `401` - Invalid credentials
- `400` - Account uses OAuth login

---

### 3. Verify Token

Verify if an access token is valid.

**Endpoint:** `POST /api/auth/verify`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "valid": true,
  "data": {
    "userId": "uuid-here",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `401` - Invalid or expired token

---

### 4. Get User Info

Get information about the authenticated user.

**Endpoint:** `GET /api/auth/user`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://ui-avatars.com/api/?name=John+Doe",
      "provider": "local",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `401` - Authentication required
- `404` - User not found

---

### 5. Logout

Logout the user and revoke the access token.

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 6. Refresh Access Token

Get a new access token using a refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGc...",
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://ui-avatars.com/api/?name=John+Doe",
      "provider": "local",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `401` - Invalid or expired refresh token

---

### 7. Change Password

Change the user's password.

**Endpoint:** `POST /api/auth/change-password`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass456"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400` - Validation error or OAuth account
- `401` - Current password is incorrect

---

### 8. Health Check

Check if the server is running.

**Endpoint:** `GET /health`

**Success Response (200 OK):**
```json
{
  "status": "healthy",
  "message": "Production Authentication Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

---

## Security Features

### Password Security
- **Bcrypt Hashing**: Passwords are hashed using bcrypt with a cost factor of 12
- **Password Strength Validation**: Enforces minimum 8 characters, uppercase, lowercase, and numbers
- **No Plain-Text Storage**: Passwords are never stored in plain text

### Token Security
- **JWT Tokens**: Industry-standard JSON Web Tokens
- **Access Token**: Short-lived (15 minutes by default)
- **Refresh Token**: Long-lived (7 days by default)
- **Token Revocation**: Supports logout and token invalidation
- **Token Type Validation**: Prevents using refresh tokens as access tokens

### HTTP Security
- **CORS Protection**: Configurable CORS with credentials support
- **Security Headers**: Includes X-Content-Type-Options, X-Frame-Options, etc.
- **HTTPS Ready**: Prepared for HTTPS deployment
- **Request ID Tracking**: Each request gets a unique ID for debugging

### Input Validation
- **Email Validation**: Validates email format and length
- **Input Sanitization**: Removes potentially dangerous characters
- **SQL Injection Prevention**: Prepared for parameterized queries
- **XSS Protection**: Input sanitization and security headers

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required or failed)
- `404` - Not Found
- `409` - Conflict (e.g., user already exists)
- `500` - Internal Server Error

---

## Token Lifecycle

1. **Registration/Login**: User receives access token (15min) and refresh token (7d)
2. **API Requests**: Include access token in Authorization header
3. **Token Expiry**: When access token expires, use refresh token to get new access token
4. **Logout**: Both tokens are revoked
5. **Security**: Refresh tokens are stored server-side and can be revoked

---

## Migration to Production Database

The current implementation uses an in-memory database for development. To migrate to production:

1. **PostgreSQL Example:**
   ```javascript
   import pg from 'pg'
   
   const pool = new pg.Pool({
     host: config.database.host,
     port: config.database.port,
     database: config.database.name,
     user: config.database.user,
     password: config.database.password
   })
   ```

2. **Update Database Service**: Replace Map-based storage with SQL queries
3. **Create Database Schema**: Users, refresh_tokens, revoked_tokens tables
4. **Update Environment Variables**: Set DB_TYPE, DB_HOST, etc.

---

## Rate Limiting

The server is prepared for rate limiting. To implement:

1. Install `express-rate-limit`
2. Configure in middleware:
   ```javascript
   import rateLimit from 'express-rate-limit'
   
   const limiter = rateLimit({
     windowMs: config.rateLimit.windowMs,
     max: config.rateLimit.maxRequests
   })
   
   app.use('/api/', limiter)
   ```

---

## Environment Variables

See `.env.auth.example` for all available configuration options.

**Critical for Production:**
- Set strong `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- Configure proper database (not in-memory)
- Set appropriate CORS origins
- Use HTTPS in production
- Configure rate limiting

---

## Quick Start

### Development

```bash
# Install dependencies
npm install bcryptjs jsonwebtoken dotenv

# Copy environment file
cp .env.auth.example .env.auth

# Start the server
node auth-server.js
```

### Production

```bash
# Set production environment
export NODE_ENV=production

# Configure secrets in .env.auth
# Set up production database
# Configure HTTPS reverse proxy (nginx/Apache)

# Start with process manager
pm2 start auth-server.js --name auth-server
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456","name":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'
```

### Verify Token
```bash
curl -X POST http://localhost:3001/api/auth/verify \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get User
```bash
curl http://localhost:3001/api/auth/user \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Support

For issues and questions, please refer to the project documentation or contact the development team.
