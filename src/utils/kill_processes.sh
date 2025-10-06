#!/bin/bash

echo "💣 Killing all Playwright-related processes"

# Маски (можешь добавлять свои)
MASKS=("playwright" "npm exec playwright" "playwright_chromiumdev_profile" "node.*playwright")

for MASK in "${MASKS[@]}"; do
  PIDS=$(pgrep -f "$MASK")
  if [ -n "$PIDS" ]; then
    for PID in $PIDS; do
      echo "❌ Killing PID $PID (matched by '$MASK')"
      kill -9 $PID 2>/dev/null
    done
  fi
done

echo "✅ All matching processes killed."
