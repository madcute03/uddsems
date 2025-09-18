#!/bin/bash
set -e

echo "🚀 Starting deployment process..."

# Clear caches first
echo "🧹 Clearing caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Install dependencies
echo "📦 Installing PHP dependencies..."
composer install --optimize-autoloader --no-dev --no-interaction

echo "📦 Installing Node.js dependencies..."
npm ci --no-audit --prefer-offline

# Build assets
echo "🔨 Building assets..."
npm run build

# Generate key if needed
if [ -z "$APP_KEY" ]; then
    echo "🔑 Generating application key..."
    php artisan key:generate --force
fi

# Run migrations
echo "🔄 Running database migrations..."
php artisan migrate --force

# Set permissions
echo "🔒 Setting permissions..."
chmod -R 775 storage bootstrap/cache
chmod -R 775 public/build

# Create storage link if it doesn't exist
if [ ! -L "public/storage" ]; then
    echo "🔗 Creating storage link..."
    php artisan storage:link
fi

# Cache configuration
echo "⚡ Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Deployment completed successfully!"

# Install and build Node.js dependencies if needed
if [ -f "package.json" ]; then
    npm install
    npm run build
fi
