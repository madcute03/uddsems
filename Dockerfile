# Base image with PHP and Composer
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl libzip-dev zip unzip nodejs npm

# Set working directory
WORKDIR /var/www/html

# Copy project files
COPY . .

# Install PHP dependencies
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader

# Install Node dependencies and build frontend
RUN npm ci
RUN npm run build

# Expose port
EXPOSE 8000

# Start PHP built-in server
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
