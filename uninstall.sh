#!/usr/bin/env bash
set -euo pipefail

echo "Uninstalling Arch Responsive Tester..."

rm -f "$HOME/.local/bin/arch-responsive-tester"
rm -f "$HOME/.local/bin/responsive-tester"
rm -f "$HOME/.local/share/applications/arch-responsive-tester.desktop"
rm -f "$HOME/.local/share/icons/hicolor/scalable/apps/arch-responsive-tester.svg"

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true
fi

echo "Arch Responsive Tester has been uninstalled."
