# Banking App - JWT Authentication with MongoDB Setup Guide

This guide will help you set up and run the banking application with JWT-based authentication and MongoDB.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - Choose one:
  - Local MongoDB - [Download](https://www.mongodb.com/try/download/community)
  - MongoDB Atlas (Cloud) - [Sign up](https://www.mongodb.com/cloud/atlas/register)
- **pnpm** (for frontend) - Install with: `npm install -g pnpm`

## Project Structure

```
banking-app-frontend/
├── backend/              # Express.js backend with JWT auth
│   ├── src/
│   │   ├── config/      # Database configuration
│   │   ├── controllers/ # Route controllers
│   │   ├── middleware/  # Auth middleware
│   │   ├── models/      # MongoDB models
│   │   ├── routes/      # API routes
│   │   └── utils/       # JWT utilities
│   ├── .env             # Backend environment variables
│   └── package.json
├── app/                 # Next.js frontend
├── components/          # React components
├── lib/                 # Frontend utilities
└── .env.local          # Frontend environment variables
```

## Setup Instructions

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- express - Web framework
- mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT token generation
- cors - Cross-origin resource sharing
- helmet - Security headers
- morgan - HTTP request logger
- dotenv - Environment variables

### Step 2: Configure MongoDB

#### Option A: Local MongoDB

1. Start MongoDB service:
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

2. The backend `.env` file is already configured for local MongoDB:
   ```
   MONGODB_URI=mongodb://localhost:27017/banking-app
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Get your connection string
3. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/banking-app
   ```

### Step 3: Configure Backend Environment

The `backend/.env` file is already created with default values. Review and update if needed:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/banking-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

**Important:** Change `JWT_SECRET` to a secure random string in production!

### Step 4: Install Frontend Dependencies

```bash
# From the root directory
pnpm install
```

### Step 5: Configure Frontend Environment

The `.env.local` file is already created. Verify it contains:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3001`

You should see:
```
Server running in development mode on port 3001
MongoDB Connected: localhost
```

### Start Frontend Development Server

In a new terminal, from the root directory:

```bash
pnpm dev
```

The frontend will start on `http://localhost:3000`

## Testing the Application

### 1. Register a New User

1. Navigate to `http://localhost:3000/register`
2. Fill in the registration form:
   - Full Name: John Doe
   - Email: john@example.com
   - Phone: +1-555-123-4567
   - Password: (minimum 8 characters)
3. Click "Create Account"
4. You'll be automatically logged in and redirected to the dashboard

### 2. Login

1. Navigate to `http://localhost:3000/login`
2. Enter your credentials
3. Click "Sign In"
4. You'll be redirected to the dashboard

### 3. Test Protected Routes

Once logged in, you can access:
- **Dashboard** - `/dashboard` - View account summary
- **Transactions** - `/transactions` - View transaction history
- **Profile** - `/profile` - Update profile and change password
- **Disputes** - `/dispute` - File transaction disputes

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user (protected)
- `POST /api/auth/change-password` - Change password (protected)

### User
- `GET /api/profile` - Get user profile (protected)
- `PUT /api/profile` - Update profile (protected)
- `GET /api/account` - Get account summary (protected)

### Transactions
- `GET /api/transactions` - Get all transactions (protected)
- `GET /api/transactions/:id` - Get single transaction (protected)
- `POST /api/transactions` - Create transaction (protected)

### Disputes
- `GET /api/disputes` - Get all disputes (protected)
- `GET /api/disputes/:caseId` - Get single dispute (protected)
- `POST /api/dispute` - Create dispute (protected)

### Health Check
- `GET /api/health` - Server health check

## Testing with Sample Data

To create sample transactions for testing:

```bash
# Use curl or Postman to create a transaction
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "credit",
    "amount": 1000,
    "description": "Salary Deposit",
    "category": "deposit"
  }'
```

## Troubleshooting

### Backend won't start
- **MongoDB connection error**: Ensure MongoDB is running
- **Port already in use**: Change PORT in `backend/.env`
- **Module not found**: Run `npm install` in backend directory

### Frontend won't connect to backend
- Verify backend is running on port 3001
- Check `.env.local` has correct API URL
- Check browser console for CORS errors

### Authentication issues
- Clear browser localStorage: `localStorage.clear()`
- Check JWT_SECRET is set in backend `.env`
- Verify token is being sent in Authorization header

### Database issues
- Check MongoDB connection string in `backend/.env`
- Verify MongoDB service is running
- Check MongoDB logs for errors

## Security Notes

### For Production:

1. **Change JWT_SECRET** to a strong random string
2. **Use HTTPS** for all connections
3. **Set secure CORS origins** in backend
4. **Use environment-specific .env files**
5. **Enable MongoDB authentication**
6. **Add rate limiting** to prevent brute force attacks
7. **Implement refresh tokens** for better security
8. **Add input validation** on all endpoints
9. **Use helmet.js** security headers (already included)
10. **Regular security audits** with `npm audit`

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  kycStatus: String (pending/verified/rejected),
  accountNumber: String,
  accountType: String (checking/savings),
  balance: Number,
  currency: String,
  timestamps: true
}
```

### Transaction Model
```javascript
{
  userId: ObjectId (ref: User),
  type: String (debit/credit),
  amount: Number,
  currency: String,
  description: String,
  status: String (completed/pending/failed),
  category: String,
  fraudScore: Number (0-100),
  disputed: Boolean,
  timestamps: true
}
```

### Dispute Model
```javascript
{
  userId: ObjectId (ref: User),
  transactionId: ObjectId (ref: Transaction),
  caseId: String (auto-generated),
  reason: String,
  description: String,
  status: String (open/under_review/resolved/closed),
  resolution: String,
  timestamps: true
}
```

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [Next.js Documentation](https://nextjs.org/docs)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs in terminal
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

## License

This project is for educational purposes.