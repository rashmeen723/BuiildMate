# BuildMate - Home Services and Tool Rental Marketplace

Welcome to BuildMate! This monorepo project unites a robust backend API, a modern cross-platform mobile application, and an administrative web dashboard to deliver a secure, scalable, and user-friendly platform for maintenance services and equipment rentals. The system ensures transparency, integrity, and accessibility for all stakeholders—customers, service providers, rental owners, and administrators.

## Table of Contents
* Introduction
* Features
* Technology Stack
* Installation
* Usage
* Project Structure
* Contributors
* Acknowledgments

## Introduction
The BuildMate system is designed to facilitate secure, efficient, and auditable home maintenance bookings and equipment rentals for households and skilled professionals. It comprises:
* Backend API: Built with NestJS, handling business logic, authentication, booking management, user enrollment, catalog mapping, and review/dispute tracking.
* Mobile Client: A cross-platform TypeScript React Native/Expo application delivering an accessible and intuitive interface for customers, service providers, and tool owners.
* Admin Dashboard: A modern TypeScript Next.js web application for platform administration, verification workflows, and dispute resolution.

## Why This System?
Traditional methods of hiring local handymen and renting tools are often fragmented, inefficient, and lack validation. BuildMate addresses these challenges by:
* Automating and verifying complex booking and rental workflows.
* Providing transparent ratings, togglable review likes, and real-time tracking.
* Securing every action with robust role-based JWT authentication and authorization.
* Enabling safe-area layouts that work seamlessly across varying Android and iOS displays.

## Features
* Role-Based Authentication and Authorization: Fine-grained access control for Household Customers, Service Providers, and Rental Owners.
* Trust and Verification System: Admin verification pipelines for documents and credentials.
* Service Booking Workflows: Detailed booking requests with step-by-step state tracking (Pending, Confirmed, On Route, Working, Awaiting Pay, Completed).
* Tool Rental Management: Dynamic day calculations, status tracking (Available, Rented), and interactive rental details.
* Real-time Location Tracking: Interactive map navigation via Expo maps to track service providers on route.
* Review and Feedback System: User ratings and comments with togglable likes for increased engagement.
* Dispute and Suspension Panel: Official resolution tracking and user account suspension options.
* Admin Authentication & Session Guard: A premium Next.js gateway featuring secure logins, dynamic guards, forgot password loops, and eye toggles.
* System Settings & Fee Controls: Configure marketplace commission percentages and dispatch system-wide announcement broadcast updates.
* Reports Center: Export financial ledger profits and marketing diagnostics as CSVs or scoped printable PDFs.
* Android and iOS Status Bar Support: Context-aware safe area handling for notch compatibility.
* Recent Core Upgrades:
  * Timezone-Aligned Booking Validation: Blocks past date-time slots for today dynamically using `Asia/Colombo` timezone.
  * Sri Lankan Rate Normalization: Seeded context-appropriate daily and hourly rates matching typical Sri Lankan market expectations.
  * Gemini AI Verification pipeline: Automated OCR-checking of business permits and utility bills.
  * Weighted Trust Score engine: Computes reliability dynamically and suspends low-score users.
  * Dynamic Role Redirects: Instantly logs in different user roles to their correct screens without flashes.

## Technology Stack

### Backend
* NestJS (API, business logic, and integration)
* Prisma ORM (database client mapping)
* PostgreSQL / Relational Database support
* JWT (JSON Web Tokens authentication)
* Cloudinary SDK (image and document uploads)

### Frontend Mobile
* TypeScript & React Native (UI/UX framework)
* Expo (cross-platform tooling)
* React Navigation (screen navigation)
* Expo Safe Area Context (notch and status bar handling)

### Frontend Web
* Next.js (routing, server-side features)
* Tailwind CSS (styling)
* Lucide React (icons)

## Installation

### Prerequisites
* Backend: Node.js (v18+), npm/yarn, supported relational database
* Mobile: Node.js (v18+), npm/yarn, Expo Go app (for testing on physical devices)
* Admin Web: Node.js (v18+), npm/yarn

### Backend Setup
1. Clone and enter the repository.
2. Navigate to the API folder:
   ```bash
   cd apps/api
   ```
3. Configure your database connection and environment variables in `.env`.
4. Run migrations and database seeding:
   ```bash
   npx prisma migrate dev
   node populate_data.js
   ```

### Mobile Client Setup
1. Navigate to the mobile folder:
   ```bash
   cd apps/mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npx expo start
   ```

### Admin Web Setup
1. Navigate to the web folder:
   ```bash
   cd apps/admin-web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Usage
* Household Customers: Browse categories, book services, rent tools, check provider locations, submit reviews, and like reviews.
* Service Providers: Configure categories, accept/decline bookings, track active paths, report client issues, and check ratings.
* Rental Owners: Manage tools, add equipment to catalog, track rental returns, and view order details.
* System Administrators: Manage category registries, review pending verifications, uphold disputes, and suspend users.

## Project Structure

### Backend (apps/api)
```text
├── prisma/
│   ├── schema.prisma             # Data models and DB schema mapping
│   ├── seed.ts                   # Seed data configuration
├── src/
│   ├── admin/                    # Category CRUD and admin controls
│   ├── auth/                     # JWT authentication and user roles
│   ├── disputes/                 # Dispute resolution and logging
│   ├── rentals/                  # Rental orders tracking
│   ├── services/                 # Service bookings tracking
│   ├── app.module.ts             # Main app module
│   └── main.ts                   # App bootstrapper
├── populate_data.js              # Database seeder execution script
├── package.json
└── README.md
```

### Frontend Mobile (apps/mobile)
```text
├── src/
│   ├── assets/                   # Images and branding files
│   ├── components/               # Navbars and common widgets
│   ├── constants/                # Theme colors and margins
│   ├── context/                  # Auth state provider
│   ├── navigation/               # Route stacks and navigation definitions
│   ├── screens/                  # Mobile screens (Dashboards, Booking Details, Schedules)
│   └── services/                 # API connection configurations
├── package.json
├── tsconfig.json
├── README.md
└── ...
```

### Frontend Web (apps/admin-web)
```text
├── src/
│   ├── app/                      # App router layout and page views
│   │   ├── login/                # Admin Portal auth and recovery wizard
│   │   ├── providers/            # User Directory control grid
│   │   ├── reports/              # Reports generation and print dashboard
│   │   ├── verifications/        # KYC verifications list
│   ├── components/               # Divided reusable widgets (StatCard, Modals)
│   └── services/                 # Authenticated API connections
├── package.json
├── tsconfig.json
├── README.md
└── ...
```

## Contributors
* J.G.J.M Rashmeen Kavindya Bandara

## Acknowledgments
* Supervised by: Prof. Thanuja Sandanayake, Faculty of Information Technology, University of Moratuwa.
* Project Mentor: Mr. Nipuna Senanayake.
* Special thanks to the Faculty of Information Technology at the University of Moratuwa for academic and platform guidance.
* Disclaimer: This system is intended for research and demonstration purposes only.
