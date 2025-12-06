# Quick Start Guide - Smart Booking System

## ⚡ Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment

**Backend (.env):**
```bash
cd backend
# Copy the example file
cp .env.example .env

# Edit .env and set:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (any long random string)
```

**Frontend (.env):**
```bash
cd frontend
# Copy the example file
cp .env.example .env

# Default values should work for local development
```

### Step 3: Start MongoDB

Make sure MongoDB is running:
- **Local MongoDB:** `mongod` or start MongoDB service
- **MongoDB Atlas:** Use your connection string in backend .env

### Step 4: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
✅ Backend runs on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Frontend runs on http://localhost:3000

### Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 🎯 What's Implemented?

### ✅ Backend (Complete)
- **Authentication System**
  - User registration & login
  - JWT-based authentication
  - Password hashing with bcrypt
  - Role-based access control (User, Provider, Admin)

- **Service Management**
  - Create, read, update, delete services
  - Category-based organization
  - Provider-specific services
  - Image upload support
  - Service approval workflow

- **Booking System**
  - Create bookings
  - Customer booking management
  - Provider booking management
  - Booking status updates
  - Cancellation with refund logic
  - Booking statistics

- **Review & Rating**
  - Post-booking reviews
  - Rating system (1-5 stars)
  - Provider and service reviews
  - Review moderation

- **Category Management**
  - Hierarchical categories
  - Popular categories
  - Category search
  - Admin category CRUD

- **Dashboard**
  - Provider dashboard with statistics
  - Customer dashboard
  - Admin dashboard
  - Revenue tracking
  - Booking analytics

- **Notifications**
  - In-app notifications
  - Email notifications (configured)
  - Notification preferences
  - Mark as read/unread

- **Security Features**
  - Rate limiting
  - Helmet.js security headers
  - CORS protection
  - Input validation
  - XSS protection
  - HPP prevention

### ✅ Frontend (Complete)
- **Pages**
  - Home page with hero section
  - Services listing and detail
  - Provider listing and detail
  - Booking page
  - User dashboard
  - Provider dashboard
  - Profile management
  - Login & Registration
  - About & Contact pages

- **Components**
  - Layout with navigation
  - Protected routes
  - Service cards
  - Booking forms
  - Review components
  - Notification center

- **State Management**
  - AuthContext for authentication
  - ServicesContext for services
  - ProvidersContext for providers
  - BookingContext for bookings

- **API Integration**
  - Complete API service layer
  - Axios interceptors
  - Error handling
  - Token management

## 📋 API Endpoints Reference

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
GET    /api/auth/me                - Get current user
PUT    /api/auth/updatedetails     - Update profile
PUT    /api/auth/updatepassword    - Change password
```

### Services
```
GET    /api/services               - Get all services
GET    /api/services/:id           - Get service by ID
POST   /api/services               - Create service (Provider)
PUT    /api/services/:id           - Update service (Provider)
DELETE /api/services/:id           - Delete service (Provider)
GET    /api/services/category/:id  - Get services by category
GET    /api/services/provider/:id  - Get provider services
PUT    /api/services/:id/photo     - Upload service photo
```

### Bookings
```
POST   /api/bookings                      - Create booking
GET    /api/bookings/my-bookings          - Get customer bookings
GET    /api/bookings/provider             - Get provider bookings
GET    /api/bookings/:id                  - Get booking details
PATCH  /api/bookings/:id/cancel           - Cancel booking
PATCH  /api/bookings/provider/:id/status  - Update status (Provider)
GET    /api/bookings/stats                - Get booking statistics
```

### Categories
```
GET    /api/categories             - Get all categories
GET    /api/categories/tree        - Get category tree
GET    /api/categories/popular     - Get popular categories
GET    /api/categories/search      - Search categories
POST   /api/categories             - Create category (Admin)
PUT    /api/categories/:id         - Update category (Admin)
DELETE /api/categories/:id         - Delete category (Admin)
```

### Reviews
```
POST   /api/reviews                      - Create review
GET    /api/reviews/service/:serviceId   - Get service reviews
GET    /api/reviews/provider/:providerId - Get provider reviews
PUT    /api/reviews/:id/helpful          - Mark review helpful
DELETE /api/reviews/:id                  - Delete review
```

### Dashboard
```
GET    /api/dashboard/provider     - Provider dashboard stats
GET    /api/dashboard/user         - User dashboard stats
GET    /api/dashboard/admin        - Admin dashboard stats
```

### Notifications
```
GET    /api/notifications                - Get user notifications
GET    /api/notifications/stats          - Get notification stats
PUT    /api/notifications/:id/read       - Mark as read
PUT    /api/notifications/mark-all-read  - Mark all as read
DELETE /api/notifications/:id            - Delete notification
DELETE /api/notifications/clear-all      - Clear all notifications
```

## 🔐 Default User Roles

### Customer (User)
- Browse services
- Book appointments
- Manage bookings
- Leave reviews

### Provider
- Create services
- Manage bookings
- View dashboard
- Respond to reviews

### Admin
- Manage all users
- Approve services
- Manage categories
- System oversight

## 🛠️ Tech Stack

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- Multer (file uploads)
- Nodemailer (emails)
- Winston (logging)
- Express Validator
- Helmet, CORS, HPP

### Frontend
- React 19
- React Router v7
- Tailwind CSS
- Axios
- Lucide React (icons)
- Framer Motion
- React Toastify
- Vite

## 📝 Next Steps

1. **Create Test Data**
   - Register as a provider
   - Create some services
   - Register as a customer
   - Make test bookings

2. **Customize**
   - Update branding in frontend
   - Configure email templates
   - Add payment integration
   - Enable real-time features

3. **Deploy**
   - Set up production MongoDB
   - Configure environment variables
   - Deploy backend to Heroku/Railway
   - Deploy frontend to Vercel/Netlify

## 🐛 Common Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check MONGODB_URI in .env

**Port Already in Use:**
- Change PORT in backend .env
- Update VITE_API_BASE_URL in frontend .env

**CORS Errors:**
- Verify CLIENT_URL in backend .env
- Check CORS configuration

## 📞 Need Help?

- Check `README_SETUP.md` for detailed documentation
- Review API endpoints above
- Check console logs for errors

---

**Happy Coding! 🚀**
