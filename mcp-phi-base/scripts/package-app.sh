#!/bin/bash
# Package φ-Discovery as a desktop application

set -e

echo "🏗️  Building φ-Discovery Desktop Application"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the mcp-phi-base directory"
    exit 1
fi

# Install Electron app dependencies
echo -e "${YELLOW}Installing Electron dependencies...${NC}"
cd electron-app
npm install
npm install --save-dev electron-builder

# Build the React UI (if it exists)
if [ -d "../ui" ]; then
    echo -e "${YELLOW}Building React UI...${NC}"
    cd ../ui
    npm install
    npm run build
    cp -r build/* ../electron-app/
    cd ../electron-app
fi

# Package for current platform
echo -e "${YELLOW}Packaging for current platform...${NC}"
npm run build

# Package for all platforms (optional)
if [ "$1" == "--all" ]; then
    echo -e "${YELLOW}Packaging for all platforms...${NC}"
    # Windows
    npm run build -- --win
    
    # macOS
    npm run build -- --mac
    
    # Linux
    npm run build -- --linux
fi

echo -e "${GREEN}✅ Build complete!${NC}"
echo ""
echo "📦 Packaged applications are in: electron-app/dist/"
echo ""
echo "To distribute:"
echo "  - Windows: dist/φ-Discovery Setup *.exe"
echo "  - macOS: dist/φ-Discovery-*.dmg"
echo "  - Linux: dist/φ-Discovery-*.AppImage"

# Create portable ZIP
echo -e "${YELLOW}Creating portable package...${NC}"
cd ..
zip -r phi-discovery-portable.zip \
    electron-app/dist \
    launcher \
    docker \
    workers \
    scripts \
    .env.example \
    README_USER.md \
    -x "*/node_modules/*" "*/target/*" "*/__pycache__/*"

echo -e "${GREEN}✅ Portable package created: phi-discovery-portable.zip${NC}"