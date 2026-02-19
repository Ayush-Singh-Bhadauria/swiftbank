# ✅ Consolidated to Single Server!

## 🎉 What Changed

Your app now runs on **one server** instead of two:

### Before:
```
Backend (Express): http://localhost:3001  ❌ REMOVED
Frontend (Next.js): http://localhost:3000 ✅ STILL HERE
```

### After:
```
Next.js (Frontend + API Routes): http://localhost:3000 ✅ ONLY THIS
├── Frontend UI: http://localhost:3000
└── Backend API: http://localhost:3000/api
```

## 🚀 How to Run

### Single Command:
```bash
npm run dev
```

That's it! No more managing two servers.

**Or use the script:**
```bash
./start.sh
```

## 📂 New Architecture

```
app/
├── api/                          ← NEW: Next.js API routes (replaced Express)
│   ├── auth/
│   │   └── login/
│   │       └── customer/
│   │           └── route.ts     ← Customer login endpoint
│   ├── profile/
│   │   └── route.ts             ← User profile endpoint
│   └── transactions/
│       └── route.ts             ← Transactions endpoint
│
├── (protected)/                  ← Your frontend pages
│   ├── dashboard/
│   ├── transactions/
│   └── ...
│
└── (public)/
    ├── login/
    └── register/

lib/
├── api-client.ts                 ← Updated to use /api routes
└── server-utils.ts               ← NEW: Server-side bankmock service

.env.local                        ← Configuration
```

## 🔧 What Was Changed

### ✅ Added:
1. **`app/api/auth/login/customer/route.ts`** - Customer login API
2. **`app/api/profile/route.ts`** - Profile API
3. **`app/api/transactions/route.ts`** - Transactions API
4. **`lib/server-utils.ts`** - Server-side service to call bankmock
5. **`.env.local`** - Next.js environment config
6. **`.env.example`** - Example environment file

### 🔄 Updated:
1. **`lib/api-client.ts`** - Now calls `/api/*` instead of `http://localhost:3001/api/*`
2. **`package.json`** - Simplified scripts (removed backend scripts)
3. **`start.sh`** - Now only starts Next.js

### ⚠️ Not Deleted (but no longer needed):
- **`backend/`** folder - Still there but not used
- You can delete it if you want, but kept for reference

## 🌐 API Endpoints

All API routes are now at `http://localhost:3000/api/*`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login/customer` | POST | Login with customer ID |
| `/api/profile` | GET | Get user profile |
| `/api/transactions` | GET | Get transactions |

## 🔐 Environment Configuration

**`.env.local`** (already created):
```env
BANKMOCK_API_URL=https://bankmock-theta.vercel.app
NODE_ENV=development
```

This is the only config file you need now!

## ⚠️ Important: Deploy Bankmock First!

Before testing login, you must deploy the bankmock changes:

```bash
cd bankmock/mockbank
git add .
git commit -m "Add customer ID login endpoint"
git push origin main
```

Wait for Vercel to deploy (~1-2 minutes).

## 🧪 Testing

### 1. Start the server:
```bash
npm run dev
```

### 2. Test in browser:
Open: http://localhost:3000/login

Enter:
- **Customer ID**: `CUST001`
- **Password**: Your password

### 3. Test API directly:
```bash
curl -X POST http://localhost:3000/api/auth/login/customer \
  -H "Content-Type: application/json" \
  -d '{"customerId":"CUST001","password":"yourpassword"}'
```

## 📊 Benefits of This Architecture

### ✅ Before (2 Servers):
- Backend: Express on port 3001
- Frontend: Next.js on port 3000
- **Problems:**
  - Need to start/manage 2 processes
  - More complex deployment
  - CORS issues
  - Different configs for each

### ✅ After (1 Server):
- Everything: Next.js on port 3000
- **Benefits:**
  - ✅ One command to start: `npm run dev`
  - ✅ Simpler deployment (just deploy Next.js)
  - ✅ No CORS issues (same origin)
  - ✅ One config file (`.env.local`)
  - ✅ Better type safety (TypeScript throughout)
  - ✅ Automatic API route optimization

## 🚀 Deployment

### Before (2 deployments):
1. Deploy backend (Vercel/Heroku/etc.)
2. Deploy frontend (Vercel/Netlify/etc.)
3. Configure CORS
4. Update API URLs

### After (1 deployment):
```bash
# Just deploy Next.js - that's it!
vercel deploy
```

Everything goes together automatically.

## 📝 How API Routes Work

Next.js API routes run on the server (Node.js), just like your Express backend did:

```typescript
// app/api/auth/login/customer/route.ts
export async function POST(request: NextRequest) {
  // This runs on the server (Node.js)
  const response = await loginWithCustomerId(customerId, password);
  return NextResponse.json(response);
}
```

**Server-side features:**
- ✅ Access to environment variables
- ✅ Can make server-to-server API calls
- ✅ Hides API keys from browser
- ✅ Full Node.js APIs available

## 🗂️ What to Do With Old Backend

The `backend/` folder is still there but not used. Options:

### Option 1: Keep for Reference (Recommended)
Leave it there in case you need to reference old code.

### Option 2: Delete It
```bash
rm -rf backend/
```

Since everything is now in Next.js API routes, you don't need it.

### Option 3: Archive It
```bash
mkdir archive
mv backend/ archive/backend-old/
```

## 🔍 Troubleshooting

### Port 3000 already in use?
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### API not working?
1. Check `.env.local` exists with `BANKMOCK_API_URL`
2. Verify bankmock is deployed with new endpoint
3. Clear Next.js cache: `rm -rf .next && npm run dev`

### Frontend not loading?
```bash
# Clear everything and rebuild
rm -rf .next node_modules
npm install
npm run dev
```

## 📚 Learn More

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Environment Variables in Next.js](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

**Ready to go!** Just run `npm run dev` and open http://localhost:3000 🚀
