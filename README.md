# CampusCloud - College Learning Management System

A comprehensive **MERN stack application** for managing college courses, quizzes, and preference forms with **role-based access control**.  
CampusCloud streamlines educational workflows for **students, faculty, and management**.

**Live Demo:** [https://campuscloud.netlify.app](https://campuscloud.netlify.app)

---

## 📑 Table of Contents

- [CampusCloud - College Learning Management System](#campuscloud---college-learning-management-system)
  - [📑 Table of Contents](#-table-of-contents)
  - [🌟 Overview](#-overview)
  - [🚀 Key Features](#-key-features)
    - [🔐 Authentication \& Authorization](#-authentication--authorization)
    - [📝 Quiz Management](#-quiz-management)
    - [📋 Preference Forms](#-preference-forms)
    - [📚 Course Management](#-course-management)
    - [📊 Reporting \& Analytics](#-reporting--analytics)
    - [🔔 Notifications](#-notifications)
  - [🚦 Role-Based Access](#-role-based-access)
    - [👨‍🎓 Student](#-student)
    - [👨‍🏫 Faculty](#-faculty)
    - [🏛️ Management](#️-management)
  - [🖥️ Technology Stack](#️-technology-stack)
    - [Backend](#backend)
    - [Frontend](#frontend)
  - [🗂️ Project Structure](#️-project-structure)
  - [🛠️ Setup Instructions](#️-setup-instructions)
    - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
    - [Navigate to the backend server directory](#navigate-to-the-backend-server-directory)
    - [Install dependencies](#install-dependencies)
    - [Create a .env file with the required environment variables](#create-a-env-file-with-the-required-environment-variables)
    - [Example:](#example)
    - [Start the backend development server](#start-the-backend-development-server)
  - [Frontend Setup](#frontend-setup)
    - [Navigate to the React client directory](#navigate-to-the-react-client-directory)
    - [Install dependencies](#install-dependencies-1)
  - [Create a .env file in the client folder](#create-a-env-file-in-the-client-folder)
    - [Example:](#example-1)
  - [Start the frontend development server](#start-the-frontend-development-server)
  - [Running the Application](#running-the-application)


---

## 🌟 Overview

CampusCloud is a modern **Learning Management System (LMS)** designed to enhance the educational experience for all stakeholders.  
It provides a centralized platform for **course management, assessments, feedback collection, and performance analytics**.

<!-- ![Dashboard Overview](/client/public/Dashboard.png) -->

---

## 🚀 Key Features

### 🔐 Authentication & Authorization
- Secure **email/password authentication**  
- **Google OAuth** integration for simplified login  
- **Role-based access control** (Student, Faculty, Management)  
- Password reset functionality with **email verification**  

<!-- ![Authentication](/client/public/Auth.png) -->

---

### 📝 Quiz Management
- Create quizzes with multiple question types:  
  - Multiple choice (single answer)  
  - Multiple choice (multiple answers)  
  - True/False  
  - Short answer  
- Set **time limits, passing scores, and availability dates**  
- Randomize questions for integrity  
- **Auto-grading** for objective questions  
- **Manual grading** with instructor feedback  

<!-- ![Quiz Creation](/client/public/quiz-creation.png) -->

---

### 📋 Preference Forms
- Create **customizable feedback and preference forms**  
- Support for multiple question types (text, rating, multiple-choice)  
- **Anonymous submission** options  
- Detailed analytics and reporting  
- Schedule forms with **start/end dates**  

<!-- ![Preference Forms](/client/public/preference-forms.png) -->

---

### 📚 Course Management
- End-to-end **course creation and management**  
- **Student enrollment** and tracking  
- Faculty assignment to courses  
- Course materials and resources organization  

<!-- ![Course Management](/client/public/course-management.png) -->

---

### 📊 Reporting & Analytics
- Detailed **quiz performance metrics**  
- Student **progress tracking**  
- Course-level analytics  
- Exportable reports for analysis  
- **Visual charts & graphs**  

<!-- ![Analytics Dashboard](/client/public/analytics-dashboard.png) -->

---

### 🔔 Notifications
- Real-time **in-app notifications**  
- **Email alerts** for important events  
- **Deadline reminders** for quizzes and forms  
- **Grading notifications** for students  

<!-- ![Notifications](/client/public/notifications.png) -->

---

## 🚦 Role-Based Access

### 👨‍🎓 Student
- Attempt assigned quizzes with real-time feedback  
- Submit **preference/feedback forms**  
- View **quiz results** and instructor feedback  
- Track **personal academic progress**  
- Access course resources  
- Receive **notifications** for assignments and grades  

<!-- ![Student Dashboard](/client/public/student-dashboard.png) -->

---

### 👨‍🏫 Faculty
- Create and manage quizzes for assigned courses  
- Grade submissions with detailed feedback  
- Collect insights via preference forms  
- Access **course-level reports**  
- Manage course content and resources  
- Track **student engagement**  

<!-- ![Faculty Dashboard](/client/public/faculty-dashboard.png) -->

---

### 🏛️ Management
- Oversee **system-wide administration**  
- Manage all courses, departments, and programs  
- Assign faculty to courses  
- Generate **institutional reports**  
- Manage users across all roles  
- Configure system settings  

<!-- ![Management Dashboard](/client/public/management-dashboard.png) -->

---

<!--
## 📸 Screenshots

### Student Experience
![Student Quiz List](/client/public/student-quiz-list.png)  
![Taking a Quiz](/client/public/quiz-taking.png)  
![Quiz Results](/client/public/quiz-results.png)  
![Student Preference Forms](/client/public/student-preference-forms.png)  

### Faculty Experience
![Faculty Quiz Management](/client/public/faculty-quiz-management.png)  
![Grading Interface](/client/public/grading-interface.png)  
![Faculty Reports](/client/public/faculty-reports.png)  
![Creating Preference Forms](/client/public/create-preference-form.png)  

### Management Experience
![User Management](/client/public/user-management.png)  
![Course Creation](/client/public/course-creation.png)  
![System Reports](/client/public/system-reports.png)  
![Management Analytics](/client/public/management-analytics.png)  
-->

---

## 🖥️ Technology Stack

### Backend
- **Node.js** – JavaScript runtime  
- **Express.js** – Web framework  
- **MongoDB** – NoSQL database  
- **Mongoose** – Data modeling  
- **JWT** – Secure authentication  
- **Passport.js** – Google OAuth integration  
- **Bcrypt** – Password hashing  
- **Nodemailer** – Email service  

### Frontend
- **React.js** – UI library  
- **Tailwind CSS** – Utility-first CSS framework  
- **React Router** – Client-side routing  
- **Axios** – API client  
- **React Icons** – Icon library  
- **Context API** – State management  
- **Chart.js** – Data visualization  

---

## 🗂️ Project Structure

```text
├── client/                 # React frontend
│   ├── public/             # Static files and images
│   └── src/
│       ├── components/     # Reusable components
│       ├── context/        # Global context providers
│       ├── pages/          # Page components
│       │   ├── student/    # Student-specific pages
│       │   ├── faculty/    # Faculty-specific pages
│       │   └── management/ # Management-specific pages
│       ├── services/       # API service handlers
│       └── utils/          # Utility functions
│
└── server/                 # Node.js backend
    ├── config/             # Configuration files
    ├── controllers/        # Route handlers
    ├── middleware/         # Custom middleware
    ├── models/             # Mongoose schemas
    └── routes/             # API routes

```

## 🛠️ Setup Instructions

### Prerequisites
- **Node.js (v14 or later)** and **npm**
- **MongoDB** (local instance or MongoDB Atlas)
- **Google OAuth credentials** (optional, only needed if you want Google login enabled)

---

## Backend Setup

### Navigate to the backend server directory
`cd server`

### Install dependencies
`npm install`

### Create a .env file with the required environment variables

### Example:
PORT=5000
MONGO_URI=mongodb://localhost:27017/campuscloud
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

### Start the backend development server
`npm run dev`

---

## Frontend Setup

### Navigate to the React client directory
`cd client`

### Install dependencies
`npm install`

## Create a .env file in the client folder

### Example:
`VITE_API_URL=http://localhost:5000/api`

## Start the frontend development server
`npm run dev`

---

## Running the Application

- The **backend** will run on: http://localhost:5000  
- The **frontend** will run on: http://localhost:5173 (default Vite port)  

⚠️ Ensure **MongoDB is running locally** or that your **MongoDB Atlas cluster** is accessible.
