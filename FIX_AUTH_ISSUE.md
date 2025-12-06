# Fix Authentication Issue - 401 Unauthorized

## Problem
Getting 401 Unauthorized errors because the stored authentication token is expired or invalid.

## Quick Fix

### Option 1: Clear Browser Storage (Recommended)
1. Open browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Local Storage** → `http://localhost:3001`
4. Click **Clear All** or delete these keys:
   - `token`
   - `user`
5. Refresh the page (F5)
6. Log in again

### Option 2: Use Incognito/Private Mode
1. Open a new Incognito/Private window
2. Go to `http://localhost:3001`
3. Log in fresh

### Option 3: Logout and Login
1. Click your profile/logout button
2. Log in again with your credentials

---

## Why This Happens

The JWT token stored in localStorage has expired. The backend is rejecting it with 401 Unauthorized.

**Common causes:**
- Token expired (JWT has expiration time)
- Backend was restarted and secret changed
- Token format changed
- Database user was modified

---

## After Logging In

You should be able to:
- ✅ Book services (modal will work)
- ✅ See provider services
- ✅ View your bookings
- ✅ Access dashboard

---

## For Provider Users

If you're logged in as a provider:
1. Go to Dashboard
2. You should see:
   - Pending bookings
   - Today's bookings
   - Your services list
3. Click "My Services" in navigation
4. You should see all your services

---

## For Customer Users

If you're logged in as a customer:
1. Browse services at `/services`
2. Click any service
3. Click "Book Now"
4. Fill the modal (date, time, notes)
5. Submit booking
6. You'll be redirected to My Bookings

---

## Checking Provider Services

To see services of a specific provider:
1. Go to `/providers`
2. Click on a provider card
3. Scroll down to "Services Offered" section
4. Click any service to book it

---

**Quick Steps:**
1. Clear localStorage
2. Refresh page
3. Login again
4. Everything should work!
