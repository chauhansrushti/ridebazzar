================================================================================
✅ ADMIN PANEL - COMPLETE FUNCTION TEST CHECKLIST
================================================================================

Test all admin panel functions here. Check each one carefully.

DATE: March 21, 2026
BACKEND: Running on http://localhost:5000
FRONTEND: http://localhost:3000 or file://

================================================================================
PREPARATION
================================================================================

Before testing:
☐ Admin backend is running (npm start in backend folder)
☐ Logged in as admin user
☐ Database has test data (5 cars, 2 bookings added)
☐ Browser console open (F12) to see any errors

Admin Credentials:
- Username: admin
- Or any user with role='admin' in database

================================================================================
1. DASHBOARD LOADING
================================================================================

Test: Dashboard loads correctly
☐ Admin page loads without errors
☐ See sidebar with menu options
☐ See admin name displayed
☐ Statistics section visible

Expected: All visual elements load, no red console errors

================================================================================
2. STATISTICS SECTION
================================================================================

Test: Dashboard statistics update
☐ Click "Dashboard" in sidebar
☐ See statistics cards showing:
  - Total Users
  - Total Cars
  - Total Bookings
  - Revenue

✓ Expected Numbers:
  - Total Users: Should show number of users in database
  - Total Cars: Should show 5 (from test data)
  - Total Bookings: Should show 2 (from test data)
  - Revenue: Should show amount from confirmed bookings

Actual Numbers:
  - Total Users: _______
  - Total Cars: _______
  - Total Bookings: _______
  - Revenue: _______

☐ Numbers match expected? YES / NO

================================================================================
3. USERS SECTION
================================================================================

Test: Load and display all users
☐ Click "Users" in sidebar
☐ See table with list of all users
☐ Each user row shows:
  - Username
  - Email
  - Phone
  - Role (admin, seller, user)
  - Registration date
  - View / Delete buttons

☐ Can search users by typing in search box
☐ Search results filter correctly

Troubleshoot if not working:
- Check F12 Console for API errors
- Is /api/auth/users returning data?
- Is Authorization token valid?

================================================================================
4. CARS SECTION
================================================================================

Test: Load and display all cars
☐ Click "Cars" in sidebar
☐ See table with all cars in database
☐ Each car row shows:
  - Car image (if available)
  - Make & Model
  - Year
  - Price
  - Status (available/sold/pending)
  - Seller name
  - Actions (View/Edit/Delete)

☐ "Total Cars" should show: 5 (from test data)

Car Search & Filter:
☐ Can search cars by name/model in search box
☐ Can filter by status (available/sold/all)
☐ Filter and search work together

Status Filter Options:
☐ All - Shows all 5 cars
☐ Available - Shows 3 cars
☐ Sold - Shows 2 cars

✓ Test Results: PASS / FAIL
If FAIL, check console error at F12

================================================================================
5. BOOKINGS SECTION
================================================================================

Test: View all bookings
☐ Click "Bookings" in sidebar
☐ See table with bookings
☐ Each booking shows:
  - Booking ID
  - Car details
  - Buyer name
  - Seller name
  - Booking amount
  - Status (pending/confirmed/cancelled)
  - Date

✓ Expected: 2 bookings from test data

Count: How many bookings shown? _______

Troubleshoot if not working:
- Check /api/bookings/admin/all-bookings endpoint
- Is admin authorized to see all bookings?

================================================================================
6. PAYMENTS SECTION
================================================================================

Test: View transaction details
☐ Click "Payments" in sidebar
☐ See table with payment transactions
☐ Each transaction shows:
  - Transaction ID
  - Booking ID
  - User
  - Amount
  - Payment method (card/UPI/etc)
  - Status (pending/success/failed)
  - Date

✓ Expected: At least 2 confirmed payment transactions

Count: How many transactions shown? _______

☐ Transactions show correct amounts
☐ Status shows correctly

================================================================================
7. REPORTS SECTION
================================================================================

Test: Generate Sales Report
☐ Click "Reports" in sidebar
☐ See three report buttons:
  1. Sales Report
  2. User Activity Report
  3. Inventory Report

Test 7.1: Sales Report
☐ Click "Sales Report" → "Generate"
☐ Modal opens showing report

Expected Report Data:
  ✓ Total Cars Sold: 2
  ✓ Total Revenue: ₹27,00,000 (approximately)
  ✓ Confirmed Bookings: 2

Actual Report Data:
  - Total Cars Sold: _______
  - Total Revenue: _______
  - Confirmed Bookings: _______

☐ Data matches? YES / NO
☐ Report displays list of sold cars

Test 7.2: User Activity Report
☐ Click "User Activity Report" → "Generate"
☐ Modal opens showing:
  - Total Users: Should match number in database
  - Active Users (last 30 days): Should show count
  - New Users This Month: Should show count
  - Total Bookings: Should show 2
  - Recent registrations table below

Actual Data:
  - Total Users: _______
  - Active Users: _______
  - New Users This Month: _______
  - Total Bookings: _______

☐ Data correct? YES / NO

Test 7.3: Inventory Report
☐ Click "Inventory Report" → "Generate"
☐ Modal opens showing:
  - Total Inventory: Should show 5
  - Available Cars: Should show 3
  - Sold Cars: Should show 2
  - Total Value: Sum of all car prices

Actual Data:
  - Total Inventory: _______ (Expected: 5)
  - Available Cars: _______ (Expected: 3)
  - Sold Cars: _______ (Expected: 2)
  - Total Value: _______ (Expected: ~₹56.5 lakhs)

☐ All numbers correct? YES / NO

================================================================================
8. ANALYTICS SECTION
================================================================================

Test: View analytics charts
☐ Click "Analytics" in sidebar
☐ Should see charts/graphs (may take a moment to load)

Expected Charts:
☐ Car Status Chart - Shows pie chart with available/sold/pending
☐ Sales Trend Chart - Shows sales over time
☐ Revenue Chart - Shows revenue over time
☐ Brand Chart - Shows cars by make/brand
☐ User Growth Chart - Shows user growth

✓ All charts visible and rendering? YES / NO

If charts not showing:
- Wait 3-5 seconds for Chart.js to load
- Check F12 console for JavaScript errors
- Ensure database has test data

================================================================================
9. MODAL/POPUP CLOSING
================================================================================

Test: Close buttons work
☐ Open any report (Sales/User/Inventory)
☐ Click "Close" button
☐ Modal closes properly

☐ Can also click outside modal to close? Try it

✓ Closing works properly? YES / NO

================================================================================
10. CONSOLE ERRORS CHECK
================================================================================

Check browser console for errors:
☐ Press F12
☐ Go to Console tab
☐ Look for red error messages
☐ Look for 404 messages

Common Issues:
- 404 /api/auth/users - Check auth routes
- 404 /api/cars - Check car routes
- 404 /api/bookings/admin/all-bookings - Check booking routes
- Authorization errors - Check JWT token

Errors Found: ____________________________________________

================================================================================
SUMMARY
================================================================================

Overall Admin Panel Status:

✓ Dashboard: ___/5 functions working
✓ Users Section: ___/5 functions working
✓ Cars Section: ___/5 functions working
✓ Bookings Section: ___/5 functions working
✓ Payments Section: ___/5 functions working
✓ Reports Section: ___/3 reports working
✓ Analytics Section: ___/5 charts working

TOTAL FUNCTIONS TESTED: 33
FUNCTIONS WORKING: ____
FUNCTIONS BROKEN: ____

Status: READY FOR DEPLOYMENT / NEEDS FIXES

================================================================================
IF SOMETHING ISN'T WORKING
================================================================================

1. Check browser console (F12 → Console tab)
2. Look for error messages
3. Check backend logs (npm start terminal)
4. Most common issues:
   - API endpoint not found (404)
   - Authorization failed
   - Database query error
   - Network timeout

Next Steps:
- Fix broken functions
- Re-run this checklist
- Deploy to Railway when all working

================================================================================
