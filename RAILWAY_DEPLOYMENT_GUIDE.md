================================================================================
RIDEBAZZAR - RAILWAY.APP DEPLOYMENT GUIDE
================================================================================

GitHub Username: chauhansrushti
Deployment Platform: Railway.app
Total Setup Time: ~15 minutes

================================================================================
PART 1: SETUP GITHUB REPOSITORY
================================================================================

Step 1: Create a GitHub repo
- Go to https://github.com/new
- Repository name: ridebazzar
- Description: "RideBazzar - Car Booking Platform"
- Make it PUBLIC
- Click "Create repository"

Step 2: Push your code to GitHub
Open PowerShell in your project folder and run:

```powershell
cd "C:\Users\DELL\OneDrive\Desktop\final rb\RideBazzar-Complete"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - RideBazzar project ready for deployment"

# Add remote origin
git remote add origin https://github.com/chauhansrushti/ridebazzar.git

# Push to main branch
git branch -M main
git push -u origin main
```

Your GitHub repo is now at: https://github.com/chauhansrushti/ridebazzar

================================================================================
PART 2: SETUP RAILWAY.APP
================================================================================

Step 1: Sign up on Railway
- Go to https://railway.app
- Click "Start Project"
- Select "Deploy from GitHub"
- Accept permissions

Step 2: Connect GitHub Account
- Click "GitHub" login option
- Authorize Railway to access your GitHub repos
- Select your "ridebazzar" repository

Step 3: Create New Railway Project
- Click "New Project"
- Select "Deploy from Repo"
- Choose "chauhansrushti/ridebazzar"
- Click "Deploy Now"

Railway will now:
✅ Create a project
✅ Build your backend
✅ Deploy your app
✅ Give you a live URL

Step 4: Get Your Live URL
- Go to "Deployments" tab
- Find the deployment
- Click to see "Service Domains"
- Your URL will be like: https://ridebazzar-xxxx.railway.app

Copy this URL! You'll need it for the next steps.

================================================================================
PART 3: SETUP DATABASE (MySQL on Railway)
================================================================================

Step 1: Add Database Service
- In Railway dashboard for your project
- Click "Create" or "Add Service"
- Select "MySQL"
- Choose default settings
- Click "Create"

Step 2: Get Database Credentials
- Click the MySQL service
- Go to "Variables" tab
- You'll see:
  - MYSQL_URL (full connection string)
  - MYSQL_HOST
  - MYSQL_USER
  - MYSQL_PASSWORD
  - MYSQL_DATABASE

Copy these values.

Step 3: Connect Backend to Database
You need to set environment variables in Railway:

In Railway Dashboard:
1. Click your "ridebazzar" backend service
2. Go to "Variables" tab
3. Add these variables:

```
DB_HOST = mysql.railway.internal
DB_USER = root
DB_NAME = railway
DB_PASSWORD = [copy from MYSQL_PASSWORD]
PORT = 3000
NODE_ENV = production
JWT_SECRET = your_secret_key_here_change_this
FRONTEND_URL = https://ridebazzar-xxxx.railway.app
```

Example values:
```
DB_HOST=mysql.railway.internal
DB_USER=root
DB_PASSWORD=aBcDeF123456...
DB_NAME=railway
DB_PORT=3306
NODE_ENV=production
PORT=3000
JWT_SECRET=super_secret_key_2024_railway_prod
FRONTEND_URL=https://ridebazzar-prod.railway.app
SMTP_HOST=smtp.gmail.com
SMTP_USER=ridebazzar797@gmail.com
SMTP_PASS=your_app_password
```

Step 4: Railroad Migration (Create Tables)
Your MySQL tables should be created automatically. If not:

1. In Railway, get MySQL connection:
   - MYSQL_URL format: mysql://root:password@mysql.railway.internal:3306/railway

2. Use a MySQL client to connect and run schema:
   ```sql
   -- This should already be in your backend/database/schema.sql
   -- If needed, execute that file
   ```

Or just let Railway auto-run the migrations.

================================================================================
PART 4: SETUP EMAIL (Gmail SMTP)
================================================================================

Your email is already configured in .env, but needs an App Password:

Step 1: Enable 2-Factor Authentication on Gmail
- Go to https://myaccount.google.com/security
- Scroll down to "2-Step Verification"
- Click "Get Started"
- Follow verification

Step 2: Create Gmail App Password
- Go to https://myaccount.google.com/apppasswords
- Select "Mail" and "Windows Computer"
- Google will generate a 16-character password
- Copy it

Step 3: Add to Railway
In Railway Dashboard → Backend Variables:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ridebazzar797@gmail.com
SMTP_PASS=[paste_16_char_password_here]
```

Example (NOT real password):
SMTP_PASS=abcd efgh ijkl mnop

================================================================================
PART 5: DEPLOY FRONTEND
================================================================================

Your frontend (HTML/CSS/JS) is already included in the same repo!

When Railway deploys:
1. ✅ Backend API serves at: https://ridebazzar-xxxx.railway.app/api
2. ✅ Frontend pages served at: https://ridebazzar-xxxx.railway.app/

All API calls automatically use the correct URL because of config.js

Frontend pages will be available at:
- https://ridebazzar-xxxx.railway.app/index.html
- https://ridebazzar-xxxx.railway.app/dashboard.html
- https://ridebazzar-xxxx.railway.app/car-details.html
- etc.

NO separate Netlify needed! Everything is in one Railway deployment.

================================================================================
PART 6: VERIFY DEPLOYMENT
================================================================================

Test your live app:

1. Open in browser:
   https://ridebazzar-xxxx.railway.app/index.html

2. Test API health:
   https://ridebazzar-xxxx.railway.app/api/health

3. Test login:
   - Go to /login.html
   - Try logging in with test account
   - Should show "Redirecting to dashboard"

4. Test payment flow:
   - Browse cars
   - Click a car → "Book Now"
   - Complete booking → Payment
   - Check email for confirmation

5. Check logs in Railway:
   - Click "Deployments"
   - Click latest deployment
   - View "Logs" to debug issues

================================================================================
PART 7: IMPORTANT REMINDERS
================================================================================

✅ DO:
1. Keep .env.production values safe (don't commit to GitHub)
2. Never share JWT_SECRET or email password
3. Use strong passwords for database
4. Monitor Railway dashboard for service status
5. Test all features before sharing app link

❌ DON'T:
1. Commit .env files to GitHub
2. Use localhost URLs in production
3. Hardcode sensitive data in code
4. Share API keys publicly

================================================================================
PART 8: TROUBLESHOOTING
================================================================================

Problem: "Cannot connect to database"
Solution:
- Check DB_HOST = mysql.railway.internal (not localhost)
- Check DB_PASSWORD is correct
- Wait 5 minutes for Railway to provision MySQL

Problem: "App keeps crashing"
- Check Railway Logs for errors
- Verify NODE_ENV = production
- Check PORT = 3000

Problem: "Email not sending"
- Verify SMTP credentials in Railway Variables
- Check if 2FA enabled and App Password created
- Test with: node -e "require('./backend/utils/email.js')"

Problem: "Frontend showing 404"
- Make sure server.js serves static files
- Check if express.static('.')  is configured
- Restart deployment

Problem: "CORS errors in frontend"
- Add FRONTEND_URL to .env
- Ensure backend has CORS headers
- Check API requests use correct domain

================================================================================
PART 9: NEXT STEPS
================================================================================

After deployment is live:

1. Share your app link with users:
   https://ridebazzar-xxxx.railway.app

2. Monitor and scale:
   - Watch Railway dashboard for usage
   - Upgrade if you exceed free tier
   - Add more team members as needed

3. Maintenance:
   - Set up GitHub Auto-deploy (Railway does this by default)
   - Push updates to GitHub → Railway auto-deploys
   - No manual deployment needed

4. Analytics:
   - Monitor database size
   - Check API response times
   - Review user activity in logs

5. Production Checklist:
   ☐ SSL certificate active (Railway provides free)
   ☐ Database backups enabled
   ☐ Email notifications working
   ☐ Payment gateway configured (Razorpay)
   ☐ Admin account created
   ☐ Custom domain configured (optional)

================================================================================
SUPPORT & RESOURCES
================================================================================

Railway Documentation: https://docs.railway.app
GitHub Docs: https://docs.github.com
MySQL Docs: https://dev.mysql.com/doc
Node.js/Express: https://expressjs.com

Questions? Check these resources first!

================================================================================
YOUR DEPLOYMENT CHECKLIST
================================================================================

☐ 1. Created GitHub repo: https://github.com/chauhansrushti/ridebazzar
☐ 2. Pushed code to GitHub
☐ 3. Created Railway account at railway.app
☐ 4. Connected GitHub to Railway
☐ 5. Created new Railway project from repo
☐ 6. Added MySQL service to Railway
☐ 7. Set environment variables (DB, API, Email)
☐ 8. Created Gmail App Password
☐ 9. Set SMTP credentials in Railway
☐ 10. Deployment successful (check Railway status)
☐ 11. Tested login page
☐ 12. Tested car browsing
☐ 13. Tested booking & payment flow
☐ 14. Verified email notifications sent
☐ 15. Shared live URL: https://ridebazzar-xxxx.railway.app

================================================================================

CONGRATULATIONS! Your RideBazzar app is now live!

Live URL: https://ridebazzar-xxxx.railway.app
GitHub: https://github.com/chauhansrushti/ridebazzar
Admin: ridebazzar797@gmail.com

Ready for your faculty presentation? 🚀

================================================================================
