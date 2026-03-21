================================================================================
✅ DEPLOYMENT CHECKLIST - PRINT THIS & CHECK OFF AS YOU GO
================================================================================

GitHub: chauhansrushti
Deploying: RideBazzar
Platform: Railway.app

Print this page and check off each item!

================================================================================
STEP 1: GITHUB SETUP (5 minutes) ☐
================================================================================

☐ Open PowerShell in project folder
☐ Run: git add .
☐ Run: git commit -m "Deploy to Railway"
☐ Run: git push -u origin main
☐ Verify on GitHub: https://github.com/chauhansrushti/ridebazzar


STEP 2: RAILWAY ACCOUNT (2 minutes) ☐
================================================================================

☐ Go to https://railway.app
☐ Click "Start Project"
☐ Click "Continue with GitHub"
☐ Authorize Railway access
☐ Have Railway account open in browser


STEP 3: CREATE PROJECT (2 minutes) ☐
================================================================================

☐ Click "New Project" in Railway
☐ Select "Deploy from GitHub"
☐ Select repo: chauhansrushti/ridebazzar
☐ Click "Deploy Now"
☐ Wait for build (2-3 minutes)
☐ Status shows "Running" ✓


STEP 4: ADD DATABASE (2 minutes) ☐
================================================================================

☐ In Railway project, click "Create"
☐ Select "Add Service"
☐ Choose "MySQL"
☐ Click "Create"
☐ Wait for MySQL to provision (1-2 min)
☐ MySQL status shows "Running" ✓


STEP 5: GET CREDENTIALS (2 minutes) ☐
================================================================================

☐ Click MySQL service
☐ Go to "Variables" tab
☐ Note down these values:
   ☐ MYSQL_HOST
   ☐ MYSQL_USER
   ☐ MYSQL_PASSWORD  ← IMPORTANT: Copy this!
   ☐ MYSQL_DATABASE
   ☐ MYSQL_PORT


STEP 6: SET ENVIRONMENT VARIABLES (2 minutes) ☐
================================================================================

DATABASE VARIABLES:
☐ DB_HOST = mysql.railway.internal
☐ DB_USER = root
☐ DB_PASSWORD = [paste from MySQL]
☐ DB_NAME = railway
☐ DB_PORT = 3306

PRODUCTION VARIABLES:
☐ NODE_ENV = production
☐ PORT = 3000
☐ JWT_SECRET = SuperSecretKey2024Railway123456

FRONTEND VARIABLE:
☐ FRONTEND_URL = [Will update after Step 7]

EMAIL VARIABLES (Gmail):
☐ SMTP_HOST = smtp.gmail.com
☐ SMTP_PORT = 587
☐ SMTP_USER = ridebazzar797@gmail.com
☐ SMTP_PASS = [Your Gmail App Password]

GMAIL APP PASSWORD:
If you don't have one, create it:
   ☐ Go to: https://myaccount.google.com/apppasswords
   ☐ Have 2FA enabled? IF NO: Enable at Security settings
   ☐ Select: Mail
   ☐ Select: Windows Computer
   ☐ Google generates 16-character password
   ☐ Copy it → Paste as SMTP_PASS

✓ All environment variables set


STEP 7: GET LIVE URL (1 minute) ☐
================================================================================

☐ Click on "ridebazzar" backend service
☐ Look for "Service URL" or "Domain"
☐ Copy the URL: https://ridebazzar-[random].railway.app
☐ Update FRONTEND_URL variable with this URL
☐ URL is saved and noted: ___________________________________


STEP 8: VERIFY DEPLOYMENT (1 minute) ☐
================================================================================

☐ Check "ridebazzar" service: Status = Running ✓
☐ Check "mysql" service: Status = Running ✓
☐ Click "ridebazzar" → "Logs" tab
☐ Look for error messages (should be none)
☐ See "Server running on port 3000" ✓


STEP 9: TEST LIVE APP (5 minutes) ☐
================================================================================

TEST FRONTEND:
☐ Open: https://[your-url]/home.html
☐ Page loads ✓
☐ Browse cars works ✓
☐ Search works ✓
☐ Click car → details show ✓

TEST LOGIN:
☐ Go to /login.html
☐ Enter credentials
☐ Click login
☐ Redirects to dashboard ✓

TEST BOOKING:
☐ Browse a car
☐ Click "Book Now"
☐ Form shows ✓
☐ Can enter details ✓

TEST DASHBOARD:
☐ Logged in
☐ Click "Dashboard"
☐ Shows profile & bookings ✓

TEST CONSOLE:
☐ Press F12 (Developer Tools)
☐ Go to "Console" tab
☐ No red error messages ✓
☐ See "CONFIG Loaded [PRODUCTION]" ✓
☐ See API Base URL ✓


STEP 10: SHARE YOUR APP (1 minute) ☐
================================================================================

☐ Copy live URL
☐ Send to team members for testing
☐ Send to faculty for presentation
☐ Update GitHub README (optional)


================================================================================
TROUBLESHOOTING CHECKLIST
================================================================================

If build fails:
☐ Check backend/package.json exists
☐ Check backend/server.js exists
☐ View Railway Logs for error details

If page shows 404:
☐ Add /home.html to end of URL
☐ Check status is "Running"
☐ Wait 5 minutes, try again

If cannot connect database:
☐ Check DB_HOST = mysql.railway.internal
☐ Check DB_PASSWORD is exactly correct
☐ Wait 5 minutes for MySQL provision

If email not sending:
☐ Have 2FA enabled on Gmail? IF NO: Enable it
☐ Have Gmail App Password created? IF NO: Create
☐ SMTP_PASS = 16 characters (with spaces removed)

If API errors 401/401:
☐ Check JWT_SECRET matches
☐ Try logging out and in again
☐ Check browser cookies haven't expired


================================================================================
FINAL CHECKLIST - BEFORE PRESENTING
================================================================================

☐ All services running (green status)
☐ Frontend loads without errors
☐ Login functionality works
☐ Can browse cars
☐ Can create bookings
☐ Dashboard shows data
☐ No console errors (F12)
☐ Email notifications working
☐ URL is sharable and works
☐ Backup: Local version still works


================================================================================
DEPLOYMENT SUMMARY
================================================================================

Time taken:          15-20 minutes
Cost:                FREE! $0 (included in $5/month)
Services deployed:   3 (Frontend, Backend, Database)
Status:              LIVE & PRODUCTION READY ✓

Your Live URL: _________________________________________

Share this URL with: ☐ Team  ☐ Faculty  ☐ Presentation

================================================================================

🎉 CONGRATS! Your RideBazzar app is LIVE! 🚀

Ready for your presentation!

================================================================================
