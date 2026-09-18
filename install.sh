#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
BIN_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/scalable/apps"

echo "Installing Arch Responsive Tester..."

# Ensure target directories exist
mkdir -p "$BIN_DIR" "$DESKTOP_DIR" "$ICON_DIR"

# Symlink binaries to PATH
ln -sf "$SCRIPT_DIR/bin/arch-responsive-tester" "$BIN_DIR/arch-responsive-tester"
ln -sf "$SCRIPT_DIR/bin/arch-responsive-tester" "$BIN_DIR/responsive-tester"
chmod +x "$SCRIPT_DIR/bin/arch-responsive-tester"

# Install icon
cp -f "$SCRIPT_DIR/assets/arch-responsive-tester.svg" "$ICON_DIR/arch-responsive-tester.svg"

# Install desktop entry
sed -e "s|Icon=arch-responsive-tester|Icon=$ICON_DIR/arch-responsive-tester.svg|g" \
    "$SCRIPT_DIR/arch-responsive-tester.desktop" > "$DESKTOP_DIR/arch-responsive-tester.desktop"

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
fi

echo "========================================================"
echo "Installation complete!"
echo "Run 'arch-responsive-tester' or 'responsive-tester' in your terminal,"
echo "or open 'Arch Responsive Tester' from your application launcher."
echo "========================================================"
