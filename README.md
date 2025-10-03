# 🏪 Store Rating Platform

A full-stack web application for managing store ratings with role-based authentication.

## 🛠 Tech Stack

**Frontend:** React + Vite  
**Backend:** Express.js + MySQL  
**Authentication:** JWT

## 👥 User Roles

- **Admin**: Manage users, stores, and view dashboard stats
- **User**: Browse stores, submit/edit ratings (1-5 stars)  
- **Store Owner**: View ratings received and user feedback
## 🔑 Default Login

**Admin:** `admin@storerating.com` / `Admin@123`

## ✨ Key Features

- Role-based dashboards
- Interactive star rating system
- Real-time search and filtering
- Secure password validation
- Responsive design

## 📋 Form Validations

- Name: 20-60 characters
- Password: 8-16 chars, 1 uppercase, 1 special char
- Address: Max 400 characters
- Rating: 1-5 stars

## 🌐 API Endpoints

- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Register  
- `GET /api/admin/stats` - Admin dashboard
- `GET /api/user/stores` - Browse stores
- `POST /api/user/stores/:id/rating` - Submit rating

## 📊 Database Schema

**Users:** id, name, email, password, address, role  
**Ratings:** id, user_id, store_id, rating (1-5), timestamps

## 🚀 Deployment

**Frontend:** cd rating-frontend -> npm install -> npm run dev  
**Backend:** cd rating-backend -> npm install -> npm run dev 
