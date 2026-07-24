<div align="center">

<img height="80" src="https://learnhub-opju.netlify.app/images/logo2.svg" alt="LearnHub Logo" />

# LearnHub — Full-Stack E-Learning & Interactive Classroom Platform

**A production-grade MERN stack Ed-Tech platform with Role-Based Access Control (RBAC), video courses, and real-time interactive classrooms.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Redux](https://img.shields.io/badge/Redux_Toolkit-1.9-764ABC?style=flat-square&logo=redux)](https://redux-toolkit.js.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

<br/>

[**🌐 Live Demo**](https://learnhub-opju.vercel.app/) &nbsp;·&nbsp; [**📡 API Reference**](#-api-reference) &nbsp;·&nbsp; [**🚀 Local Setup**](#-local-setup)

</div>

---

## 📌 Overview

LearnHub is an end-to-end educational platform designed for modern online learning. It combines a full-fledged **course marketplace** (video lectures, progress tracking, Razorpay checkout) with **interactive classrooms** for instructor-student collaboration (announcements, direct file & link materials, timed assignments, and auto-generated join codes).

The platform features an automatic **triple-tier database fallback system**:
1. **Primary**: Remote MongoDB Atlas Cluster
2. **Secondary**: Local MongoDB Server (`mongodb://127.0.0.1:27017/learnhub`)
3. **Tertiary (In-Memory)**: Automatic zero-config `mongodb-memory-server` fallback for offline / development environments.

---

## 🔐 Role-Based Access Control (RBAC) & Test Accounts

| Role | Entry URL | Default Test Credentials | Primary Capabilities |
|------|-----------|--------------------------|----------------------|
| **Super Admin** | `http://localhost:5173/admin-secure-portal/login` *(Isolated URL)* | `admin@test.com` / `password123` | Global system oversight, platform stats console, category management, complete classroom audit |
| **Instructor** | `http://localhost:5173/login` *(Common Gateway)* | `instructor@test.com` / `password123` | Create courses & classrooms, post announcements, upload materials (PDFs/Images/Links/Text), create/extend assignments |
| **Student** | `http://localhost:5173/login` *(Common Gateway)* | `student@test.com` / `password123` | Purchase & watch courses, join classrooms via 8-char code or URL, submit assignments before deadlines, view materials |

---

## ✨ Key Features

### 🎓 Student Workspace
- **Course Marketplace**: Browse categories, add courses to wishlist/cart, and complete checkout via **Razorpay**.
- **Interactive Video Player**: Subsection video streaming with progress tracking and completion checkmarks.
- **Classroom Enrollment**: Join classrooms using an 8-character unique code or a shareable URL (`/join/:uniqueCode`).
- **Classroom Feed & Materials**: Read instructor announcements, access reading links, view uploaded PDF notes and images.
- **Assignment Submissions**: Submit assignment links prior to enforced deadlines.

### 👩‍🏫 Instructor Workspace
- **Course Creation Studio**: Multi-step builder (Course Details → Sections/Subsections → Cloudinary Media → Publish).
- **Classroom Management**: Create timed classrooms with auto-generated unique codes and shareable join URLs.
- **Rich Material Uploads**: Post course materials by choosing between **Direct Local File Upload** (PDFs/Images uploaded to Cloudinary), external links, or inline text body.
- **Timed Assignments**: Create assignments with strict due dates, extend deadlines on demand, and review student submission links.
- **Instructor Dashboard**: Analytics on total earnings, enrolled students, and course performance.

### 🛡️ Super Admin Console
- **Isolated Portal**: Security portal at `/admin-secure-portal/login` with API-level `ACCOUNT_TYPE` verification.
- **Platform Analytics**: Total classrooms, student enrollments, instructor activity, and system overview.
- **Category Control**: Create, edit, and organize course catalog categories.

---

## 💻 Tech Stack

### Frontend
- **Core**: React 18, Vite 4, React Router DOM v6
- **State Management**: Redux Toolkit (`auth`, `profile`, `course`, `cart`, `classroom`, `viewCourse`)
- **Styling**: Tailwind CSS + Vanilla CSS, Framer Motion
- **Icons & Media**: React Icons (`vsc`, `md`, `ai`, `fi`), Video-React, Swiper, Cloudinary
- **Form & UX**: React Hook Form, React Hot Toast

### Backend
- **Runtime & Framework**: Node.js, Express.js
- **Database**: MongoDB + Mongoose ODM (with `mongodb-memory-server` fallback)
- **Auth & Security**: JWT (JSON Web Tokens), bcrypt hashing, OTP email verification
- **File & Media Storage**: Cloudinary SDK, express-fileupload
- **Payments**: Razorpay Node SDK
- **Communication**: Nodemailer (SMTP)

---

## 🏗️ System Architecture

```text
  ┌──────────────────────┐   HTTP / REST API (JSON)   ┌──────────────────────┐
  │    React 18 Client   │ ─────────────────────────► │   Express Server     │
  │  Redux / Vite / RTK  │ ◄───────────────────────── │   Node.js + JWT      │
  └──────────────────────┘                            └──────────┬───────────┘
                                                                 │
      ┌──────────────────┬──────────────────┬────────────────────┼────────────────────┐
      ▼                  ▼                  ▼                    ▼                    ▼
┌───────────┐      ┌────────────┐     ┌───────────┐        ┌───────────┐        ┌───────────┐
│  MongoDB  │      │ Cloudinary │     │ Razorpay  │        │Nodemailer │        │ Mongo-Mem │
│(Atlas/Loc)│      │File Uploads│     │ Payments  │        │ SMTP Mail │        │ In-Memory │
└───────────┘      └────────────┘     └───────────┘        └───────────┘        └───────────┘
```

---

## 🗂️ Database Models

| Schema | Key Fields | Description |
|--------|------------|-------------|
| **User** | `firstName`, `lastName`, `email`, `password`, `accountType`, `courses[]`, `classrooms[]`, `image` | User account document supporting Student, Instructor, and Admin roles |
| **Profile** | `gender`, `dateOfBirth`, `about`, `contactNumber` | Extended user profile details |
| **Course** | `courseName`, `instructor`, `price`, `thumbnail`, `courseContent[]`, `studentsEnrolled[]`, `status` | Video course object |
| **Classroom** | `className`, `instructor`, `uniqueCode`, `shareableUrl`, `duration`, `studentsEnrolled[]`, `materials[]`, `assignments[]`, `notices[]` | Interactive classroom object with embedded material, notice, and assignment subdocuments |
| **Section** | `sectionName`, `subSection[]` | Course curriculum section |
| **SubSection** | `title`, `timeDuration`, `description`, `videoUrl` | Individual video lesson |
| **CourseProgress** | `courseID`, `userId`, `completedVideos[]` | Tracks video lesson completion |
| **OTP** | `email`, `otp`, `createdAt` | Auto-expiring TTL collection for email verification |

---

## 📁 Project Structure

```
LearnHub-E-Learning-Platform/
├── backend/
│   ├── config/               # Database, Cloudinary, Razorpay configuration
│   ├── controllers/
│   │   ├── auth.js           # Signup, Login, OTP, AdminLogin
│   │   ├── classroomController.js  # Classroom CRUD, materials, notices, assignments
│   │   ├── course.js         # Course lifecycle management
│   │   ├── profile.js        # User profile & avatar operations
│   │   ├── payments.js       # Razorpay order capture & signature verification
│   │   ├── category.js       # Category management
│   │   └── section.js / subSection.js / ratingAndReview.js
│   ├── middleware/
│   │   └── auth.js           # JWT auth + role guard middleware (isStudent, isInstructor, isAdmin)
│   ├── models/
│   │   ├── Classroom.js      # Classroom schema with embedded materials/assignments
│   │   ├── user.js           # User schema (with classrooms[] array ref)
│   │   └── course.js / profile.js / OTP.js / section.js / subSection.js
│   ├── routes/
│   │   ├── classroom.js      # /api/v1/classroom
│   │   ├── user.js           # /api/v1/auth (including admin-login)
│   │   └── course.js / profile.js / payments.js
│   ├── utils/                # mailSender, imageUploader helpers
│   ├── .env / .env.example
│   └── server.js
│
├── frontend/
│   ├── data/                 # sidebarLinks (role-filtered), navbarLinks
│   └── src/
│       ├── components/
│       │   ├── common/       # Navbar, Footer, Loading, Modals
│       │   └── core/
│       │       ├── Auth/     # OpenRoute, ProtectedRoute, AdminRoute guards
│       │       ├── Dashboard/# Sidebar, MyProfile, Classrooms (MyClassrooms, CreateClassroom, EnrolledClassrooms)
│       │       └── Catalog/  # Course cards, sliders, active classroom grid
│       ├── pages/
│       │   ├── AdminLogin.jsx      # Isolated Super Admin portal
│       │   ├── AdminDashboard.jsx  # Platform management console
│       │   ├── ClassroomView.jsx   # Tabbed classroom page (Feed/Materials/Assignments/Members)
│       │   ├── JoinClassroom.jsx   # Shareable URL auto-join handler
│       │   ├── Catalog.jsx         # Course catalog & active live classrooms listing
│       │   └── Home / Login / Signup / CourseDetails / Dashboard / Settings
│       ├── services/
│       │   ├── apis.js             # API endpoint definitions
│       │   └── operations/         # Async thunks (classroomAPI, adminAPI, authAPI, courseDetailsAPI)
│       ├── slices/                 # Redux slices (classroomSlice, authSlice, profileSlice, etc.)
│       └── App.jsx                 # Application routes & guards
│
├── backend/.env / .env.example
├── frontend/.env / .env.example
└── README.md
```

---

## 🚀 Local Setup Guide

### 1 · Clone Repository
```bash
git clone https://github.com/BoddepallyVenkatesh06/LearnHub-E-Learning-Platform.git
cd LearnHub-E-Learning-Platform
```

### 2 · Setup Backend
```bash
cd backend
npm install
npm run dev
```
*The backend server runs on `http://localhost:5000`.*

### 3 · Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```
*The frontend application runs on `http://localhost:5173`.*

---

## ⚙️ Environment Variables Reference

### Backend (`backend/.env`)

```env
# Server Configuration
PORT=5000

# Database Configuration (MongoDB Atlas connection string)
DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/learnhub?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_jwt_secret_key

# Cloudinary Integration (Media & File Uploads)
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
FOLDER_NAME=LearnHub

# Nodemailer / SMTP Email Service
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_email_app_password

# Razorpay Payment Gateway
RAZORPAY_KEY=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret

# Frontend Application URL (Used for generating shareable classroom URLs)
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
# Backend API Endpoint Base URL
VITE_APP_BASE_URL=http://localhost:5000/api/v1

# Razorpay Integration Key (Public)
VITE_APP_RAZORPAY_KEY=your_razorpay_key_id
```

---

## 📡 API Reference

### Authentication — `/api/v1/auth`

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| `POST` | `/sendotp` | Generate and dispatch OTP to user email | Public |
| `POST` | `/signup` | Register new Student or Instructor account | Public |
| `POST` | `/login` | Standard user login (Student / Instructor) | Public |
| `POST` | `/admin-login` | **Super Admin** isolated login endpoint | Admin |
| `POST` | `/changepassword` | Change authenticated account password | Authenticated |

### Interactive Classrooms — `/api/v1/classroom`

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| `POST` | `/create` | Create classroom (generates 8-char code + share URL) | Instructor |
| `POST` | `/join` | Enroll in classroom using 8-char join code | Student |
| `GET` | `/my-classrooms` | Get created (Instructor) or enrolled (Student) classrooms | Authenticated |
| `GET` | `/all-classrooms` | Fetch all active platform classrooms for catalog listing | Authenticated |
| `POST` | `/details` | Get full details of a specific classroom | Authenticated |
| `POST` | `/post-material` | Post material (supports direct file upload to Cloudinary or link/text) | Instructor |
| `POST` | `/post-notice` | Post announcement to classroom feed | Instructor |
| `POST` | `/create-assignment` | Create timed assignment with due date | Instructor |
| `POST` | `/extend-deadline` | Extend assignment due date | Instructor |
| `POST` | `/submit-assignment` | Submit assignment link prior to deadline | Student |
| `DELETE` | `/delete` | Delete classroom and remove references | Instructor |
| `GET` | `/all` | Get all classrooms on platform for Admin dashboard | Admin |

### Courses & Catalog — `/api/v1/course`

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| `GET` | `/getAllCourses` | List all published courses | Public |
| `POST` | `/getCourseDetails` | Fetch public course details | Public |
| `POST` | `/getFullCourseDetails` | Fetch full details with lesson video access | Authenticated |
| `POST` | `/createCourse` | Create a new course | Instructor |
| `POST` | `/editCourse` | Update course details | Instructor |
| `DELETE` | `/deleteCourse` | Delete course | Instructor |
| `GET` | `/getInstructorCourses` | List instructor's created courses | Instructor |
| `POST` | `/createCategory` | Create course category | Admin |
| `GET` | `/showAllCategories` | List all catalog categories | Public |

---

## 🗺️ Frontend Route Map

| Path | Guard | Component | Description |
|------|-------|-----------|-------------|
| `/` | Public | Home | Platform landing page |
| `/login` | OpenRoute | Login | Standard student & instructor login |
| `/signup` | OpenRoute | Signup | Registration page |
| `/admin-secure-portal/login` | OpenRoute | **AdminLogin** | Isolated portal for Super Admins |
| `/admin/dashboard` | **AdminRoute** | AdminDashboard | Super Admin platform management console |
| `/catalog/:catalogName` | Public | Catalog | Catalog displaying courses and active live classrooms |
| `/classroom/:classroomId` | ProtectedRoute | **ClassroomView** | Tabbed classroom view (Feed, Materials, Assignments, Members) |
| `/join/:uniqueCode` | ProtectedRoute | **JoinClassroom** | Shareable URL auto-join handler |
| `/dashboard/my-profile` | ProtectedRoute | MyProfile | User profile overview |
| `/dashboard/my-classrooms` | ProtectedRoute | **MyClassrooms** | Instructor classroom management list |
| `/dashboard/create-classroom` | ProtectedRoute | **CreateClassroom** | Instructor classroom creation form |
| `/dashboard/joined-classrooms` | ProtectedRoute | **EnrolledClassrooms** | Student joined classrooms list & code modal |

---

## 📄 License

Distributed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ — LearnHub Engineering Team</sub>
</div>
