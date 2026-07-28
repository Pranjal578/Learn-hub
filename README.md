<div align="center">

# 🎓 LearnHub — Full-Stack E-Learning & Interactive Classroom Platform

**A production-grade MERN stack Ed-Tech platform featuring Role-Based Access Control (RBAC), Course Marketplace with 100% Completion Verifiable Certificates, Zero-Code Quiz Creation, Graph Analytics, and Interactive Virtual Classrooms.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Redux](https://img.shields.io/badge/Redux_Toolkit-1.9-764ABC?style=flat-square&logo=redux)](https://redux-toolkit.js.org/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384?style=flat-square&logo=chartdotjs)](https://www.chartjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

<br/>

[**📡 API Reference**](#-api-reference) &nbsp;·&nbsp; [**🚀 Local Setup**](#-local-setup-guide) &nbsp;·&nbsp; [**✨ Features**](#-key-features) &nbsp;·&nbsp; [**🔐 RBAC Portal**](#-role-based-access-control-rbac--test-accounts)

</div>

---

## 📌 Overview

**LearnHub** is an end-to-end educational platform designed for modern online learning and academic collaboration. It bridges the gap between self-paced video learning and live classroom management by combining:

1. **Course Marketplace**: Video curriculum, progress tracking, interactive quizzes, and **Verifiable Certificates of Completion** granted strictly upon 100% course lecture completion.
2. **Interactive Virtual Classrooms**: Real-time instructor-student hubs with feed announcements, direct document/media notes, timed assignments, and auto-generated shareable join codes.
3. **Instructor Analytics Console**: Interactive Bar and Line graph visualizations to monitor student enrollments, course revenues, and top-performing content.

The backend features an automated **Triple-Tier Database Fallback System**:
- 🟢 **Primary**: Remote MongoDB Atlas Cloud Cluster
- 🟡 **Secondary**: Local MongoDB Instance (`mongodb://127.0.0.1:27017/learnhub`)
- 🔵 **Tertiary (In-Memory)**: Zero-config `mongodb-memory-server` fallback for offline development.

---

## 🚀 Key Highlights & New Enhancements

### 🏆 Course Completion Certificates
- **100% Completion Enforced**: Certificates are granted **only** to students enrolled in a course who have completed 100% of all lectures.
- **Dynamic Verification**: Every certificate receives a unique `CERT-XXXX` code and a public verification link (`/verify-certificate/:code`).
- **Clean Isolated Printing**: Built-in `@media print` rules ensure only the official certificate frame is printed, removing all navigation bars and background elements.

### 📝 Zero-Code Quiz & Assessment Builder
- Instructors can add **Quizzes & Assessments** directly in the **Course Builder** studio alongside video lectures.
- **1-Click Visual Builder Launchers**: Direct integration with *Google Forms*, *Microsoft Forms*, and *Quizizz* so non-technical instructors can build quizzes without writing code.
- **Student Quiz Card**: Renders an interactive assessment card inside the course player with direct launch buttons and a "Mark Quiz as Completed" action.

### 📊 Instructor Graph Analytics & Visualization
- Upgraded instructor dashboard from static pie charts to dynamic **Chart.js** **Bar & Line Graphs**.
- Filter metrics by **Students Enrolled**, **Revenue Generated (₹)**, or a **Dual-Axis Combined Overview**.

### 🎥 Large Video Chunking Upload System
- Optimized Cloudinary integration using `upload_large` with 6MB chunking to prevent timeout issues when uploading high-res video lectures.

---

## 🔐 Role-Based Access Control (RBAC) & Test Accounts

| Role | Access URL | Default Test Credentials | Primary Capabilities |
|------|------------|--------------------------|----------------------|
| **Super Admin** | `http://localhost:5173/admin-secure-portal/login` *(Isolated Security Route)* | `admin@test.com` / `password123` | Global system oversight, platform stats console, category management, full classroom & course audit |
| **Instructor** | `http://localhost:5173/login` | `instructor@test.com` / `password123` | Multi-step Course Builder (Lectures + Quizzes), Instructor Analytics Graphs, Create & Manage Classrooms, Post Materials & Timed Assignments |
| **Student** | `http://localhost:5173/login` | `student@test.com` / `password123` | Enroll in courses, watch video lectures, complete quizzes, claim **100% Completion Certificates**, join classrooms via code/URL |

---

## ✨ Feature Breakdown

### 🎓 Student Workspace
- **Course Catalog**: Filter by category, view course detail pages, add items to cart/wishlist, and checkout via **Razorpay**.
- **Course Player & Progress**: Video streaming with completion checkmarks, lecture navigation, and real-time progress percentages.
- **Certificate Claim**: Dynamic "Claim Certificate" widget appears in the player sidebar as soon as progress reaches 100%.
- **Classroom Student Hub**: Join classrooms with 8-character unique codes or direct URLs (`/join/:code`), download notes (PDFs/Images), submit assignment links before deadlines.

### 👩‍🏫 Instructor Workspace
- **Course Builder Studio**: Create sections, add video lectures or quizzes, upload media via chunked Cloudinary streams, and publish.
- **Analytics Dashboard**: Visual Bar and Line graphs tracking total earnings, total students, and course performance breakdown.
- **Classroom Control**: Post feed notices, upload learning materials (PDFs/Images/Links/Text), set assignment deadlines, and review submissions.

### 🛡️ Admin Security Console
- **Isolated Super Admin Portal**: Security portal located at `/admin-secure-portal/login` with strict server-side `ACCOUNT_TYPE` validation.
- **Category Control**: Create, edit, and organize catalog categories.
- **System Metrics**: Total user registrations, active courses, classrooms, and platform activity.

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 18, Vite 4, React Router DOM v6
- **State Management**: Redux Toolkit (`auth`, `profile`, `course`, `cart`, `classroom`, `viewCourse`)
- **Visualizations**: Chart.js, React-Chartjs-2
- **Styling**: Tailwind CSS, Vanilla CSS Design System, Framer Motion
- **Icons & Media**: React Icons, Video-React, Swiper
- **Utilities**: React Hook Form, React Hot Toast

### Backend
- **Runtime & Server**: Node.js, Express.js
- **Database**: MongoDB & Mongoose ODM (with `mongodb-memory-server` fallback)
- **Auth & Security**: JWT (JSON Web Tokens), bcrypt password hashing, OTP verification
- **Media & Files**: Cloudinary SDK, express-fileupload
- **Payments**: Razorpay Node SDK
- **Mailing**: Nodemailer (SMTP)

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
│(Atlas/Loc)│      │Media Upload│     │ Payments  │        │ SMTP Mail │        │ In-Memory │
└───────────┘      └────────────┘     └───────────┘        └───────────┘        └───────────┘
```

---

## 🗂️ Database Models

| Schema | Key Fields | Description |
|--------|------------|-------------|
| **User** | `firstName`, `lastName`, `email`, `password`, `accountType`, `courses[]`, `classrooms[]`, `image` | Core user entity supporting Student, Instructor, and Admin accounts |
| **Course** | `courseName`, `instructor`, `price`, `thumbnail`, `courseContent[]`, `studentsEnrolled[]`, `status` | Video course entity |
| **Section** | `sectionName`, `subSection[]` | Section container for lectures and quizzes |
| **SubSection** | `title`, `timeDuration`, `description`, `videoUrl`, `isQuiz`, `quizUrl` | Video lesson or quiz item |
| **Certificate** | `student`, `course`, `instructor`, `type`, `certificateCode`, `issueDate` | Verifiable completion certificate document |
| **Classroom** | `className`, `instructor`, `uniqueCode`, `shareableUrl`, `duration`, `studentsEnrolled[]`, `materials[]`, `assignments[]` | Interactive virtual classroom |
| **CourseProgress** | `courseID`, `userId`, `completedVideos[]` | Tracks completed lectures for course progress calculation |
| **OTP** | `email`, `otp`, `createdAt` | Auto-expiring TTL collection for email verification |

---

## 📁 Project Structure

```
LearnHub-E-Learning-Platform/
├── backend/
│   ├── config/               # DB, Cloudinary, Razorpay configurations
│   ├── controllers/
│   │   ├── auth.js           # Signup, Login, OTP, AdminLogin
│   │   ├── certificateController.js # Verifiable certificate generator & public verifier
│   │   ├── classroomController.js   # Classroom CRUD, feed, materials, assignments
│   │   ├── course.js         # Course lifecycle management
│   │   ├── profile.js        # Profile details & instructor dashboard analytics
│   │   ├── subSection.js     # Video lecture & zero-code quiz handler
│   │   └── payments.js / category.js / section.js
│   ├── middleware/
│   │   └── auth.js           # JWT verification & role guards (isStudent, isInstructor, isAdmin)
│   ├── models/
│   │   ├── Certificate.js    # Certificate model with type: course | classroom
│   │   ├── Classroom.js      # Classroom schema with embedded materials/assignments
│   │   ├── subSection.js     # SubSection model supporting isQuiz & quizUrl
│   │   └── user.js / course.js / CourseProgress.js / profile.js / OTP.js
│   ├── routes/               # API route modules (/api/v1/...)
│   └── server.js             # Express application entry point
│
├── frontend/
│   ├── data/                 # Sidebar navigation & links
│   └── src/
│       ├── components/
│       │   ├── common/       # Navbar, Footer, Modals, FilePreviewModal
│       │   └── core/
│       │       ├── Auth/     # Route guards (OpenRoute, ProtectedRoute, AdminRoute)
│       │       ├── Dashboard/# InstructorChart (Bar/Line graphs), MyProfile, CourseBuilder
│       │       └── ViewCourse/# VideoDetails (Player & Quiz View), VideoDetailsSidebar (Progress & Cert Claim)
│       ├── pages/
│       │   ├── CertificateView.jsx  # Public verifiable certificate page with isolated print
│       │   ├── ClassroomView.jsx    # Virtual classroom workspace (Feed/Materials/Assignments/Quizzes)
│       │   ├── AdminDashboard.jsx   # Super Admin console
│       │   └── Catalog.jsx / CourseDetails.jsx / Dashboard.jsx
│       ├── services/         # API endpoints & async thunks (certificateAPI, courseDetailsAPI, etc.)
│       └── App.jsx           # App routing table
│
├── .gitignore                # Global workspace gitignore
└── README.md                 # System documentation
```

---

## 🚀 Local Setup Guide

### 1 · Clone Repository
```bash
git clone https://github.com/Pranjal578/LearnHub-E-Learning-Platform.git
cd LearnHub-E-Learning-Platform
```

### 2 · Backend Setup
```bash
cd backend
npm install
npm run dev
```
*Backend server runs on `http://localhost:5000`.*

### 3 · Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend dev server runs on `http://localhost:5173`.*

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
