# Opens Google Cloud Console in Microsoft Edge and saves OAuth credentials to apps/api/.env
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root "apps\api\.env"

Write-Host "`n=== MockCertify Google OAuth Setup ===" -ForegroundColor Cyan
Write-Host "1. Sign in with your Google account in Edge"
Write-Host "2. Create project (or select existing) -> APIs & Services -> Credentials"
Write-Host "3. Create OAuth client ID -> Web application"
Write-Host "   Authorized redirect URI:"
Write-Host "   http://localhost:4000/api/v1/auth/google/callback" -ForegroundColor Yellow
Write-Host "4. Copy Client ID and Client Secret below`n"

$uri = "https://console.cloud.google.com/apis/credentials"
if (Get-Command msedge -ErrorAction SilentlyContinue) {
  Start-Process "msedge" $uri
} else {
  Start-Process $uri
}

$clientId = Read-Host "Paste Google Client ID"
$clientSecret = Read-Host "Paste Google Client Secret" -AsSecureString
$plainSecret = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
  [Runtime.InteropServices.Marshal]::SecureStringToBSTR($clientSecret)
)

if (-not (Test-Path $envFile)) {
  Copy-Item (Join-Path $root ".env.example") $envFile -ErrorAction SilentlyContinue
}

function Set-EnvLine($path, $key, $value) {
  $lines = @()
  if (Test-Path $path) { $lines = Get-Content $path }
  $found = $false
  $out = foreach ($line in $lines) {
    if ($line -match "^$key=") { $found = $true; "$key=$value" } else { $line }
  }
  if (-not $found) { $out += "$key=$value" }
  $out | Set-Content $path -Encoding utf8
}

Set-EnvLine $envFile "GOOGLE_CLIENT_ID" $clientId
Set-EnvLine $envFile "GOOGLE_CLIENT_SECRET" $plainSecret
Set-EnvLine $envFile "GOOGLE_CALLBACK_URL" "http://localhost:4000/api/v1/auth/google/callback"

Write-Host "`nSaved to apps/api/.env" -ForegroundColor Green
Write-Host "Restart the API server: pnpm dev:api`n"
