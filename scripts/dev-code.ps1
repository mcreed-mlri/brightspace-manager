# Mint a sign-in code WITHOUT sending an email — testing never touches the
# built-in Supabase sender's ~2 emails/hour budget.
#
#   Double-click scripts\dev-code.cmd            -> code for the first invited user
#   powershell -File scripts\dev-code.ps1        -> same
#   powershell -File scripts\dev-code.ps1 you@mlri.org   -> specific user
#
# Pure PowerShell (no node/npm needed). Uses the admin generate_link API with
# the service-role key from .env, so it works on this machine only — by design.

param([string]$Email = "")

$ErrorActionPreference = "Stop"

# .env lives in the repo root, one level up from scripts\
$envPath = Join-Path (Split-Path $PSScriptRoot -Parent) ".env"
if (-not (Test-Path $envPath)) {
  Write-Host "No .env file found at $envPath" -ForegroundColor Red
  exit 1
}

$vars = @{}
foreach ($line in Get-Content $envPath) {
  if ($line -match '^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$') {
    $vars[$Matches[1]] = $Matches[2].Trim()
  }
}

$url = $vars["NEXT_PUBLIC_SUPABASE_URL"]
$key = $vars["SUPABASE_SERVICE_ROLE_KEY"]
if (-not $url -or -not $key) {
  Write-Host "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env." -ForegroundColor Red
  exit 1
}

$headers = @{ apikey = $key; Authorization = "Bearer $key" }

if (-not $Email) {
  try {
    $users = Invoke-RestMethod -Uri "$url/auth/v1/admin/users?per_page=1" -Headers $headers
  } catch {
    Write-Host "Could not list users: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
  }
  if (-not $users.users -or $users.users.Count -eq 0) {
    Write-Host "No users found - invite someone in the Supabase dashboard first." -ForegroundColor Red
    exit 1
  }
  $Email = $users.users[0].email
}

try {
  $body = @{ type = "magiclink"; email = $Email } | ConvertTo-Json
  $result = Invoke-RestMethod -Uri "$url/auth/v1/admin/generate_link" -Method Post `
    -Headers $headers -ContentType "application/json" -Body $body
} catch {
  Write-Host "Could not generate a code for $Email : $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "Is this email on the invite list (Authentication -> Users)?" -ForegroundColor Yellow
  exit 1
}

if (-not $result.email_otp) {
  Write-Host "Supabase did not return a code. Response: $($result | ConvertTo-Json -Depth 3)" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Sign-in code for $Email :" -ForegroundColor Cyan
Write-Host ""
Write-Host "    $($result.email_otp)" -ForegroundColor Green
Write-Host ""
Write-Host "Paste it into the app's sign-in form. No email was sent."
