# --------------------------
# Stage 1: PHP + Composer
# --------------------------
    FROM php:8.2-fpm AS php-builder

    # Install system dependencies
    RUN set -eux; \
        apt-get update && apt-get install -y --no-install-recommends \
            git \
            unzip \
            curl \
            libzip-dev \
            libonig-dev \
            libxml2-dev \
            libpng-dev \
            libjpeg62-turbo-dev \
            libfreetype6-dev \
            libwebp-dev \
            libicu-dev \
            libpq-dev \
            default-mysql-client \
            supervisor \
            nginx; \
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
            opcache; \
        # Install Composer
        curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer; \
        # Clean up
        apt-get clean; \
        rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
    
    # Install Composer
    COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer
    
    WORKDIR /var/www/html
    COPY . .
    
    # Install dependencies
    RUN if [ -f "composer.json" ]; then \
            composer install --no-dev --optimize-autoloader --no-interaction --no-progress --ignore-platform-reqs; \
        fi
    
    # Set permissions
    RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
        chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache
    
    # Generate key if not exists and cache config
    RUN if [ ! -f .env ]; then \
            cp .env.example .env && \
            php artisan key:generate --force; \
        fi && \
        php artisan config:cache && \
        php artisan route:cache && \
        php artisan view:cache
    
    # --------------------------
    # Stage 2: Node + Vite build
    # --------------------------
    FROM node:18 AS node-builder
    
    WORKDIR /var/www/html
    COPY --from=php-builder /var/www/html .
    
    # Install and build frontend
    RUN npm ci --prefer-offline --no-audit --no-fund && \
        npm run build && \
        npm cache clean --force
    
    # --------------------------
    # Stage 3: Final image
    # --------------------------
    FROM php:8.2-fpm
    
    # Install system dependencies
    RUN set -eux; \
        apt-get update && apt-get install -y --no-install-recommends \
            nginx \
            supervisor \
            libzip-dev \
            libpng-dev \
            libjpeg62-turbo-dev \
            libfreetype6-dev \
            libwebp-dev \
            libicu-dev; \
        docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp; \
        docker-php-ext-install -j$(nproc) \
            pdo \
            pdo_mysql \
            zip \
            gd \
            intl \
            opcache; \
        apt-get clean; \
        rm -rf /var/lib/apt/lists/*
    
    # Configure PHP
    RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
    
    # Configure PHP-FPM
    RUN { \
        echo '[global]'; \
        echo 'daemonize = no'; \
        echo; \
        echo '[www]'; \
        echo 'listen = 9000'; \
        echo 'pm = dynamic'; \
        echo 'pm.max_children = 5'; \
        echo 'pm.start_servers = 2'; \
        echo 'pm.min_spare_servers = 1'; \
        echo 'pm.max_spare_servers = 3'; \
        } > /usr/local/etc/php-fpm.d/zz-docker.conf
    
    # Configure nginx
    COPY docker/nginx.conf /etc/nginx/nginx.conf
    COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
    
    WORKDIR /var/www/html
    COPY --from=php-builder /var/www/html .
    COPY --from=node-builder /var/www/html/public/build ./public/build/
    
    # Set permissions
    RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
    
    # Create necessary directories and set permissions
    RUN mkdir -p /var/www/html/storage/framework/{sessions,views,cache} && \
        chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache && \
        chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
    
    # Wait for MySQL to be ready
    COPY docker/wait-for-mysql.sh /usr/local/bin/
    RUN chmod +x /usr/local/bin/wait-for-mysql.sh
    
    # Health check
    HEALTHCHECK --interval=30s --timeout=3s \
        CMD curl -f http://localhost:8000/up || exit 1
    
    EXPOSE 8000
    
    # Copy nginx config
    COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
    
    # Copy supervisord config
    COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
    
    # Expose port 8000 for Railway
    EXPOSE 8000
    
    # Start supervisord
    CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]