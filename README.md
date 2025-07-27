# Authentication Server

A secure authentication server built with Express.js, TypeScript, and PostgreSQL. Features user registration, login, JWT token management, and password hashing.

## Features

- ✅ User registration and login
- ✅ Password hashing with bcrypt
- ✅ JWT access and refresh tokens
- ✅ Token refresh mechanism
- ✅ Password change functionality
- ✅ Protected routes
- ✅ PostgreSQL database integration
- ✅ TypeScript support
- ✅ CORS enabled
- ✅ Health check endpoint
- ✅ Graceful shutdown

## Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- TypeScript

## Installation

1. Install dependencies:
```bash
bun install
```

2. Set up environment variables by creating a `.env` file:
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=auth_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Secrets (change these in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production

# Server Configuration
PORT=3000
```

3. Create PostgreSQL database:
```sql
CREATE DATABASE auth_db;
```

## Running the Server

### Development mode (with hot reload):
```bash
bun run dev
```

### Production mode:
```bash
bun run start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### Health Check
- `GET /health` - Check server and database status

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

### Protected Routes
- `GET /auth/profile` - Get user profile (requires authentication)
- `PUT /auth/change-password` - Change user password (requires authentication)

## API Usage Examples

### Register a new user:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Access protected route:
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh token:
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Change password:
```bash
curl -X PUT http://localhost:3000/auth/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
  }'
```

## Database Schema

The server automatically creates the following tables:

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with 12 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Refresh Tokens**: Long-lived refresh tokens for better UX
- **Token Expiration**: Access tokens expire after 15 minutes, refresh tokens after 7 days
- **CORS**: Cross-origin resource sharing enabled
- **Input Validation**: Server-side validation for all inputs
- **Error Handling**: Comprehensive error handling and logging

## Project Structure

```
auth/
├── src/
│   └── database/
│       └── PostgresHandler.ts    # PostgreSQL database handler
├── index.ts                      # Main server file
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## Development

The project uses:
- **Bun** as the runtime
- **TypeScript** for type safety
- **Express.js** for the web server
- **PostgreSQL** for data persistence
- **bcryptjs** for password hashing
- **jsonwebtoken** for JWT tokens
- **cors** for cross-origin requests
- **dotenv** for environment variables

## License

MIT
