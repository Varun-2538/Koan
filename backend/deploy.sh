#!/bin/bash

# DeFi Execution Engine - Production Deployment Script
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="unite-defi-execution-engine"

echo "🚀 Deploying DeFi Execution Engine to $ENVIRONMENT environment..."

# Check if required environment variables are set
check_env_vars() {
    local required_vars=(
        "ONEINCH_API_KEY"
        "ETHEREUM_RPC_URL"
        "POLYGON_RPC_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            echo "❌ Error: Environment variable $var is not set"
            echo "Please set required environment variables in .env file"
            exit 1
        fi
    done
    
    echo "✅ Environment variables validated"
}

# Build and deploy with Docker Compose
deploy_docker() {
    echo "📦 Building Docker images..."
    docker-compose build --no-cache
    
    echo "🗑️ Cleaning up old containers..."
    docker-compose down --remove-orphans
    
    echo "🚀 Starting services..."
    docker-compose up -d
    
    echo "⏳ Waiting for services to be healthy..."
    sleep 10
    
    # Health check
    if curl -f http://localhost:3001/api/health >/dev/null 2>&1; then
        echo "✅ DeFi Execution Engine is healthy!"
    else
        echo "❌ Health check failed"
        docker-compose logs defi-engine
        exit 1
    fi
}

# Deploy to cloud (example for AWS/GCP/Azure)
deploy_cloud() {
    echo "☁️ Deploying to cloud environment..."
    
    # Build and push Docker image
    docker build -t $PROJECT_NAME:latest .
    docker tag $PROJECT_NAME:latest $DOCKER_REGISTRY/$PROJECT_NAME:latest
    docker push $DOCKER_REGISTRY/$PROJECT_NAME:latest
    
    # Deploy using your preferred method (k8s, ECS, etc.)
    echo "Cloud deployment would happen here..."
}

# Backup current deployment
backup_deployment() {
    echo "💾 Creating backup..."
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR
    
    # Backup Redis data if running
    if docker-compose ps | grep -q "defi-redis"; then
        docker exec defi-redis redis-cli BGSAVE
        docker cp defi-redis:/data/dump.rdb $BACKUP_DIR/
    fi
    
    # Backup logs
    if [[ -d "logs" ]]; then
        cp -r logs $BACKUP_DIR/
    fi
    
    echo "✅ Backup created at $BACKUP_DIR"
}

# Rollback to previous version
rollback() {
    echo "⏪ Rolling back deployment..."
    docker-compose down
    
    # Restore from latest backup
    LATEST_BACKUP=$(ls -1 backups/ | sort -r | head -n1)
    if [[ -n "$LATEST_BACKUP" ]]; then
        echo "📁 Restoring from backup: $LATEST_BACKUP"
        
        # Restore Redis data
        if [[ -f "backups/$LATEST_BACKUP/dump.rdb" ]]; then
            docker-compose up -d redis
            sleep 5
            docker cp "backups/$LATEST_BACKUP/dump.rdb" defi-redis:/data/
            docker-compose restart redis
        fi
        
        # Restore logs
        if [[ -d "backups/$LATEST_BACKUP/logs" ]]; then
            cp -r "backups/$LATEST_BACKUP/logs" ./
        fi
    fi
    
    docker-compose up -d
    echo "✅ Rollback completed"
}

# Show deployment status
status() {
    echo "📊 Deployment Status:"
    echo "===================="
    
    docker-compose ps
    
    echo ""
    echo "🔍 Service Health:"
    echo "=================="
    
    # Check API health
    if curl -s http://localhost:3001/api/health | jq -r '.status' | grep -q "healthy"; then
        echo "✅ API: Healthy"
    else
        echo "❌ API: Unhealthy"
    fi
    
    # Check Redis
    if docker exec defi-redis redis-cli ping | grep -q "PONG"; then
        echo "✅ Redis: Connected"
    else
        echo "❌ Redis: Disconnected"
    fi
    
    echo ""
    echo "📈 Resource Usage:"
    echo "=================="
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
}

# Monitor logs
logs() {
    local service=${1:-defi-engine}
    echo "📋 Showing logs for $service..."
    docker-compose logs -f $service
}

# Main deployment flow
main() {
    case "${1:-deploy}" in
        deploy)
            backup_deployment
            check_env_vars
            deploy_docker
            status
            ;;
        cloud)
            check_env_vars
            deploy_cloud
            ;;
        rollback)
            rollback
            ;;
        status)
            status
            ;;
        logs)
            logs $2
            ;;
        backup)
            backup_deployment
            ;;
        help|--help|-h)
            echo "DeFi Execution Engine Deployment Script"
            echo ""
            echo "Usage: $0 [command] [options]"
            echo ""
            echo "Commands:"
            echo "  deploy    Deploy to local Docker environment (default)"
            echo "  cloud     Deploy to cloud environment"
            echo "  rollback  Rollback to previous deployment"
            echo "  status    Show deployment status"
            echo "  logs      Show service logs"
            echo "  backup    Create backup"
            echo "  help      Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 deploy"
            echo "  $0 status"
            echo "  $0 logs defi-engine"
            echo "  $0 rollback"
            ;;
        *)
            echo "❌ Unknown command: $1"
            echo "Run '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"