#!/bin/bash
# ==============================================================================
# Telemetry Push Client (Bash) - macOS / Linux / PiOS / UGOS / OMV
# ==============================================================================
# Schedule this script to run every 10-15 minutes using cron.
# Example cron job (every 10 minutes):
# */10 * * * * /path/to/push.sh > /dev/null 2>&1
# ==============================================================================

# --- CONFIGURATION (Change these to match your environment) ---
API_URL="https://your-dashboard-domain.pages.dev/api/push-metrics"
API_SECRET_TOKEN="f3b9c4501a2d4807a9e3a6c9d2f5e70c" # Change to a custom random token

# Optional Override for Hostname (defaults to system hostname)
HOSTNAME_OVERRIDE=""

# Optional Sub-type identifying specialized systems:
# e.g., "OMV", "UGOS (DH2300)", "PiOS", "macOS", "Ubuntu Server"
# If left empty, the script will attempt to detect the OS automatically.
MACHINE_TYPE="macOS" 

# --- END OF CONFIGURATION ---

# Resolve Hostname
if [ -n "$HOSTNAME_OVERRIDE" ]; then
  HOST="$HOSTNAME_OVERRIDE"
else
  HOST=$(hostname)
fi

# Detect OS and Sub-type
OS_NAME="Linux"
if [[ "$OSTYPE" == "darwin"* ]]; then
  OS_NAME="macOS"
  [ -z "$MACHINE_TYPE" ] && MACHINE_TYPE="macOS"
else
  # Linux auto-detection
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_NAME="Linux"
    if [ -z "$MACHINE_TYPE" ]; then
      if [ -f /etc/openmediavault/config.xml ]; then
        MACHINE_TYPE="OMV"
      elif grep -q "ugos" /etc/os-release 2>/dev/null; then
        MACHINE_TYPE="UGOS"
      elif grep -q "Raspbian" /etc/os-release 2>/dev/null || [ -d /boot/firmware ]; then
        MACHINE_TYPE="PiOS"
      else
        MACHINE_TYPE="$NAME"
      fi
    fi
  fi
fi

# Calculate System Uptime (seconds)
UPTIME_SECS=0
if [ "$OS_NAME" = "macOS" ]; then
  BOOT_TIME=$(sysctl -n kern.boottime | awk -F'[ =,]' '{print $6}')
  NOW=$(date +%s)
  UPTIME_SECS=$((NOW - BOOT_TIME))
else
  if [ -f /proc/uptime ]; then
    UPTIME_SECS=$(cut -d. -f1 /proc/uptime)
  fi
fi

# Gather Disk Metrics using POSIX-compliant df -kP
# Exclude standard virtual and system filesystems
JSON_DISKS=""
IFS=$'\n'
for line in $(df -kP); do
  # Skip header line
  if [[ "$line" =~ ^Filesystem ]]; then
    continue
  fi

  # Split fields
  fs=$(echo "$line" | awk '{print $1}')
  blocks=$(echo "$line" | awk '{print $2}')
  used=$(echo "$line" | awk '{print $3}')
  avail=$(echo "$line" | awk '{print $4}')
  percent=$(echo "$line" | awk '{print $5}' | tr -d '%')
  mount=$(echo "$line" | awk '{print $6}')

  # Skip typical virtual/temp filesystems
  if [[ "$fs" == "tmpfs" || "$fs" == "devtmpfs" || "$fs" == "udev" || "$fs" == "overlay" || "$fs" == "shm" || "$fs" == "map" || "$fs" == "devfs" || "$fs" == "none" ]]; then
    continue
  fi

  # Exclude Docker overlay mounts, loop devices (Ubuntu Snaps), and virtual endpoints
  if [[ "$fs" =~ ^/dev/loop ]] || [[ "$mount" =~ ^/(proc|sys|dev|run|snap|var/lib/docker) ]]; then
    continue
  fi

  # Skip zero-size partitions
  if [ "$blocks" -eq 0 ] 2>/dev/null; then
    continue
  fi

  # Convert from 1K blocks to raw Bytes
  SIZE_BYTES=$((blocks * 1024))
  USED_BYTES=$((used * 1024))
  AVAIL_BYTES=$((avail * 1024))

  # Escape backslashes and double quotes in mount and fs strings
  clean_mount=$(echo "$mount" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')
  clean_fs=$(echo "$fs" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')

  # Append disk block to JSON list
  JSON_DISKS="$JSON_DISKS{\"mount\":\"$clean_mount\",\"device\":\"$clean_fs\",\"size_bytes\":$SIZE_BYTES,\"used_bytes\":$USED_BYTES,\"available_bytes\":$AVAIL_BYTES,\"used_percent\":$percent},"
done

# Strip trailing comma from disk list and wrap in brackets
JSON_DISKS="[${JSON_DISKS%,}]"

# Construct final JSON Payload (without JQ dependency)
PAYLOAD="{\"hostname\":\"$HOST\",\"machine_type\":\"$MACHINE_TYPE\",\"os\":\"$OS_NAME\",\"uptime_seconds\":$UPTIME_SECS,\"disks\":$JSON_DISKS}"

# Push to Cloudflare endpoint
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Authorization: Bearer $API_SECRET_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "$API_URL")

if [ "$response" -eq 200 ] 2>/dev/null; then
  echo "Success: Telemetry pushed successfully (HTTP 200)."
else
  echo "Error: Failed to push telemetry. API responded with HTTP status $response."
  exit 1
fi
