# --------------------------
# Stage 1: PHP + Composer
# --------------------------
FROM php:8.2-fpm AS php-builder

# Install system dependencies with cleanup in one layer
RUN set -eux; \
    apt-get update; \
    # Install required packages
    apt-get install -y --no-install-recommends \
        git \
        unzip \
        curl \
        libzip-dev \
        libonig-dev \
        libxml2-dev \
        libpng-dev \
        libjpeg-dev \
        libfreetype6-dev \
        libwebp-dev \
        libjpeg62-turbo-dev \
        libicu-dev \
        g++ \
        ; \
    # Configure and install PHP extensions
    docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp; \
    docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_mysql \
        zip \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        intl \
        opcache \
        ; \
    # Clean up
    apt-get clean; \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /usr/share/doc/*; \
    # Verify installations
    php -m; \
    php -v; \
    php -i | grep error_log

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set working directory
WORKDIR /var/www/html

# Copy only the necessary files for composer install
COPY composer.json composer.lock ./

# Install PHP dependencies (no dev dependencies for production)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress --no-scripts --no-plugins

# Copy application files
COPY . .

# Generate application key if not exists
RUN if [ ! -f .env ]; then \
        cp .env.example .env && \
        php artisan key:generate; \
    fi

# Optimize Laravel
RUN php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache

# --------------------------
# Stage 2: Node + Vite build
# --------------------------
FROM node:18 AS node-builder

WORKDIR /var/www/html

# Copy package files first for better layer caching
COPY package*.json ./
COPY vite.config.js ./

# Install Node dependencies with improved caching
RUN set -eux; \
    npm config set cache /tmp/npm-cache; \
    npm ci --prefer-offline --no-audit --no-fund; \
    # Clean npm cache to reduce image size
    npm cache clean --force

# Copy frontend source (exclude node_modules in .dockerignore)
COPY resources/ resources/

# Build frontend assets for production
RUN set -eux; \
    npm run build; \
    # Clean up development dependencies
    npm prune --production; \
    # Remove cache and temporary files
    rm -rf /tmp/npm-cache /tmp/*

# --------------------------
# Stage 3: Final image
# --------------------------
FROM php:8.2-fpm

# Install system dependencies with cleanup in one layer
RUN set -eux; \
    apt-get update; \
    # Install required packages
    apt-get install -y --no-install-recommends \
        nginx \
        supervisor \
        libzip-dev \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libwebp-dev \
        libicu-dev \
        ; \
    # Configure and install PHP extensions
    docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp; \
    docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_mysql \n        zip \
        gd \
        intl \
        opcache \
        ; \
    # Clean up
    apt-get clean; \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /usr/share/doc/*; \
    # Verify installations
    php -m; \
    php -v

# Configure PHP for production
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Configure PHP-FPM
RUN echo 'pm = dynamic' >> /usr/local/etc/php-fpm.d/zz-docker.conf \
    && echo 'pm.max_children = 5' >> /usr/local/etc/php-fpm.d/zz-docker.conf \
    && echo 'pm.start_servers = 2' >> /usr/local/etc/php-fpm.d/zz-docker.conf \
    && echo 'pm.min_spare_servers = 1' >> /usr/local/etc/php-fpm.d/zz-docker.conf \
    && echo 'pm.max_spare_servers = 3' >> /usr/local/etc/php-fpm.d/zz-docker.conf

# Configure nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set working directory
WORKDIR /var/www/html

# Copy application files from builder stages
COPY --from=php-builder /var/www/html .
COPY --from=node-builder /var/www/html/public/build ./public/build/

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose the port the app runs on
EXPOSE 8000

# Use supervisord to manage multiple processes
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]