#!/bin/bash
# ==============================================================================
# Telemetry Linux/PiOS crontab Setup Script
# ==============================================================================

# Get absolute path of this script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PUSH_SCRIPT="$SCRIPT_DIR/push.sh"

# Define a safe local directory in the user's home folder to copy the script
LOCAL_BIN_DIR="$HOME/.config/dashboard-telemetry"
LOCAL_PUSH_SCRIPT="$LOCAL_BIN_DIR/push.sh"

echo "Setting up Linux/PiOS telemetry daemon..."

if [ ! -f "$PUSH_SCRIPT" ]; then
    echo "Error: Cannot find push.sh at $PUSH_SCRIPT"
    exit 1
fi

# Create local directory
mkdir -p "$LOCAL_BIN_DIR"

# Copy the telemetry script to the local home folder
echo "Copying script to local storage: $LOCAL_PUSH_SCRIPT"
cp "$PUSH_SCRIPT" "$LOCAL_PUSH_SCRIPT"
chmod +x "$LOCAL_PUSH_SCRIPT"

# Define the cron job to run every 10 minutes
CRON_ENTRY="*/10 * * * * /bin/bash $LOCAL_PUSH_SCRIPT > /dev/null 2>&1"

# Read existing crontab, remove any existing dashboard-telemetry entries to prevent duplicates,
# add the new entry, and save it back.
echo "Registering cron job..."
(crontab -l 2>/dev/null | grep -v "dashboard-telemetry/push.sh" ; echo "$CRON_ENTRY") | crontab -

echo "Success! The telemetry cron job has been registered and will run every 10 minutes."
echo "You can check your current crontab entries by running: crontab -l"
