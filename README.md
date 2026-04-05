# 🛍️ SK Mart - Complete E-commerce Platform

![MERN Stack](https://img.shields.io/badge/MERN-Stack-green)
![MongoDB](https://img.shields.io/badge/MongoDB-4.4-brightgreen)
![Express](https://img.shields.io/badge/Express-4.18-blue)
![React](https://img.shields.io/badge/React-18.2-cyan)
![Node](https://img.shields.io/badge/Node-18.x-green)
![JWT](https://img.shields.io/badge/JWT-Auth-orange)

A full-featured e-commerce platform built with the MERN stack (MongoDB, Express.js, React, Node.js). Includes user authentication, product management, shopping cart, order processing, admin dashboard, and PDF invoice generation.

## 🚀 Live Demo

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Default Credentials](#default-credentials)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 👤 User Features
- JWT Authentication (Login/Register)
- Product browsing with search & filters
- Real-time search as you type
- Category-based navigation
- Product details with quantity selector
- Shopping cart (add/remove/update quantities)
- Checkout with shipping address
- Order history
- PDF invoice download
- Profile management (update name, email, change password)

### 👑 Admin Features
- Admin Dashboard with statistics
- Product management (CRUD with image upload)
- Category management (CRUD)
- Order management (view all, update status)
- User management (view, change roles, delete)
- Low stock alerts

### 🛠️ Technical Features
- Responsive design (mobile, tablet, desktop)
- Real-time search with debouncing
- Stock management (auto-reduces on order)
- Role-based access control (User/Admin)
- File upload for product images
- PDF invoice generation (html2pdf.js)
- Error boundaries for graceful error handling
- Loading states and animations

## 🏗️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Multer | File upload |
| CORS | Cross-origin requests |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| React Router v6 | Routing |
| Axios | HTTP client |
| Context API | State management |
| html2pdf.js | PDF generation |
| CSS3 | Styling |

