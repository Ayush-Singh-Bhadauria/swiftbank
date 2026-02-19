# Quick Start Guide - Customer Login

## ⚡ Fast Setup (5 minutes)

### 1. Deploy Bankmock (Required)

Your bankmock needs to be redeployed with the new customer login endpoint:

```bash
cd bankmock/mockbank
git add .
git commit -m "Add customer ID login endpoint"
git push
```

**Wait for Vercel deployment to complete** (~1-2 minutes)

### 2. Configure Backend

```bash
cd backend

# The .env file should already exist with correct configuration
# Verify it contains:
# BANKMOCK_API_URL=https://bankmock-theta.vercel.app

# Start the backend
npm run dev
```

Backend will run on **http://localhost:3001**

### 3. Start Frontend

Open a new terminal:

```bash
# From project root
npm run dev
# or: pnpm dev
```

Frontend will run on **http://localhost:3000**

### 4. Test Login

1. Open: http://localhost:3000/login
2. Enter:
   - **Customer ID**: `CUST001` (or any customer_id from your MongoDB)
   - **Password**: Your actual password (not hashed)
3. Click **Sign In**
4. Should redirect to `/dashboard`

### 5. Verify (Optional)

Run the test script:

```bash
# From project root
./test-login.sh

# Or with custom values:
TEST_CUSTOMER_ID=CUST001 TEST_PASSWORD=yourpassword ./test-login.sh
```

## 🔍 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid credentials" | Verify customer_id exists in MongoDB and password is correct |
| "Cannot find module" | Run `npm install` in backend directory |
| CORS errors | Check `FRONTEND_URL` in backend/.env |
| 404 on bankmock | Redeploy bankmock with new changes |
| Backend not starting | Create backend/.env with BANKMOCK_API_URL |

## 📋 Checklist

- [ ] Bankmock deployed with new endpoint
- [ ] Backend .env file configured
- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] Test customer exists in MongoDB
- [ ] Password is bcrypt hashed in database

## 🎯 What Changed

### Files Modified:

**Bankmock (requires deployment):**
- `controllers/authController.js` - Added `loginWithCustomerId()`
- `routes/authRoutes.js` - Added route
- `README.md` - Added documentation

**Backend:**
- `src/services/bankmockService.js` - NEW service to call bankmock
- `src/controllers/authController.js` - Added customer login
- `src/routes/auth.js` - Added route
- `.env.example` - Added BANKMOCK_API_URL

**Frontend:**
- `lib/validators.ts` - Changed schema to accept customerId
- `lib/api-client.ts` - Added loginWithCustomerId()
- `context/auth-context.tsx` - Added customer login support
- `components/auth/login-form.tsx` - Changed form field

## 📚 More Information

See [CUSTOMER_LOGIN_IMPLEMENTATION.md](./CUSTOMER_LOGIN_IMPLEMENTATION.md) for:
- Detailed architecture
- Security best practices
- API documentation
- Data flow diagrams
- Advanced troubleshooting

---

**Need Help?** Check the detailed implementation guide or run `./test-login.sh` to diagnose issues.
