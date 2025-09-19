#!/bin/bash
set -euo pipefail

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Auto-detect environment
if [ -z "${RAILWAY_ENVIRONMENT:-}" ]; then
    ENV_FILE=".env"
    log "${YELLOW}Running in local environment${NC}"
else
    ENV_FILE=".env.production"
    log "${GREEN}Running in Railway environment${NC}"
    
    # Copy .env.example to .env if it doesn't exist
    if [ ! -f ".env" ]; then
        log "${YELLOW}Creating .env file from .env.example${NC}"
        cp .env.example .env
    fi
    
    # Generate app key if not set
    if ! grep -q '^APP_KEY=' .env; then
        log "${YELLOW}🔑 Generating application key...${NC}"
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
    log "${YELLOW}➜ Running: ${cmd}${NC}"
    if ! output=$($cmd 2>&1); then
        log "${RED}❌ Command failed: $cmd"
        log "${RED}Output: $output${NC}"
        return 1
    fi
    return 0
}

# Main deployment function
main() {
    log "${GREEN}🚀 Starting deployment process in ${ENV_FILE} environment...${NC}"
    
    # Check for required commands
    local required_commands=("php" "composer" "node" "npm")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log "${RED}❌ $cmd is required but not installed${NC}"
            exit 1
        fi
    done

    # Create necessary directories with proper permissions
    log "${GREEN}📂 Creating directories...${NC}"
    local dirs=(
        "storage/framework/sessions"
        "storage/framework/views"
        "storage/framework/cache"
        "storage/logs"
        "bootstrap/cache"
    )
    
    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            run_command mkdir -p "$dir"
        fi
        run_command chmod 775 "$dir"
    done

    # Set proper permissions
    log "${GREEN}🔒 Setting permissions...${NC}"
    run_command find storage -type d -exec chmod 775 {} \;
    run_command find storage -type f -exec chmod 664 {} \;
    run_command find bootstrap/cache -type d -exec chmod 775 {} \;
    run_command find bootstrap/cache -type f -exec chmod 664 {} \;

    # Clear caches
    log "${GREEN}🧹 Clearing caches...${NC}"
    local cache_commands=(
        "cache:clear"
        "config:clear"
        "route:clear"
        "view:clear"
        "event:clear"
    )
    
    for cmd in "${cache_commands[@]}"; do
        run_command php artisan "$cmd"
        log "${GREEN}✓ Cleared: $cmd${NC}"
    done

    # Install PHP dependencies
    log "${GREEN}📦 Installing PHP dependencies...${NC}"
    run_command composer install --optimize-autoloader --no-interaction --prefer-dist

    # Install Node.js dependencies if package.json exists
    if [ -f "package.json" ]; then
        log "${GREEN}📦 Installing Node.js dependencies...${NC}"
        run_command npm ci --no-audit --prefer-offline
        
        # Build assets for production
        log "${GREEN}🔨 Building assets...${NC}"
        run_command npm run build --if-present
    fi

    # Database setup
    log "${GREEN}🔄 Setting up database...${NC}"
    if [ "${DB_CONNECTION:-}" = "pgsql" ]; then
        # Wait for PostgreSQL to be ready
        log "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
        timeout 30 bash -c 'until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_DATABASE; do sleep 1; done' || {
            log "${RED}❌ PostgreSQL is not ready${NC}"
            exit 1
        }
    fi

    # Run migrations
    log "${GREEN}🔄 Running database migrations...${NC}"
    run_command php artisan migrate --force --no-interaction

    # Run database seeders if needed
    # Uncomment the following line if you want to run seeders during deployment
    # run_command php artisan db:seed --force --no-interaction

    # Optimize framework
    log "${GREEN}⚡ Optimizing framework...${NC}"
    local optimize_commands=(
        "config:cache"
        "route:cache"
        "view:cache"
    )
    
    for cmd in "${optimize_commands[@]}"; do
        run_command php artisan "$cmd"
        log "${GREEN}✓ Optimized: $cmd${NC}"
    done

    # Restart queue workers if using queues
    if [ -f "storage/logs/worker.log" ]; then
        log "${GREEN}🔄 Restarting queue workers...${NC}"
        run_command php artisan queue:restart
    fi

    # Generate application key if not exists
    if [ ! -f ".env" ] || ! grep -q "^APP_KEY=" .env; then
        log "${GREEN}🔑 Generating application key...${NC}"
        run_command php artisan key:generate
    fi

    # Create storage link if it doesn't exist
    if [ ! -L "public/storage" ]; then
        log "${GREEN}🔗 Creating storage link...${NC}"
        run_command php artisan storage:link
    fi

    # Cache configuration
    log "${GREEN}⚡ Caching configuration...${NC}"
    run_command php artisan config:cache
    run_command php artisan route:cache
    run_command php artisan view:cache

    # Final success message
    log "${GREEN}✨ Deployment completed successfully!${NC}"
    log "${GREEN}🌐 Your app is now running at: ${APP_URL:-https://$RAILWAY_PUBLIC_DOMAIN}${NC}"
    log "${YELLOW}ℹ️  Debug Info:${NC}"
    log "- Environment: ${APP_ENV:-production}"
    log "- Debug Mode: ${APP_DEBUG:-false}"
    log "- Log Level: ${LOG_LEVEL:-error}"
    
    # Exit with success
    exit 0
}

# Run the main function
main "$@"
