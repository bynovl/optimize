// PowerShell installer generator (Windows)
export default function getInstallerWin(
    npmrcContent = '',
    packageName = '@bynovl/optimize'
) {
    return `<# PowerShell installer for Optimize #>
# ------------------------------------------------------------------
# Stop on any error
# ------------------------------------------------------------------
$ErrorActionPreference = 'Stop'

# ------------------------------------------------------------------
# Write .npmrc (or placeholder) and secure it
# ------------------------------------------------------------------
$npmrcPath = ".npmrc"
if (Test-Path $npmrcPath) {
  Copy-Item $npmrcPath "$npmrcPath.bak" -Force
  Write-Host "Backed up existing .npmrc → .npmrc.bak"
}
@"
${npmrcContent}
"@ | Set-Content -Path $npmrcPath -Encoding UTF8
# Restrict permissions to the current user only
icacls $npmrcPath /inheritance:r /grant:r "$($env:USERNAME):(R,W)" | Out-Null
Write-Host ".npmrc written"

# ------------------------------------------------------------------
# Install Node.js via Chocolatey if it is missing
# ------------------------------------------------------------------
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "✖ Node.js not found – installing via Chocolatey..."
  # Install Chocolatey if it isn’t already present
  if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Set-ExecutionPolicy Bypass -Scope Process -Force
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
  }
  # Install a specific LTS version (adjust if you need a different one)
  choco install nodejs --version=24.19.0 -y
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node installation via Chocolatey failed"
  }
  Write-Host "✔ Node.js installed successfully"
}

# ------------------------------------------------------------------
# Directory sanity check – create a skills folder if none exist
# ------------------------------------------------------------------
$skillsDirs = @(".github", ".claude", ".agents", ".opencode")
$skillDir   = $null   # initialise so we can test it later

foreach ($dir in $skillsDirs) {
    if (Test-Path $dir) {
        $skillDir = $dir   # use the first folder that already exists
        break
    }
}

# If no skills folder was found, fall back to creating a .github folder
if ($null -eq $skillDir) {
    $skillDir = ".github"
    New-Item -ItemType Directory -Path $skillDir -Force | Out-Null
    Write-Host "Created $skillDir directory (no other skills dirs found)"
}

# ------------------------------------------------------------------
# Detect an existing Optimize output folder
# ------------------------------------------------------------------
# These are the folder names that Optimize recognises automatically.
$outputFolders = @("_site", "_opt", "dist", "out", "_build", "public")
$defaultFound = $false   # becomes $true as soon as we see any of them

foreach ($folder in $outputFolders) {
  if (Test-Path $folder) {
    $defaultFound = $true
    break
  }
}

# ------------------------------------------------------------------
# If no default folder exists → create a minimal _opt folder + index.html
# ------------------------------------------------------------------
if (-not $defaultFound) {
  # Create the folder (Force makes the command idempotent)
  New-Item -ItemType Directory -Path "_opt" -Force | Out-Null
  Write-Host "Created _opt directory for quick install"

  # Path to the file we are about to create
  $indexPath = "_opt/index.html"

  # Only write the file if it does not already exist – protects a user‑added file.
  if (-not (Test-Path $indexPath)) {
    @"
<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
  <title>Optimize Setup</title>
</head>
<body>
  <h1>Welcome to Optimize!</h1>
  <p>This is a test page for the Optimize CLI.</p>
</body>
</html>
"@ | Set-Content -Path $indexPath -Encoding UTF8

    Write-Host "Created _opt/index.html for quick install"
  } else {
    Write-Host "⚠️  _opt/index.html already exists – leaving it untouched"
  }
}

# ------------------------------------------------------------------
# Ensure a package.json exists with type:module
# ------------------------------------------------------------------
if (-not (Test-Path "package.json")) {
  npm init -y > $null
  $pkg = Get-Content "package.json" -Raw | ConvertFrom-Json
  $pkg.type = "module"
  $pkg | ConvertTo-Json -Depth 10 | Set-Content "package.json" -Encoding UTF8
  Write-Host "Created package.json with \"type\":\"module\""
}

# ------------------------------------------------------------------
# Detect which package manager to use (pnpm > yarn > npm)
# ------------------------------------------------------------------
if (Test-Path "pnpm-lock.yaml") {
  $pkgMgr = "pnpm"
} elseif (Test-Path "yarn.lock") {
  $pkgMgr = "yarn"
} else {
  $pkgMgr = "npm"
}
Write-Host "🔧 Using package manager: $pkgMgr"

# ------------------------------------------------------------------
# Install the requested Optimize package
# ------------------------------------------------------------------
& $pkgMgr install ${packageName}
Write-Host "$packageName installed successfully"

# ------------------------------------------------------------------
# Install skills
# ------------------------------------------------------------------
& npx optimize --skills
Write-Host "Skills installed successfully"

# ------------------------------------------------------------------
# Final friendly message
# ------------------------------------------------------------------
Write-Host "\`n Run npx ${packageName}.\`n\`n Optimize the web. No site left behind."
`;
}
