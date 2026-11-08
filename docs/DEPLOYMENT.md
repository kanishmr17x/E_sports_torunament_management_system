# E-Sports Platform - Complete Production Deployment Guide

This guide covers the complete step-by-step instructions to deploy the E-Sports Tournament Management Platform to production.

---

## Architecture Overview

The application is structured as a full-stack monorepo:
- **Frontend**: React 18 SPA built with Vite (`client/`).
- **Backend**: Node.js & Express REST API (`server/`).
- **Serverless Adapter**: Vercel Serverless Function entry point (`api/index.js`) that wraps the Express app.
- **Database**: MongoDB Atlas cloud cluster.
- **Unified Deployment**: Can be hosted completely on **Vercel** as a single project (Frontend + Serverless API) or as a **Split Deployment** (Vercel for Frontend + Render/Railway for Backend).

---

## 1. MongoDB Atlas Setup (Prerequisite)

Before deploying to Vercel or any cloud host, your MongoDB Atlas cluster must be configured to allow cloud server connections:

### 1.1 Network Access (IP Whitelist)
1. Go to [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. In the left navigation under **Security**, click **Network Access**.
3. Click **Add IP Address**.
4. Select **Allow Access From Anywhere** (`0.0.0.0/0`).
   > *Note: Cloud providers like Vercel and AWS use dynamic IP pools. Restricting to a single local IP will cause cloud functions to fail with connection timeouts.*
5. Click **Confirm** and wait ~30 seconds for the status to show **Active**.

### 1.2 Database User Credentials
1. Under **Security**, click **Database Access**.
2. Ensure you have a database user with **Read and write to any database** permissions.
3. If you rotated the password, ensure there are no literal `<` or `>` characters around the password.

### 1.3 Target Connection String
The production URI format should be:
```text
mongodb+srv://<DB_USERNAME>:<DB_PASSWORD>@<YOUR_CLUSTER>.mongodb.net/esports_db?retryWrites=true&w=majority
```

---

## 2. Deploying on Vercel (Recommended Full-Stack Method)

The project includes pre-configured [`vercel.json`](../vercel.json) and [`api/index.js`](../api/index.js) for zero-config Vercel deployment.

### Step 2.1: Push Latest Changes to GitHub
Ensure all latest commits are pushed to your repository:
```bash
git push origin main
```

### Step 2.2: Import Project in Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Select your GitHub repository: `kanishmr17x/E_sports_torunament_management_system`.
4. In the configuration screen:
   - **Framework Preset**: `Vite` (Vercel detects this automatically from `vercel.json`).
   - **Root Directory**: `./` (**Do NOT change this to `client`**; keep it at the repository root so both `api/` and `client/` deploy together).
   - **Build Command**: `cd client && npm run build` (Pre-configured in `vercel.json`).
   - **Output Directory**: `client/dist` (Pre-configured in `vercel.json`).

### Step 2.3: Configure Production Environment Variables
In the Vercel project setup screen under **Environment Variables**, add the following keys for **Production**, **Preview**, and **Development**:

| Variable Name | Example / Recommended Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production mode optimizations |
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/esports_db` | MongoDB Atlas connection string |
| `JWT_SECRET` | `3fbf6d851844d869ee27d0936f29ea7973ccd1e9215880e421b2aee338b1d482` | 64-char secure random secret |
| `JWT_EXPIRE` | `7d` | Token lifetime |
| `FRONTEND_URL` | `https://your-project.vercel.app` | Your Vercel production URL |

*(Optional email and AWS S3 variables can be added if using external notification/upload services).*

### Step 2.4: Deploy
Click **Deploy**. Vercel will:
1. Install root and client dependencies.
2. Build the Vite production bundle.
3. Provision the Serverless Function at `api/index.js`.
4. Route `/api/*` to the Express backend and all other routes to the React SPA.

---

## 3. Alternative: Split Deployment (Render/Railway Backend + Vercel Frontend)

If you prefer a long-running Node server rather than serverless functions:

### Backend on Render / Railway:
1. Create a new **Web Service** pointing to the repository.
2. Set **Root Directory**: `server`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start` (runs `node server.js`)
5. Add environment variables: `PORT=5000`, `NODE_ENV=production`, `MONGO_URI=...`, `JWT_SECRET=...`, `FRONTEND_URL=https://your-frontend.vercel.app`.

### Frontend on Vercel:
1. Create a Vercel project with **Root Directory**: `client`
2. Add environment variable:
   `VITE_API_URL=https://your-backend.onrender.com/api`

---

## 4. Post-Deployment Verification Checklist

Once deployed, verify the following endpoints:

- [ ] **Health Check**: Open `https://<YOUR-APP>.vercel.app/api/health` in your browser. Expected response:
  ```json
  {
    "success": true,
    "message": "API is healthy",
    "timestamp": "...",
    "database": "connected"
  }
  ```
- [ ] **Frontend Loading**: Open `https://<YOUR-APP>.vercel.app/` — verify navigation, styles, and hero banner render cleanly.
- [ ] **User Registration**: Register a new user at `/register` and verify token is received and user profile loads.
- [ ] **Admin Account**: To initialize an admin account in your production database, run from your local terminal with your production `MONGO_URI`:
  ```bash
  cd server
  ADMIN_EMAIL="admin@esports.com" ADMIN_PASSWORD="SecurePassword123" node createAdmin.js
  ```

