# 📱 Arch Responsive Tester

<p align="center">
  <img src="assets/arch-responsive-tester.svg" width="96" height="96" alt="Arch Responsive Tester Logo" />
</p>

<p align="center">
  <strong>Simultaneous multi-device responsive web design testing tool for Arch Linux.</strong>
</p>

<p align="center">
  <a href="https://archlinux.org"><img src="https://img.shields.io/badge/Arch%20Linux-Compatible-1793d1?style=flat-square&logo=archlinux" alt="Arch Linux" /></a>
  <a href="https://hyprland.org"><img src="https://img.shields.io/badge/Hyprland-Optimized-00c8b3?style=flat-square" alt="Hyprland" /></a>
  <a href="https://wayland.freedesktop.org"><img src="https://img.shields.io/badge/Wayland%20%2F%20X11-Supported-orange?style=flat-square" alt="Wayland / X11" /></a>
  <a href="https://www.electronjs.org"><img src="https://img.shields.io/badge/Electron-Chromium%20Engine-47848f?style=flat-square&logo=electron" alt="Electron" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License" /></a>
</p>

---

## 🌟 Overview

**Arch Responsive Tester** is a fast, standalone developer application for Arch Linux distributions (Arch, EndeavourOS, CachyOS, Manjaro, Omarchy, Garuda) and Wayland/X11 compositors.

It allows frontend developers and web designers to test websites and local development servers across **Phone**, **Tablet**, and **Desktop** viewports simultaneously with live synchronized scrolling, automatic reloading, and customizable layout views.

---

## ✨ Features

- **📱 Multi-Device Viewports**:
  - **Phone View**: iPhone 15 (390×844), iPhone SE (375×667), Pixel 8 (412×915), Galaxy S24 (360×780) with mobile touch & User Agent simulation.
  - **Tablet View**: iPad Air (820×1180), iPad Mini (744×1133), iPad Pro 12.9" (1024×1366), Surface Pro 8 (912×1368).
  - **Desktop View**: Desktop 1440×900, MacBook 13" (1280×800), Full HD 1080p (1920×1080), HD Laptop (1366×768).

- **🎛️ Dynamic Centering & Flexible Views**:
  - Choose to display **any single view**, **any combination of two**, or **all 3 views** simultaneously.
  - Viewports are **automatically centered** in the workspace with balanced margins.

- **⚡ Local Dev Servers Quick Menu**:
  - `[⚡ Dev Servers ▾]` popover button for quick access to popular local dev ports:
    - `localhost:3000` (Next.js, React, Remix, Bun)
    - `localhost:5173` (Vite, Vue, Svelte)
    - `localhost:8080` (Webpack, Spring, Go)
    - `localhost:4321` (Astro)
    - `localhost:8000` (FastAPI, Django)

- **🔄 Synchronized Scrolling & Live Reload**:
  - **Global Refresh**: Reload all active device viewports with one click or `Ctrl+R` / `F5`.
  - **Independent Refresh**: Reload a specific frame without reloading others.
  - **Auto-Reload Timer**: Set automated intervals (3s, 5s, 10s, 30s) during live coding sessions.
  - **Sync Scroll**: Scrolling inside any viewport proportionally scrolls all other active devices.
  - **Device Rotation**: Instant Portrait ⇄ Landscape toggle (`⇄ Rotate`) for mobile and tablet views.

- **🛡️ Bypass CSP & X-Frame-Options**:
  - Built-in session filter automatically strips restrictive embedding headers, enabling you to test external websites that normally reject frame embedding.

- **🎨 Arch Dark Theme & Dynamic Palette**:
  - Ships with a clean, modern Arch Linux dark theme.
  - Automatically adapts to system palettes if Pywal or custom theme colors are configured.

---

## 🚀 Installation

### Option 1: Install as Omarchy Shell Plugin (Omarchy Users)
If you are running Omarchy, install and enable the status bar widget directly:
```bash
omarchy plugin add https://github.com/Seraph919/arch-responsive-tester.git --enable
```
To position it in a specific section of the top status bar (e.g. right):
```bash
omarchy plugin enable seraph.arch-responsive-tester --section right
```

---

### Option 2: Standalone Install (Any Arch Linux Distro)
For standard Arch Linux, EndeavourOS, Manjaro, CachyOS, etc.:

1. **Install dependencies**:
   ```bash
   sudo pacman -S git electron
   ```

2. **Clone and run the installer**:
   ```bash
   git clone https://github.com/Seraph919/arch-responsive-tester.git ~/.local/share/arch-responsive-tester
   cd ~/.local/share/arch-responsive-tester
   ./install.sh
   ```

The installer script:
1. Links the launcher to `~/.local/bin/arch-responsive-tester` and `~/.local/bin/responsive-tester`.
2. Installs the application icon and FreeDesktop entry to `~/.local/share/applications/`.
3. Updates your desktop application database.

---

## 💡 Usage

### From the Application Menu
Press `Super` to open your app launcher (**Rofi**, **Wofi**, **Fuzzel**, **KDE**, **GNOME**) and launch **Arch Responsive Tester**.

### From the Terminal
```bash
# Launch with default website (https://asoudani.dev)
arch-responsive-tester

# Launch with a specific URL or local dev port
arch-responsive-tester http://localhost:5173
arch-responsive-tester https://github.com
```

---

## ⌨️ Shortcuts & Controls

| Action | Shortcut / Control |
|---|---|
| **Navigate URL** | Type in Omnibox & press `Enter` |
| **Refresh All Viewports** | `Ctrl + R` or `F5` |
| **Focus Address Bar** | `Ctrl + L` |
| **Toggle Dev Servers Menu** | Click `[⚡ Dev Servers ▾]` |
| **Rotate Phone / Tablet** | Click `⇄ Rotate` |
| **Toggle Sync Scroll** | Click `⇄ Sync` |
| **Auto Refresh Timer** | Select from `⏱ Auto: Off / 3s / 5s / 10s / 30s` |
| **Toggle Viewports** | Click `📱 Phone`, `📱 Tablet`, or `💻 Desktop` |

---

## 🪟 Window Manager Configuration

### Hyprland (`hyprland.conf`)
```ini
windowrulev2 = float, class:^(arch-responsive-tester)$
windowrulev2 = center, class:^(arch-responsive-tester)$
windowrulev2 = size 1540 960, class:^(arch-responsive-tester)$
windowrulev2 = opacity 1.0 1.0, class:^(arch-responsive-tester)$
```

### Sway / i3 (`config`)
```ini
for_window [app_id="arch-responsive-tester"] floating enable, resize set 1540 960, move position center
```

---

## 📊 Waybar Integration

Add a quick launcher module to your status bar in `~/.config/waybar/config.jsonc`:

```jsonc
"custom/responsive-tester": {
  "format": "󰹑",
  "tooltip": "Arch Responsive Tester",
  "on-click": "arch-responsive-tester"
}
```

Add to your `modules-right` or `modules-left` array:
```jsonc
"modules-right": [
  "custom/responsive-tester",
  // other modules...
]
```

---

## 📁 Project Structure

```
arch-responsive-tester/
├── arch-responsive-tester.desktop  # FreeDesktop launcher entry
├── install.sh                      # One-command installer
├── uninstall.sh                    # Clean uninstaller
├── assets/
│   └── arch-responsive-tester.svg  # Application vector icon
├── bin/
│   └── arch-responsive-tester      # Wayland/Ozone-aware launcher script
└── app/
    ├── package.json                # Application metadata
    ├── main.js                     # Electron main process (header stripping & single instance)
    ├── preload.js                  # Secure IPC bridge
    ├── index.html                  # UI layout & viewport stage
    ├── styles.css                  # Arch theme variables & responsive flex layout
    └── renderer.js                 # Multi-viewport controller & scroll synchronization
```

---

## 🗑️ Uninstallation

To remove Arch Responsive Tester from your system:
```bash
cd ~/.local/share/arch-responsive-tester
./uninstall.sh
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to open an issue or submit a pull request on [GitHub](https://github.com/Seraph919/arch-responsive-tester).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
