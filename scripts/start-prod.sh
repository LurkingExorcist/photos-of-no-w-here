#!/bin/bash

# Set error handling
set -euo pipefail
trap 'echo "Error on line $LINENO"' ERR

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}Error: Docker is not running${NC}"
        exit 1
    fi
}

# Function to check required files
check_files() {
    if [ ! -f "docker-compose.yml" ]; then
        echo -e "${RED}Error: docker-compose.yml not found${NC}"
        exit 1
    fi
}

# Function to check disk space
check_disk_space() {
    # Get available disk space in GB
    available_space=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
    
    if [ "$available_space" -lt 10 ]; then
        echo -e "${RED}Warning: Less than 10GB of disk space available${NC}"
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Function to backup existing volumes
backup_volumes() {
    echo -e "${GREEN}Backing up volumes...${NC}"
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_dir="backups/${timestamp}"
    mkdir -p "$backup_dir"
    
    # Add your volume backup logic here
    docker run --rm \
        --volumes-from photos_redis_data \
        -v "$(pwd)/${backup_dir}:/backup" \
        alpine tar czf /backup/redis-data.tar.gz /data
}

# Function to clean up old containers and volumes
cleanup() {
    echo -e "${YELLOW}Cleaning up old containers...${NC}"
    docker compose down --remove-orphans
}

# Function to check container health
check_health() {
    echo -e "${GREEN}Checking container health...${NC}"
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps | grep -q "healthy"; then
            echo -e "${GREEN}All containers are healthy!${NC}"
            return 0
        fi
        echo -e "${YELLOW}Waiting for containers to be healthy (attempt $attempt/$max_attempts)...${NC}"
        sleep 5
        ((attempt++))
    done
    
    echo -e "${RED}Error: Containers failed to become healthy${NC}"
    docker compose logs
    exit 1
}

# Main execution
main() {
    echo -e "${GREEN}Starting production environment...${NC}"
    
    # Change to the project root directory
    cd "$(dirname "$0")/.."
    
    # Perform checks
    check_docker
    check_files
    check_disk_space
    
    # Backup existing volumes
    backup_volumes
    
    # Clean up old containers
    cleanup
    
    # Pull latest images
    echo -e "${GREEN}Pulling latest images...${NC}"
    docker compose pull
    
    # Build and start containers in detached mode
    echo -e "${GREEN}Building and starting containers...${NC}"
    docker compose up -d --build
    
    # Check container health
    check_health
    
    echo -e "${GREEN}Production environment is up and running!${NC}"
    echo -e "${GREEN}To view logs, run: docker compose logs -f${NC}"
}

# Execute main function
main 