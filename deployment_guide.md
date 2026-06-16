# ShopEZ Stock Trader - Deployment Guide

This guide describes how to deploy the **ShopEZ Stock Trader** MERN application to cloud hosting platforms for free.

## Tech Stack Target:
1. **Database**: MongoDB Atlas (Free Cloud Tier)
2. **Backend**: Render (Free Web Service Tier)
3. **Frontend**: Vercel (Free Static Site Hosting) or Render Static Site

---

## Step 1: Set up MongoDB Atlas (Cloud Database)

Since your local database (`mongodb://localhost:27017`) is only running on your computer, you need a cloud-hosted MongoDB database for the live application:

1. Sign up/Log in at [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database).
2. Create a new project and build a **M0 (Free)** Shared Cluster.
3. Choose a provider (e.g., AWS) and region nearest to you.
4. **Database Access Security**:
   - Create a database user (e.g. username: `shopez_admin`, password: write down a strong password).
5. **Network Access Security**:
   - Add an IP access list entry. For Render/Vercel to connect, add `0.0.0.0/0` (Allow Access from Anywhere).
6. **Get connection string**:
   - Click **Connect** → **Drivers**.
   - Copy the connection URI. It will look like this:
     ```text
     mongodb+srv://shopez_admin:<password>@cluster0.xxxxx.mongodb.net/shopez?retryWrites=true&w=majority
     ```
   - Replace `<password>` with the database user password you created.

---

## Step 2: Deploy Backend to Render

Render will host the Node.js / Express backend server.

1. Create a free account at [Render](https://render.com).
2. Push your project repository to GitHub (or GitLab).
3. On the Render Dashboard, click **New +** → **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect the `render.yaml` file in your root folder and set up the services.
6. In the blueprint parameters page, enter the Environment Variables:
   - `MONGO_URI`: The MongoDB Atlas connection string from Step 1.
   - `JWT_SECRET`: A secure random secret string (e.g., `my_custom_production_jwt_secret_9988`).
7. Click **Apply**. Render will start building and deploying the backend.
8. Once the build completes, copy the backend service URL (e.g., `https://shopez-backend.onrender.com`).

---

## Step 3: Deploy Frontend to Vercel

Vercel is optimized for React static sites and will host your frontend client.

1. Create a free account at [Vercel](https://vercel.com).
2. Click **Add New** → **Project**.
3. Import your GitHub repository.
4. Select the **Vite** framework preset (it should be auto-detected).
5. Set the root directory to `frontend` (extremely important!).
6. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://<your-render-backend-url>.onrender.com/api` (the backend URL from Step 2, appended with `/api`).
7. Click **Deploy**.
8. Once the build is complete, Vercel will provide your **live URL** (e.g., `https://shopez-stock-trader.vercel.app`).

---

## Step 4: Seed Cloud Database (Optional)

To seed your live cloud database with the 10 initial stock profiles and default test accounts:

1. In your local backend project folder, open the `backend/.env` file.
2. Temporarily replace the `MONGO_URI` with your MongoDB Atlas cloud URI.
3. Run the seeder locally:
   ```bash
   npm run seed
   ```
4. This will connect to your MongoDB Atlas cloud cluster, seed the stock tickers, and seed the default accounts (`user@shopez.com` and `admin@shopez.com`).
5. Revert your local `backend/.env` file back to `mongodb://127.0.0.1:27017/shopez-stock-trader` for local development.

Now your application is fully functional, secure, and live on the internet!
