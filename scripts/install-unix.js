// Unix installer generator (Unix / Linux / macOS / WSL)
export default function getInstallerUnix(npmrcContent = '', packageName = '@bynovl/optimize') {
  return `#!/usr/bin/env bash
set -e

# --------------------------------------------------
# Helper: install Node.js via nvm (cross‑platform)
# --------------------------------------------------
install_node() {
  echo "Attempting to install Node.js via nvm (cross‑platform)…"
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="\$HOME/.nvm"
  [ -s "\$NVM_DIR/nvm.sh" ] && . "\$NVM_DIR/nvm.sh"
  if command -v nvm >/dev/null 2>&1; then
    nvm install --lts
  else
    echo "✖ nvm installation failed. On native Windows, install Node.js manually."
    exit 1
  fi
}

# --------------------------------------------------
# Ensure Node.js is available
# --------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  echo "✖ Node.js not found – installing…"
  install_node
  if ! command -v node >/dev/null 2>&1; then
    echo "✖ Node.js installation failed – aborting."
    exit 1
  fi
  echo "✔ Node.js installed successfully!"
fi

# --------------------------------------------------
# Prepare .npmrc (registry + auth token)
# --------------------------------------------------
NPMRC_PATH=".npmrc"
if [ -f "\$NPMRC_PATH" ]; then
  cp "\$NPMRC_PATH" "\$NPMRC_PATH.bak"
  echo "📦 Backed up existing .npmrc → .npmrc.bak"
fi

cat > "\$NPMRC_PATH" << 'NPMRCEOF'
${npmrcContent}
NPMRCEOF

chmod 600 "\$NPMRC_PATH"
echo "✅ NPM token configured successfully!"

# --------------------------------------------------
# Detect an existing Optimize output folder
# --------------------------------------------------
# Recognised output folders: _site, _opt, dist, out, _build, public
OUTPUT_FOLDERS=("_site" "_opt" "dist" "out" "_build" "public")
DEFAULT_FOUND=false

for dir in "\${OUTPUT_FOLDERS[@]}"; do
  if [ -d "\$dir" ]; then
    DEFAULT_FOUND=true
    break
  fi
done

# If none exist, create a minimal _opt folder + index.html
if [ "\$DEFAULT_FOUND" = false ]; then
  mkdir -p "_opt"
  cat > "_opt/index.html" << 'HTML_EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Optimize Setup</title>
</head>
<body>
  <h1>Welcome to Optimize!</h1>
  <p>This is a test page for the Optimize CLI.</p>
</body>
</html>
HTML_EOF
  echo "✔ Created _opt directory and index.html for quick install"
fi

# --------------------------------------------------
# Locate (or create) a skills directory
# --------------------------------------------------
SKILLS_DIRS=(".claude" ".agents" ".opencode" ".github")
SKILL_DIR=""

for d in "\${SKILLS_DIRS[@]}"; do
  if [ -d "\$d" ]; then
    SKILL_DIR="\$d"
    break
  fi
done

if [ -z "\$SKILL_DIR" ]; then
  SKILL_DIR=".github"
  mkdir -p "\$SKILL_DIR"
  echo "✔ Skill directory created at \$SKILL_DIR"
fi

# --------------------------------------------------
# Detect package manager (pnpm > yarn > npm)
# --------------------------------------------------
if [ -f "pnpm-lock.yaml" ]; then
  PKG_MGR="pnpm"
elif [ -f "yarn.lock" ]; then
  PKG_MGR="yarn"
else
  PKG_MGR="npm"
fi
echo "🔧 Using package manager: \$PKG_MGR"

# --------------------------------------------------
# Create a .gitignore if it does not exist
# --------------------------------------------------
if [ ! -f ".gitignore" ]; then
  cat > ".gitignore" <<'GITIGNORE_EOF'
  node_modules
  env.sh
  .env
  GITIGNORE_EOF
  echo "Created .gitignore with common ignore patterns"
fi

# --------------------------------------------------
# Ensure a package.json exists with type:module
# --------------------------------------------------
if [ ! -f "package.json" ]; then
  npm init -y > /dev/null 2>&1
  node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));p.type='module';fs.writeFileSync('package.json',JSON.stringify(p,null,2));"
  echo "Created package.json and set \"type\":\"module\""
else
  # Make sure the file is ESM‑compatible
  if ! grep -q '"type"[[:space:]]*:[[:space:]]*"module"' package.json; then
    cp package.json package.json.bak
    node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));p.type='module';fs.writeFileSync('package.json',JSON.stringify(p,null,2));"
    echo "Added \"type\":\"module\" to package.json (backup: package.json.bak)"
  fi
fi

# --------------------------------------------------
# Install the Optimize package (the @ is now safely quoted)
# --------------------------------------------------
${packageName ? '' : ''}# The package name is interpolated by the JS template below
${`$PKG_MGR install '${packageName}' && \\
    echo "✔ Optimize package installed successfully!" || \\
    echo "✖ Failed to install Optimize package with \$PKG_MGR"`}

# --------------------------------------------------
# Install Optimize skills
# --------------------------------------------------
npx optimize --skills && \
    echo "✔ Skills installed successfully!" || \
    echo "✖ Failed to install skills with npx optimize --skills"

# --------------------------------------------------
# Final instructions
# --------------------------------------------------
echo
echo "Run: npx ${packageName}"
echo
echo "Optimize the web – no site left behind! 🎉"
`
};