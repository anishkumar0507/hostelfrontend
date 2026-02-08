# 403 Forbidden Error - Solution Guide

## Problem
If you see **"Access denied. You do not have permission to perform this action. Your session may have expired. Please logout and login again."** errors, it means your current authentication token is outdated.

## Root Cause
When you logged in before, your token may not have included your role information. The backend now requires fresh tokens with role information for authorization checks.

## Solution

### Quick Fix (Recommended)
1. **In the app**: Click the **Logout** button in the sidebar
2. **Refresh the page** (press F5 or Ctrl+R)
3. **Login again** with your credentials
4. You should now have access to all features

### Manual Fix (If needed)
If the logout button doesn't work or you want to manually clear the token:

1. **Open DevTools**: Press `F12` in your browser
2. **Go to Storage**: Click on "Application" or "Storage" tab
3. **Find LocalStorage**: Click on your current domain
4. **Delete the token**: 
   - Find the key `user_token`
   - Right-click and delete it, OR
   - Find the key `user_role`  
   - Right-click and delete it
5. **Refresh the page**: Press F5
6. **Login again**: Use your email and password

### Browser-Specific Steps

**Chrome/Edge:**
- Press F12 â†’ Application â†’ LocalStorage â†’ select your domain â†’ delete `user_token`

**Firefox:**
- Press F12 â†’ Storage â†’ Local Storage â†’ select your domain â†’ delete `user_token`

**Safari:**
- Press Cmd+Option+I â†’ Storage â†’ Local Storage â†’ select your domain â†’ delete `user_token`

## Testing After Fix
After logging in again, you should be able to:
- **Parents**: View child's location, fees, entry-exit logs, chat with warden
- **Wardens**: View student list, manage chat, view all student data
- **Students**: View dashboard, submit requests, chat with warden

## Automatic Token Clearing
The system now **automatically clears invalid tokens** when it detects a 403 error. After seeing the error message, you can:
1. Click the logout button if available
2. Or manually clear the token as described above
3. Then login again with fresh credentials

## If Problem Persists
1. Verify your email and password are correct
2. Ensure you're using the correct portal (student/parent/warden)
3. Check that the backend server is running on https://hostelbackend-98mc.onrender.com
4. Contact your administrator if the issue continues

