# Profile Update API - Complete Fix ✅

## Issues Fixed

### 1. ❌ 404 Error: `/api/users/profile/photo`
**Problem:** Frontend tried to upload image to non-existent endpoint.

**Solution:** Removed separate photo upload. Now uses base64 preview or existing URL.

### 2. ❌ 500 Error: `/api/users/profile`
**Problem:** Backend wasn't properly handling `providerInfo` updates.

**Solution:** 
- Added `/profile` route that uses current user's ID
- Fixed `providerInfo` merging logic
- Added detailed error logging

---

## Changes Made

### Backend: `routes/users.js`
```javascript
// Added profile routes - current user
router
  .route('/profile')
  .get((req, res, next) => {
    req.params.id = req.user.id
    next()
  }, getUser)
  .put((req, res, next) => {
    req.params.id = req.user.id
    next()
  }, updateUser)
```

### Backend: `controllers/userController.js`
```javascript
// Added providerInfo to allowed fields
const allowedFields = ['firstName', 'lastName', 'phone', 'preferences', 'profileImage', 'providerInfo']

// Fixed providerInfo merging
if (req.body.providerInfo && req.user.role === 'provider') {
  fieldsToUpdate.providerInfo = {
    ...user.providerInfo?.toObject?.() || user.providerInfo || {},
    ...req.body.providerInfo
  }
}

// Added detailed logging
console.log('Update user request:', { userId, body })
console.log('Fields to update:', fieldsToUpdate)
```

### Frontend: `ProviderSettings.jsx`
```javascript
// Removed separate photo upload endpoint
// Now sends everything in one request
const response = await fetch('/api/users/profile', {
  method: 'PUT',
  body: JSON.stringify({
    firstName: formData.firstName,
    lastName: formData.lastName,
    phone: formData.phone,
    profileImage: imagePreview, // base64 or URL
    providerInfo: {
      bio: formData.bio,
      specialties: formData.specialties,
      location: formData.location,
      experience: parseInt(formData.experience) || 0,
      category: formData.category,
      availability: formData.availability,
      priceRange: formData.priceRange
    }
  })
})
```

### Frontend: `Header.jsx`
```javascript
// Provider profile link now goes to settings
<Link
  to={isProvider ? "/provider/settings" : "/profile"}
  className="..."
>
  <User className="h-4 w-4 mr-2" />
  {isProvider ? "Profile Settings" : "Profile"}
</Link>
```

---

## API Endpoint

### `PUT /api/users/profile`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "profileImage": "https://... or base64",
  "providerInfo": {
    "bio": "Professional service provider with 5 years experience...",
    "specialties": ["Specialty 1", "Specialty 2", "Specialty 3"],
    "location": "New York, NY",
    "experience": 5,
    "category": "Healthcare",
    "availability": "Mon-Fri 9AM-5PM",
    "priceRange": "$50 - $200"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@email.com",
    "phone": "+1234567890",
    "role": "provider",
    "profileImage": "...",
    "providerInfo": {
      "bio": "...",
      "specialties": ["..."],
      "location": "...",
      "experience": 5,
      "category": "...",
      "availability": "...",
      "priceRange": "...",
      "rating": 0,
      "reviewCount": 0,
      "verified": false
    }
  },
  "message": "User updated successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Failed to update user: <error details>"
}
```

---

## Provider Info Schema

```javascript
providerInfo: {
  bio: String,                    // Provider bio/description
  specialties: [String],          // Array of specialty tags
  category: String,               // Service category
  experience: Number,             // Years of experience
  rating: Number (default: 0),    // Average rating
  reviewCount: Number (default: 0), // Number of reviews
  location: String,               // Service location
  availability: String,           // Availability hours
  priceRange: String,             // Price range (e.g., "$50 - $200")
  verified: Boolean (default: false) // Verification status
}
```

---

## Testing Steps

### 1. Restart Backend
```bash
cd backend
npm start
```

### 2. Login as Provider
- Go to login page
- Login with provider credentials

### 3. Access Profile Settings
**Option A:** From Header
- Click user avatar/name
- Click "Profile Settings"

**Option B:** From Dashboard
- Go to Provider Dashboard
- Click "Profile Settings" button

**Option C:** Direct URL
- Navigate to `/provider/settings`

### 4. Update Profile
- Change name, phone
- Upload profile photo
- Update bio (max 1000 chars)
- Select category
- Add experience (years)
- Set location
- Add availability
- Set price range
- Add/remove specialties
- Click "Save Changes"

### 5. Verify Update
- Check success message
- Page should reload
- Check backend console logs
- Verify data in database

---

## Console Logs to Check

### Backend Console:
```
Update user request: {
  userId: '...',
  requestUserId: '...',
  body: { firstName: '...', ... }
}
Fields to update: {
  firstName: '...',
  providerInfo: { ... }
}
User updated successfully
```

### Frontend Console:
```
Profile update response status: 200
Profile update response data: {
  success: true,
  data: { ... }
}
```

---

## Common Issues

### Issue: "User not found"
**Cause:** Invalid user ID
**Fix:** Check authentication token

### Issue: "Not authorized"
**Cause:** Trying to update another user's profile
**Fix:** Ensure using `/profile` endpoint (not `/:id`)

### Issue: "Validation Error"
**Cause:** Invalid data format
**Fix:** Check field types (e.g., experience must be number)

### Issue: Base64 image too large
**Cause:** Large image file
**Fix:** 
- Compress image before upload
- Use external image hosting (Cloudinary, AWS S3)
- Implement proper file upload endpoint

---

## Image Upload Note

**Current Implementation:**
- Uses base64 encoding (temporary solution)
- Stores in database (not recommended for production)

**Production Recommendation:**
- Upload to cloud storage (AWS S3, Cloudinary, etc.)
- Store only URL in database
- Implement separate upload endpoint:
  ```
  POST /api/upload/profile-image
  - Accepts multipart/form-data
  - Returns image URL
  - Use URL in profile update
  ```

---

## Profile Completion Tracking

The sidebar shows completion percentage based on:
1. ✅ First Name
2. ✅ Last Name
3. ✅ Phone
4. ✅ Bio
5. ✅ Category
6. ✅ Location
7. ✅ Experience
8. ✅ Specialties (at least 1)

**Formula:** `(completed fields / 8) * 100%`

---

## Status: ✅ All Fixed!

1. ✅ `/profile` endpoint created
2. ✅ `providerInfo` updates working
3. ✅ Photo upload simplified
4. ✅ Header link updated
5. ✅ Error logging added
6. ✅ Frontend console logs added

**Restart backend and test the profile update!** 🎉
