# CampusCloud - College Learning Management System

![CampusCloud Logo](./public/images/logo.png)

A comprehensive MERN stack application for managing college courses, quizzes, and preference forms with role-based access control. CampusCloud streamlines educational workflows for students, faculty, and management.

**Live Demo:** [https://campuscloud.netlify.app](https://campuscloud.netlify.app)

## � Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Role-Based Access](#role-based-access)
- [Screenshots](#screenshots)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Security Features](#security-features)
- [Contributors](#contributors)
- [License](#license)
- [Contact](#contact)

## 🌟 Overview

CampusCloud is a modern learning management system designed to enhance the educational experience for all stakeholders. It provides a centralized platform for course management, assessments, feedback collection, and performance analytics.

![Dashboard Overview](./public/images/dashboard-overview.png)

## 🚀 Key Features

### Authentication & Authorization
- Secure email/password authentication
- Google OAuth integration for simplified login
- Role-based access control (Student, Faculty, Management)
- Password reset functionality with email verification

![Authentication](./public/images/auth-screen.png)

### Quiz Management
- Create quizzes with multiple question types:
  - Multiple choice (single answer)
  - Multiple choice (multiple answers)
  - True/False
  - Short answer
- Set time limits, passing scores, and availability dates
- Randomize questions for enhanced assessment integrity
- Auto-grading for objective questions
- Manual grading with feedback for subjective questions

![Quiz Creation](./public/images/quiz-creation.png)

### Preference Forms
- Create customizable feedback and preference forms
- Multiple question types (text, rating, multiple-choice)
- Anonymous submission options
- Detailed analytics and reporting
- Schedule forms with specific start/end dates

![Preference Forms](./public/images/preference-forms.png)

### Course Management
- Comprehensive course creation and management
- Student enrollment and tracking
- Faculty assignment to courses
- Course materials and resources organization

![Course Management](./public/images/course-management.png)

### Reporting & Analytics
- Detailed quiz performance metrics
- Student progress tracking
- Course-level analytics
- Exportable reports for further analysis
- Visual data representation with charts and graphs

![Analytics Dashboard](./public/images/analytics-dashboard.png)

### Notifications
- Real-time in-app notification system
- Email notifications for important events
- Deadline reminders for quizzes and forms
- Grading notifications for students

![Notifications](./public/images/notifications.png)

## 🚦 Role-Based Access

### Student
- View and take assigned quizzes with real-time feedback
- Submit preference forms for courses
- View detailed quiz results and instructor feedback
- Track personal academic progress
- Access course materials and resources
- Receive notifications for new assignments and grades

![Student Dashboard](./public/images/student-dashboard.png)

### Faculty
- Create and manage quizzes for assigned courses
- Grade student submissions with detailed feedback
- Create preference forms to gather student feedback
- View comprehensive reports for their courses
- Manage course content and materials
- Track student performance and engagement

![Faculty Dashboard](./public/images/faculty-dashboard.png)

### Management
- System-wide administration and oversight
- Manage all courses, departments, and academic programs
- Create and assign faculty to courses
- Generate comprehensive institutional reports
- User management across all roles
- System configuration and settings management

![Management Dashboard](./public/images/management-dashboard.png)

## � Screenshots

### Student Experience
![Student Quiz List](./public/images/student-quiz-list.png)
![Taking a Quiz](./public/images/quiz-taking.png)
![Quiz Results](./public/images/quiz-results.png)
![Student Preference Forms](./public/images/student-preference-forms.png)

### Faculty Experience
![Faculty Quiz Management](./public/images/faculty-quiz-management.png)
![Grading Interface](./public/images/grading-interface.png)
![Faculty Reports](./public/images/faculty-reports.png)
![Creating Preference Forms](./public/images/create-preference-form.png)

### Management Experience
![User Management](./public/images/user-management.png)
![Course Creation](./public/images/course-creation.png)
![System Reports](./public/images/system-reports.png)
![Management Analytics](./public/images/management-analytics.png)

## � Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **Passport.js** - Google OAuth integration
- **Bcrypt** - Password hashing
- **Nodemailer** - Email functionality

### Frontend
- **React** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Icons** - Icon library
- **Context API** - State management
- **Chart.js** - Data visualization

## 📝 Project Structure

```
├── client/                 # React frontend
│   ├── public/             # Static files and images
│   └── src/
│       ├── components/     # Reusable components
│       ├── context/        # React context providers
│       ├── pages/          # Page components
│       │   ├── student/    # Student-specific pages
│       │   ├── faculty/    # Faculty-specific pages
│       │   └── management/ # Management-specific pages
│       ├── services/       # API service functions
│       └── utils/          # Utility functions
│
└── server/                 # Node.js backend
    ├── config/             # Configuration files
    ├── controllers/        # Request handlers
    ├── middleware/         # Custom middleware
    ├── models/             # Mongoose models
    └── routes/             # API routes
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14+) and npm
- MongoDB (local or Atlas)
- Google OAuth credentials (optional for OAuth login)

### Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file with required variables
# See .env.example for reference

# Start development server
npm run dev
```

### Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create .env file
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

## 📱 Responsive Design

CampusCloud is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile devices

![Responsive Design](./public/images/responsive-design.png)

## 🔒 Security Features

- **JWT-based Authentication**: Secure token-based user sessions
- **Password Hashing**: Bcrypt for secure password storage
- **HTTP-only Cookies**: Protection against XSS attacks
- **CORS Protection**: Configured for secure cross-origin requests
- **Input Validation**: Comprehensive validation for all user inputs
- **Rate Limiting**: Protection against brute force attacks
- **Role-Based Access Control**: Granular permissions based on user roles

## 👥 Contributors

- Roshan Suthar - Lead Developer

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Contact

For questions or support, please contact:
- Email: sroshan2931@gmail.com
- GitHub: [GitHub Profile](https://github.com/yourusername)
