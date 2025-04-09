# CampusCloud - College Quiz Management System

A comprehensive MERN stack application for managing college quizzes, tests, and preference forms with role-based access control.

**Live Demo:** [https://campuscloud.netlify.app](https://campuscloud.netlify.app)

## 📝 Project Structure

```
├── client/                 # React frontend
│   ├── public/             # Static files
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

## 🚦 Role-Based Access

### Student
- View and take assigned quizzes
- Submit preference forms
- View quiz results and feedback
- Track personal progress

### Faculty
- Create and manage quizzes for assigned courses
- Grade student submissions
- Create preference forms
- View reports for their courses

### Management
- System-wide administration
- Manage all courses, quizzes, and forms
- Generate comprehensive reports
- User management

## Prerequisites

- Node.js (v14+) and npm
- MongoDB (local or Atlas)
- Google OAuth credentials

## 🔧 Setup Instructions

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

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- HTTP-only cookies
- CORS protection
- Input validation
- Rate limiting

## � Screenshots

![Dashboard](https://campuscloud.netlify.app/screenshots/dashboard.png)
![Quiz Creation](https://campuscloud.netlify.app/screenshots/quiz-creation.png)
![Quiz Taking](https://campuscloud.netlify.app/screenshots/quiz-taking.png)
![Reports](https://campuscloud.netlify.app/screenshots/reports.png)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributors

- Roshan Suthar - Lead Developer

## 📧 Contact

For questions or support, please contact:
- Email: sroshan2931@gmail.com
- GitHub: [Your GitHub Profile](https://github.com/yourusername)

## �🚀 Features

### Authentication & Authorization
- Email/password authentication
- Google OAuth integration
- Role-based access control (Student, Faculty, Management)
- Secure password reset functionality

### Quiz Management
- Create quizzes with multiple question types:
  - Multiple choice (single answer)
  - Multiple choice (multiple answers)
  - True/False
  - Short answer
- Set time limits, passing scores, and availability dates
- Randomize questions
- Auto-grading for objective questions
- Manual grading for subjective questions

### Preference Forms
- Create customizable preference forms
- Collect student feedback
- Generate detailed reports and analytics
- Schedule forms with start/end dates

### User Management
- Student enrollment in courses
- Faculty assignment to courses
- Profile management
- Role-specific dashboards

### Reporting & Analytics
- Quiz performance metrics
- Student progress tracking
- Course-level analytics
- Exportable reports

### Notifications
- Email notifications for new quizzes and forms
- In-app notification system
- Deadline reminders

## 🔧 Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **Passport.js** - Google OAuth
- **Bcrypt** - Password hashing
- **Nodemailer** - Email functionality

### Frontend
- **React** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Icons** - Icon library
- **Context API** - State management
