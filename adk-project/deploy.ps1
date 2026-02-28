# SwiftBank ADK Deploy Script
# Deploys all tools and agents to IBM watsonx Orchestrate in dependency order.
# Run from the adk-project/ directory:
#   cd adk-project
#   .\deploy.ps1

param(
    [switch]$DryRun,
    [switch]$SkipEnvSetup
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  SwiftBank ADK Deployment to WO Cloud" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Load .env credentials ─────────────────────────────────────────────────
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*([^#\s=]+)\s*=\s*(.+)\s*$") {
            [System.Environment]::SetEnvironmentVariable($Matches[1], $Matches[2].Trim(), "Process")
        }
    }
    Write-Host "[OK] Loaded credentials from .env" -ForegroundColor Green
} else {
    Write-Error ".env file not found. Expected at $envFile"
    exit 1
}

$woInstance = $env:WO_INSTANCE
$woApiKey   = $env:WO_API_KEY

if (-not $woInstance -or -not $woApiKey) {
    Write-Error "WO_INSTANCE or WO_API_KEY missing from .env"
    exit 1
}

# ── 2. Set up & activate environment ─────────────────────────────────────────
if (-not $SkipEnvSetup) {
    Write-Host ""
    Write-Host "[STEP 1] Configuring watsonx Orchestrate environment..." -ForegroundColor Yellow
    if ($DryRun) {
        Write-Host "  [DRY-RUN] orchestrate env add swiftbank-env -u $woInstance --type ibm_iam" -ForegroundColor DarkGray
        Write-Host "  [DRY-RUN] orchestrate env activate swiftbank-env --api-key <key>" -ForegroundColor DarkGray
    } else {
        # Add environment (ignore error if already exists)
        orchestrate env add swiftbank-env -u $woInstance --type ibm_iam 2>$null
        orchestrate env activate swiftbank-env --api-key $woApiKey
        Write-Host "  [OK] Environment 'swiftbank-env' activated" -ForegroundColor Green
    }
}

# ── Helper ────────────────────────────────────────────────────────────────────
function Import-Tool {
    param([string]$FilePath)
    $name = Split-Path $FilePath -Leaf
    Write-Host "  Importing tool: $name" -ForegroundColor White
    if ($DryRun) {
        Write-Host "    [DRY-RUN] orchestrate tools import -k python -f $FilePath" -ForegroundColor DarkGray
    } else {
        orchestrate tools import -k python -f $FilePath
        Write-Host "    [OK] $name imported" -ForegroundColor Green
    }
}

function Import-Agent {
    param([string]$FilePath)
    $name = Split-Path $FilePath -Leaf
    Write-Host "  Importing agent: $name" -ForegroundColor White
    if ($DryRun) {
        Write-Host "    [DRY-RUN] orchestrate agents import -f $FilePath" -ForegroundColor DarkGray
    } else {
        orchestrate agents import -f $FilePath
        Write-Host "    [OK] $name imported" -ForegroundColor Green
    }
}

# ── 3. Import Tools (order doesn't matter for tools) ─────────────────────────
Write-Host ""
Write-Host "[STEP 2] Importing Python tools..." -ForegroundColor Yellow

Import-Tool "tools\banking_info_tools.py"
Import-Tool "tools\otp_tools.py"
Import-Tool "tools\card_tools.py"
Import-Tool "tools\case_tools.py"

Write-Host "  [OK] All tools imported." -ForegroundColor Green

# ── 4. Import Agents (leaf-first, orchestrator last) ──────────────────────────
Write-Host ""
Write-Host "[STEP 3] Importing agents (dependency order)..." -ForegroundColor Yellow

# Leaf agents first (no collaborators)
Import-Agent "agents\banking-info-agent.yaml"
Import-Agent "agents\otp-agent.yaml"

# Mid-level (Card_Action_Agent depends on OTP_Agent)
Import-Agent "agents\card-action-agent.yaml"

# Independent mid-level
Import-Agent "agents\case-management-agent.yaml"

# Root orchestrator (depends on all above)
Import-Agent "agents\swiftbank-orchestrator.yaml"

Write-Host "  [OK] All agents imported." -ForegroundColor Green

# ── 5. Verify ─────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[STEP 4] Verifying deployment..." -ForegroundColor Yellow
if ($DryRun) {
    Write-Host "  [DRY-RUN] orchestrate agents list" -ForegroundColor DarkGray
} else {
    orchestrate agents list
}

# ── Done ──────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Open your WO instance and locate 'SwiftBank_Orchestrator'" -ForegroundColor White
Write-Host "  2. Copy the agent ID and update components/chat/webchat-widget.tsx" -ForegroundColor White
Write-Host "  3. Redeploy the Next.js frontend" -ForegroundColor White
Write-Host ""
