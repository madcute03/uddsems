#!/bin/bash
set -e

# Wait for MySQL to be ready
/usr/local/bin/wait-for-mysql.sh mysql 3306

# Run database migrations
php artisan migrate --force

# Clear and cache routes and config
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Cache routes and config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start PHP-FPM and Nginx
/usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
