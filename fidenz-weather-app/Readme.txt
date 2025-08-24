# 🌦️ Fidenz Weather App

A full-stack weather application built with **React (frontend)** and **Node.js + Express (backend)**.  
Features **JWT authentication**, **Multi-Factor Authentication (MFA)** via email, and **OpenWeatherMap API integration**.  

---

## 🚀 Features
- 🌐 Real-time weather data from **OpenWeatherMap API**
- 🔐 **JWT-based Authentication**
- 🔑 **Multi-Factor Authentication (MFA)** with email verification
- 📦 **Concurrent development** (backend + frontend runs in one command)
- ⚡ API caching for performance
- 🎨 Modern UI with React + Bootstrap + Toast Notifications

---

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Bootstrap, React Toastify
- **Backend**: Node.js, Express, Nodemailer, JWT
- **Other**: OpenWeatherMap API, Concurrently

---

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/chamidukeshika/Weather-App.git

cd fidenz-weather-app


Configure Environment Variables
🔹 Backend (/backend/.env)

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# OpenWeatherMap API
OPENWEATHER_API_KEY=your_api_key_here
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=24h

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Cache Settings
CACHE_DURATION=300


------------------------------------

Frontend (/frontend/.env)

# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=Fidenz Weather App
VITE_APP_VERSION=1.0.0



npm run install-deps

npm run dev

Backend Only
npm run server

Frontend Only
npm run client

Build Frontend

npm run build

