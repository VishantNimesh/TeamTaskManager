# TeamTaskManager

A full-stack task management application built with Node.js/Express backend and React frontend with Vite. It features role-based access control (RBAC), user authentication, project management, and task tracking.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication** - Secure login and registration with JWT tokens
- **Role-Based Access Control (RBAC)** - Different permission levels for users (Admin, Manager, User)
- **Project Management** - Create, update, and manage projects with team members
- **Task Management** - Create, assign, and track tasks with status updates
- **Responsive UI** - Modern React frontend with Tailwind CSS styling
- **Protected Routes** - Secure pages with authentication and authorization checks
- **Toast Notifications** - User-friendly feedback messages

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication
- **Mongoose** - MongoDB object modeling

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Context API** - State management
- **Axios** - HTTP client
- **CSS** - Styling

## Project Structure

```
TeamTaskManager/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── authController.js      # Authentication logic
│   │   ├── projectController.js   # Project management
│   │   └── taskController.js      # Task management
│   ├── middleware/
│   │   ├── auth.js                # JWT verification
│   │   └── rbac.js                # Role-based access control
│   ├── models/
│   │   ├── User.js                # User schema
│   │   ├── Project.js             # Project schema
│   │   └── Task.js                # Task schema
│   ├── routes/
│   │   ├── authRoutes.js          # Auth endpoints
│   │   ├── projectRoutes.js       # Project endpoints
│   │   └── taskRoutes.js          # Task endpoints
│   ├── validators/
│   │   ├── authValidator.js       # Auth input validation
│   │   ├── projectValidator.js    # Project validation
│   │   └── taskValidator.js       # Task validation
│   ├── package.json
│   └── server.js                  # Express server setup
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── pages/                 # Page components
│   │   ├── services/              # API services
│   │   ├── context/               # Context API
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas connection string)

## Installation

### Backend Setup

```bash
cd backend
npm install
```

### Frontend Setup

```bash
cd frontend
npm install
```

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/teamtaskmanager
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

Update the configuration in `backend/config/db.js` with your MongoDB connection details.

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm start
```

The backend server will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.