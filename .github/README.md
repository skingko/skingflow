# GitHub Actions Configuration

This directory contains the GitHub Actions workflows for automated deployment and CI/CD.

## Workflows

### 1. Deploy Documentation to Cloudflare Pages (`deploy-docs.yml`)

**Trigger**:
- Push to `main` or `dev` branches
- Pull requests to `main` branch
- Manual workflow dispatch

**What it does**:
- Sets up Node.js 20 with caching
- Builds the documentation website in `skingflow/website/`
- Installs and configures Wrangler CLI
- Automatically creates Cloudflare Pages project if it doesn't exist
- Deploys to Cloudflare Pages project: `skingflow-docs`
- Provides fallback deployment method using Cloudflare Pages Action

**New Features**:
- ✅ **Automatic Wrangler Installation**: Installs latest Wrangler CLI
- ✅ **Project Auto-Creation**: Creates Pages project if it doesn't exist
- ✅ **Enhanced Error Handling**: Multiple deployment strategies with fallback
- ✅ **Detailed Logging**: Comprehensive deployment progress tracking
- ✅ **Memory Optimization**: Configured Node.js memory limits for large builds

**Required Secrets**:
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with Pages edit permissions
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

### 2. Deploy to NPM (`deploy-npm.yml`)

**Trigger**:
- Version tags (v*)
- Manual workflow dispatch

**What it does**:
- Builds the NPM package
- Runs tests
- Publishes to NPM registry
- Creates GitHub Release

**Required Secrets**:
- `NPM_TOKEN`: NPM authentication token for publishing

## Setup Instructions

### For Documentation Deployment

1. **Generate Cloudflare API Token**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to My Profile → API Tokens
   - Create token with "Edit" permission for "Cloudflare Pages"
   - Save the token

2. **Get Account ID**:
   - Found in Cloudflare Dashboard right sidebar
   - Or in URL: `https://dash.cloudflare.com/{ACCOUNT_ID}/pages`

3. **Configure GitHub Secrets**:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add:
     - `CLOUDFLARE_API_TOKEN`: Your API token
     - `CLOUDFLARE_ACCOUNT_ID`: Your account ID

### For NPM Deployment

1. **Generate NPM Token**:
   - Go to [NPM Settings](https://www.npmjs.com/settings)
   - Generate new automation token
   - Save the token

2. **Configure GitHub Secret**:
   - Add `NPM_TOKEN` to repository secrets

## Manual Trigger

You can manually trigger both workflows from the Actions tab in your GitHub repository.

## Local Deployment

For local testing and deployment, you can use the provided deployment script:

```bash
# Set environment variables
export CLOUDFLARE_API_TOKEN="your-api-token"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"

# Run deployment script
./deploy-docs.sh
```

The script will:
- Install dependencies and build documentation
- Install and configure Wrangler CLI
- Create Pages project if needed
- Deploy to Cloudflare Pages

## Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure proper token permissions
2. **Path Issues**: Verify all paths in workflow files are correct
3. **Cache Issues**: Clear workflow cache if needed
4. **Node Version**: Ensure correct Node.js version is specified

### Logs

Check workflow runs for detailed error messages and debugging information.