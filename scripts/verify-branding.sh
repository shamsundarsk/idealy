#!/bin/bash

echo "🔍 Idealy Branding Verification Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for v0 references in code
echo "Checking for v0 references in code..."
V0_COUNT=$(grep -r "\[v0\]" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . 2>/dev/null | grep -v node_modules | grep -v ".next" | wc -l)

if [ "$V0_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✅ No [v0] references found in code${NC}"
else
    echo -e "${RED}❌ Found $V0_COUNT [v0] references in code${NC}"
    grep -r "\[v0\]" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . 2>/dev/null | grep -v node_modules | grep -v ".next"
fi

echo ""

# Check package.json
echo "Checking package.json..."
PACKAGE_NAME=$(grep '"name"' package.json | head -1 | cut -d'"' -f4)
if [ "$PACKAGE_NAME" = "idealy" ]; then
    echo -e "${GREEN}✅ Package name is 'idealy'${NC}"
else
    echo -e "${RED}❌ Package name is '$PACKAGE_NAME' (should be 'idealy')${NC}"
fi

echo ""

# Check for Idealy branding
echo "Checking for Idealy branding..."
IDEALY_COUNT=$(grep -r "\[Idealy\]" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | grep -v ".next" | wc -l)
echo -e "${GREEN}✅ Found $IDEALY_COUNT [Idealy] references${NC}"

echo ""

# Check for brand assets
echo "Checking brand assets..."
if [ -f "public/icon.svg" ]; then
    echo -e "${GREEN}✅ Icon exists: public/icon.svg${NC}"
else
    echo -e "${RED}❌ Missing: public/icon.svg${NC}"
fi

if [ -f "public/idealy-logo.svg" ]; then
    echo -e "${GREEN}✅ Logo exists: public/idealy-logo.svg${NC}"
else
    echo -e "${RED}❌ Missing: public/idealy-logo.svg${NC}"
fi

if [ -f "BRANDING.md" ]; then
    echo -e "${GREEN}✅ Brand guidelines exist: BRANDING.md${NC}"
else
    echo -e "${RED}❌ Missing: BRANDING.md${NC}"
fi

echo ""

# Check metadata
echo "Checking metadata in app/layout.tsx..."
if grep -q "generator.*v0" app/layout.tsx; then
    echo -e "${RED}❌ Found v0 generator reference in metadata${NC}"
else
    echo -e "${GREEN}✅ No v0 generator reference in metadata${NC}"
fi

if grep -q "Idealy Team" app/layout.tsx; then
    echo -e "${GREEN}✅ Idealy Team in metadata${NC}"
else
    echo -e "${YELLOW}⚠️  Idealy Team not found in metadata${NC}"
fi

echo ""

# Summary
echo "======================================"
echo "Summary:"
echo ""
if [ "$V0_COUNT" -eq 0 ] && [ "$PACKAGE_NAME" = "idealy" ]; then
    echo -e "${GREEN}✅ All branding checks passed!${NC}"
    echo -e "${GREEN}✅ No v0 references found${NC}"
    echo -e "${GREEN}✅ Idealy branding is complete${NC}"
    echo ""
    echo "Your application is ready for production! 🚀"
else
    echo -e "${RED}❌ Some branding issues found${NC}"
    echo "Please review the output above and fix any issues."
fi

echo ""
