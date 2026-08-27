# 🔍 FoundIt - The Intelligent Community Lost & Found Platform

## 📖 What is FoundIt?

**FoundIt** is a full-stack, hyper-localized web application designed to help communities recover lost items quickly and efficiently. Losing a valuable item like keys, a wallet, or a pet is stressful. FoundIt bridges the gap between individuals who have lost items and good samaritans who have found them. 

Unlike traditional bulletin boards or chaotic social media groups, FoundIt is purpose-built with **real-time interactive mapping**, **smart proximity sorting**, and **geofenced notifications**. Whether you're searching for a lost item or trying to return a found one, FoundIt connects you to the right people in your exact vicinity.

## ✨ Key Features

- **🗺️ Interactive Map & Proximity Feed:** View reports either through an interactive map or a feed list. The platform intelligently calculates your distance from each report and **automatically sorts nearby items to the top** of your feed!
- **📍 Geofence Notifications:** Users can drop a pin on their exact neighborhood in their Settings and define a notification radius. They are instantly alerted whenever an item is reported within that zone.
- **📝 Comprehensive Report Management:** Easily create reports with a 3-step wizard (Image -> Details -> Location). Report owners have full access to **edit** their reports (update images, move the map pin, change descriptions) or toggle the item's status between `ACTIVE` and `RESOLVED`.
- **💬 Community Communication:** Every report features an integrated comment thread where finders and owners can communicate securely without sharing phone numbers publicly. Comments show user profile pictures seamlessly synced from Google or direct uploads.
- **🔐 Secure Authentication & Profiles:** Powered by Firebase Authentication, supporting both Email/Password and Google OAuth. Users can upload custom profile pictures and manage their contact details directly on the platform.
- **🖼️ Native Binary Image Storage:** Images are handled via `multipart/form-data` and securely stored and served directly from the PostgreSQL database using Prisma ORM.

---

## 🏗️ Architecture

```
foundit/
├── frontend/          # Next.js (App Router) + Tailwind CSS + Firebase Auth
│   ├── src/
│   │   ├── app/       
│   │   │   ├── page.tsx              # Auth (Login/Register)
│   │   │   ├── dashboard/page.tsx    # Hybrid Map/Feed Dashboard (Proximity Sorted)
│   │   │   ├── search/page.tsx       # Search Engine
│   │   │   ├── report/new/page.tsx   # 3-Step Report Wizard
│   │   │   ├── report/[id]/page.tsx  # Report Details, Editing, and Comments
│   │   │   ├── my-reports/page.tsx   # Personal Dashboard
│   │   │   └── settings/page.tsx     # Profile & Geofence Configuration
│   │   ├── components/               # Reusable UI (Navbar, MapView, ReportCard)
│   │   ├── contexts/                 # Global Auth Context
│   │   └── lib/                      # Firebase setup, API services, Types
│   └── ...
├── backend/           # Node.js + Express.js + Prisma ORM
│   ├── src/
│   │   ├── index.js                  # Express Server
│   │   ├── middleware/               # Firebase Token Verification
│   │   └── routes/                   # RESTful API logic (reports, users, comments)
│   └── prisma/
│       └── schema.prisma             # PostgreSQL Database Schema
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Firebase project (Auth enabled)

### 1. Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Email/Password** and **Google** sign-in methods.
3. Copy your web app config values.
4. Generate a Service Account key for the Node.js backend.

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables (.env)
DATABASE_URL="postgresql://postgres:password@localhost:5432/foundit"
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'

# Push database schema & generate client
npx prisma db push
npx prisma generate

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# Start development server
npm run dev
```

### 4. Access the App
- Frontend Application: `http://localhost:3000`
- Backend API Server: `http://localhost:5000`

---

## 🗄️ API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users/sync` | ✅ | Sync Firebase user to DB |
| GET | `/api/users/me` | ✅ | Get current user profile |
| PATCH | `/api/users/me` | ✅ | Update profile info & picture |
| GET | `/api/reports` | ❌ | List active reports |
| GET | `/api/reports/user/me` | ✅ | Get my reports |
| GET | `/api/reports/:id` | ❌ | Get report detail |
| PATCH | `/api/reports/:id` | ✅ | Edit report details |
| PATCH | `/api/reports/:id/status` | ✅ | Toggle report status |
| DELETE | `/api/reports/:id` | ✅ | Delete report |
| GET | `/api/reports/:id/image` | ❌ | Serve report image |
| POST | `/api/reports` | ✅ | Create report |
| GET | `/api/comments/:reportId` | ❌ | List comments |
| POST | `/api/comments` | ✅ | Add comment |
| POST | `/api/notifications/check` | ✅ | Check geofenced area for nearby reports |

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS 4, Lucide Icons, React Leaflet (Maps)
- **Backend**: Express.js 5, Prisma ORM, Multer (multipart form handling)
- **Database**: PostgreSQL (via Supabase or local)
- **Auth**: Firebase Authentication (Client UI + Admin SDK verification)
