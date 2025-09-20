# --------------------------
# Stage 1: PHP + Composer
# --------------------------
    FROM php:8.2-fpm AS php-builder

    # Set working directory
    WORKDIR /var/www/html
    
    # Install system dependencies
    RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
        git \
        unzip \
        curl \
        libzip-dev \
        libonig-dev \
        libxml2-dev \
        zip \
        zlib1g-dev \
        && docker-php-ext-install pdo pdo_mysql zip mbstring exif pcntl bcmath
    
    # Install Composer
    RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
    
    # Copy PHP backend files
    COPY composer.json composer.lock ./
    RUN composer install --no-dev --optimize-autoloader
    
    COPY . .
    
    # --------------------------
    # Stage 2: Node + Vite build
    # --------------------------
    FROM node:18 AS node-builder
    
    WORKDIR /var/www/html
    
    # Copy package files first
    COPY package*.json ./
    
    # Install Node dependencies
    RUN npm ci
    
    # Copy frontend source & Vite config
    COPY resources resources
    COPY vite.config.js ./
    
    # Build frontend assets
    RUN npm run build
    
    # --------------------------
    # Stage 3: Final image
    # --------------------------
    FROM php:8.2-fpm
    
    WORKDIR /var/www/html
    
    # Copy backend from PHP stage
    COPY --from=php-builder /var/www/html . 
    
    # Copy frontend build from Node stage
    COPY --from=node-builder /var/www/html/public/build ./public/build
    
    # Expose port
    EXPOSE 8000
    
    # Run Laravel server
    CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
    