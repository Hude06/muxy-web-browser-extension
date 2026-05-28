#!/bin/sh
# Muxy keeps this process running for the lifetime of the extension.
# Replace this stub with logic that connects to "$MUXY_SOCKET_PATH" and
# authenticates with "$MUXY_EXTENSION_TOKEN" before subscribing to events.
echo "[muxy] $MUXY_EXTENSION_ID started"
while true; do sleep 3600; done