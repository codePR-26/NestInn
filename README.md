# 🏠 NestInn – Full Stack Property Booking Platform

![Angular](https://img.shields.io/badge/Angular-17-red)
![.NET](https://img.shields.io/badge/.NET-10-blue)
![Node](https://img.shields.io/badge/Node-20-green)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Status](https://img.shields.io/badge/Status-Active-success)

NestInn is a **full-stack property booking platform** where users can browse rental properties, owners can list their properties, and bookings are handled through a secure backend API.

The project demonstrates a **modern enterprise-style architecture using Angular and ASP.NET Core Web API with SQL Server**.

---

# 🚀 Features

* User registration & login with **JWT authentication**
* Property listing and search
* Booking system
* Owner dashboard
* CEO dashboard with earnings overview
* Messaging system between users and property owners
* Email OTP verification
* Payment processing module
* AI-powered chatbot assistant (Frontend-based)
* Cloudinary-based image upload system

---

# 🧰 Tech Stack

## Frontend

* **Angular 17**
* **TypeScript**
* **SCSS**
* Angular Guards & Services

## Backend

* **ASP.NET Core Web API**
* **Entity Framework Core**
* **JWT Authentication**
* **C#**

## Database

* **SQL Server**

## Development Tools

* **Visual Studio**
* **VS Code**
* **Git & GitHub**
* **Postman**

---

# 📦 Environment Versions

| Tool           | Version     |
| -------------- | ----------- |
| Node.js        | 20.20.1     |
| Angular CLI    | 17.3.0      |
| npm            | 10.8.2      |
| .NET SDK       | 10.0.200    |
| Additional SDK | 9.0.311     |
| OS             | Windows x64 |

---

# 🏗 System Architecture

NestInn follows a **layered architecture pattern**.

```
Angular Frontend
        │
        ▼
ASP.NET Core REST API
        │
        ▼
Service Layer
        │
        ▼
Entity Framework Core
        │
        ▼
SQL Server Database
```

---

# ☁️ Cloudinary Image Upload Flow

```
User uploads image (Angular Frontend)
        │
        ▼
Image sent via HTTP request
        │
        ▼
ASP.NET Core Backend API
        │
        ▼
Cloudinary SDK uploads image
        │
        ▼
Image stored in Cloudinary CDN
        │
        ▼
Image URL returned to backend
        │
        ▼
Stored in SQL Server database
        │
        ▼
Frontend displays image using URL
```

### 🔹 How it Works

* Images are stored in **Cloudinary cloud**
* Only image URL is saved in database
* Faster loading using CDN
* No local storage required

---

# 🤖 Chatbot Working Flow (Frontend-Based)

```
User enters message (Angular UI)
        │
        ▼
Frontend sends request directly to Groq API
        │
        ▼
Groq AI processes the request
        │
        ▼
Response returned to Frontend
        │
        ▼
Chatbot displays response
```

### 🔹 Key Points

* Chatbot runs **fully in frontend**
* Uses **Groq API (LLM)**
* No backend integration for chatbot
* Provides:

  * Property assistance
  * Booking help
  * General queries

---

# 📊 System Flowchart

👉 https://codepr-26.github.io/NestInn/docs/nestinn_flowchart.html

---

# 🗄 Database ER Diagram

👉 https://codepr-26.github.io/NestInn/docs/NestInn_ER_Diagram.html

---

# 📂 Project Structure

```
NestInn
│
├── Backend
│   └── NestInn.API
│
├── Frontend
│   └── nestinn-frontend
│
├── Database
│   └── Database_Schema_NestInn.sql
│
├── docs
│   ├── nestinn_flowchart.html
│   └── NestInn_ER_Diagram.html
│
└── README.md
```

---

# ⚙ Installation Guide

## 1️⃣ Clone Repository

```
git clone https://github.com/codePR-26/NestInn.git
cd NestInn
```

---

# 🔧 Backend Setup (.NET)

```
cd Backend/NestInn.API
dotnet restore
dotnet run
```

Backend runs on:

```
https://localhost:5001
```

---

# 🎨 Frontend Setup (Angular)

```
cd Frontend/nestinn-frontend
npm install
ng serve
```

Frontend runs on:

```
http://localhost:4200
```

---

# 🗄 Database Setup

1. Open SQL Server Management Studio
2. Create a new database
3. Import schema from:

```
Database/Database_Schema_NestInn.sql
```

---

# 🔐 Authentication Flow

```
User Registration
        │
        ▼
OTP Email Verification
        │
        ▼
Login
        │
        ▼
JWT Token Generated
        │
        ▼
Access Protected Routes
```

---

# 📡 Main API Modules

* AuthController
* PropertyController
* BookingController
* MessageController
* PaymentController
* CeoController

---

# 🔮 Future Improvements

* Secure chatbot integration via backend
* Stripe / Razorpay integration
* Image optimization & compression
* Admin moderation dashboard
* Docker deployment
* CI/CD pipeline (GitHub Actions)

---

# 👨‍💻 Author

**Prithwish Bhowmik**

GitHub:
https://github.com/codePR-26

---

# ⭐ Support

If you like this project, consider **starring the repository** ⭐
