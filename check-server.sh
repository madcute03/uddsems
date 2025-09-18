#!/bin/bash

# Enable debug mode
set -ex

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a service is running
check_service() {
    if command_exists systemctl; then
        systemctl is-active --quiet "$1"
    else
        pgrep -x "$1" >/dev/null
    fi
}

# Check PHP version and extensions
echo "🔍 Checking PHP..."
php -v
echo "\n📦 Checking PHP extensions..."
php -m | grep -E 'pdo_mysql|mbstring|tokenizer|xml|ctype|json|openssl|fileinfo|bcmath|gd|zip'

# Check Node.js and npm
echo "\n🟢 Checking Node.js..."
node -v
npm -v

# Check database connection
echo "\n🔌 Testing database connection..."
php artisan db:show --quiet || echo "❌ Database connection failed"

# Check storage permissions
echo "\n🔒 Checking storage permissions..."
ls -la storage/
ls -la bootstrap/cache/

# Check storage link
echo "\n🔗 Checking storage link..."
ls -la public/ | grep storage

# Check environment
echo "\n🌍 Environment:"
php artisan env
echo "\n🔑 Application key:"
php artisan key:generate --show

# Check routes
echo "\n🛣️  Checking routes..."
php artisan route:list --path=api

# Check queues
echo "\n📮 Checking queues..."
php artisan queue:table
php artisan queue:work --once > /dev/null && echo "✅ Queue worker is working" || echo "❌ Queue worker failed"

echo "\n✅ Server check completed!"

exit 0
