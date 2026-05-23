# ==============================================================================
# Telemetry Push Client (PowerShell) - Windows
# ==============================================================================
# Schedule this script to run every 10-15 minutes using Windows Task Scheduler.
# Trigger: Repeat task every 10 minutes.
# Action: Start a program
# Program/script: powershell.exe
# Add arguments: -NoProfile -WindowStyle Hidden -File "C:\Path\To\push.ps1"
# ==============================================================================

# --- CONFIGURATION (Change these to match your environment) ---
$ApiUrl = "https://your-dashboard-domain.pages.dev/api/push-metrics"
$ApiSecretToken = "f3b9c4501a2d4807a9e3a6c9d2f5e70c" # Must match push.sh and Cloudflare environment variable

# Optional Override for Hostname (defaults to computer name)
$HostnameOverride = ""

# Optional Sub-type identifying specialized systems (e.g. "Gaming Rig", "Media Server")
$MachineType = "Windows"

# --- END OF CONFIGURATION ---

# Resolve Hostname
$HostName = if ($HostnameOverride) { $HostnameOverride } else { $env:COMPUTERNAME }

# Calculate System Uptime (seconds)
$UptimeSecs = 0
try {
    $os = Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue
    if ($os) {
        $bootTime = $os.LastBootUpTime
        $uptimeSecs = [math]::Round(((Get-Date) - $bootTime).TotalSeconds)
    }
} catch {
    # Fallback if Get-CimInstance is restricted
    $uptimeSecs = [math]::Round([Environment]::TickCount / 1000)
}

# Gather Disk Metrics (Local Fixed Disks, DriveType = 3)
$Disks = @()
try {
    $logicalDisks = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" -ErrorAction Stop
    foreach ($drive in $logicalDisks) {
        $sizeBytes = [int64]$drive.Size
        $freeBytes = [int64]$drive.FreeSpace
        
        # Skip unformatted or unallocated volumes (Size = 0)
        if ($sizeBytes -eq 0) { continue }
        
        $usedBytes = $sizeBytes - $freeBytes
        $usedPercent = [math]::Round(($usedBytes / $sizeBytes) * 100, 1)
        
        $diskName = $drive.DeviceID # e.g. "C:"
        if ($drive.VolumeName) {
            $diskName = "$($drive.DeviceID) ($($drive.VolumeName))"
        }

        $Disks += @{
            mount         = $drive.DeviceID
            device        = $diskName
            size_bytes    = $sizeBytes
            used_bytes    = $usedBytes
            available_bytes = $freeBytes
            used_percent  = $usedPercent
        }
    }
} catch {
    Write-Host "Error gathering disk metrics: $_"
}

# Construct Final JSON Payload
$PayloadObj = @{
    hostname       = $HostName
    machine_type   = $MachineType
    os             = "Windows"
    uptime_seconds = $uptimeSecs
    disks          = $Disks
}

$PayloadJson = $PayloadObj | ConvertTo-Json -Depth 5 -Compress

# Send POST Request to Cloudflare Page API
$Headers = @{
    "Authorization" = "Bearer $ApiSecretToken"
    "Content-Type"  = "application/json"
}

try {
    $Response = Invoke-RestMethod -Uri $ApiUrl -Method Post -Headers $Headers -Body $PayloadJson -ErrorAction Stop
    Write-Host "Success: Telemetry pushed successfully."
} catch {
    Write-Host "Error pushing telemetry: $_"
    exit 1
}
