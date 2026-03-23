#!/bin/bash

echo ""
echo "🚀 CASH-ONLY PROPERTY ANALYZER - DEPLOYMENT VERIFICATION"
echo "=========================================================="
echo ""

start_time=$(date +%s)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Status functions
status() {
    echo -e "${GRAY}[$1] $2${NC}"
}

success() {
    echo -e "  ${GREEN}✅ $1${NC}"
}

fail() {
    echo -e "  ${RED}❌ $1${NC}"
}

warning() {
    echo -e "  ${YELLOW}⚠️  $1${NC}"
}

all_passed=true
failed_steps=()

echo -e "${YELLOW}📊 STEP 1: ENVIRONMENT CHECK${NC}"
status "1.1" "Checking Node.js version..."
node_version=$(node --version)
if [[ $node_version =~ v(18|20|22) ]]; then
    success "Node.js $node_version"
else
    fail "Node.js $node_version (need v18, v20, or v22)"
    all_passed=false
    failed_steps+=("Node.js version")
fi

status "1.2" "Checking npm version..."
npm_version=$(npm --version)
success "npm v$npm_version"

echo ""
echo -e "${YELLOW}🔧 STEP 2: DEPENDENCIES & BUILD${NC}"

status "2.1" "Installing dependencies..."
if npm ci --silent; then
    success "Dependencies installed"
else
    fail "Dependency installation failed"
    all_passed=false
    failed_steps+=("Dependency installation")
fi

status "2.2" "TypeScript type checking..."
if npx tsc --noEmit; then
    success "TypeScript compilation passed"
else
    fail "TypeScript compilation failed"
    all_passed=false
    failed_steps+=("TypeScript compilation")
fi

status "2.3" "Building application..."
if npm run build --silent; then
    if [ -d "dist" ]; then
        build_size=$(du -sh dist | cut -f1)
        success "Build successful ($build_size)"
    else
        fail "Build failed - no dist folder"
        all_passed=false
        failed_steps+=("Build")
    fi
else
    fail "Build failed"
    all_passed=false
    failed_steps+=("Build")
fi

echo ""
echo -e "${YELLOW}🧪 STEP 3: TEST SUITE${NC}"

status "3.1" "Running golden reference tests..."
if npm run test:golden --silent; then
    success "Golden tests passed (6/6)"
else
    fail "Golden tests failed"
    all_passed=false
    failed_steps+=("Golden tests")
fi

status "3.2" "Running unit tests..."
if npm run test:unit --silent; then
    success "Unit tests passed"
else
    fail "Unit tests failed"
    all_passed=false
    failed_steps+=("Unit tests")
fi

status "3.3" "Running property-based tests..."
if npm run test:property --silent; then
    success "Property tests passed"
else
    fail "Property tests failed"
    all_passed=false
    failed_steps+=("Property tests")
fi

echo ""
echo -e "${YELLOW}📦 STEP 4: DEPLOYMENT ARTIFACTS${NC}"

status "4.1" "Checking dist folder structure..."
if [ -d "dist" ]; then
    required_files=("index.html" "assets/" "vite-manifest.json")
    missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ ! -e "dist/$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        file_count=$(find dist -type f | wc -l)
        success "Dist folder complete ($file_count files)"
    else
        fail "Missing required files: ${missing_files[*]}"
        all_passed=false
        failed_steps+=("Dist folder structure")
    fi
else
    fail "Dist folder not found"
    all_passed=false
    failed_steps+=("Dist folder")
fi

status "4.2" "Checking PWA configuration..."
if [ -f "dist/manifest.webmanifest" ]; then
    success "PWA manifest found"
else
    warning "No PWA manifest (optional for private use)"
fi

end_time=$(date +%s)
duration=$((end_time - start_time))

echo ""
echo -e "${CYAN}📋 FINAL RESULTS${NC}"
echo -e "${CYAN}================${NC}"

if [ "$all_passed" = true ]; then
    echo -e "${GREEN}🎉 DEPLOYMENT READY!${NC}"
    echo ""
    echo -e "${NC}Next steps:"
    echo -e "1. Copy the entire 'dist' folder to your private server"
    echo -e "2. Ensure server serves index.html for all routes (SPA routing)"
    echo -e "3. Test offline functionality on your server"
    echo ""
    echo -e "${GREEN}Your capital protection engine is ready for production use.${NC}"
else
    echo -e "${RED}🚫 DEPLOYMENT BLOCKED${NC}"
    echo ""
    echo -e "${RED}Failed steps:${NC}"
    for step in "${failed_steps[@]}"; do
        echo -e "  • $step"
    done
    echo ""
    echo -e "${YELLOW}Fix the issues above before deploying.${NC}"
fi

echo ""
echo -e "${GRAY}⏱️  Total verification time: ${duration}s${NC}"

if [ "$all_passed" = true ]; then
    exit 0
else
    exit 1
fi