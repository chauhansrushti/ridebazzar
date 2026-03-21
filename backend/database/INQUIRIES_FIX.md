# Fix for Contact Seller - 500 Error

## Problem
When clicking "Send Inquiry", you're getting a 500 Internal Server Error. This is likely because the `inquiries` table hasn't been created in your MySQL database yet.

## Solution

### Step 1: Create the Inquiries Table
You need to run the SQL script to create the inquiries table. Choose ONE of these methods:

#### Option A: Using MySQL Command Line
1. Open Command Prompt/PowerShell
2. Navigate to: `c:\srushti\rideBazzar\RideBazzar-Complete\backend\database`
3. Run:
```bash
mysql -u root -p ridebazzar < create-inquiries-table.sql
```
(Enter your MySQL password when prompted)

#### Option B: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. Open the file: `backend/database/create-inquiries-table.sql`
4. Execute the script (Ctrl+Shift+Enter or click the lightning bolt)

#### Option C: Direct SQL
1. Open MySQL client connected to `ridebazzar` database
2. Copy and paste the contents of `backend/database/create-inquiries-table.sql`
3. Execute it

### Step 2: Verify the Table
After creating the table, verify it was created:
```sql
SHOW TABLES LIKE 'inquiries';
DESC inquiries;
```

### Step 3: Restart Backend Server
After creating the table, restart your Node.js backend:
1. Stop the current server (Ctrl+C in terminal)
2. Run: `node server.js` from the backend directory

### Step 4: Test Again
1. Go to a car details page
2. Click "Contact Seller"
3. Fill in message and phone
4. Click "Send Inquiry"
5. You should see a success message!

## How to Check Backend Logs
The backend will now show detailed logs when you submit an inquiry:
```
Inquiry submission received: { userId, username, carId, message, phone }
Car found: { id, seller_id }
Creating inquiry: { carId, userId, seller_id, message, phone }
Inquiry created successfully: { inquiryId }
```

## If You Still Get Errors
Check the backend terminal for detailed error messages. Common issues:
1. **Table doesn't exist**: Follow Step 1 above
2. **"User ID not found in token"**: Make sure you're logged in with the API version (use the login form)
3. **"Car not found"**: The car ID might be invalid
4. **Foreign key errors**: Make sure the users and cars tables exist

## Database Structure
The inquiries table contains:
- `id`: Unique inquiry ID
- `car_id`: Which car the inquiry is about
- `buyer_id`: Who is inquiring (user ID from users table)
- `seller_id`: Who owns the car (user ID from users table)
- `message`: The inquiry message
- `phone`: Buyer's contact number
- `status`: pending/responded/closed
- `created_at` / `updated_at`: Timestamps
