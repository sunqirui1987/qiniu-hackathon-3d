# Production Authentication Backend

## Overview

This is a production-ready authentication backend built on top of PR #41 and PR #48, providing secure user authentication with JWT tokens, bcrypt password hashing, and comprehensive security features.

## What's New in This Implementation

### 🔒 Security Enhancements
- **Bcrypt Password Hashing**: Replaces plain-text password storage with secure bcrypt hashing (cost factor 12)
- **JWT Access & Refresh Tokens**: Industry-standard token-based authentication with token rotation
- **Password Strength Validation**: Enforces strong passwords (8+ chars, uppercase, lowercase, numbers)
- **Token Revocation**: Supports logout and invalidating compromised tokens
- **Security Headers**: CORS, X-Frame-Options, CSP, XSS protection
- **Input Validation**: Comprehensive validation and sanitization

### 🏗️ Architecture Improvements
- **Database Abstraction Layer**: Easy migration to PostgreSQL, MySQL, or MongoDB
- **Modular Design**: Separated concerns (routes, services, middleware, utils)
- **Error Handling**: Centralized error handling with proper status codes
- **Environment Configuration**: Flexible configuration via environment variables
- **Request Tracking**: Unique request IDs for debugging

### 📚 Production-Ready Features
- **Complete API Documentation**: See `AUTH_API.md`
- **Environment Configuration**: See `.env.auth.example`
- **Health Check Endpoint**: Monitor server status
- **Graceful Shutdown**: Proper cleanup on SIGTERM/SIGINT
- **Logging**: Comprehensive request and error logging

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token management
- `dotenv` - Environment configuration
- `express` - Web framework (already installed)
- `cors` - CORS middleware (already installed)

### 2. Configure Environment

```bash
cp .env.auth.example .env.auth
```

Edit `.env.auth` and update the values (especially JWT secrets for production).

### 3. Start the Server

```bash
# Development mode
npm run auth-server:dev

# Production mode
npm run auth-server
```

The server will start on `http://localhost:3001`

## API Endpoints

See `AUTH_API.md` for complete API documentation.

Quick reference:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Token verification
- `GET /api/auth/user` - Get user info
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/change-password` - Change password
- `GET /health` - Health check

## Testing

### Register a New User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "name": "Test User"
  }'
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "test@example.com",
      "name": "Test User",
      "avatar": "https://ui-avatars.com/api/?name=Test+User",
      "provider": "local",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

### Get User Info

```bash
curl http://localhost:3001/api/auth/user \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Verify Token

```bash
curl -X POST http://localhost:3001/api/auth/verify \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Access Token

```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Change Password

```bash
curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "SecurePass123",
    "newPassword": "NewSecurePass456"
  }'
```

### Logout

```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Project Structure

```
auth-server.js                      # Main server entry point
server/
├── config/
│   └── env.js                      # Environment configuration
├── routes/
│   └── auth.js                     # Authentication routes
├── services/
│   ├── authService.js              # Core authentication logic
│   └── database.js                 # Database abstraction layer
├── models/
│   └── User.js                     # User model
├── utils/
│   ├── jwt.js                      # JWT token utilities
│   ├── password.js                 # Password hashing utilities
│   └── validation.js               # Input validation
└── middleware/
    ├── security.js                 # Security middleware
    └── errorHandler.js             # Error handling
```

## Migrating to Production Database

The current implementation uses an in-memory database. To migrate to production:

### PostgreSQL Example

1. Install PostgreSQL client:
```bash
npm install pg
```

2. Update `server/services/database.js`:
```javascript
import pg from 'pg'
import { config } from '../config/env.js'

const pool = new pg.Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password
})

// Replace Map-based operations with SQL queries
export async function createUser(userData) {
  const result = await pool.query(
    'INSERT INTO users (email, password_hash, name, avatar, provider) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userData.email, userData.passwordHash, userData.name, userData.avatar, userData.provider]
  )
  return result.rows[0]
}
```

3. Create database schema:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar TEXT,
  provider VARCHAR(50) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE revoked_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL,
  revoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

4. Update environment variables in `.env.auth`:
```
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=auth_db
DB_USER=postgres
DB_PASSWORD=your_password
```

## Security Best Practices

### Development
- ✅ Use `.env.auth` for configuration
- ✅ Never commit secrets to git
- ✅ Test with HTTPS locally using mkcert

### Production
- ✅ Set strong JWT secrets (64+ characters)
- ✅ Use production database (PostgreSQL/MySQL/MongoDB)
- ✅ Enable HTTPS (use nginx/Apache reverse proxy)
- ✅ Implement rate limiting
- ✅ Set up monitoring and logging
- ✅ Use process manager (PM2, systemd)
- ✅ Regular security updates

## Differences from mock-oauth-server.js

| Feature | mock-oauth-server.js | auth-server.js |
|---------|---------------------|----------------|
| Password Storage | Plain text ⚠️ | Bcrypt hashed ✅ |
| Token Type | Simple random bytes | JWT with expiry ✅ |
| Token Refresh | Not supported ❌ | Supported ✅ |
| Password Validation | None ❌ | Strong validation ✅ |
| Database | In-memory only | Abstraction layer ✅ |
| Input Validation | Minimal ⚠️ | Comprehensive ✅ |
| Security Headers | None ❌ | Full set ✅ |
| Error Handling | Basic ⚠️ | Centralized ✅ |
| Environment Config | Hardcoded ❌ | .env file ✅ |
| API Documentation | None ❌ | Complete ✅ |
| Production Ready | No ❌ | Yes ✅ |

## Deployment

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start the server
pm2 start auth-server.js --name auth-server

# Monitor
pm2 logs auth-server
pm2 monit

# Auto-restart on server reboot
pm2 startup
pm2 save
```

### Using Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "auth-server.js"]
```

```bash
docker build -t auth-server .
docker run -p 3001:3001 --env-file .env.auth auth-server
```

### Using systemd

```ini
[Unit]
Description=Authentication Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/auth-server
EnvironmentFile=/var/www/auth-server/.env.auth
ExecStart=/usr/bin/node auth-server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

## Troubleshooting

### Server won't start
- Check if port 3001 is available
- Verify `.env.auth` configuration
- Check Node.js version (requires 18+)

### Token verification fails
- Check JWT secrets match between registration and verification
- Verify token hasn't expired
- Check token format (should be `Bearer <token>`)

### Password validation fails
- Ensure password meets requirements (8+ chars, uppercase, lowercase, number)
- Check for leading/trailing spaces

## Contributing

When extending this authentication backend:

1. Follow the existing modular structure
2. Add appropriate validation and error handling
3. Update documentation
4. Write tests for new features
5. Follow security best practices

## License

ISC

## Related Files

- `mock-oauth-server.js` - Original OAuth mock server (development only)
- `AUTH_API.md` - Complete API documentation
- `.env.auth.example` - Environment configuration template
- `OAUTH_SETUP.md` - OAuth provider setup guide
