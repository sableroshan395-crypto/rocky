# Rocky's Workspace

> **Private Personal Digital Headquarters & Utility Dashboard**

Welcome to **Rocky's Workspace**, an all-in-one productivity suite, financial operations ledger, business management hub, and developer utility center.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 3. Run Automated Tests
```bash
npm run test
```

### 4. Build for Production
```bash
npm run build
```

---

## 🔐 Storage & Security Architecture

### Mode 1: Local Workspace Mode (Active by default)
- **Zero-barrier startup**: Works immediately out of the box without requiring external cloud accounts or API keys.
- **Vetted Passcode Hashing**: Protects the interface with a local passcode hashed using Web Crypto API **PBKDF2** (SHA-256, 100,000 iterations, 16-byte random cryptographic salt).
- **Attempt Throttling**: Locks the interface for 60 seconds after 5 consecutive failed attempts.
- **Security Disclosure**: Local mode data is persisted in browser `localStorage`. While the UI is locked against casual viewers, local browser storage is *unencrypted* at rest. Do not store sensitive bank credentials, UPI PINs, or recovery phrases in local mode.
- **Safety Backups**: One-click JSON backup export and recovery via `Settings -> Data Backup & Recovery`.

### Mode 2: Firebase Authenticated Cloud Mode
- Connects to Firebase Authentication and Cloud Firestore for multi-device sync and private cloud storage.
- Strict owner isolation: documents are scoped under `users/{userId}/**` with Firebase Security Rules denying all unauthorized and cross-user access.
- **Controlled Migration Wizard**: Accessible in Settings, allows you to download a backup, inspect and validate records, and idempotently import your local records into Firestore.

---

## ⚙️ Connecting Firebase (Optional)

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. In the project dashboard:
   - Enable **Authentication** (Email/Password provider).
   - Enable **Cloud Firestore** in production mode.
   - (Optional) Enable **Firebase Storage**.
3. Create a Web App in Project Settings and copy your configuration values.
4. Create a `.env` file in the project root:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
5. Deploy Firebase Security Rules:
```bash
firebase deploy --only firestore:rules,storage:rules
```

---

## 🌐 Netlify Deployment

1. Push your repository to GitHub / GitLab.
2. In Netlify:
   - Click **Add new site** -> **Import an existing project**.
   - Set **Build command**: `npm run build`
   - Set **Publish directory**: `dist`
3. In **Site Configuration** -> **Environment variables**, add the `VITE_FIREBASE_*` variables if using Firebase.
4. Deploy!

---

## 🗺️ Implementation Roadmap

- [x] **Phase 1: Foundation**
  - Application shell & high-density design system
  - Grouped navigation with mobile drawer
  - Local workspace security (PBKDF2 passcode & attempt throttling)
  - Universal Search (`Ctrl+K`) & Quick Capture (`Ctrl+Q`)
  - Command Center with real recorded data metrics & widget customization
  - Integer paise financial data schema
  - Data backup, restore & migration wizard
  - Strict security rules & unit test suite
- [x] **Phase 2: Money Center**
  - Configurable accounts (Cash in Hand, OmniCard, Kotak Bank, Amazon Pay, MobiKwik, Airtel Payments Bank)
  - Searchable transaction ledger with category tracking
  - Inter-account transfers with linked debit/credit records
  - Cashbook with balance verification & audit trail
  - 3.2% Work Commission ledger
  - Gambling session tracker with cooldown and net P&L
  - Financial summary & reconciliation reports
- [x] **Phase 3: Tools Hub**
  - Financial calculators (GST with CGST/SGST split, 3.2% commission, percentage)
  - Developer utilities (JSON formatter/validator, PBKDF2/cryptographic password generator, UUID v4, Base64 & URL encoders)
  - Text tools (Word & character counter with reading times, 8-style case converter, lorem ipsum generator)
  - Unit & format converters (Length, weight, temperature, area, volume, data, Unix timestamps, HEX/RGB/HSL color tool with CSS exports)
- [x] **Phase 4: Sai Decoration Hub**
  - Live Netlify portals integration (Business website & Billing application)
  - Event bookings schedule with date tracking, advances received, and balance due calculations
  - Customer & party directory with direct phone calling, booking history, and addresses
  - Generator & rental equipment fleet tracking (availability, daily rates, fuel capacity, and meter hours)
  - Professional client quotation generator with line item calculations, discounts, taxes, and printable invoice layouts
- [x] **Phase 5: Digital Lab & Personal Library**
  - Web portfolio manager for live Netlify, Vercel, Firebase & custom deployments
  - AI Prompt Engineering library with `{{variable}}` detection, tags, and one-click clipboard copying
  - SMM Reseller Hub with profit margin analysis, client tracking, and provider order IDs
  - Online gig & microtask earnings tracker with hours spent, review statuses, and payout channels
  - Curated web bookmarks vault with categorized tags & quick launching
  - Knowledge notes vault with category tagging and persistent storage
  - Entertainment & anime watchlist with `+ / -` live episode counters and ratings
  - Document & KYC metadata vault with reference numbers, expiry reminders, and locker location tracking
- [x] **Phase 6: Personal Study & Idea Lab**
  - B.Com degree subject modules tracker with syllabus progress bars, faculty details, and key exam topics
  - Academic exam timetable scheduler with live days-left countdowns, hall venues, and preparation status
  - Daily habits and routines streak counter with 1-click check-in toggles
  - Idea Lab venture incubator with 6-stage pipeline (Inbox ➔ Researching ➔ Validating ➔ Building ➔ Launched ➔ Archived)
  - 1-click conversion from validated business ideas into active workspace projects and task checklists
