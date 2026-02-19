# Bankmock Changes - Complete Guide

## ⚠️ Files to Modify in Bankmock

You need to make changes to **2 files** in your bankmock repository.

---

## 📝 Change 1: controllers/authController.js

**Location:** `bankmock/mockbank/controllers/authController.js`

**Add this function** after the existing `login` function (around line 110):

```javascript
// @desc    Login customer with customer_id
// @route   POST /api/v1/auth/login/customer
// @access  Public
exports.loginWithCustomerId = async (req, res, next) => {
  try {
    const { customer_id, password } = req.body;

    // Validate customer_id & password
    if (!customer_id || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customer ID and password'
      });
    }

    // Check for customer by customer_id
    const customer = await Customer.findOne({ customer_id }).select('+password');

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await customer.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(customer._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        customer_id: customer.customer_id,
        name: customer.name,
        email: customer.email,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};
```

**Where to add it:**
- After the existing `exports.login` function
- Before the `exports.getMe` function

---

## 📝 Change 2: routes/authRoutes.js

**Location:** `bankmock/mockbank/routes/authRoutes.js`

### Step 1: Update the require statement
**Find this:**
```javascript
const {
  register,
  login,
  getMe
} = require('../controllers/authController');
```

**Replace with:**
```javascript
const {
  register,
  login,
  loginWithCustomerId,
  getMe
} = require('../controllers/authController');
```

### Step 2: Add the route
**Find this:**
```javascript
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
```

**Replace with:**
```javascript
router.post('/register', register);
router.post('/login', login);
router.post('/login/customer', loginWithCustomerId);
router.get('/me', protect, getMe);
```

**Complete file should look like:**
```javascript
const express = require('express');
const {
  register,
  login,
  loginWithCustomerId,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/login/customer', loginWithCustomerId);
router.get('/me', protect, getMe);

module.exports = router;
```

---

## 📝 Change 3: README.md (Optional)

**Location:** `bankmock/mockbank/README.md`

**Find the login section** (around line 97) and add this after it:

```markdown
#### Login with Customer ID
```http
POST /auth/login/customer
Content-Type: application/json

{
  "customer_id": "CUST001",
  "password": "password123"
}
```
```

---

## ✅ Summary of Changes

### File 1: `controllers/authController.js`
- **Add:** `loginWithCustomerId` function (58 lines)
- **Where:** After `exports.login`, before `exports.getMe`

### File 2: `routes/authRoutes.js`
- **Update:** Import statement to include `loginWithCustomerId`
- **Add:** Route `router.post('/login/customer', loginWithCustomerId);`

### File 3: `README.md` (Optional)
- **Add:** Documentation for new endpoint

---

## 🚀 After Making Changes

```bash
cd bankmock/mockbank
git add .
git commit -m "Add customer ID login endpoint"
git push origin main
```

Vercel will auto-deploy in 1-2 minutes.

---

## 🧪 Test After Deployment

```bash
curl -X POST https://bankmock-theta.vercel.app/api/v1/auth/login/customer \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "CUST001",
    "password": "your_password"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "customer_id": "CUST001",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## 📋 Checklist

- [ ] Modified `controllers/authController.js` - Added `loginWithCustomerId` function
- [ ] Modified `routes/authRoutes.js` - Added import and route
- [ ] (Optional) Updated `README.md` - Added documentation
- [ ] Committed changes to git
- [ ] Pushed to trigger Vercel deployment
- [ ] Waited for deployment (~1-2 min)
- [ ] Tested the endpoint with curl
- [ ] Started Next.js app with `npm run dev`
- [ ] Tested login at http://localhost:3000/login

---

## 💡 Quick Copy-Paste

### For authController.js
Copy the entire `loginWithCustomerId` function from "Change 1" above and paste it after the existing `login` function.

### For authRoutes.js
1. Add `loginWithCustomerId,` to the require statement
2. Add `router.post('/login/customer', loginWithCustomerId);` after the login route

That's all you need! 🎉
