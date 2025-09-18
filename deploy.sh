#!/bin/bash

# Enable debug mode and exit on error
set -ex

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "🚀 Starting deployment..."

# Check if .env exists, copy from example if not
if [ ! -f .env ]; then
    log "📄 Creating .env file..."
    cp .env.example .env
    php artisan key:generate
fi

# Clear caches first
log "🧹 Clearing caches..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Install PHP dependencies
log "📦 Installing PHP dependencies..."
composer install --no-interaction --optimize-autoloader --no-dev

# Install Node.js dependencies
log "📦 Installing Node.js dependencies..."
npm ci

# Build assets
log "🔨 Building assets..."
npm run build:prod

# Generate application key if not exists
if [ -z "$APP_KEY" ]; then
    log "🔑 Generating application key..."
    php artisan key:generate --force
fi

# Set permissions
log "🔒 Setting permissions..."
chmod -R 775 storage bootstrap/cache
chmod -R 775 public/build

# Create storage link if it doesn't exist
if [ ! -L "public/storage" ]; then
    log "🔗 Creating storage link..."
    php artisan storage:link
fi

# Cache configuration
log "⚙️ Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Verify the application
log "🔍 Verifying application..."
php artisan about

# Display environment summary
log "\n=== Environment Summary ==="
grep -E 'APP_|DB_|LOG_|BROADCAST_|CACHE_|QUEUE_|SESSION_|REDIS_|MAIL_|AWS_|PUSHER_|JWT_' .env || echo "No .env file found"
echo "=========================="

log "✨ Deployment completed successfully!"

exit 0
