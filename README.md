# 🗳️ School Voting System

A full-stack digital election management platform for schools, supporting end-to-end election workflows from candidate nominations to result publication.

---

## Features

- **Multi-role system**: Super Admin, School Admin, Booth Officer, Voting Terminal
- **Complete election lifecycle**: Draft → Configure → Ready → Active → Paused → Closed
- **EVM-style voting terminal** with beep audio feedback
- **Live monitoring** of voting progress and booth status
- **Nomination portal** for self-registration by students
- **Public results page** shareable after election closes
- **Excel voter import**, PDF/Excel report export
- **Razorpay payment integration** for subscription plans
- **Email notifications** via Nodemailer

---

## Prerequisites

- Node.js v18+
- MySQL 8.0+
- npm

---

## Backend Setup

### 1. Configure environment

```bash
cd backend
cp .env.example .env   # or create .env manually
```

Edit `.env`:

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=school_voting_system
PORT=5000

# IMPORTANT: Use a strong random string in production (min 32 chars)
JWT_SECRET=change_this_to_a_long_random_secret_string

# Your deployed frontend domain (comma-separated for multiple)
FRONTEND_URL=https://yourdomain.com

# Email (for notifications)
EMAIL_USER=your@email.com
EMAIL_PASS=your_app_password

# Razorpay (for payment)
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

> ⚠️ **Security**: Never commit `.env` to version control. Change `JWT_SECRET` to a long random string before going live.

### 2. Import database

```bash
mysql -u root -p school_voting_system < database_backup.sql
```

Or create the database first:

```sql
CREATE DATABASE school_voting_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then import the SQL file.

### 3. Run audit log migration (one-time)

```bash
node scripts/migrate_audit.js
```

### 4. Install dependencies & start

```bash
npm install
npm run dev        # Development (with hot reload)
npm start          # Production
```

Backend runs at: `http://localhost:5000`

---

## Frontend Setup

```bash
cd frontend-react
npm install
npm run dev        # Development
npm run build      # Production build
```

Frontend runs at: `http://localhost:5173`

> For production, set `VITE_API_URL` in a `.env` file in `frontend-react/`:
> ```
> VITE_API_URL=https://api.yourdomain.com/api
> ```

---

## Roles & Access

| Role | URL | Description |
|---|---|---|
| Super Admin | `/login` | Manages all schools and plans |
| School Admin | `/login` | Full election management for their school |
| Booth Officer | `/login` | Manages voter check-in at a polling booth |
| Voting Terminal | `/terminal` | EVM interface — enter machine code to activate |
| Nomination Portal | `/nominate/:code` | Students self-nominate (public link) |
| Public Results | `/public-results/:electionId` | Results page (public after election closes) |

---

## Default Credentials

After importing the database, use the credentials set during school/admin creation.  
To reset an admin password:

```bash
node scripts/reset_admin_password.js
```

---

## Production Deployment Notes

1. **Change `JWT_SECRET`** to a long, random string (e.g., `openssl rand -hex 64`)
2. **Set `FRONTEND_URL`** to your actual domain in `.env`
3. **Use HTTPS** — get a free SSL certificate via Let's Encrypt / Certbot
4. **Use a reverse proxy** (Nginx/Caddy) in front of Node.js
5. **Set `NODE_ENV=production`** in your `.env`
6. **File uploads** — the `backend/uploads/` folder must be persisted (not wiped on redeploy)

---

## Project Structure

```
school_voting_system/
├── backend/
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth, rate limiting, file upload
│   ├── routes/         # API route definitions
│   ├── services/       # Email and payment services
│   ├── utils/          # Audit logger, helpers
│   ├── scripts/        # One-time migration and utility scripts
│   ├── uploads/        # Candidate photos and symbols (persisted)
│   └── server.js       # Entry point
└── frontend-react/
    ├── src/
    │   ├── pages/      # All page components by role
    │   ├── components/ # Shared UI components
    │   ├── api/        # Axios instance
    │   ├── store/      # Zustand state stores
    │   └── hooks/      # Custom React hooks
    └── public/
```
