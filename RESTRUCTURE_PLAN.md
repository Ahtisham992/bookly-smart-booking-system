# Project Restructuring Plan

## 🎯 New User Flows

### Provider Flow:
1. **Register** as provider → Auto-login → Provider Dashboard
2. **Add Services** → Services appear in public services list
3. **Dashboard** shows:
   - Pending bookings (to accept/reject)
   - Upcoming bookings (accepted)
   - Completed bookings
   - My services list
4. **Manage Bookings**:
   - Accept/Reject pending bookings
   - Mark as completed
   - Cancel bookings (customer gets notified)
5. **Manage Services**:
   - View only MY services
   - Edit MY services
   - Delete MY services

### Customer Flow:
1. **Register** as customer → Auto-login → Customer Dashboard
2. **Browse**:
   - View all providers
   - View all services
   - Search services
3. **Book Service**:
   - Click on service card → Service Detail page
   - Click "Book Now" button
   - Fill booking form (date, time, notes)
   - Submit booking
4. **Dashboard** shows:
   - My upcoming bookings
   - My past bookings
   - Quick actions
5. **Manage Bookings**:
   - View booking details
   - Cancel bookings
   - Leave reviews after completion

### Guest Flow (Not Logged In):
1. **Home Page** - Marketing page with features
2. **Can view**:
   - Services list (read-only)
   - Providers list (read-only)
3. **Cannot**:
   - Book services
   - See dashboards
4. **Actions**:
   - Login
   - Register

---

## 📁 File Structure Changes

### Keep:
- ✅ `/pages/Auth/Login.jsx`
- ✅ `/pages/Auth/Register.jsx`
- ✅ `/pages/Home/Home.jsx` (modify for guest only)
- ✅ `/pages/Services/Services.jsx`
- ✅ `/pages/Services/ServiceDetail.jsx` (add booking form)
- ✅ `/pages/Providers/Providers.jsx`
- ✅ `/components/services/ServiceCard.jsx`
- ✅ `/components/services/ServiceForm.jsx`
- ✅ `/components/layout/Navbar.jsx` (modify for role-based nav)

### Modify:
- 🔄 `/pages/Dashboard/Dashboard.jsx` → Customer Dashboard
- 🔄 `/pages/Dashboard/ProviderDashboard.jsx` → Provider Dashboard
- 🔄 `/pages/Services/ServiceDetail.jsx` → Add booking form
- 🔄 `/components/layout/Navbar.jsx` → Role-based navigation

### Remove:
- ❌ `/pages/Booking/Booking.jsx` (move booking to service detail)
- ❌ Any other unused booking pages

### Create New:
- ➕ `/components/bookings/BookingCard.jsx` - Display booking info
- ➕ `/components/bookings/BookingForm.jsx` - Booking form for service detail
- ➕ `/components/reviews/ReviewForm.jsx` - Leave review after completion
- ➕ `/components/reviews/ReviewList.jsx` - Display reviews

---

## 🔄 Navigation Structure

### Guest (Not Logged In):
- Home
- Services (view only)
- Providers (view only)
- Login
- Register

### Customer (Logged In):
- Dashboard
- Services
- Providers
- My Bookings
- Profile
- Logout

### Provider (Logged In):
- Dashboard
- My Services
- My Bookings
- Profile
- Logout

---

## 🎨 Dashboard Layouts

### Customer Dashboard:
```
┌─────────────────────────────────────┐
│  Welcome back, [Name]!              │
├─────────────────────────────────────┤
│  Quick Stats                        │
│  📅 Upcoming: 2  ✅ Completed: 5    │
├─────────────────────────────────────┤
│  Upcoming Bookings                  │
│  ┌─────────────────────────────┐   │
│  │ Haircut - Tomorrow 10:00 AM │   │
│  │ [Cancel] [View Details]     │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Recent Services                    │
│  [Browse All Services →]            │
└─────────────────────────────────────┘
```

### Provider Dashboard:
```
┌─────────────────────────────────────┐
│  Provider Dashboard                 │
├─────────────────────────────────────┤
│  Quick Stats                        │
│  ⏳ Pending: 3  📅 Today: 2         │
├─────────────────────────────────────┤
│  Pending Bookings (Need Action)    │
│  ┌─────────────────────────────┐   │
│  │ John Doe - Haircut          │   │
│  │ Tomorrow 10:00 AM           │   │
│  │ [Accept] [Reject]           │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Today's Bookings                   │
│  ┌─────────────────────────────┐   │
│  │ Jane Smith - Massage        │   │
│  │ 2:00 PM                     │   │
│  │ [Mark Complete] [Cancel]    │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  My Services (3)                    │
│  [Add New Service →]                │
└─────────────────────────────────────┘
```

---

## 🔧 Backend Changes Needed

### Booking Model Updates:
- Add `status` field: 'pending', 'accepted', 'rejected', 'completed', 'cancelled'
- Add `providerResponse` field for accept/reject
- Add `completedAt` timestamp
- Add `cancelledBy` field (customer or provider)

### Booking Controller Updates:
- `acceptBooking(bookingId)` - Provider accepts
- `rejectBooking(bookingId, reason)` - Provider rejects
- `completeBooking(bookingId)` - Provider marks complete
- `cancelBooking(bookingId, cancelledBy)` - Either party cancels

### Review System:
- Create Review model
- Link to booking
- Customer can review after completion
- Display on service detail page

---

## 📋 Implementation Order

1. ✅ Update Register page (already has role selection)
2. 🔄 Update Navbar - role-based navigation
3. 🔄 Update Home page - guest only
4. 🔄 Create Customer Dashboard
5. 🔄 Create Provider Dashboard
6. 🔄 Add booking form to Service Detail page
7. 🔄 Update backend booking controller
8. 🔄 Add review system
9. 🔄 Update Services page - provider sees only their services
10. ❌ Remove old Booking page
11. ✅ Test all flows

---

## 🎯 Key Features

### For Providers:
- ✅ See only MY services
- ✅ Accept/Reject bookings
- ✅ Mark bookings complete
- ✅ Cancel bookings
- ✅ Dashboard shows pending actions

### For Customers:
- ✅ Browse all services
- ✅ Book from service detail page
- ✅ See my bookings
- ✅ Cancel bookings
- ✅ Leave reviews after completion

### For Both:
- ✅ Profile management
- ✅ Notifications (future)
- ✅ Role-based navigation
- ✅ Clean, intuitive UI

---

**This restructuring will create a professional, role-based booking system!**
