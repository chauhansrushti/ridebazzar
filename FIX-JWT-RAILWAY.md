# 🔐 Fix JWT_SECRET on Railway

## Problem
Token verification fails: "invalid signature"
- Token was created with JWT_SECRET
- But Railway backend uses a DIFFERENT JWT_SECRET (or none)
- JWT signatures don't match = 401 error

## Solution: Set JWT_SECRET on Railway

### Step 1: Open Railway Dashboard
1. Go to: https://dashboard.railway.app
2. Login with your GitHub account

### Step 2: Go to Your Project
1. Find "web-production-f7f4" or your ridebazzar service
2. Click on it

### Step 3: Go to Variables
1. Click "Variables" tab in the service details
2. You should see your existing variables (DB_HOST, DB_USER, etc)

### Step 4: Add JWT_SECRET
1. Click "New Variable" button
2. **Name:** `JWT_SECRET`
3. **Value:** `SuperSecretKey2024Railway123456` (exactly this, 31 characters)
4. Click "Add" or "Save"

### Step 5: Verify it was Added
- You should see JWT_SECRET in the variables list
- Should show the value (or hidden dots)

### Step 6: Wait for Redeploy
- Railway will automatically rebuild and restart your backend
- Takes 2-3 minutes
- Watch the "Deployments" section for status

### Step 7: Test Again
1. Go back to: https://web-production-f7f4.up.railway.app/admin.html
2. Click 🔧 Debug → Test Config
3. Should now show: ✅ JWT_SECRET configured (31 chars)
4. Then try Test /users again - should work!

## Verification Screenshots
Look for these in Railway dashboard:
- Variables tab open
- JWT_SECRET listed with value `SuperSecretKey2024Railway123456`
- Build status showing "Running" (green)

## If Still Getting 401 After Adding JWT_SECRET
1. Hard refresh browser: Ctrl+Shift+R
2. Clear localStorage: Open F12 → Application → Local Storage → Clear
3. Reload page
4. Auto-login will run with fresh token
5. Try Test /users again

---

**Note:** The JWT_SECRET must be exactly **31 characters**:
`SuperSecretKey2024Railway123456`

If you use a different secret, tokens won't match!
