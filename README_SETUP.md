# Smart Booking System - Setup Guide

A comprehensive smart booking system with AI-powered features, built with React, Node.js, Express, and MongoDB.

## 🚀 Features

### Core Functionality
- ✅ User Authentication (Register, Login, JWT-based auth)
- ✅ Role-based Access Control (User, Provider, Admin)
- ✅ Service Management (Create, Read, Update, Delete)
- ✅ Booking System (Create, Manage, Cancel bookings)
- ✅ Review & Rating System
- ✅ Category Management
- ✅ Provider Dashboard
- ✅ Customer Dashboard
- ✅ Notification System
- ✅ Real-time Updates (Socket.io ready)

### Technical Features
- ✅ RESTful API with Express.js
- ✅ MongoDB with Mongoose ODM
- ✅ JWT Authentication
- ✅ Rate Limiting & Security (Helmet, HPP, CORS)
- ✅ File Upload Support (Multer)
- ✅ Email Service (Nodemailer)
- ✅ Logging (Winston)
- ✅ Modern React UI with Tailwind CSS
- ✅ React Router for navigation
- ✅ Context API for state management
- ✅ Axios for API calls

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Git

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Smart Booking System"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env file with your configuration
# Required variables:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: A secure random string
# - CLIENT_URL: Frontend URL (default: http://localhost:3000)
```

**Backend Environment Variables (.env):**
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/smart-booking

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-complex
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Email (Optional - for production)
EMAIL_FROM=noreply@smartbooking.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env file if needed
```

**Frontend Environment Variables (.env):**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Smart Booking System
VITE_APP_URL=http://localhost:3000
```

## 🚀 Running the Application

### Development Mode

**Option 1: Run Backend and Frontend Separately**

Terminal 1 - Backend:
```bash
cd backend
npm start
```
Backend will run on http://localhost:5000

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

**Option 2: Use Concurrently (if configured)**
```bash
# From root directory
npm run dev
```

## 📁 Project Structure

```
Smart Booking System/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (email, etc.)
│   │   └── utils/           # Helper functions
│   ├── uploads/             # File uploads
│   ├── logs/                # Application logs
│   ├── .env                 # Environment variables
│   ├── server.js            # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React Context providers
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service calls
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   ├── .env                 # Environment variables
│   └── package.json
│
└── README_SETUP.md          # This file
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create service (Provider)
- `PUT /api/services/:id` - Update service (Provider)
- `DELETE /api/services/:id` - Delete service (Provider)

### Bookings
- `POST /api/bookings` - Create booking (Customer)
- `GET /api/bookings/my-bookings` - Get customer bookings
- `GET /api/bookings/provider` - Get provider bookings
- `PATCH /api/bookings/:id/cancel` - Cancel booking
- `PATCH /api/bookings/provider/:id/status` - Update booking status (Provider)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/tree` - Get category tree
- `GET /api/categories/popular` - Get popular categories

### Reviews
- `POST /api/reviews` - Create review (Customer)
- `GET /api/reviews/service/:serviceId` - Get service reviews
- `GET /api/reviews/provider/:providerId` - Get provider reviews

### Dashboard
- `GET /api/dashboard/provider` - Provider dashboard stats
- `GET /api/dashboard/user` - User dashboard stats
- `GET /api/dashboard/admin` - Admin dashboard stats (Admin)

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/mark-all-read` - Mark all as read

## 👥 User Roles

### Customer (User)
- Browse and search services
- Book appointments
- Manage bookings
- Leave reviews
- View notifications

### Provider
- Create and manage services
- View and manage bookings
- Respond to booking requests
- View dashboard statistics
- Manage availability

### Admin
- Manage all users
- Approve/reject services
- Manage categories
- View system statistics
- Send notifications

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization
- XSS protection
- HPP (HTTP Parameter Pollution) prevention

## 📝 Default Test Accounts

After initial setup, you can create test accounts:

**Admin:**
- Email: admin@smartbooking.com
- Password: Admin@123

**Provider:**
- Email: provider@smartbooking.com
- Password: Provider@123

**Customer:**
- Email: customer@smartbooking.com
- Password: Customer@123

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or check your Atlas connection string
- Verify MONGODB_URI in .env file

### Port Already in Use
- Change PORT in backend .env file
- Update VITE_API_BASE_URL in frontend .env accordingly

### CORS Errors
- Verify CLIENT_URL in backend .env matches frontend URL
- Check CORS configuration in server.js

### Module Not Found
- Delete node_modules and package-lock.json
- Run `npm install` again

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact: support@smartbooking.com

---

**Happy Booking! 🎉**
