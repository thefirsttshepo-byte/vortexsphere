#!/bin/bash
echo "🔐 Running Security Audit for Financial Software"
echo "=============================================="

echo "1. Checking for known vulnerabilities..."
npm audit

echo "2. Checking for outdated packages..."
npm outdated

echo "3. Checking math library versions..."
npm list | grep -E "(math|decimal|big|precision)"

echo "4. Running dependency check..."
npx depcheck

echo "5. Scanning for sensitive data (if any)..."
grep -r "password\|secret\|key\|token" --include="*.ts" --include="*.js" --include="*.json" src/ || echo "No sensitive data found in source code"