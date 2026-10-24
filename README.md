# AWDF Practical 6: Full Stack Integration (React + Node + MongoDB)

CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY  
FACULTY OF TECHNOLOGY AND ENGINEERING  
Department of Information Technology / Computer Engineering / CSE / AIML  
**Course Code:** ITUE301 (Advanced Web Development Frameworks)

---

## 🎯 Objective
To wire the React frontend to the Node/Express/MongoDB backend into a fully functional full-stack application with real-time state synchronization, loading & error states, deletion confirmation, and toast feedback.

---

## 🏗️ Architecture
```
React Frontend (localhost:5173)
       │  fetch() / REST API calls (CORS enabled)
       ▼
Express Backend (localhost:5000)
       │  Mongoose ODM
       ▼
MongoDB Database (localhost:27017)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+
- **MongoDB**: Running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### 2. Frontend Setup (React + Vite)
```bash
# Install frontend dependencies
npm install

# Start Vite development server (runs on port 5173)
npm run dev
```

### 3. Backend Setup (Node.js + Express + MongoDB)
Open a separate terminal window:
```bash
# Navigate to server directory & install dependencies
cd server
npm install

# Start the Express server (runs on port 5000)
npm start
```

---

## 🛠️ Key Features Implemented

1. **Central API Layer (`src/api.js`)**: Base backend URL configuration (`http://localhost:5000`), standardized `GET`, `POST`, `PUT`, `DELETE` methods, and automatic local demo fallback mode.
2. **Task Creation & Optimistic UI**: Tasks appear in the UI immediately while syncing with MongoDB in the background.
3. **Task Status Toggle & Editing**: Instant checkbox completion toggle and edit modal for title, description, priority, and status.
4. **Delete Confirmation Dialog**: Modal confirmation dialog before permanently removing records from MongoDB.
5. **Toast Notifications**: Floating notification component for CRUD success and failure responses.
6. **Loading & Error Handling**: Operation-level spinner feedback, error alert cards, and manual retry options.
7. **Simulate Error Mode**: Toggle button to demonstrate network failure and error recovery for viva evaluation.
8. **Analysis & Troubleshooting Guide**: Detailed answers to CORS, state synchronization, and write error handling questions.
