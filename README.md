# Muxy Web Browser Extension

A lightweight web browser tab extension for Muxy.

It adds:

- A `Web Browser` tab type
- A command: `Web Browser: Open`
- A right-side status bar launcher: `Browser`

## Install

1. Close Muxy (recommended).
2. Clone this repo into Muxy's extensions directory:

```bash
mkdir -p ~/.config/muxy/extensions
git clone https://github.com/Hude06/muxy-web-browser-extension.git ~/.config/muxy/extensions/Web-Browser
chmod +x ~/.config/muxy/extensions/Web-Browser/run.sh
```

3. Open Muxy.
4. Go to `Settings -> Extensions`.
5. Click `Reload`.

## Use

1. Click `Browser` in the right status bar, or run `Web Browser: Open` from the command palette.
2. Type a URL or search query in the address bar and press Enter.

## Update

```bash
cd ~/.config/muxy/extensions/Web-Browser
git pull
```

Then reload extensions in Muxy.

## Uninstall

```bash
rm -rf ~/.config/muxy/extensions/Web-Browser
```
