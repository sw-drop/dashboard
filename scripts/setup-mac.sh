#!/bin/bash
# ==============================================================================
# Telemetry macOS LaunchAgent Setup Script
# ==============================================================================

# Get absolute path of this script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PUSH_SCRIPT="$SCRIPT_DIR/push.sh"

# Define a safe local directory in the user's home folder to prevent macOS
# Sandbox/TCC boundary blocks when running scripts off external/synced drives.
LOCAL_BIN_DIR="$HOME/.config/dashboard-telemetry"
LOCAL_PUSH_SCRIPT="$LOCAL_BIN_DIR/push.sh"
PLIST_PATH="$HOME/Library/LaunchAgents/com.dashboard.telemetry.plist"

echo "Setting up macOS telemetry daemon..."

if [ ! -f "$PUSH_SCRIPT" ]; then
    echo "Error: Cannot find push.sh at $PUSH_SCRIPT"
    exit 1
fi

# Create local directories
mkdir -p "$LOCAL_BIN_DIR"
mkdir -p "$HOME/Library/LaunchAgents"

# Copy the telemetry script to the local home folder
echo "Copying script to local storage: $LOCAL_PUSH_SCRIPT"
cp "$PUSH_SCRIPT" "$LOCAL_PUSH_SCRIPT"
chmod +x "$LOCAL_PUSH_SCRIPT"

# Unload existing agent if it exists
if launchctl list | grep -q "com.dashboard.telemetry"; then
    echo "Unloading existing LaunchAgent..."
    launchctl unload "$PLIST_PATH" 2>/dev/null
fi

# Write dynamic plist file pointing to the local home folder copy
cat <<EOF > "$PLIST_PATH"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.dashboard.telemetry</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$LOCAL_PUSH_SCRIPT</string>
    </array>
    <key>StartInterval</key>
    <integer>600</integer>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/dashboard-telemetry.out.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/dashboard-telemetry.err.log</string>
</dict>
</plist>
EOF

# Load the new LaunchAgent
echo "Loading LaunchAgent..."
launchctl load "$PLIST_PATH"

echo "Success! The telemetry service has been loaded and will run every 10 minutes."
echo "You can check your dashboard to see this Mac reporting."
