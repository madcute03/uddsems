#!/bin/bash
set -e

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
/usr/local/bin/wait-for-mysql.sh mysql 3306

# Set proper permissions
echo "Setting up permissions..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Generate application key if not set
if [ -z "$(grep '^APP_KEY=' .env)" ]; then
    echo "Generating application key..."
    php artisan key:generate --force
fi

# Run database migrations with retry logic
max_retries=5
retry_count=0

while [ $retry_count -lt $max_retries ]; do
    echo "Running database migrations (Attempt $((retry_count + 1)) of $max_retries)..."
    if php artisan migrate --force; then
        echo "Migrations completed successfully."
        break
    else
        retry_count=$((retry_count + 1))
        if [ $retry_count -eq $max_retries ]; then
            echo "Failed to run migrations after $max_retries attempts. Exiting..."
            exit 1
        fi
        echo "Migration failed. Retrying in 5 seconds..."
        sleep 5
    fi
done

# Clear and cache routes and config
echo "Optimizing Laravel..."
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ensure supervisor log directory exists
mkdir -p /var/log/supervisor

# Start PHP-FPM and Nginx
echo "Starting services..."
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
