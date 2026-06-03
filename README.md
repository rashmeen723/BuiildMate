# BuildMate — Professional Monorepo Marketplace

BuildMate is a comprehensive, corporate-grade marketplace platform designed to connect household clients, skilled maintenance professionals, and tool owners. It provides a unified ecosystem containing a React Native mobile application, a NestJS REST API, and a Next.js administrative web portal.

This project was developed as an **Individual Project (5th Semester)**.

---

## 🎓 Academic Credits & Guidance

* **Academic Supervisor**: Prof. Thanuja Sandanayake
* **Project Mentor**: Mr. Nipuna Senanayake
* **Student/Developer**: Rashmeen

---

## 💡 Key Features & Roles

The system supports four distinct user roles, each equipped with dedicated dashboards and specialized workflows:

### 1. 🏠 Household Customer (Client)
* **Onboarding & Authentication**: Secure sign-up/login, profile creation, and dynamic category discovery.
* **Service Booking**: Explore maintenance services (e.g., electrical, plumbing) and request bookings.
* **Tool Rentals**: Search, view, and rent local equipment with dynamic daily rates, extensions, and automated price calculations.
* **Interactive Reviews**: Post ratings and detailed feedback with a toggleable "Like/Unlike" system for review engagement.
* **Real-time Tracking**: Interactive map navigation via Expo maps to track service providers on route.

### 2. 🛠️ Service Provider (Expert)
* **Pending Booking Feed**: Inspect details (date, customer profile, issue photos) before approving or declining.
* **Interactive Dashboard**: Track today's earnings, see active bookings, and start provider journeys.
* **Active Progress Tracking**: Update statuses (`ON_THE_WAY`, `ARRIVED`, `COMPLETED`) to keep clients informed.
* **Dispute Reporting**: Option to flag customer accounts or file client issue reports upon service completion.

### 3. 🚜 Rental Owner (Supplier)
* **Dashboard Feeds**: Monitor incoming rental tool orders and ongoing pickups in real-time.
* **Inventory Management (CRUD)**: Create, read, update, and delete tools in the rental inventory (uploading product photos via Cloudinary).
* **Schedules & Splits**: View past completed rentals and ongoing rentals separately, limited to 2 items by default with a "View All / Show Less" toggle.

### 4. 🛡️ System Administrator
* **Trust & Verification**: Approve or reject provider/owner credentials.
* **Identity Audits**: Track document uploads and automated identity flags.
* **Disputes Resolution Panel**: Review client-provider conflicts, penalty configurations, and suspend/unsuspend user profiles.

---

## 🛠️ Technology Stack

BuildMate is configured as a Monorepo managed with **Turborepo** for optimal code compilation and modularity:

* **Mobile Client (`apps/mobile`)**: React Native, Expo CLI, Expo SDK, React Navigation, Expo Linear Gradient, React Native Vector Icons, React Native Maps, Expo Image Picker.
* **Backend REST API (`apps/api`)**: NestJS, Prisma ORM, PostgreSQL / SQLite Database, JWT Authentication (strategies/guards), Cloudinary SDK.
* **Administrative Web Portal (`apps/admin-web`)**: Next.js (App Router), Tailwind CSS, Lucide Icons.

---

## 📂 Codebase Directory Structure

```text
BuildMate/
├── apps/
│   ├── admin-web/              # Next.js admin interface
│   │   ├── src/app/            # App router pages (verifications, disputes, services, settings)
│   │   └── src/services/       # API call utilities
│   ├── api/                    # NestJS API backend
│   │   ├── prisma/             # Database schema and seed population configurations
│   │   ├── src/admin/          # Category CRUD & user controls
│   │   ├── src/auth/           # JWT, signup/login & verification systems
│   │   └── src/disputes/       # Dispute resolution logic
│   └── mobile/                 # React Native / Expo app
│       ├── src/assets/         # Icons and illustration assets
│       ├── src/components/     # Shared components (BottomNavBar, etc.)
│       ├── src/navigation/     # Stack navigators and routes
│       └── src/screens/        # Role-based screens (Activity, Inventory, Dashboard, etc.)
├── package.json                # Core workspaces and dependency scripts
└── turbo.json                  # Turborepo task pipeline configuration
```

---

## 🚀 Getting Started

To get a local development environment running:

### 1. Prerequisite Installations
Ensure you have **Node.js (v18+)** and **npm** installed on your workstation.

### 2. Dependency Setup
Clone the repository and install all dependencies in the monorepo root:
```bash
npm install
```

### 3. Database Initialization
Configure your database connection credentials in `apps/api/.env`. Then run the migrations and seed data script:
```bash
cd apps/api
npx prisma migrate dev
node populate_data.js
```

### 4. Run the Platform
Start the Next.js, NestJS, and Expo development servers concurrently using Turborepo from the root directory:
```bash
npm run dev
```

---

*This project was built with clean type-safety and visual polish to comply with modern UX best practices.*
