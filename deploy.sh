#!/bin/bash

# Exit on error
set -e

# Install PHP dependencies
composer install --optimize-autoloader --no-dev

# Generate application key if it doesn't exist
if [ -z "$APP_KEY" ]; then
    php artisan key:generate
fi

# Run database migrations
php artisan migrate --force

# Clear application cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Cache configuration for better performance
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set proper permissions
chmod -R 775 storage bootstrap/cache

# Install and build Node.js dependencies if needed
if [ -f "package.json" ]; then
    npm install
    npm run build
fi
