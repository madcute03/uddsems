# Stage 1: Build PHP + Composer
FROM php:8.2-fpm

# Set working directory
WORKDIR /var/www/html

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql zip mbstring exif pcntl bcmath

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Copy PHP backend files
COPY . .

# Copy environment file
COPY .env.example .env

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Stage 2: Node + Vite build
FROM node:18

WORKDIR /var/www/html

# Copy frontend files
COPY package*.json ./
COPY resources ./resources

# Install Node dependencies
RUN npm ci
RUN npm run build

# Stage 3: Final image
FROM php:8.2-fpm

WORKDIR /var/www/html

# Copy built backend and frontend
COPY --from=0 /var/www/html . 
COPY --from=1 /var/www/html/public/build ./public/build

# Expose port 8000
EXPOSE 8000

# Start Laravel server
CMD php artisan serve --host=0.0.0.0 --port=8000
