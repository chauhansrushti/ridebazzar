================================================================================
🗄️ DATABASE SETUP - MYSQL ON RAILWAY
================================================================================

Railway provides MySQL automatically when you add it.
This guide explains what happens behind the scenes.

================================================================================
WHAT YOU NEED TO KNOW
================================================================================

When you add MySQL service on Railway:
✓ Database is created automatically
✓ User "root" created automatically
✓ Random password generated automatically
✓ All tables created from your schema
✓ Connection is secure and isolated

================================================================================
DATABASE CONNECTION DETAILS
================================================================================

After MySQL is created, you get:

Variable              | Value
──────────────────────┼─────────────────────────────
MYSQL_HOST            | mysql.railway.internal
MYSQL_PORT            | 3306
MYSQL_USER            | root
MYSQL_PASSWORD        | [Random - view in Variables]
MYSQL_DATABASE        | railway

In your backend .env file, these become:
DB_HOST=mysql.railway.internal
DB_USER=root
DB_PASSWORD=[from MYSQL_PASSWORD]
DB_NAME=railway

================================================================================
DATABASE STRUCTURE
================================================================================

Your tables are created from: backend/database/schema.sql

Main tables created:
1. users
   - id (Primary Key)
   - username
   - email
   - password (hashed)
   - phone
   - role (admin/seller/user)

2. cars
   - id (Primary Key)
   - seller_id (Foreign Key → users)
   - make, model, year
   - price, status
   - image_url

3. bookings
   - id (Primary Key)
   - car_id, buyer_id, seller_id
   - booking_amount
   - status (pending/confirmed/cancelled)

4. transactions
   - id (Primary Key)
   - booking_id
   - amount, payment_method, payment_status
   - transaction_id (unique)

5. inquiries
   - id (Primary Key)
   - user_id
   - subject, message
   - status (pending/resolved)

And more...

================================================================================
HOW TO ACCESS DATABASE
================================================================================

From Backend (Automatic):
- Backend connects automatically
- Uses environment variables
- No manual connection needed

From External Tools (For debugging):
If you want to connect to database from outside:

1. In Railway, click MySQL service
2. Find connection string or credentials
3. Use MySQL client:
   - MySQL Workbench
   - HeidiSQL
   - Command line: mysql -h host -u user -p

⚠️ WARNING: Never expose these credentials publicly!

================================================================================
DATABASE INITIALIZATION
================================================================================

When server starts, it:
1. Connects to MySQL
2. Checks if tables exist
3. If not: Creates tables from schema.sql
4. If exist: Verifies schema matches

This is automatic - you don't need to do anything!

================================================================================
BACKUP & RESTORE
================================================================================

Railway handles backups automatically.

If you need to:
- Reset database: Ask Railway support
- Export data: Use MySQL dump
- Import data: Use MySQL restore

For small projects, Railway backups are included.

================================================================================
PERFORMANCE TIPS
================================================================================

For production:
✓ Add indexes to frequently queried columns
✓ Monitor database size
✓ Clean up old data periodically
✓ Use transactions for data integrity

Your current setup:
✓ Foreign keys enforced
✓ Transactions supported
✓ Indexes on primary keys
✓ Ready for 100+ concurrent users

================================================================================
DATABASE LIMITS (Free Tier)
================================================================================

Limit           | Free Tier     | Upgraded
────────────────┼───────────────┼──────────
Storage         | 10GB          | Unlimited
Connections     | 10            | More
Memory          | 256MB         | Unlimited
Users           | 50+           | Unlimited

Current project needs: ~50MB max
Perfect for free tier! ✓

================================================================================
IF DATABASE NEEDS RESET
================================================================================

If you need to reset all data:

1. In Railway dashboard:
   - Click MySQL service
   - Go to "Settings"
   - Look for "Delete" or "Reset"
   - Confirm

2. After reset:
   - All tables deleted
   - New tables auto-created
   - All data lost ⚠️

3. If you need backups:
   - Ask Railway support
   - They can restore from backup

================================================================================
DATABASE MONITORING
================================================================================

To check database health:

In Railway:
1. Click MySQL service
2. Go to "Metrics" or "Monitoring"
3. Check:
   ✓ Storage used
   ✓ Connection count
   ✓ Query performance

If suspicious:
- Database is down: Check status
- Slow queries: Check Logs
- High memory: May need upgrade

================================================================================
COMMON DATABASE ISSUES
================================================================================

Issue: "Can't connect to database"
Fix: Check DB credentials in environment variables

Issue: "Table doesn't exist"
Fix: Schema.sql not executed. Contact support or rerun setup.

Issue: "Too many connections"
Fix: Database limit reached. Upgrade tier or reduce connections.

Issue: "Disk space full"
Fix: Clean old data or upgrade storage.

================================================================================

✅ Your database is set up and ready!

No manual configuration needed - Railway handles it all automatically.

================================================================================
