🌦️ Fidenz Weather App
A full-stack weather application built with React (frontend) and Node.js + Express (backend). Includes JWT authentication, Multi-Factor Authentication (MFA) via email, and real-time weather data from the OpenWeatherMap API.

🚀 Features
•	🌐 Real-time weather updates via OpenWeatherMap API
•	🔐 JWT-based authentication for secure login
•	🔑 Email-based Multi-Factor Authentication (MFA)
•	📦 Concurrent development (backend & frontend run together)
•	⚡ API caching for faster performance
•	🎨 Modern UI using React, Bootstrap, and Toast Notifications

🛠️ Tech Stack
•	Frontend: React, Vite, Bootstrap, React Toastify
•	Backend: Node.js, Express, Nodemailer, JWT
•	Other Tools: OpenWeatherMap API, Concurrently

⚙️ Setup Instructions

1️⃣ Clone the Repository
git clone https://github.com/chamidukeshika/Weather-App.git

cd fidenz-weather-app

2️⃣ Configure Environment Variables(Already included in the repository. You just need to update them with your own credentials and API keys.)

🔹 Backend (/backend/.env)

PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

OPENWEATHER_API_KEY=your_api_key_here  🔑
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5

JWT_SECRET=your_jwt_secret         🔑
JWT_EXPIRE=24h

EMAIL_USER=your_email@gmail.com    🔑
EMAIL_PASS=your_email_app_password 🔑

CACHE_DURATION=300
-----------------------------------------------

🔹 Frontend (/frontend/.env)

VITE_API_URL=http://localhost:5000/api

VITE_APP_NAME=Fidenz Weather App
VITE_APP_VERSION=1.0.0

3️⃣ Install Dependencies

cd backend
npm install

cd ..

cd frontend
npm install

cd ..

4️⃣ Run the Application

npm run dev

App will be available at: http://localhost:5173

5️⃣ Test with Predefined Users

User 1
Email: careers@fidenz.com
Password: Pass#fidenz

User 2
Email: chamidukeshikaz@gmail.com
Password: 123

📌 Notes
•	Make sure to use a valid OpenWeatherMap API key.
•	For MFA, configure Gmail App Passwords if using a Gmail account.
•	Update .env files before running the project.
