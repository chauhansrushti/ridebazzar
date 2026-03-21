================================================================================
🔧 TROUBLESHOOTING GUIDE - COMMON ISSUES & SOLUTIONS
================================================================================

Having problems deploying? Find your issue below!

================================================================================
❌ PROBLEM: Build Failed
================================================================================

Error Message:
"Build failed" or showing red status

Checklist:
☐ backend/package.json exists?
☐ backend/server.js exists?
☐ All dependencies listed in package.json?
☐ No syntax errors in JavaScript?

How to fix:
1. Check Logs in Railway dashboard
   - Click your service
   - Go to "Logs" tab
   - Read error message
   - Search Google for the error

2. Common issues:
   - Missing npm module → Run "npm install"
   - Port already in use → Close other apps
   - Wrong Node version → Check package.json

3. If still stuck:
   - Try local first: npm start
   - Fix error locally
   - Push to GitHub
   - Railway auto-rebuilds

================================================================================
❌ PROBLEM: Page Shows 404 Not Found
================================================================================

Error: Cannot reach https://ridebazzar-xxxx.railway.app

Fix:
☐ Add /home.html to URL
   Wrong: https://ridebazzar-xxxx.railway.app
   Right: https://ridebazzar-xxxx.railway.app/home.html

☐ Check status is "Running"
   - If grey/building: Wait more
   - If red: Build failed, check logs

☐ Wait 5 minutes
   - Fresh deployments take time
   - Refresh browser (Ctrl+F5)

================================================================================
❌ PROBLEM: Cannot Connect to Database
================================================================================

Error: "ER_ACCESS_DENIED_FOR_USER" or "Unknown host"

Causes & Fixes:
1. Wrong DB_PASSWORD
   ☐ Copy exact password from MySQL Variables
   ☐ Include any special characters
   ☐ No spaces at beginning/end

2. Wrong DB_HOST
   ☐ Should be: mysql.railway.internal
   ☐ Not: localhost
   ☐ Not: your.railway.app (that's for external)

3. MySQL not ready
   ☐ Wait 5 minutes after creating MySQL
   ☐ Check MySQL status is "Running" (green)
   ☐ Try again

4. Wrong DB_NAME
   ☐ Should be: railway (default name)
   ☐ Check MySQL Variables for exact name

Fix step-by-step:
1. Go to MySQL service → Variables
2. Copy each value exactly:
   - MYSQL_HOST → DB_HOST
   - MYSQL_USER → DB_USER (usually "root")
   - MYSQL_PASSWORD → DB_PASSWORD
   - MYSQL_DATABASE → DB_NAME
3. Update backend service variables
4. Wait 2 minutes for restart
5. Check Logs

================================================================================
❌ PROBLEM: Email Not Sending
================================================================================

Error: "SMTP Error" or emails received in admin but not users

Causes:
1. No Gmail App Password
   ☐ Need 2FA enabled first
   ☐ Create at: https://myaccount.google.com/apppasswords
   ☐ Use 16-character password (remove spaces)

2. Wrong SMTP credentials
   ☐ SMTP_USER = ridebazzar797@gmail.com (exact)
   ☐ SMTP_HOST = smtp.gmail.com (exact)
   ☐ SMTP_PORT = 587 (exact)
   ☐ SMTP_PASS = Your 16-char app password

3. Email turned off in browser
   ☐ Check browser console (F12)
   ☐ Look for email errors
   ☐ Check spam folder

Fix:
1. Setup Gmail 2FA:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification
   - Complete verification process

2. Create App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select Mail + Windows Computer
   - Copy 16-character password (ignore spaces)
   - Save without spaces

3. Update Railway:
   - SMTP_PASS = [your app password]
   - Wait 2 minutes for restart
   - Test again

================================================================================
❌ PROBLEM: API Returns 400/401/500 Errors
================================================================================

Errors in browser console:
- "Unauthorized" (401)
- "Bad Request" (400)  
- "Server Error" (500)

What went wrong:
401 = Login failed
   ☐ Check JWT_SECRET matches
   ☐ Try logout and login again
   ☐ Clear browser cookies (DevTools → Storage → Clear)

400 = Wrong data sent
   ☐ Check required fields in form
   ☐ Check JSON format correct
   ☐ See browser console for details

500 = Server crashed
   ☐ Check backend logs: Railway → Logs tab
   ☐ Error message will be there
   ☐ Fix error and redeploy

How to debug:
1. Press F12 (Developer Tools)
2. Go to "Network" tab
3. Make request that fails
4. Click the request
5. Go to "Response" tab
6. Read error message
7. Search Google for error

================================================================================
❌ PROBLEM: App Works Locally But Fails on Railway
================================================================================

Reason: Environment variables not set

Solution:
☐ Set exact same variables in Railway as your local .env
☐ Check spelling of variable names
☐ Restart service after adding variables
   - Click service
   - Look for "restart" button
   - Or railway auto-restarts

================================================================================
❌ PROBLEM: Deployment Stuck on "Building"
================================================================================

Status: Shows "Building..." for >10 minutes

Fix:
1. Click on your service
2. Check "Logs" tab
3. If last log is several minutes old:
   - Build might be stuck
   - Click "Settings"
   - Look for "Restart" or "Redeploy"
   - Click it

4. If still stuck:
   - Push new commit to GitHub
   - Railway automatically rebuilds

================================================================================
❌ PROBLEM: Service Keeps Restarting
================================================================================

Status: Keeps switching Running → Crashed → Running

Cause: Server keeps crashing

Fix:
1. Check backend Logs
   - Click service → Logs
   - Look for error messages
   - Most recent error
   - Read it carefully

2. Common causes:
   - Database not connected → Check DB variables
   - Missing npm modules → Check package.json
   - Port in use → Change PORT variable
   - Syntax error in code → Fix and redeploy

3. If unsure:
   - Test locally first
   - Run: cd backend && node server.js
   - Fix any errors
   - Push to GitHub
   - Railway rebuilds

================================================================================
✅ QUICK DIAGNOSIS CHECKLIST
================================================================================

Before asking for help, check:

☐ All services showing green "Running"?
☐ Can see latest deployment in Logs?
☐ All environment variables set?
☐ Database created and running?
☐ Frontend URL correct with /home.html?
☐ Email credentials correct?
☐ Browser console shows no red errors (F12)?
☐ Tried refreshing page (Ctrl+F5)?
☐ Tried waiting 5 minutes?
☐ Tried locally first?

================================================================================
🆘 STILL STUCK?
================================================================================

1. Google the error message
2. Check Railway docs: https://docs.railway.app
3. Ask on Railway Discord: https://discord.gg/railway
4. Review STEP-BY-STEP.md again

Most issues can be fixed by:
- Waiting 5 minutes
- Checking environment variables
- Reading the Logs carefully
- Testing locally first

You've got this! 💪

================================================================================
