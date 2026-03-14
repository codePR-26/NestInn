# NestInn Backend API

![.NET](https://img.shields.io/badge/.NET-10-blue)
![C#](https://img.shields.io/badge/C%23-Backend-purple)
![Status](https://img.shields.io/badge/API-Active-success)

The **NestInn Backend** is built using **ASP.NET Core Web API** and provides RESTful services for the NestInn property booking platform.

It handles authentication, property management, bookings, messaging, and payment processing.

---

# Backend Architecture

```text
Controller Layer
       │
       ▼
Service Layer
       │
       ▼
Data Access Layer
       │
       ▼
Entity Framework Core
       │
       ▼
SQL Server Database
```

---

# API Modules

### Authentication

* Register user
* Login user
* OTP verification
* JWT token generation

### Property Management

* Add property
* Update property
* Search properties
* Property details

### Booking System

* Create booking
* View booking history

### Messaging

* User ↔ Owner chat system

### Payments

* Payment processing
* Transaction tracking

### CEO Dashboard

* Earnings overview
* Withdrawal system

---

# Tech Stack

* ASP.NET Core Web API
* Entity Framework Core
* SQL Server
* JWT Authentication
* C#

---

# Run Backend

Navigate to backend folder:

```bash
cd Backend/NestInn.API
```

Restore dependencies:

```bash
dotnet restore
```

Run API:

```bash
dotnet run
```

API will run on:

```
https://localhost:5001
```

---

# Database

Database schema file:

```
Database/Database_Schema_NestInn.sql
```

Import it into SQL Server.

---

# Author

**Prithwish Bhowmik**

GitHub
https://github.com/codePR-26
