#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment..."

# Install PHP dependencies
echo "📦 Installing PHP dependencies..."
composer install --no-interaction --optimize-autoloader --no-dev

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm ci

# Build assets
echo "🔨 Building assets..."
npm run build:prod

# Generate application key if not exists
if [ -z "$APP_KEY" ]; then
    echo "🔑 Generating application key..."
    php artisan key:generate --force
fi

# Run database migrations
echo "🔄 Running database migrations..."
php artisan migrate --force

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
echo "🔒 Setting permissions..."
chmod -R 775 storage bootstrap/cache
chmod -R 775 public/build

# Create storage link
php artisan storage:link

echo "✨ Deployment completed successfully!"

exit 0
