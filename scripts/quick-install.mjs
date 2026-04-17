// Out-of-the-box setup: No need to clone the repo!
// Just run this script to install the .npmrc, package, config, and skill—get started instantly.
// The installer takes care of everything: package install, config, and skill setup.
// All you need to do is update optimize.config.js as needed for your project.
// Safe, local, and ready for CI/CD or personal projects.

// Installation script template for setting up .npmrc with the delivered token and downloading the optimize-site skill and config file.
export default function getInstallerTemplate(npmrcContent = '', packageName = '@bynovl/optimize') {
    return `#!/bin/bash
set -e

# Cross-platform Node.js install helper
install_node() {
  echo "Attempting to install Node.js via nvm (cross-platform)..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  if command -v nvm >/dev/null 2>&1; then
    nvm install --lts
  else
    echo "✖ nvm installation failed. If you are on native Windows, please install Node.js manually from https://nodejs.org/en/download/ or use nvm-windows: https://github.com/coreybutler/nvm-windows"
    exit 1
  fi
}

# Check if Node.js is installed
if ! command -v node >/dev/null 2>&1; then
  echo "✖ Node.js is not installed. Attempting to install Node.js..."
  install_node
  if ! command -v node >/dev/null 2>&1; then
    echo "✖ Node.js installation failed. Please install Node.js (v18+) and try again."
    exit 1
  fi
  echo "✔ Node.js installed successfully!"
fi

echo "Preparing .npmrc for download..."

NPMRC_PATH=".npmrc"
SKILL_DIR=""
SKILL_PATH="https://optimize.bynovl.com/33920e45"
CONFIG_URL="https://optimize.bynovl.com/d88373fa"
PACKAGE_NAME="${packageName}"

# Check required environment variables
if [ -z "$CONFIG_URL" ]; then
  echo "✖ CONFIG_URL environment variable is not set."
  exit 1
fi
if [ -z "$SKILL_PATH" ]; then
  echo "✖ SKILL_PATH environment variable is not set."
  exit 1
fi

# Backup existing .npmrc if it exists
if [ -f "$NPMRC_PATH" ]; then
    cp "$NPMRC_PATH" "$NPMRC_PATH.bak"
    echo "📦 Backed up existing .npmrc to .npmrc.bak"
fi

# Write .npmrc content directly (registry + auth token)
cat > "$NPMRC_PATH" << 'NPMRCEOF'
${npmrcContent}
NPMRCEOF

chmod 600 "$NPMRC_PATH"
echo "✅ NPM token configured successfully!"
echo "📦 Ready to run: npm install"

# --- Download optimize.config.js (required) ---
curl -fsSL "$CONFIG_URL" -o optimize.config.js && \
    echo "✔ optimize.config.js downloaded to ./optimize.config.js" || \
    echo "✖ Failed to download optimize.config.js"

echo
# Auto-install optimize-site skill
if [ -d ".github/skills" ]; then
    SKILL_DIR=".github/skills"
elif [ -d ".claude/skills" ]; then
    SKILL_DIR=".claude/skills"
else
    SKILL_DIR=".github/skills"
    mkdir -p "$SKILL_DIR"
    echo "ℹ️  Created $SKILL_DIR for skill install."
fi

# Create a test folder _site (for quick install)
if [ -d "_site" ]; then
  echo "_site directory already exists. Backing up to _site_bak."
  rm -rf "_site_bak"
  mv "_site" "_site_bak"
fi
mkdir -p "_site"

mkdir -p "$SKILL_DIR/optimize-site"
curl -fsSL "$SKILL_PATH" -o "$SKILL_DIR/optimize-site/SKILL.md" && \
    echo "✔ optimize-site skill downloaded to $SKILL_DIR/optimize-site/" || \
    echo "✖ Failed to download optimize-site skill"

echo
# Detect package manager
if [ -f "pnpm-lock.yaml" ]; then
    PKG_MGR="pnpm"
elif [ -f "yarn.lock" ]; then
    PKG_MGR="yarn"
else
    PKG_MGR="npm"
fi

BACKUP_PKG_JSON=true

# Check if package.json exists, if not create one
if [ ! -f "package.json" ]; then
  BACKUP_PKG_JSON=false
  npm init -y > /dev/null 2>&1
  # Set type to module immediately (cross-platform)
  node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));p.type='module';fs.writeFileSync('package.json',JSON.stringify(p,null,2));"
  echo "📦 Created package.json for package installation and set type to module."
fi

$PKG_MGR install ${packageName} && \
    echo "✔ Optimize package and skill installed successfully!" || \
    echo "✖ Failed to install optimize package and skill with $PKG_MGR"
echo

# --- ESM Compatibility Check ---
if [ "$BACKUP_PKG_JSON" = true ] && [ -f "package.json" ]; then
  if ! grep -q '"type"[[:space:]]*:[[:space:]]*"module"' package.json; then
    cp package.json package.json.bak
    echo "⚠️  Your package.json does not have 'type: module'. Adding it automatically (backup: package.json.bak)."
    # Set type to module using Node.js (cross-platform)
    node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));p.type='module';fs.writeFileSync('package.json',JSON.stringify(p,null,2));"
  fi
fi

# Final Instructions
echo

echo 'Optimize the web - no site left behind! 🎉'
`;
}
