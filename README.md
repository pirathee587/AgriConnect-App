# AgriConnect — Farmer & Agency Vegetable Transport Platform

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/React%20Native-Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/Redux%20Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Auth-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
</p>

> **AgriConnect** is a full-stack mobile platform that connects **farmers** with **transport agencies** for vegetable logistics. Farmers can book transport packages, agencies manage drivers and vehicles, and admins oversee the entire ecosystem — all secured with JWT authentication and OTP verification.

---

## 📌 Project Overview

AgriConnect solves the last-mile logistics problem for Sri Lankan farmers by providing a streamlined platform where:

- 🌾 **Farmers** browse transport packages, make bookings, rate agencies, and manage their profile.
- 🚚 **Agencies** manage drivers, vehicles, packages, earnings, and handle booking assignments.
- 🛡️ **Admins** verify agencies, manage users, oversee bookings, and monitor platform revenue.

---

## 🗂️ Repository Structure

This is a **monorepo** containing both the backend and the mobile frontend:

```
AgriConnect/
├── Backend/      # Spring Boot REST API (Java 21 + PostgreSQL)
└── Frontend/     # React Native mobile app (Expo + TypeScript)
```

---

## 🚀 Backend — Spring Boot REST API

### Prerequisites

- **Java 21**
- **Maven** (Maven wrapper `mvnw` included — no global install needed)
- **PostgreSQL** running locally or remotely

### 1. Create the Database

```sql
CREATE DATABASE agriconnect;
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` in the `Backend/` directory and fill in your values:

```env
# Server
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=prod

# Admin Bootstrap (first-time setup)
BOOTSTRAP_DEFAULT_ADMIN=true
BOOTSTRAP_ADMIN_NAME=Admin
BOOTSTRAP_ADMIN_PHONE=+94xxxxxxxxx
BOOTSTRAP_ADMIN_PASSWORD=your_password
BOOTSTRAP_ADMIN_EMAIL=admin@example.com

# Database
DB_URL=jdbc:postgresql://localhost:5432/agriconnect
DB_USERNAME=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRATION_MS=86400000

# CORS
CORS_ALLOWED_ORIGIN_PATTERNS=http://localhost:5173,http://localhost:3000

# Twilio (OTP via SMS)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# PayHere (Payments)
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_MERCHANT_SECRET=your_secret
PAYHERE_API_URL=https://www.payhere.lk/pay/checkout

# File Uploads
FILE_UPLOAD_DIR=uploads

# Email (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=your_email@gmail.com
```

> ⚠️ **Security:** Never commit real credentials. Always use `.env` (gitignored) or a secrets manager in production.

### 3. Run in Development Mode

```bash
cd Backend
./mvnw spring-boot:run
```

### 4. Build a Runnable JAR

```bash
./mvnw clean package
java -jar target/agriconnect-backend-1.0.0.jar
```

The server starts at: **`http://localhost:8080`**

---

## 📱 Frontend — React Native (Expo)

### Prerequisites

- **Node.js** (LTS recommended)
- **Expo CLI**: `npm install -g expo-cli`
- **Android Studio** or **Xcode** (for emulators), or the **Expo Go** app on your device

### 1. Install Dependencies

```bash
cd Frontend
npm install
```

### 2. Configure Environment

Create a `.env` file in the `Frontend/` directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080
```

### 3. Start the App

```bash
# Start Expo dev server
npm start

# Or target a specific platform
npm run android
npm run ios
npm run web
```

---

## 🏗️ Backend Architecture

### Module Structure

```
src/main/java/com/agriconnect/
├── AgriconnectApplication.java      # Spring Boot entrypoint
├── admin/                           # Admin module
│   ├── agencyverification/          # Verify & approve agencies
│   ├── auth/                        # Admin authentication
│   ├── bookingmanagement/           # Monitor all bookings
│   ├── driverregistry/              # Registry of all drivers
│   ├── packagemanagement/           # Manage transport packages
│   ├── revenue/                     # Platform revenue reports
│   └── usermanagement/              # User CRUD & management
├── agency/                          # Agency module
│   ├── assignment/                  # Driver-to-booking assignments
│   ├── auth/                        # Agency registration & login
│   ├── booking/                     # Booking management
│   ├── driver/                      # Driver management
│   ├── earnings/                    # Earnings & payouts
│   ├── payment/                     # Payment processing
│   ├── pkg/                         # Transport package CRUD
│   ├── profile/                     # Agency profile
│   └── vehicle/                     # Vehicle management
├── farmer/                          # Farmer module
│   ├── auth/                        # Farmer registration & login
│   ├── bankdetail/                  # Bank details for payouts
│   ├── booking/                     # Book transport packages
│   ├── pkg/                         # Browse available packages
│   ├── profile/                     # Farmer profile
│   └── rating/                      # Rate agencies
└── shared/                          # Shared infrastructure
    ├── config/                      # Security, CORS, WebSocket config
    ├── entity/                      # JPA entities
    ├── enums/                       # Shared enums
    ├── exception/                   # Global exception handling
    ├── repository/                  # Spring Data JPA repositories
    ├── security/                    # JWT filter, UserDetailsService
    └── service/                     # Shared services (OTP, mail, etc.)
```

---

## 🗄️ Data Models (JPA Entities)

| Entity           | Table              | Key Fields                                                        |
|------------------|--------------------|-------------------------------------------------------------------|
| `User`           | `users`            | `id`, `name`, `phone`, `email`, `role`, `passwordHash`           |
| `Farmer`         | `farmers`          | `id`, `user`, `district`, `address`                              |
| `Agency`         | `agencies`         | `id`, `user`, `nicNumber`, `address`, `status`, `averageRating`  |
| `Agent`          | `agents`           | `id`, `user`, `agency`, `nicNumber`                              |
| `Driver`         | `drivers`          | `id`, `agency`, `name`, `licenseNumber`, `phone`                 |
| `Vehicle`        | `vehicles`         | `id`, `agency`, `licensePlate`, `type`, `capacity`               |
| `Package`        | `packages`         | `id`, `agency`, `name`, `pricePerKg`, `vegetables`               |
| `PackageVegetable` | `package_vegetables` | `id`, `package`, `vegetableName`                             |
| `Booking`        | `bookings`         | `id`, `package`, `farmer`, `vegetableName`, `weightKg`, `status` |
| `Payment`        | `payments`         | `id`, `booking`, `amount`, `status`                              |
| `Rating`         | `ratings`          | `id`, `farmer`, `agency`, `score`, `comment`                     |
| `BankDetail`     | `bank_details`     | `id`, `farmer`, `bankName`, `accountNumber`                      |
| `Notification`   | `notifications`    | `id`, `user`, `title`, `message`, `isRead`                       |
| `OtpLog`         | `otp_logs`         | `id`, `phone`, `code`, `expiresAt`, `verified`                   |
| `AgencyDocument` | `agency_documents` | `id`, `agency`, `documentType`, `filePath`                       |

---

## 🛠️ Technologies Used

### Backend

| Technology | Purpose |
|---|---|
| Spring Boot 3.2 | Application framework |
| Java 21 | Language runtime |
| Spring Web | REST API layer |
| Spring Data JPA + Hibernate | ORM / database access |
| Spring Security + JWT | Authentication & authorization |
| Spring Validation | Input validation |
| Spring WebSocket | Real-time notifications |
| Spring Boot Actuator | Health checks & metrics |
| Spring Boot Mail | Email notifications (SMTP) |
| PostgreSQL | Production database |
| Twilio SDK | OTP SMS verification |
| Lombok | Boilerplate reduction |
| Maven | Build tool |

### Frontend

| Technology | Purpose |
|---|---|
| React Native | Cross-platform mobile framework |
| Expo ~54 | Dev toolchain & native APIs |
| TypeScript | Type-safe development |
| Redux Toolkit | Global state management |
| React Redux | React bindings for Redux |
| React Navigation | Screen navigation |
| Axios | HTTP client |
| Expo Image Picker | Camera & gallery access |
| Expo Linear Gradient | UI gradients |
| AsyncStorage | Local persistence |

---

## ✨ Features by Role

### 🌾 Farmer
- Register & login with phone/OTP verification
- Browse available transport packages
- Book a package with vegetable details & pickup address
- Track booking status in real-time
- Rate and review transport agencies
- Manage profile and bank details

### 🚚 Agency
- Register & await admin approval
- Manage drivers and vehicles
- Create and publish transport packages
- View and assign incoming bookings to drivers
- Track earnings and payment history
- Manage agency profile

### 🛡️ Admin
- Verify and approve/reject agency registrations
- Manage all platform users (farmers, agencies, agents)
- Monitor all bookings across the platform
- Manage transport packages
- View revenue reports and analytics
- Maintain the driver registry

---

## 🔒 Security

- **JWT Bearer Tokens** — stateless authentication for all protected endpoints
- **Role-Based Access Control (RBAC)** — `FARMER`, `AGENCY`, `AGENT`, `ADMIN` roles
- **OTP Verification** — phone number verified via Twilio SMS on registration
- **Password Hashing** — BCrypt encryption
- **CORS** — configurable allowed origins via environment variable

---

## 🚀 Production Checklist

- [ ] Set `SPRING_PROFILES_ACTIVE=prod`
- [ ] Use strong, randomly-generated `JWT_SECRET`
- [ ] Secure database credentials via environment variables or a secrets manager
- [ ] Configure `CORS_ALLOWED_ORIGIN_PATTERNS` to your production frontend domain
- [ ] Set up a production PostgreSQL instance with backups
- [ ] Configure Twilio credentials for live OTP delivery
- [ ] Set up a mail provider for email notifications
- [ ] Set `BOOTSTRAP_DEFAULT_ADMIN=false` after initial admin is created
- [ ] Reverse proxy (Nginx/Caddy) in front of Spring Boot
- [ ] Enable HTTPS / TLS on the production server

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
