# Credit Card Application Backend

Backend API for the Credit Card Application System built with Express.js and MongoDB.

## Features

- ✅ RESTful API design
- ✅ JWT authentication
- ✅ Role-based authorization (User/Admin)
- ✅ MongoDB with Mongoose ODM
- ✅ Input validation
- ✅ Error handling
- ✅ Request logging
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Security headers (Helmet)
- ✅ Audit logging

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT
- **Validation:** express-validator
- **Logging:** Winston

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/credit-card-app
JWT_SECRET=6f80f1ae2f081ad7164b3cc23521ce86
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
REFRESH_TOKEN_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Start MongoDB

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod
```

### 4. Run the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The API will be available at `http://localhost:5000/api`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user (protected)

### Applications

- `POST /api/applications` - Submit application
- `GET /api/applications/track/:applicationNumber` - Track application (public)
- `GET /api/applications/my` - Get user's applications (protected)
- `GET /api/applications/:id` - Get application by ID (protected)
- `GET /api/applications` - Get all applications (admin only)
- `PATCH /api/applications/:id` - Update application status (admin only)

### Health Check

- `GET /api/health` - Health check endpoint

## Business Rules

1. **Age Validation:** Applicant must be ≥ 18 years old
2. **Duplicate Check:** No approved/rejected application in last 6 months for same PAN
3. **Credit Score:** Automatically retrieved based on PAN card (mock implementation)
4. **Credit Limit:** Calculated based on annual income:
   - ≤ ₹2,00,000 → ₹50,000
   - ₹2,00,001 - ₹3,00,000 → ₹75,000
   - ₹3,00,001 - ₹5,00,000 → ₹1,00,000
   - > ₹5,00,000 → Subjective (manual review)
5. **Auto Approval:** Credit score > 800 AND credit limit not subjective → Approved

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # Mongoose models
│   ├── controllers/     # Route controllers
│   ├── routes/          # Express routes
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic
│   ├── validators/      # Input validators
│   ├── utils/           # Utility functions
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── logs/                # Log files
├── .env                 # Environment variables
├── .env.example         # Environment template
├── package.json         # Dependencies
└── README.md            # This file
```

## Error Handling

All errors return a consistent JSON format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": [] // Optional validation details
  }
}
```

## Security Features

- Password hashing with bcrypt
- JWT tokens with expiry
- Rate limiting
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention (Mongoose)

## Logging

Winston logger with multiple transports:
- Console (colored)
- File (`logs/error.log` for errors)
- File (`logs/combined.log` for all logs)

## Testing

```bash
npm test
```

## License

MIT
