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
    if [ ! -f "docker-compose.dev.yml" ]; then
        echo -e "${RED}Error: docker-compose.dev.yml not found${NC}"
        exit 1
    fi
}

# Function to clean up old containers and volumes
cleanup() {
    echo -e "${YELLOW}Cleaning up old development containers...${NC}"
    docker compose -f docker-compose.dev.yml down --remove-orphans
}

# Main execution
main() {
    echo -e "${GREEN}Starting development environment...${NC}"
    
    # Change to the project root directory
    cd "$(dirname "$0")/.."
    
    # Perform checks
    check_docker
    check_files
    
    # Clean up old containers
    cleanup
    
    # Pull latest images
    echo -e "${GREEN}Pulling latest images...${NC}"
    docker compose -f docker-compose.dev.yml pull
    
    # Build and start containers
    echo -e "${GREEN}Building and starting containers...${NC}"
    docker compose -f docker-compose.dev.yml up --build
}

# Execute main function
main 