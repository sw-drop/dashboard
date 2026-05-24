#!/bin/bash
# ==============================================================================
# Telemetry macOS LaunchAgent Setup Script
# ==============================================================================

# Get absolute path of this script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PUSH_SCRIPT="$SCRIPT_DIR/push.sh"
PLIST_PATH="$HOME/Library/LaunchAgents/com.dashboard.telemetry.plist"

echo "Setting up macOS telemetry daemon..."

if [ ! -f "$PUSH_SCRIPT" ]; then
    echo "Error: Cannot find push.sh at $PUSH_SCRIPT"
    exit 1
fi

# Ensure push.sh is executable
chmod +x "$PUSH_SCRIPT"

# Create LaunchAgents directory if it doesn't exist
mkdir -p "$HOME/Library/LaunchAgents"

# Unload existing agent if it exists
if launchctl list | grep -q "com.dashboard.telemetry"; then
    echo "Unloading existing LaunchAgent..."
    launchctl unload "$PLIST_PATH" 2>/dev/null
fi

# Write dynamic plist file
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
        <string>$PUSH_SCRIPT</string>
    </array>
    <key>StartInterval</key>
    <integer>600</integer>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
EOF

# Load the new LaunchAgent
echo "Loading LaunchAgent..."
launchctl load "$PLIST_PATH"

echo "Success! The telemetry service has been loaded and will run every 10 minutes."
echo "You can check your dashboard to see this Mac reporting."
