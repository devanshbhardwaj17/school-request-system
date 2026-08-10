# Requisition — School Supply Request System

A full-stack app for managing school supply requests across three roles:

- **Teacher** — submits a request (item + quantity + optional note), sees their own request history and status.
- **Director** — sees every request, approves or rejects pending ones, sees full history for all requests.
- **Store Manager** — only sees requests the director has approved, marks them **In Stock**, **Out of Stock**,
  or **Delivered**. Once a request is **Delivered**, it's locked — nobody can change its status again.

Every status change is stamped into that request's history (who changed it, to what, and when), and every
dashboard shows that trail.

## Status flow

```
pending --(director)--> approved --(store manager)--> in_stock \
   |                                                   out_of_stock  --> delivered (locked)
   +--(director)--> rejected
```

- Only the **director** can move a request out of `pending`.
- Only the **store manager** can move an `approved` request into `in_stock` / `out_of_stock` / `delivered`.
- Once a request is `delivered`, the backend rejects any further status-change request (403/409), regardless
  of who sends it — this is enforced server-side, not just hidden in the UI.

## Tech stack

- **Frontend:** React 18 + Vite + Tailwind CSS + React Router
- **Backend:** Node.js + Express + JWT auth (bcrypt-hashed passwords)
- **Storage:** simple JSON-file store (`backend/data/*.json`) — no external database to set up. Swap in
  Postgres/Mongo later without touching the frontend, since all access goes through `backend/db.js`.

## Project structure

```
school-request-system/
├── backend/
│   ├── server.js            Express app entry point
│   ├── db.js                JSON-file data layer + default user seeding
│   ├── middleware/auth.js   JWT verification + role guard
│   └── routes/
│       ├── auth.js          POST /api/auth/login, GET /api/auth/me
│       └── requests.js      POST/GET /api/requests, PATCH decision & store-status
├── frontend/
│   └── src/
│       ├── context/AuthContext.jsx   Token/user state, persisted to localStorage
│       ├── api/api.js                fetch wrapper for the backend
│       ├── components/               Navbar, StatusBadge, RequestTable
│       └── pages/                    Login, TeacherDashboard, DirectorDashboard, StoreDashboard
└── render.yaml               Optional Render Blueprint (deploys both services at once)
```

## Demo accounts (seeded automatically on first backend run)

| Role          | Username    | Password      |
|---------------|-------------|---------------|
| Teacher       | `teacher1`  | `teacher123`  |
| Director      | `director1` | `director123` |
| Store Manager | `store1`    | `store123`    |

These are also shown as one-click fill buttons on the login page.

## Running locally

### 1. Backend

```bash
cd backend
cp .env.example .env      # edit JWT_SECRET for anything beyond local testing
npm install
npm run dev                # or: npm start
```

The API runs on `http://localhost:5000`. On first run it creates `backend/data/users.json` (seeded demo
accounts) and `backend/data/requests.json` (empty).

### 2. Frontend

```bash
cd frontend
cp .env.example .env       # VITE_API_URL should point at the backend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Deploying to Render

You need **two** Render services: a Node web service for the backend, and a static site for the frontend.
The easiest path is the included Blueprint.

### Option A — One click with the Blueprint

1. Push this whole project (with `render.yaml` at the root) to a GitHub/GitLab repo.
2. In Render, choose **New +** → **Blueprint**, and point it at the repo.
3. Render reads `render.yaml` and creates both services automatically.
4. After the first deploy, open the backend service → **Environment**, and update `CORS_ORIGIN` to your
   actual frontend URL if it differs from the guessed one. Do the same for `VITE_API_URL` on the frontend
   service if the backend URL differs, then trigger a redeploy (static sites bake env vars in at build time).

### Option B — Manual setup

**Backend (Web Service):**
1. New + → Web Service → connect your repo.
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables:
   - `JWT_SECRET` — any long random string
   - `CORS_ORIGIN` — your frontend's Render URL, e.g. `https://your-frontend.onrender.com`
6. (Recommended) Add a **Persistent Disk** mounted at `backend/data` so requests/users survive redeploys —
   Render's default filesystem is ephemeral and resets on every deploy otherwise.
7. Deploy, then copy the resulting backend URL (e.g. `https://your-backend.onrender.com`).

**Frontend (Static Site):**
1. New + → Static Site → connect your repo.
2. Root directory: `frontend`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_API_URL` = your backend URL from above.
6. Add a rewrite rule so client-side routing works: source `/*` → destination `/index.html`.
7. Deploy.

> Free Render web services spin down after inactivity — the first request after idling can take ~30–50s to
> wake the backend up. That's normal on the free tier, not a bug in the app.

## Notes on the persistence layer

This uses flat JSON files instead of a database to keep the project easy to run anywhere with zero setup.
For a production deployment with multiple people hitting it concurrently, swap `backend/db.js` for a real
database (Postgres via Render's managed DB is a natural next step) — the rest of the app doesn't need to
change since every route only talks to `db.js`.
