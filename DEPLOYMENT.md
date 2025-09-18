# Deployment Guide for Railway

This guide will walk you through deploying your Laravel application to Railway.

## Prerequisites

1. A GitHub/GitLab/Bitbucket account with your project repository
2. A Railway account (https://railway.app)
3. Node.js and npm installed (for Railway CLI)

## Deployment Steps

### 1. Push your code to a Git repository

Make sure all your changes are committed and pushed to your Git repository.

### 2. Install Railway CLI (optional but recommended)

```bash
npm install -g @railway/cli
railway login
```

### 3. Deploy to Railway

#### Option A: Using the Web Interface

1. Go to [Railway](https://railway.app) and log in
2. Click "New Project" and select "Deploy from GitHub repo"
3. Select your repository
4. Railway will automatically detect your Laravel application and set it up
5. Go to the "Variables" tab and make sure all required environment variables are set
6. Your application will be automatically deployed

#### Option B: Using Railway CLI

1. Run the deployment script:
   ```bash
   chmod +x deploy-railway.sh
   ./deploy-railway.sh
   ```
2. Follow the prompts to complete the setup
3. Run `railway up` to deploy your application

### 4. Set Up a Database (if not already done)

1. In the Railway dashboard, click "New" and select "Database"
2. Choose MySQL or PostgreSQL
3. Railway will automatically set the required environment variables
4. Run migrations:
   ```bash
   railway run -- php artisan migrate --force
   ```

### 5. Set Up a Custom Domain (Optional)

1. Go to your project in the Railway dashboard
2. Click on the "Settings" tab
3. Under "Domains", add your custom domain
4. Follow the instructions to verify domain ownership

## Environment Variables

Make sure to set the following environment variables in your Railway project:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_KEY` (generated automatically)
- `APP_URL` (set automatically by Railway)
- `DB_*` (database credentials, set automatically by Railway)
- `FILESYSTEM_DISK=public`

## Troubleshooting

### Application Key Not Set

If you see an "Application key not set" error, run:

```bash
railway run -- php artisan key:generate --force
```

### Database Connection Issues

1. Make sure you've added a database to your Railway project
2. Check that all database environment variables are set correctly
3. Run migrations:
   ```bash
   railway run -- php artisan migrate --force
   ```

### File Permissions

If you have file permission issues, run:

```bash
railway run -- chmod -R 775 storage bootstrap/cache
railway run -- chown -R www-data:www-data storage bootstrap/cache
```

## Monitoring

- Check the "Logs" tab in the Railway dashboard for any errors
- Set up alerts in the "Alerts" section
- Monitor resource usage in the "Metrics" tab
