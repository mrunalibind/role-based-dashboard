# Role-Based Dashboard (Backend)

## 🚀 Overview

This project is a role-based dashboard system built using Next.js and MongoDB. It implements secure authentication and role-based access control for three roles: Super Admin, Admin, and User.

---

## 🛠️ Tech Stack

* Next.js (App Router)
* MongoDB + Mongoose
* JWT Authentication
* bcrypt (Password Hashing)
* Next.js (Freamwork) and Tailwind css

---

## 🔐 Features

### Authentication

* Login with email & password
* JWT-based authentication
* Secure password hashing

---

### Role-Based Access Control

#### Super Admin

* Manage Admins (Create, Read, Update, Delete)
* Manage all Users

#### Admin

* Manage only their Users

#### User

* Access personal dashboard
* Manage Notes (CRUD)

---

### Notes Module (User)

* Create Note
* View Notes
* Update Note
* Delete Note

---

## 📁 Folder Structure

/app/api

* auth/login
* admin
* admin/[id]
* user
* user/[id]
* notes
* notes/[id]

/lib → DB connection
/models → Mongoose schemas
/middleware → Auth & RBAC
/utils → helpers

---

## ⚙️ Setup Instructions

1. Clone the repository

2. Install dependencies:
   npm install

3. Create `.env`:
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret

4. Run the project:
   npm run dev

---

## 🔑 API Endpoints

### Auth

* POST /api/auth/login

### Admin (Super Admin only)

* POST /api/admin
* GET /api/admin
* PUT /api/admin/:id
* DELETE /api/admin/:id

### User

* POST /api/user
* GET /api/user
* PUT /api/user/:id
* DELETE /api/user/:id

### Notes (User only)

* POST /api/notes
* GET /api/notes
* PUT /api/notes/:id
* DELETE /api/notes/:id


---

## ✅ Key Highlights

* Secure authentication with JWT
* Strict role-based access control
* Ownership-based data access
* Clean and scalable code structure

---
