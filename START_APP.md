# 🚀 Quick Start Guide

## Start the Application

### Step 1: Start Backend (Terminal 1)
```bash
cd backend
npm start
```

**Wait for:**
```
✅ MongoDB Connected: localhost
🚀 Server running in development mode on port 5000
```

### Step 2: Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

**Wait for:**
```
➜  Local:   http://localhost:3000/
```

### Step 3: Open Browser
Go to: **http://localhost:3000**

---

## ✅ What's Already Set Up

1. **Categories** - 8 categories created ✅
2. **Test Service** - "Professional Haircut" created ✅
3. **Your Provider Account** - Ready to use ✅

---

## 🎯 Quick Test

### View Services
1. Go to **Services** page
2. ✅ Should see "Professional Haircut" service

### Create New Service
1. Login as provider
2. Click **Add Service**
3. Fill form:
   - Title: "Massage Therapy"
   - Description: "Relaxing full body massage"
   - Price: 80
   - Duration: 90
   - Category: Select any
4. Click **Create Service**
5. ✅ Should appear immediately

### Book a Service
1. Login as customer (or register new account)
2. Go to **Book Now**
3. Select service from dropdown
4. Choose date and time
5. Submit booking

---

## 🐛 Troubleshooting

### Services Not Showing?
**Check:**
1. ✅ Backend is running on port 5000
2. ✅ Frontend is running on port 3000
3. ✅ MongoDB is connected
4. ✅ Browser console for errors (F12)

**Fix:**
```bash
# Restart backend
cd backend
npm start

# Restart frontend (new terminal)
cd frontend
npm run dev
```

### Can't Create Services?
**Check:**
1. ✅ Logged in as provider
2. ✅ All form fields filled
3. ✅ Category selected from dropdown
4. ✅ Price is positive number

### Categories Not Loading?
**Run:**
```bash
cd backend
node src/scripts/seedCategories.js
```

---

## 📊 Current Database

### Categories (8)
- Healthcare
- Beauty & Wellness
- Fitness & Sports
- Education & Tutoring
- Home Services
- Professional Services
- Technology
- Automotive

### Services (1)
- Professional Haircut ($45, 60 min)

### Users
- Your provider account: usman ghani

---

## 🎨 Features Working

✅ User Authentication (Login/Register)  
✅ Role-based Access (Customer/Provider)  
✅ Service Management (CRUD)  
✅ Category System  
✅ Booking System  
✅ Dashboard (Customer & Provider)  
✅ Real-time Data (No dummy data)  
✅ Responsive Design  
✅ Professional CSS Styling  

---

## 📝 Next Steps

1. **Create More Services** - Add variety
2. **Test Bookings** - Book services as customer
3. **Check Dashboard** - View stats
4. **Add More Providers** - Register new provider accounts
5. **Test Reviews** - Leave reviews after bookings

---

## 🔥 Pro Tips

1. **Keep both terminals running** - Backend + Frontend
2. **Check browser console** - For any errors (F12)
3. **Use Chrome DevTools** - Network tab to see API calls
4. **MongoDB Compass** - View database directly (optional)

---

## ⚡ Common Commands

```bash
# Seed categories
node src/scripts/seedCategories.js

# Create test service
node src/scripts/seedTestService.js

# Start backend
npm start

# Start frontend
npm run dev

# Check backend health
curl http://localhost:5000/health
```

---

**Ready to go! Start both servers and enjoy your Smart Booking System! 🎉**
