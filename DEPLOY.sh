#!/bin/bash

###############################################################################
# MacroDash Agentic Workflow Deployment Script
#
# This script runs all necessary steps to deploy the agent implementation
# Run this on your production/staging server with Python environment set up
###############################################################################

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║         MacroDash Agentic Workflow Deployment                    ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Navigate to server directory
echo -e "${YELLOW}[1/6]${NC} Navigating to server directory..."
cd server || exit 1
echo -e "${GREEN}✓ In server directory${NC}"
echo ""

# Step 2: Check if virtual environment is activated
echo -e "${YELLOW}[2/6]${NC} Checking Python environment..."
if ! python --version &> /dev/null; then
    echo -e "${RED}✗ Python not found in PATH${NC}"
    echo "   Please activate your virtual environment:"
    echo "   - Linux/Mac: source venv/bin/activate"
    echo "   - Windows: venv\\Scripts\\activate"
    exit 1
fi
python_version=$(python --version)
echo -e "${GREEN}✓ Python found: ${python_version}${NC}"
echo ""

# Step 3: Check Django installation
echo -e "${YELLOW}[3/6]${NC} Checking Django installation..."
if ! python -c "import django" &> /dev/null; then
    echo -e "${RED}✗ Django not installed${NC}"
    echo "   Please install dependencies:"
    echo "   pip install -r requirements.txt"
    exit 1
fi
django_version=$(python -c "import django; print(django.get_version())")
echo -e "${GREEN}✓ Django installed: ${django_version}${NC}"
echo ""

# Step 4: Create migrations
echo -e "${YELLOW}[4/6]${NC} Creating migrations for new models..."
echo "   Running: python manage.py makemigrations"
python manage.py makemigrations
echo -e "${GREEN}✓ Migrations created${NC}"
echo ""

# Step 5: Apply migrations
echo -e "${YELLOW}[5/6]${NC} Applying migrations to database..."
echo "   Running: python manage.py migrate"
python manage.py migrate
echo -e "${GREEN}✓ Database updated${NC}"
echo ""

# Step 6: Collect static files (if needed)
echo -e "${YELLOW}[6/6]${NC} Collecting static files..."
python manage.py collectstatic --noinput 2>/dev/null || echo "   (Static files skipped or already collected)"
echo -e "${GREEN}✓ Deployment complete${NC}"
echo ""

echo "╔══════════════════════════════════════════════════════════════════╗"
echo -e "${GREEN}✓ DEPLOYMENT SUCCESSFUL${NC}"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

echo "Next steps:"
echo "1. Set environment variables in .env file:"
echo "   - OPENAI_API_KEY=sk-..."
echo "   - ALPHA_VANTAGE_API_KEY=..."
echo "   - EMAIL settings (if using email)"
echo ""
echo "2. Start the server:"
echo "   python manage.py runserver"
echo ""
echo "3. Start the frontend:"
echo "   cd ../client && yarn dev"
echo ""
echo "4. Verify scheduler started:"
echo "   Check Django logs for 'APScheduler started successfully'"
echo ""
