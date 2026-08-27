# FoundIt

FoundIt is a location-aware community lost-and-found platform that helps people report missing belongings, publish items they have found, and connect with nearby community members who may be able to help.

The application combines structured reports, interactive maps, proximity-based discovery, secure user accounts, threaded conversations, and configurable notification areas in one focused experience.

## The problem

Lost-and-found information is usually scattered across social media posts, messaging groups, physical notice boards, and unrelated community pages. These channels make reports difficult to search, provide little location context, and quickly bury older posts.

People who lose an item often do not know where to look, while people who find an item may not have a safe or reliable way to reach its owner.

## The solution

FoundIt creates a dedicated local recovery network where users can:

- Publish consistent lost or found reports with photos, descriptions, categories, and map coordinates.
- Discover active reports through a searchable feed and interactive map.
- Prioritize reports near a saved location.
- Communicate through comments and replies without immediately moving to another platform.
- Manage report status from creation through resolution.
- Define a geofence and check for relevant activity nearby.

The goal is to reduce the time between an item being lost, discovered, reported, and returned.

## Key capabilities

### Authentication and profiles

- Email and password authentication through Firebase.
- Google sign-in support.
- Automatic synchronization between Firebase identities and PostgreSQL user records.
- Editable display name, phone number, and profile photo.
- Password-reset support.

### Lost and found reports

- Dedicated flows for both `LOST` and `FOUND` reports.
- Three-step report wizard covering photo, item details, and location.
- Six categories: pets, electronics, keys, wallets, bags, and other items.
- Optional image upload with a 5 MB limit.
- Owner-only editing, deletion, resolution, and reopening.
- Optional contact information.

### Discovery and maps

- Responsive report feed with category and text filtering.
- Feed, map, and split-screen dashboard modes.
- Interactive Leaflet maps backed by OpenStreetMap tiles.
- Proximity sorting based on the user's saved area.
- Reverse-geocoded location labels through OpenStreetMap Nominatim.
- Active reports shown as distinct lost or found map markers.

### Community communication

- Comments on individual reports.
- One-level threaded replies.
- Author profile images or generated initials.
- Owner and comment-author permissions enforced by the API.

### Notification area

- User-selected center point and radius from 1 to 10 km.
- Manual checks for active reports inside the configured area.
- Navbar activity panel for nearby reports, comments, and replies.
- Geofence preferences stored locally in the browser.

> FoundIt's current notification system performs on-demand API checks. It is not yet a background push-notification service.

## System architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                         Web browser                          │
│  Next.js App Router · React · Tailwind CSS · Leaflet · SWR  │
└───────────────┬───────────────────────────────┬──────────────┘
                │ Firebase ID token             │ Map tiles and
                │ REST / multipart requests     │ reverse geocoding
                ▼                               ▼
┌───────────────────────────────┐    ┌─────────────────────────┐
│        Express REST API       │    │ OpenStreetMap/Nominatim │
│ Firebase Admin authentication │    └─────────────────────────┘
│ Multer uploads · validation   │
└───────────────┬───────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
┌──────────────┐  ┌────────────────┐
│ PostgreSQL   │  │ Redis optional │
│ Prisma ORM   │  │ report caching │
└──────────────┘  └────────────────┘
```

### Frontend

The frontend uses the Next.js App Router. Most application screens are client components because they depend on Firebase session state, browser geolocation, local storage, and interactive maps.

SWR revalidates report feeds, while a central API module attaches Firebase ID tokens to authenticated requests.

### Backend

The backend is an Express 5 REST API. Firebase Admin verifies bearer tokens, Prisma handles PostgreSQL access, Multer processes image uploads in memory, and Redis can cache report-list queries for 60 seconds.

### Image storage

Report images and uploaded profile photos are stored as binary PostgreSQL fields. Lightweight `hasImage` and `hasPhoto` flags allow list queries to avoid loading image data. Dedicated API endpoints serve the binary images to clients.

## Technology stack

| Area | Technology |
| --- | --- |
| Frontend framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, global design tokens |
| Data fetching | SWR, Fetch API |
| Maps | Leaflet, OpenStreetMap |
| Authentication | Firebase Authentication, Firebase Admin SDK |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL |
| ORM | Prisma 7 with PostgreSQL adapter |
| Cache | Redis through ioredis, optional |
| Upload handling | Multer |
| Deployment | Multi-stage Docker images |

## Repository structure

```text
foundit/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database models and enums
│   ├── src/
│   │   ├── index.js               # Express application entry point
│   │   ├── lib/                   # Prisma, Firebase Admin, and Redis clients
│   │   ├── middleware/            # Firebase token verification
│   │   └── routes/                # Users, reports, comments, notifications
│   ├── Dockerfile
│   ├── prisma.config.ts
│   └── package.json
├── frontend/
│   ├── public/                    # Category icons and static images
│   ├── src/
│   │   ├── app/                   # App Router pages and global styles
│   │   ├── components/            # Navigation, maps, cards, locations
│   │   ├── contexts/              # Firebase authentication context
│   │   └── lib/                   # API client, Firebase config, shared types
│   ├── Dockerfile
│   ├── next.config.ts
│   └── package.json
├── stitch_landing.html            # Original standalone landing-page prototype
└── README.md
```

## Main application routes

| Route | Purpose |
| --- | --- |
| `/` | Marketing page and authentication dialog |
| `/dashboard` | Proximity-aware feed and map discovery |
| `/search` | Debounced report-title and category search |
| `/report/new` | Lost/found report creation wizard |
| `/report/[id]` | Report details, editing, status, comments, and sharing |
| `/my-reports` | Current user's report management |
| `/settings` | Profile, geofence, and recent activity |
| `/about` | Project background |
| `/mission` | Project mission |

## Data model

### User

- Uses the Firebase UID as its primary key.
- Stores email, display name, optional phone number, and optional profile photo.
- Owns reports and comments.

### Report

- Stores a title, description, optional contact information, category, and location.
- Has a type of `LOST` or `FOUND`.
- Has a status of `ACTIVE` or `RESOLVED`.
- Can contain binary image data.
- Belongs to one user and can have many comments.

### Comment

- Belongs to a report and an author.
- Can optionally reference a parent comment to create a reply.

## REST API

All endpoints are mounted below `/api`.

### System

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | API health check |

### Users

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/users/sync` | Required | Create or update the current Firebase user |
| `GET` | `/users/me` | Required | Return the current user's profile |
| `PATCH` | `/users/me` | Required | Update profile details and photo |
| `GET` | `/users/:id/image` | Public | Serve an uploaded profile photo |

### Reports

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/reports` | Public | List reports with optional filters |
| `GET` | `/reports/user/me` | Required | List reports owned by the current user |
| `GET` | `/reports/:id` | Public | Return one report and its comments |
| `GET` | `/reports/:id/image` | Public | Serve a report image |
| `POST` | `/reports` | Required | Create a report using multipart form data |
| `PATCH` | `/reports/:id` | Owner | Edit report details, location, or image |
| `PATCH` | `/reports/:id/status` | Owner | Resolve or reopen a report |
| `DELETE` | `/reports/:id` | Owner | Delete a report |

Supported report-list query parameters are `category`, `status`, `query`, `lat`, `lng`, and `radius`.

### Comments

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/comments/:reportId` | Public | List comments for a report |
| `POST` | `/comments` | Required | Add a comment or reply |
| `DELETE` | `/comments/:id` | Author | Delete a comment |

### Notifications

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/notifications/check` | Required | Check nearby reports and relevant comments |

## Local development

### Prerequisites

- Node.js 22 recommended.
- npm.
- PostgreSQL database.
- Firebase project with Email/Password and optionally Google authentication enabled.
- Redis-compatible service if report caching is required.

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd foundit

cd backend
npm ci

cd ../frontend
npm ci
```

### 2. Configure Firebase

1. Create a Firebase project.
2. Enable Email/Password authentication.
3. Enable Google authentication if Google sign-in is required.
4. Register a Firebase web application and copy its public configuration.
5. Create a Firebase Admin service account for the backend.

### 3. Configure the backend

Create `backend/.env`:

```dotenv
DATABASE_URL="postgresql://postgres:password@localhost:5432/foundit"
PORT=5000
FRONTEND_URL="http://localhost:3000"

FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"..."}'

# Optional
REDIS_URL="redis://localhost:6379"
NODE_ENV="development"
```

Generate the Prisma client and synchronize the schema:

```bash
cd backend
npm run db:generate
npm run db:push
```

Start the backend:

```bash
npm run dev
```

The local API is available at `http://localhost:5000/api`.

### 4. Configure the frontend

Create `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL="http://localhost:5000/api"

NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`.

## Available commands

### Frontend

```bash
npm run dev       # Start the Next.js development server
npm run build     # Create a production build
npm run start     # Start the production server
npm run lint      # Run ESLint
```

TypeScript can be checked without emitting files:

```bash
npx tsc --noEmit --incremental false
```

### Backend

```bash
npm run dev          # Start Express with nodemon
npm run start        # Start Express with Node.js
npm run db:generate  # Generate the Prisma client
npm run db:push      # Push the schema to the configured database
npm run db:migrate   # Create and apply a development migration
npm run db:studio    # Open Prisma Studio
```

## Docker deployment

Both applications include multi-stage Dockerfiles and run as non-root users. Their production containers expose port `8080`.

Build the images from the repository root:

```bash
docker build -t foundit-backend ./backend
docker build -t foundit-frontend ./frontend
```

When deploying:

- Configure backend secrets through the hosting platform rather than committing `.env` files.
- Set `FRONTEND_URL` to the deployed frontend origin.
- Set `NEXT_PUBLIC_API_URL` to the deployed backend URL ending in `/api`.
- Remember that `NEXT_PUBLIC_*` variables are embedded during the frontend build.
- Apply the Prisma schema before sending production traffic to a new database.
- Configure `REDIS_URL` only when a Redis service is available.

## Security and privacy considerations

- Mutating API operations require a valid Firebase ID token.
- Report and comment ownership is verified by the backend.
- Image uploads are limited to image MIME types and 5 MB.
- Firebase service-account credentials and database URLs must never be committed.
- The report API currently exposes report coordinates, author email addresses, and optional contact information through public read endpoints. Users should avoid entering sensitive information until field-level privacy controls are implemented.
- Production deployments should add rate limiting, structured request validation, security headers, abuse reporting, and content moderation.

## Caching behavior

When `REDIS_URL` is configured, report-list responses are cached for 60 seconds. Creating a report clears report-list cache keys. Editing, changing status, and deleting reports should also invalidate these keys in a future backend improvement.

SWR refreshes major frontend report views every 60 seconds and can revalidate when the browser regains focus.

## Current project status

The application currently has:

- A valid Prisma schema.
- A successful production Next.js build.
- Successful TypeScript validation.
- Working Docker build definitions.
- No automated unit, integration, or end-to-end test suite yet.
- A remaining ESLint backlog in older report-detail, settings, and map code.

## Known limitations and recommended next steps

1. Add automated API, component, and end-to-end tests.
2. Replace on-demand notification checks with background or push notifications.
3. Store geofence preferences in the database for cross-device synchronization.
4. Add pagination and database-level geospatial filtering.
5. Expand search to descriptions and introduce relevance ranking.
6. Move large images to object storage when data volume increases.
7. Invalidate Redis caches after every report mutation.
8. Add moderation, report verification, and abuse-prevention workflows.
9. Introduce location privacy controls and approximate public coordinates.
10. Track and apply production database migrations through a committed migration workflow.

## Contribution workflow

Before submitting changes:

1. Create a focused branch.
2. Keep environment files and credentials out of version control.
3. Run TypeScript validation and the production build.
4. Run ESLint and document any unrelated existing failures.
5. Test affected user journeys on desktop and mobile.
6. Describe database or environment changes clearly in the pull request.

---

FoundIt is designed around a simple idea: local communities already want to help; they need a reliable place to coordinate.
