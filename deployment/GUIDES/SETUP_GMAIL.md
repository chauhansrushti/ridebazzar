================================================================================
📧 SETUP GMAIL APP PASSWORD - STEP BY STEP
================================================================================

Gmail requires an "App Password" for email to work on Railway.

This 16-character password is different from your normal Gmail password.

================================================================================
STEP 1: CHECK IF 2FA IS ENABLED
================================================================================

Go to: https://myaccount.google.com/security

Look for "2-Step Verification":
✓ If it says "Status: On" → Continue to Step 2
✗ If it says "Status: Off" → Do Steps 1a, 1b, 1c first

STEP 1a: Enable 2-Step Verification
- On Security page
- Find "2-Step Verification"
- Click "Get Started"
- Verify your phone number
- Confirm you want to enable

STEP 1b: Complete verification
- Google sends verification code to your phone
- Enter the code
- Click "Next"

STEP 1c: Save backup codes
- Google shows 10 backup codes
- Save these somewhere safe
- Click "Done"

✅ 2FA is now enabled

================================================================================
STEP 2: GO TO APP PASSWORDS PAGE
================================================================================

Go to: https://myaccount.google.com/apppasswords

You should see a dropdown menu at the top.

================================================================================
STEP 3: SELECT APP & DEVICE
================================================================================

The page should show:
- Select the app: [Dropdown]
- Select the device: [Dropdown]

ACTION:
Click first dropdown → Select "Mail"

Click second dropdown → Select "Windows Computer"

(Don't worry if exact options differ - pick closest)

================================================================================
STEP 4: GENERATE PASSWORD
================================================================================

After selecting:
- Click "Generate" button
- OR click "Create" button
- Depends on your Gmail interface

Google will show a 16-character password like:
```
abcd efgh ijkl mnop
```

================================================================================
STEP 5: COPY THE PASSWORD
================================================================================

⚠️ IMPORTANT: Copy exactly as shown

Google shows it with spaces:
```
abcd efgh ijkl mnop
```

WHEN YOU USE IT: Remove the spaces!
```
abcdefghijklmnop
```

Copy without spaces to Railway.

================================================================================
STEP 6: USE IN RAILWAY
================================================================================

In Railway Dashboard:
1. Go to your backend service → Variables
2. Add new variable:
   - Name: SMTP_PASS
   - Value: [paste 16 character password WITHOUT SPACES]

Example:
SMTP_PASS=abcdefghijklmnop

3. Click "Save" or "Add"
4. Wait 2 minutes for service to restart

✅ Email should now work!

================================================================================
VERIFY IT WORKS
================================================================================

Test by:
1. Create a booking
2. Complete payment
3. Check your email inbox
4. You should get confirmation email

If no email:
- Check spam folder
- Check all environment variables are correct
- See TROUBLESHOOTING.md

================================================================================
IMPORTANT REMINDERS
================================================================================

✓ Save this password somewhere safe
✗ Don't share this password with anyone
✓ This password is only for Railway
✗ It's NOT your Gmail password
✓ If you lose it, you can generate a new one
✓ You can revoke it anytime: https://myaccount.google.com/apppasswords

================================================================================

🎉 You're all set! Email will now work on your Railway deployment!

================================================================================
