# FoundIt - Localized Lost & Found Network Platform

A full-stack community-powered platform for reporting and discovering lost & found items in your neighborhood, featuring real-time geolocation, interactive maps, and geofenced notifications.

## 🏗️ Architecture

```
foundit/
├── frontend/          # Next.js + Tailwind CSS + Firebase Auth Client
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   │   ├── page.tsx              # Auth (Login/Register)
│   │   │   ├── dashboard/page.tsx    # Hybrid Map/Feed Dashboard
│   │   │   ├── report/new/page.tsx   # 3-Step Report Wizard
│   │   │   ├── report/[id]/page.tsx  # Report Detail + Comments
│   │   │   ├── my-reports/page.tsx   # My Reports Dashboard
│   │   │   └── settings/page.tsx     # Geofence Notifications
│   │   ├── components/               # Shared UI Components
│   │   ├── contexts/                 # Auth Context Provider
│   │   └── lib/                      # Firebase, API, Types
│   └── ...
├── backend/           # Node.js + Express.js + Prisma ORM
│   ├── src/
│   │   ├── index.js                  # Express server
│   │   ├── lib/                      # Prisma client, Firebase Admin
│   │   ├── middleware/               # Auth middleware
│   │   └── routes/                   # API routes
│   └── prisma/
│       └── schema.prisma             # Database schema
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Firebase project (Auth enabled)

### 1. Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Enable **Email/Password** and **Google** sign-in methods
3. Copy your web app config values
4. Generate a service account key for the backend

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
# Edit .env with your PostgreSQL URL and Firebase config
DATABASE_URL="postgresql://postgres:password@localhost:5432/foundit"
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'

# Push database schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies (already installed)
npm install

# Configure environment
# Edit .env.local with your Firebase web config
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# Start development server
npm run dev
```

### 4. Access the App
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🗺️ Hybrid Dashboard | Split Map/Feed view with category filtering |
| 📝 Report Wizard | 3-step creation: Image → Details → Location |
| 💬 Public Comments | Comment threads on item detail pages |
| ✅ Item Lifecycle | Toggle ACTIVE/RESOLVED status |
| 👤 My Reports | Personal dashboard with management tools |
| 🔔 Geofence Alerts | Set radius notifications for nearby reports |
| 🔐 Firebase Auth | Email/password + Google OAuth |
| 📸 Binary Image Storage | Images stored directly in PostgreSQL |

## 🗄️ API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users/sync` | ✅ | Sync Firebase user to DB |
| GET | `/api/users/me` | ✅ | Get current user profile |
| GET | `/api/reports` | ❌ | List active reports |
| GET | `/api/reports/user/me` | ✅ | Get my reports |
| GET | `/api/reports/:id` | ❌ | Get report detail |
| GET | `/api/reports/:id/image` | ❌ | Serve report image |
| POST | `/api/reports` | ✅ | Create report (multipart) |
| PATCH | `/api/reports/:id/status` | ✅ | Update report status |
| DELETE | `/api/reports/:id` | ✅ | Delete report |
| GET | `/api/comments/:reportId` | ❌ | List comments |
| POST | `/api/comments` | ✅ | Add comment |
| DELETE | `/api/comments/:id` | ✅ | Delete comment |
| POST | `/api/notifications/check` | ✅ | Check geofenced area |

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, Tailwind CSS 4, Lucide Icons, Leaflet Maps
- **Backend**: Express.js 5, Prisma ORM 7, Multer
- **Database**: PostgreSQL
- **Auth**: Firebase Authentication (Client + Admin SDK)
