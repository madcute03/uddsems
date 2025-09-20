# Stage 1: Build PHP + Composer
FROM php:8.2-fpm AS php-builder

WORKDIR /var/www/html

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
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

COPY . .

# Stage 2: Node + Vite build
FROM node:18 AS node-builder

WORKDIR /var/www/html

COPY package*.json ./
RUN npm ci

COPY resources ./resources
COPY vite.config.js ./

RUN npm run build

# Stage 3: Final image
FROM php:8.2-fpm

WORKDIR /var/www/html

# Copy PHP from builder
COPY --from=php-builder /var/www/html /var/www/html

# Copy Vite-built frontend
COPY --from=node-builder /var/www/html/public/build /var/www/html/public/build

# Expose port 8000
EXPOSE 8000

# Use PHP-FPM (artisan serve is for dev only)
CMD ["php-fpm"]
