#!/bin/bash
set -e

echo "🚀 Starting deployment process..."

# Create necessary directories if they don't exist
mkdir -p storage/framework/{sessions,views,cache}
mkdir -p storage/logs

# Set proper permissions
echo "🔒 Setting initial permissions..."
chmod -R 775 storage bootstrap/cache

# Clear caches first
echo "🧹 Clearing caches..."
php artisan cache:clear || true
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

# Install PHP dependencies
echo "📦 Installing PHP dependencies..."
composer install --optimize-autoloader --no-dev --no-interaction --prefer-dist

# Install Node.js dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install --no-audit --prefer-offline
    
    echo "🔨 Building assets..."
    npm run build
fi

# Generate key if needed
if [ -z "$APP_KEY" ]; then
    echo "🔑 Generating application key..."
    php artisan key:generate --force
fi

# Run migrations if database is ready
if [ -n "$DATABASE_URL" ] || [ -n "$DB_DATABASE" ]; then
    echo "🔄 Running database migrations..."
    php artisan migrate --force || echo "⚠️  Warning: Database migration failed"
else
    echo "ℹ️  No database configuration found, skipping migrations"
fi

# Set final permissions
echo "🔒 Setting final permissions..."
chmod -R 775 storage bootstrap/cache
chmod -R 775 public || true

# Create storage link if it doesn't exist
if [ ! -L "public/storage" ]; then
    echo "🔗 Creating storage link..."
    php artisan storage:link || echo "⚠️  Warning: Failed to create storage link"
fi

# Cache configuration
echo "⚡ Caching configuration..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "✅ Deployment completed successfully!"
