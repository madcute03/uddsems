#!/bin/bash

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway
railway login

# Link to existing project or create new one
railway link

# Set environment variables
railway variables set APP_ENV=production
railway variables set APP_DEBUG=false
railway variables set APP_KEY=$(php artisan key:generate --show)
railway variables set APP_URL="" # This will be set automatically by Railway

# Set Vite environment variables
railway variables set VITE_APP_NAME="${APP_NAME:-Laravel}"
railway variables set VITE_APP_ENV=production
railway variables set VITE_APP_URL="${APP_URL}"

# Set filesystem disk to public
railway variables set FILESYSTEM_DISK=public

# Database configuration (Railway will automatically set these)
railway variables set DB_CONNECTION=mysql

# Install Node.js dependencies and build assets
railway run -- npm ci
railway run -- npm run build

# Generate a new application key if not set
railway run -- php artisan key:generate --force

# Run migrations
railway run -- php artisan migrate --force

# Cache configuration
railway run -- php artisan config:cache
railway run -- php artisan route:cache
railway run -- php artisan view:cache

# Create storage link
railway run -- php artisan storage:link

# Set proper permissions
railway run -- chmod -R 775 storage bootstrap/cache
railway run -- chmod -R 775 public/build

echo "Deployment configuration complete!"
echo "Run 'railway up' to deploy your application"
