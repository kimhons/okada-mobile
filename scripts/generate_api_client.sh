#!/bin/bash

# ============================================
# Okada Mobile - API Client Generation Script
# ============================================
# This script generates Flutter API client code from the OpenAPI specification
# 
# Prerequisites:
# - openapi-generator-cli installed (npm install -g @openapitools/openapi-generator-cli)
# - OpenAPI spec file available at ../okada-backend/docs/api/openapi.yaml
#
# Usage:
#   ./scripts/generate_api_client.sh

set -e

echo "🚀 Okada Mobile - API Client Generation"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_ROOT="$(dirname "$PROJECT_ROOT")/okada-backend"
OPENAPI_SPEC="$BACKEND_ROOT/docs/api/openapi.yaml"
OUTPUT_DIR="$PROJECT_ROOT/shared/lib/api/generated"
PACKAGE_NAME="okada_api"

# Check if OpenAPI spec exists
if [ ! -f "$OPENAPI_SPEC" ]; then
    echo -e "${RED}❌ Error: OpenAPI specification not found at:${NC}"
    echo "   $OPENAPI_SPEC"
    echo ""
    echo "Please ensure the okada-backend repository is cloned at the same level as okada-mobile"
    exit 1
fi

echo -e "${GREEN}✓${NC} Found OpenAPI specification"

# Check if openapi-generator-cli is installed
if ! command -v openapi-generator-cli &> /dev/null; then
    echo -e "${RED}❌ Error: openapi-generator-cli not found${NC}"
    echo ""
    echo "Please install it using:"
    echo "  npm install -g @openapitools/openapi-generator-cli"
    echo ""
    echo "Or use Docker:"
    echo "  docker pull openapitools/openapi-generator-cli"
    exit 1
fi

echo -e "${GREEN}✓${NC} Found openapi-generator-cli"

# Clean previous generation
if [ -d "$OUTPUT_DIR" ]; then
    echo -e "${YELLOW}⚠${NC}  Cleaning previous generated code..."
    rm -rf "$OUTPUT_DIR"
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo ""
echo "📝 Generating Flutter API client..."
echo "   Input:  $OPENAPI_SPEC"
echo "   Output: $OUTPUT_DIR"
echo ""

# Generate API client
openapi-generator-cli generate \
  -i "$OPENAPI_SPEC" \
  -g dart \
  -o "$OUTPUT_DIR" \
  --additional-properties=\
pubName=$PACKAGE_NAME,\
pubVersion=1.0.0,\
pubDescription="Okada Platform API Client",\
pubAuthor="Okada Team",\
pubAuthorEmail="dev@okada.cm",\
pubHomepage="https://okada.cm",\
dateLibrary=core,\
nullSafe=true,\
legacyDiscriminatorBehavior=false

echo ""
echo -e "${GREEN}✅ API client generated successfully!${NC}"
echo ""

# Run Flutter pub get
echo "📦 Running flutter pub get in shared package..."
cd "$PROJECT_ROOT/shared"
flutter pub get

echo ""
echo -e "${GREEN}✅ All done!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review generated code in: $OUTPUT_DIR"
echo "  2. Import in your app: import 'package:okada_shared/api/generated/api.dart';"
echo "  3. Use the API client:"
echo ""
echo "     final api = DefaultApi(ApiClient(basePath: 'https://api.okada.cm/v1'));"
echo "     final products = await api.listProducts();"
echo ""

