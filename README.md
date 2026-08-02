<div align="center">

# 🎓 LearnHub — Full-Stack E-Learning, Virtual Classroom & MCQ Quiz Platform

**A production-ready MERN stack Ed-Tech platform featuring Role-Based Access Control (RBAC), Interactive Classrooms, Enforced Enrollment Quizzes, Instructor Student Attempt Remarks, Verifiable Certificates of Completion, Graph Analytics, and Containerized Docker Deployment.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

<br/>

[**🐳 Docker Setup**](#-docker-setup--deployment) &nbsp;·&nbsp; [**🚀 Local Setup**](#-local-setup-guide) &nbsp;·&nbsp; [**✨ Features**](#-key-features) &nbsp;·&nbsp; [**🔐 RBAC Portal**](#-role-based-access-control-rbac--test-accounts) &nbsp;·&nbsp; [**📡 API Reference**](#-api-reference)

</div>

---

## 📌 Overview

**LearnHub** is a comprehensive educational ecosystem built to bridge self-paced video courses with live interactive classroom environments. It provides complete solutions for students, instructors, and administrators:

1. **Course Marketplace**: Video streaming, lecture progress tracking, auto-evaluating MCQ quizzes, and **Verifiable Certificates of Completion** granted strictly upon 100% course lecture completion.
2. **Interactive Virtual Classrooms**: Real-time instructor-student hubs with feed announcements, direct document notes, timed assignments, and interactive MCQ quizzes.
3. **Classroom Quiz & Remarks Engine**: Quizzes are restricted exclusively to enrolled classroom students. The quiz creator instructor can review student performance remarks, scores, and answer breakdowns.
4. **Instructor Analytics Console**: Interactive Chart.js graphs monitoring student enrollments, course revenues, and content statistics.
5. **Docker Containerization**: Pre-configured multi-stage Docker builds and Docker Compose for 1-command environment setup.

---

## ✨ Key Features & Highlights

### 📋 Enforced Classroom Quizzes & Instructor Student Remarks
- **Enrolled-Only Access**: Classroom quizzes are accessible only to students who are actively enrolled in the classroom.
- **Instructor Attempt Remarks View**: Only the instructor who created the quiz (or classroom owner / admin) can view student attempt details, including:
  - Student profile & attempt timestamp
  - Auto-calculated score & percentage
  - Automated performance remarks (*Outstanding 100%*, *Passed / Good Performance*, *Average*, *Needs Improvement*)
  - Expandable answer-by-answer breakdown comparing student choices against expected correct answers.
- **Resubmission Prevention**: Strict backend enforcement preventing quiz resubmission or unauthorized score editing.

### 🏆 Verifiable 100% Completion Certificates
- **Enforced 100% Progress**: Certificates are unlocked **only** when a student completes 100% of course lectures.
- **Unique Verification Code**: Generates a unique `CERT-XXXX` code with public verification (`/verify-certificate/:code`).
- **Clean Print Layout**: Built-in `@media print` rules for printing official certificate documents cleanly.

### 📊 Instructor Graph Analytics
- Dynamic **Chart.js** **Bar & Line Graphs** visualizing total earnings, enrollments, and course revenue breakdowns.

### 🐳 Full Docker & Nginx Support
- **Production Ready**: 2-stage Nginx static serving for React frontend and Node 18 Alpine image for backend Express API.

---

## 🐳 Docker Setup & Deployment

Run the complete LearnHub platform with Docker in **1 command**:

```bash
# Clone repository
git clone https://github.com/Pranjal578/Learn-hub.git
cd Learn-hub

# Build and start frontend & backend services
docker compose up --build
```
> Access the web application at **`http://localhost`** and API at **`http://localhost:5000`**.

### Published Docker Hub Images
```bash
# Pull published production images directly from Docker Hub
docker pull pranjal9362/learnhub-backend:latest
docker pull pranjal9362/learnhub-frontend:latest

# Or launch entire stack using docker-compose
docker compose up
```

---

## 🔐 Role-Based Access Control (RBAC) & Test Accounts

| Role | Access URL | Default Test Credentials | Primary Capabilities |
|------|------------|--------------------------|----------------------|
| **Super Admin** | `http://localhost:5173/admin-secure-portal/login` | `admin@test.com` / `password123` | Global system oversight, platform stats console, category management, full classroom & course audit |
| **Instructor** | `http://localhost:5173/login` | `instructor@test.com` / `password123` | Multi-step Course Builder, Instructor Analytics Graphs, Create Classrooms, Post Materials & Timed Assignments, Check Student Quiz Remarks |
| **Student** | `http://localhost:5173/login` | `student@test.com` / `password123` | Enroll in courses, watch lectures, attempt classroom quizzes, claim **100% Completion Certificates**, join classrooms via code |

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite 4, Redux Toolkit, Tailwind CSS, Chart.js, React Icons
- **Backend**: Node.js, Express.js, MongoDB & Mongoose ODM
- **Security & Auth**: JWT (JSON Web Tokens), bcrypt, OTP verification, Rate Limiting, SubSection & Classroom Validators
- **Cloud Services**: Cloudinary (Media & Large Video Chunking), Razorpay (Payments), Nodemailer (SMTP Mail)
- **DevOps**: Docker, Docker Compose, Nginx Reverse Proxy

---

## 🏗️ System Architecture

```text
  ┌──────────────────────┐   HTTP / REST API (JSON)   ┌──────────────────────┐
  │    React 18 Client   │ ─────────────────────────► │   Express Server     │
  │  Redux / Vite / Nginx│ ◄───────────────────────── │   Node.js + JWT      │
  └──────────────────────┘                            └──────────┬───────────┘
                                                                  │
      ┌──────────────────┬──────────────────┬────────────────────┼────────────────────┐
      ▼                  ▼                  ▼                    ▼                    ▼
┌───────────┐      ┌────────────┐     ┌───────────┐        ┌───────────┐        ┌───────────┐
│  MongoDB  │      │ Cloudinary │     │ Razorpay  │        │Nodemailer │        │  Docker   │
│(Atlas/Loc)│      │Media Upload│     │ Payments  │        │ SMTP Mail │        │ Containers│
└───────────┘      └────────────┘     └───────────┘        └───────────┘        └───────────┘
```

---

## 📡 API Reference

### Quizzes (`/api/v1/quiz`)
- `POST /create` — Create & publish classroom/course quiz (Instructor/Admin)
- `POST /submit` — Submit quiz answers & auto-evaluate (Enrolled Student)
- `GET /classroom/:classroomId` — Fetch classroom quizzes & student attempt status (Enrolled Student/Instructor)
- `GET /:quizId` — Fetch single quiz details

### Classrooms (`/api/v1/classroom`)
- `POST /create` — Create classroom & generate unique join code (Instructor)
- `POST /join` — Join classroom using unique code (Student)
- `GET /my-classrooms` — Fetch enrolled or created classrooms
- `POST /material` — Post learning material / PDF / link (Instructor)
- `POST /assignment` — Create timed assignment (Instructor)
- `POST /submit-assignment` — Submit assignment PDF or link (Student)

---

## 🚀 Local Setup Guide (Without Docker)

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:5000`.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
