#!/bin/bash
# ==============================================================================
# Telemetry Push Client (Bash) - macOS / Linux / PiOS / UGOS / OMV
# ==============================================================================
# Schedule this script to run every 10-15 minutes using cron.
# Example cron job (every 10 minutes):
# */10 * * * * /path/to/push.sh > /dev/null 2>&1
# ==============================================================================

# --- CONFIGURATION (Change these to match your environment) ---
API_URL="https://dashboard-der.pages.dev/api/push-metrics"
API_SECRET_TOKEN="f3b9c4501a2d4807a9e3a6c9d2f5e70c" # Change to a custom random token

# Optional Override for Hostname (defaults to system hostname)
HOSTNAME_OVERRIDE=""

# Optional Sub-type identifying specialized systems:
# e.g., "OMV", "UGOS (DH2300)", "PiOS", "macOS", "Ubuntu Server"
# If left empty, the script will attempt to detect the OS automatically.
MACHINE_TYPE="" 

# --- END OF CONFIGURATION ---

# Export a robust PATH to ensure cron can find commands like sysctl, curl, awk, df, and scutil
export PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH

# Resolve Hostname
if [ -n "$HOSTNAME_OVERRIDE" ]; then
  HOST="$HOSTNAME_OVERRIDE"
else
  # macOS cron environments often cause 'hostname' to return "UNKNOWN", so use scutil if available
  if command -v scutil >/dev/null 2>&1; then
    HOST=$(scutil --get LocalHostName | cut -d. -f1)
  else
    HOST=$(hostname | cut -d. -f1)
  fi
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
  BOOT_TIME=$(sysctl -n kern.boottime | awk '{print $4}' | tr -d ',')
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
COMPARE_STR=""
SEEN_DEVICES=""
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

  # Exclude Docker overlay mounts, loop devices (Ubuntu Snaps), system partitions, and virtual endpoints
  if [[ "$fs" =~ ^/dev/loop ]] || [[ "$mount" =~ ^/(proc|sys|dev|run|snap|var/lib/docker|rootfs|ugreen|mnt/factory|overlay) ]]; then
    continue
  fi

  # Skip duplicate device mappings (e.g. same volume mounted in multiple places)
  if [[ " $SEEN_DEVICES " == *" $fs "* ]]; then
    continue
  fi
  SEEN_DEVICES="$SEEN_DEVICES $fs"

  # Exclude macOS system/internal APFS volumes to avoid cluttering storage cards
  if [ "$OS_NAME" = "macOS" ]; then
    # Ignore the read-only system root partition
    if [ "$mount" = "/" ]; then
      continue
    fi
    # Ignore internal virtual containers
    if [[ "$mount" =~ ^/System/Volumes/ && "$mount" != "/System/Volumes/Data" ]]; then
      continue
    fi
    # Exclude macOS recovery, VM, and TimeMachine partitions
    if [[ "$mount" =~ ^/(Volumes/Recovery|Volumes/com\.apple\.TimeMachine|Volumes/\.timemachine|Volumes/Backups|private/var/) ]]; then
      continue
    fi
    
    # Rename the writeable User Data partition to a friendly name
    if [ "$mount" = "/System/Volumes/Data" ]; then
      mount="Macintosh HD"
    fi
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

  # Append to comparison string for smart caching (rounded to the nearest 1 GB to ignore background noise)
  # avail is in 1KB blocks, so divide by 1048576 (1024*1024) to get Gigabytes
  avail_gb=$((avail / 1048576))
  COMPARE_STR="${COMPARE_STR}mount:${clean_mount},percent:${percent},avail_gb:${avail_gb};"

  # Append disk block to JSON list
  JSON_DISKS="$JSON_DISKS{\"mount\":\"$clean_mount\",\"device\":\"$clean_fs\",\"size_bytes\":$SIZE_BYTES,\"used_bytes\":$USED_BYTES,\"available_bytes\":$AVAIL_BYTES,\"used_percent\":$percent},"
done

# Strip trailing comma from disk list and wrap in brackets
JSON_DISKS="[${JSON_DISKS%,}]"



# Construct final JSON Payload (without JQ dependency)
PAYLOAD="{\"hostname\":\"$HOST\",\"machine_type\":\"$MACHINE_TYPE\",\"os\":\"$OS_NAME\",\"uptime_seconds\":$UPTIME_SECS,\"disks\":$JSON_DISKS}"

echo "Payload: $PAYLOAD"

# Push to Cloudflare endpoint
echo "Info: Initiating metrics push..."
if command -v curl >/dev/null 2>&1; then
  # Use -S to show errors even when silent (-s)
  response=$(curl -s -S -o /dev/null -w "%{http_code}" -X POST \
    -H "Authorization: Bearer $API_SECRET_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" \
    "$API_URL" 2> /tmp/dashboard_curl_err.txt)

  if [ "$response" -eq 200 ] 2>/dev/null; then
    echo "Success: Telemetry pushed successfully (HTTP 200)."
  else
    echo "Error: Failed to push telemetry. API responded with HTTP status ${response:-000}."
    [ -s /tmp/dashboard_curl_err.txt ] && echo "Curl Error Output:" && cat /tmp/dashboard_curl_err.txt
    exit 1
  fi
elif command -v wget >/dev/null 2>&1; then
  # Fetch server headers using wget and parse the HTTP status code (e.g. 200, 403, 500)
  response_headers=$(wget --server-response --post-data="$PAYLOAD" \
    --header="Authorization: Bearer $API_SECRET_TOKEN" \
    --header="Content-Type: application/json" \
    --no-check-certificate \
    -O /dev/null "$API_URL" 2>&1)
  response=$(echo "$response_headers" | awk '/HTTP\// {print $2}' | tail -n 1)
  
  if [ "$response" -eq 200 ] 2>/dev/null; then
    echo "Success: Telemetry pushed successfully (HTTP 200)."
  else
    echo "Error: Failed to push telemetry. API responded with HTTP status $response."
    exit 1
  fi
else
  echo "Error: Neither curl nor wget was found on this system. Please install curl or wget."
  exit 1
fi
