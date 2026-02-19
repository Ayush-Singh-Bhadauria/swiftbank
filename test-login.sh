#!/bin/bash

# Test script for Customer Login Implementation
# Run this after deploying bankmock and starting the backend

echo "🧪 Testing Customer Login Flow"
echo "================================"
echo ""

# Configuration
BANKMOCK_URL="${BANKMOCK_API_URL:-https://bankmock-theta.vercel.app}"
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
CUSTOMER_ID="${TEST_CUSTOMER_ID:-CUST001}"
PASSWORD="${TEST_PASSWORD:-password123}"

echo "Configuration:"
echo "  Bankmock URL: $BANKMOCK_URL"
echo "  Backend URL: $BACKEND_URL"
echo "  Customer ID: $CUSTOMER_ID"
echo ""

# Test 1: Check Bankmock Health
echo "Test 1: Checking Bankmock Health..."
BANKMOCK_HEALTH=$(curl -s "$BANKMOCK_URL" | grep -o '"success":true')
if [ -n "$BANKMOCK_HEALTH" ]; then
  echo "  ✅ Bankmock API is running"
else
  echo "  ❌ Bankmock API is not responding"
  exit 1
fi
echo ""

# Test 2: Test Bankmock Customer Login Endpoint
echo "Test 2: Testing Bankmock Customer Login..."
BANKMOCK_LOGIN=$(curl -s -X POST "$BANKMOCK_URL/api/v1/auth/login/customer" \
  -H "Content-Type: application/json" \
  -d "{\"customer_id\":\"$CUSTOMER_ID\",\"password\":\"$PASSWORD\"}")

echo "  Response: $BANKMOCK_LOGIN"
BANKMOCK_TOKEN=$(echo "$BANKMOCK_LOGIN" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -n "$BANKMOCK_TOKEN" ]; then
  echo "  ✅ Login successful, token received"
else
  echo "  ❌ Login failed or token not returned"
  echo "  Note: Make sure customer exists with correct credentials"
fi
echo ""

# Test 3: Check Backend Health
echo "Test 3: Checking Backend Health..."
BACKEND_HEALTH=$(curl -s "$BACKEND_URL/health" | grep -o '"success":true')
if [ -n "$BACKEND_HEALTH" ]; then
  echo "  ✅ Backend API is running"
else
  echo "  ❌ Backend API is not responding"
  echo "  Make sure to run: cd backend && npm run dev"
  exit 1
fi
echo ""

# Test 4: Test Backend Customer Login Proxy
echo "Test 4: Testing Backend Customer Login Proxy..."
BACKEND_LOGIN=$(curl -s -X POST "$BACKEND_URL/api/auth/login/customer" \
  -H "Content-Type: application/json" \
  -d "{\"customerId\":\"$CUSTOMER_ID\",\"password\":\"$PASSWORD\"}")

echo "  Response: $BACKEND_LOGIN"
BACKEND_TOKEN=$(echo "$BACKEND_LOGIN" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -n "$BACKEND_TOKEN" ]; then
  echo "  ✅ Backend login successful, token received"
else
  echo "  ❌ Backend login failed"
  echo "  Check backend logs and .env configuration"
fi
echo ""

# Summary
echo "================================"
echo "📊 Test Summary"
echo "================================"
if [ -n "$BANKMOCK_TOKEN" ] && [ -n "$BACKEND_TOKEN" ]; then
  echo "✅ All tests passed!"
  echo ""
  echo "Next steps:"
  echo "  1. Open http://localhost:3000/login in your browser"
  echo "  2. Enter Customer ID: $CUSTOMER_ID"
  echo "  3. Enter your password"
  echo "  4. Click Sign In"
  echo ""
else
  echo "❌ Some tests failed. Please check the errors above."
  echo ""
  echo "Common issues:"
  echo "  - Customer doesn't exist in database"
  echo "  - Password is incorrect or not bcrypt hashed"
  echo "  - Bankmock not deployed with new changes"
  echo "  - Backend .env not configured"
  echo "  - Backend not running"
  echo ""
fi
