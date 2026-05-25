# School Announcement Board (Education Portal)

The **School Announcement Board** is a production-ready, centralized communication portal designed for educational institutions. This application satisfies all **25 core Software Requirements Specification (SRS)** guidelines, featuring a robust role-based access control system (RBAC), personalized feeds, digital consent parent signatures, audit log tracking, active content moderation, event calendar integrations, simulated Twilio SMS broadcasts, daily digest newsletters, and interactive analytics charts.

Built using a premium, modern dark-glass theme (Glassmorphism), this application is designed to amaze users at first glance while remaining fully responsive and highly performant.

---

## Technical Stack

* **Backend**: Node.js, Express.js (Layered Architecture: Controller -> Service -> Repository -> Model).
* **Database**: MongoDB with Mongoose object modeling.
* **Frontend**: React (Vite-backed), Tailwind CSS (v3 for rich responsive visual badges), Lucide React (premium iconography).
* **Integrations**: JWT Authentication, Multer local file uploads, simulated Google Workspace/Microsoft 365 SSO, Twilio SMS broadcast logs, automated daily mail digest scheduler.

---

## Core Features (SRS Compliant)

1. **Multi-Role Login**: Secure JWT authorization for `Admin`, `Teacher`, and `Student/Parent` accounts.
2. **SSO Integration**: Simulated Google Workspace / Office 365 authentication flows.
3. **Role-Specific Dashboards**: Customized workspace widgets populated dynamically per role.
4. **User Bulk CSV Ingestion**: CSV bulk-import parsing on the Admin control panel.
5. **Rich Text Formatting**: Markdown support in the content authoring panel.
6. **Audience Targeting**: Filters feeds dynamically by School-wide, specific Grade Level, or specific Enrolled Class.
7. **File Attachments**: Local static hosting and upload mapping (up to 5 PDFs/Images).
8. **Scheduled Posting**: Set a future date/time for announcements to automatically go live.
9. **Priority Tagging**: Highlight notices (`High` / `Urgent`) styled with blinking visual indicators.
10. **Expiration Dates**: Automatic filtering of expired alerts (moving them to history).
11. **Personalized Feed**: Custom student feed query aggregations.
12. **Read Receipts Tracking**: Audit logs recording which users have opened and read a bulletin.
13. **Digital Consents**: Signed permission slips mapped to databases with typed signatures.
14. **Threaded Q&A Comments**: Toggleable threaded discussions below notices.
15. **Saved Bookmark Items**: Direct bookmarking workspace filters.
16. **Visual Category Badges**: Curated color-coded tags (Sports, Academics, Holidays, Emergencies).
17. **Global Keywords Search**: Multi-field query keyword filters.
18. **Archive Feed History**: Separate history reviewing area.
19. **Event Calendar Integration**: Interactive grid calendar parsing event dates.
20. **Push Notifications**: Simulated browser and live in-app Toast updates.
21. **Daily Digests Campaign**: Queue-automated end-of-day SMTP summary mailings logs.
22. **Twilio SMS Gateway**: Trigger urgent text alerts directly to mobile gateways.
23. **Analytics SVG Charts**: Dynamic responsive SVG charts tracking views and consent completion rates.
24. **Content Moderation Panel**: Administrative edits/deletions on announcements and comments.
25. **Security Audit Trails**: DB ledger audit listing logins, creates, imports, and gateway actions.

---

## Getting Started

### Prerequisites
* **Node.js** (v18.x or higher)
* **npm** (v10.x or higher)
* **MongoDB** (running locally on port `27017` or Atlas connection string)

---

### Installation & Setup

1. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `backend/.env` file with these values:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/school_board
   JWT_SECRET=super_secret_school_board_key_2026
   ```
   *(Note: The system has pre-seeded this configuration for you).*

3. **Seed the Database**:
   Preload categories, mock users (Admin, Teachers, Students, Parents), Q&A threads, views, and consent records:
   ```bash
   npm run seed
   ```

4. **Install Frontend Dependencies**:
   ```bash
   cd ../frontend
   npm install --legacy-peer-deps
   ```

---

### Running the Application

1. **Start the Layered Backend Server**:
   ```bash
   cd backend
   npm start
   ```
   *Server will run on: `http://localhost:5000`*

2. **Start the React Frontend Development Server**:
   ```bash
   cd ../frontend
   npm run dev
   ```
   *Vite React Client will run on: `http://localhost:5173`*

---

## Testing & Role Demonstration

Open `http://localhost:5173` in your browser. Use the floating credentials card or simulated Single Sign-On (SSO) picking dialog on the login page:

* **System Admin**: `admin@school.com` / `password123`
  * *Controls*: Security logs, category badges editor, bulk user CSV imports, Twilio gateway text broadcaster, content moderation.
* **Teacher**: `davis@school.com` / `password123`
  * *Controls*: Post target grade bulletins, check read receipts list, toggle signatures slips, review SVG analytics.
* **Student/Parent**: `alex@school.com` / `password123`
  * *Controls*: Class-specific feed views, interactive event calendars, bookmark saves, digital consent sign-offs, comment Q&A.
