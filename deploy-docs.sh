#!/bin/bash

# SkinFlow Documentation Deployment Script
# This script deploys the documentation to Cloudflare Pages

set -e

echo "🚀 Starting SkinFlow documentation deployment..."

# Check required environment variables
if [[ -z "$CLOUDFLARE_API_TOKEN" ]]; then
    echo "❌ CLOUDFLARE_API_TOKEN environment variable is required"
    exit 1
fi

if [[ -z "$CLOUDFLARE_ACCOUNT_ID" ]]; then
    echo "❌ CLOUDFLARE_ACCOUNT_ID environment variable is required"
    exit 1
fi

# Navigate to website directory
cd skingflow/website

echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building documentation..."
npm run build

echo "🔧 Installing Wrangler..."
npm install -g wrangler

echo "🔐 Configuring Wrangler..."
export CLOUDFLARE_API_TOKEN
export CLOUDFLARE_ACCOUNT_ID

echo "📋 Checking Pages project..."
if ! wrangler pages project list 2>/dev/null | grep -q "skingflow-docs"; then
    echo "🆕 Creating Pages project: skingflow-docs"
    wrangler pages project create skingflow-docs --production-branch=main
else
    echo "✅ Pages project skingflow-docs already exists"
fi

echo "🚀 Deploying to Cloudflare Pages..."

# Generate deployment info
COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
DEPLOY_MESSAGE="Docs: Local deployment from ${BRANCH_NAME} (${COMMIT_SHA})"

echo "📋 Deployment info:"
echo "  Branch: ${BRANCH_NAME}"
echo "  Commit: ${COMMIT_SHA}"
echo "  Message: ${DEPLOY_MESSAGE}"

if wrangler pages deploy ./.vitepress/dist \
  --project-name=skingflow-docs \
  --branch=main \
  --commit-dirty=true \
  --commit-message="${DEPLOY_MESSAGE}"; then
    echo "✅ Deployment successful!"
    echo "🌐 Documentation will be available at: https://skingflow-docs.pages.dev"
else
    echo "❌ Deployment failed"
    exit 1
fi

echo "🎉 Documentation deployment completed!"