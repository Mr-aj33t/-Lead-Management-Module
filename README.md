# 🚀 Lead Management Application

A full-stack Lead Management System built with React, TypeScript, Node.js, Express, and MongoDB. This application allows you to capture, view, and manage leads with a clean, responsive interface.

## ✨ Features

- **Lead Capture Form** with client and server-side validation
- **Lead Listing** with pagination and status filtering
- **Responsive Design** that works on all device sizes
- **Real-time Updates** with toast notifications
- **Type Safety** with TypeScript throughout the stack
- **Modern UI** built with Tailwind CSS

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Hook Form, React Router
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Development Tools**: ESLint, Prettier, TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lead-task-fullstack-enhanced
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   
   # Install backend dependencies
   cd ../server
   npm install
   cd ..
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/lead_management
   NODE_ENV=development
   ```

4. **Start the development servers**
   ```bash
   # Start both frontend and backend in development mode
   npm run dev:all
   ```
   This will start:
   - Frontend at http://localhost:5173
   - Backend at http://localhost:5000

## 🏗 Project Structure

```
lead-task-fullstack-enhanced/
├── client/                 # Frontend React application
│   ├── public/             # Static files
│   └── src/                # Source files
│       ├── components/      # Reusable UI components
│       ├── pages/           # Page components
│       ├── utils/           # Utility functions
│       ├── App.tsx          # Main App component
│       └── main.tsx         # Entry point
│
├── server/                 # Backend Express application
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   └── index.js            # Server entry point
│
├── .env                   # Environment variables
├── package.json           # Root package.json
└── README.md              # This file
```

## 🚀 Available Scripts

- `npm run dev` - Start frontend development server
- `npm run server` - Start backend server
- `npm run server:dev` - Start backend server with nodemon
- `npm start` - Start both frontend and backend in production mode
- `npm run dev:all` - Start both frontend and backend in development mode
- `npm run build` - Build frontend for production

## 🧪 Testing the Application

1. **Frontend**: Open http://localhost:5173 in your browser
2. **Backend API**: Test endpoints at http://localhost:5000/api

## 📝 API Endpoints

### Leads
- `GET /api/leads` - Get all leads with pagination
  - Query params: `page`, `limit`, `status`
  - Example: `GET /api/leads?page=1&limit=10&status=new`

- `POST /api/leads` - Create a new lead
  - Body: `{ name: string, email: string, phone: string, notes?: string }`
  - Example: 
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "notes": "Interested in premium plan"
    }
    ```

## 🛠 Built With

- [React](https://reactjs.org/) - Frontend library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Vite](https://vitejs.dev/) - Frontend build tool
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Express](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Mongoose](https://mongoosejs.com/) - MongoDB object modeling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [Your Name]
