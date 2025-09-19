#!/bin/bash
set -euo pipefail

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Auto-detect environment
if [ -z "${RAILWAY_ENVIRONMENT:-}" ]; then
    ENV_FILE=".env"
else
    ENV_FILE=".env.production"
    cp .env.example .env
    
    # Generate app key if not set
    if ! grep -q '^APP_KEY=' .env; then
        echo -e "${YELLOW}🔑 Generating application key...${NC}"
        php artisan key:generate --no-interaction --force
    fi
fi

# Function to handle errors
error_exit() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
    exit 1
}

# Function to run commands with error handling
run_command() {
    local cmd="$*"
    echo -e "${YELLOW}➜${NC} Running: ${cmd}"
    if ! output=$($cmd 2>&1); then
        error_exit "Command failed: $cmd\n$output"
    fi
    return 0
}

echo -e "\n${GREEN}🚀 Starting deployment process in ${ENV_FILE} environment...${NC}"

# Check for required commands
for cmd in php composer node npm; do
    if ! command -v $cmd &> /dev/null; then
        error_exit "$cmd is required but not installed"
    fi
done

# Create necessary directories with proper permissions
echo -e "\n${GREEN}📂 Creating directories...${NC}"
for dir in "storage/framework/sessions" "storage/framework/views" "storage/framework/cache" "storage/logs" "bootstrap/cache"; do
    if [ ! -d "$dir" ]; then
        run_command mkdir -p "$dir"
    fi
    run_command chmod 775 "$dir"
done

# Set proper permissions
echo -e "\n${GREEN}🔒 Setting permissions...${NC}"
run_command find storage -type d -exec chmod 775 {} \;
run_command find storage -type f -exec chmod 664 {} \;
run_command find bootstrap/cache -type d -exec chmod 775 {} \;
run_command find bootstrap/cache -type f -exec chmod 664 {} \;

# Clear caches
echo -e "\n${GREEN}🧹 Clearing caches...${NC}"
for cmd in "cache:clear" "config:clear" "route:clear" "view:clear" "event:clear"; do
    run_command php artisan $cmd
    echo -e "${GREEN}✓${NC} Cleared: $cmd"
done

# Install PHP dependencies
echo -e "\n${GREEN}📦 Installing PHP dependencies...${NC}"
run_command composer install --optimize-autoloader --no-interaction --prefer-dist

# Install Node.js dependencies if package.json exists
if [ -f "package.json" ]; then
    echo -e "\n${GREEN}📦 Installing Node.js dependencies...${NC}"
    run_command npm ci --no-audit --prefer-offline
    
    # Build assets for production
    echo -e "\n${GREEN}🔨 Building assets...${NC}"
    run_command npm run build --if-present
fi

# Database setup
echo -e "\n${GREEN}🔄 Setting up database...${NC}"
if [ "$DB_CONNECTION" = "pgsql" ]; then
    # Wait for PostgreSQL to be ready
    echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
    timeout 30 bash -c 'until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_DATABASE; do sleep 1; done' || {
        echo -e "${RED}❌ PostgreSQL is not ready${NC}"
        exit 1
    }
fi

# Run migrations
echo -e "\n${GREEN}🔄 Running database migrations...${NC}
run_command php artisan migrate --force --no-interaction

# Run database seeders if needed
# Uncomment the following line if you want to run seeders during deployment
# run_command php artisan db:seed --force --no-interaction

# Optimize framework
echo -e "\n${GREEN}⚡ Optimizing framework...${NC}"
for cmd in "config:cache" "route:cache" "view:cache"; do
    run_command php artisan $cmd
    echo -e "${GREEN}✓${NC} Optimized: $cmd"
done

# Set ownership (uncomment and adjust if needed)
# echo -e "\n${GREEN}👤 Setting ownership...${NC}"
# run_command chown -R www-data:www-data .

# Restart queue workers if using queues
if [ -f "storage/logs/worker.log" ]; then
    echo -e "\n${GREEN}🔄 Restarting queue workers...${NC}"
    run_command php artisan queue:restart
fi

# Clear the application cache one final time
echo -e "\n${GREEN}🧹 Final cache clear...${NC}"
run_command php artisan cache:clear

# Generate application key if not exists
if [ ! -f ".env" ] || ! grep -q "^APP_KEY=" .env; then
    echo -e "\n${GREEN}🔑 Generating application key...${NC}"
    run_command php artisan key:generate
fi

# Create storage link if it doesn't exist
if [ ! -L "public/storage" ]; then
    echo -e "\n${GREEN}🔗 Creating storage link...${NC}"
    run_command php artisan storage:link
fi

# Cache configuration
echo -e "\n${GREEN}⚡ Caching configuration...${NC}"
run_command php artisan config:cache
run_command php artisan route:cache
run_command php artisan view:cache

# Final success message
echo -e "\n${GREEN}✨ Deployment completed successfully!${NC}"
echo -e "\n${GREEN}🌐 Your app is now running at: ${APP_URL:-https://$RAILWAY_PUBLIC_DOMAIN}${NC}"
echo -e "\n${YELLOW}ℹ️  Debug Info:${NC}"
echo -e "Environment: ${APP_ENV:-production}"
echo -e "Debug Mode: ${APP_DEBUG:-false}"
echo -e "Log Level: ${LOG_LEVEL:-error}"
