# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Lint
npx eslint .

# No build step — the extension uses plain JavaScript
# No tests are implemented
```

To load the extension in Chrome: go to `chrome://extensions/`, enable Developer Mode, and click "Load unpacked" pointing to the project root.

## Architecture

Lean Site Blocker is a Manifest V3 Chrome extension that closes tabs when the user navigates to a blocked domain.

**background.js** — Service worker. Listens to `chrome.tabs.onUpdated` and calls `chrome.tabs.remove(tabId)` when the updated tab's URL matches a blocked domain. Matching checks both exact hostname and subdomain (e.g., blocking `facebook.com` also catches `m.facebook.com`).

**popup/** — The extension popup (HTML/CSS/JS). Reads and writes `chrome.storage.local` to manage the blocked domains list. `popup.js` normalizes user input by stripping protocol, `www.`, and path before storing.

**Storage format:** `chrome.storage.local` key `blocked` holds a plain string array of normalized domain names (e.g., `["facebook.com", "reddit.com"]`).

There is no build process — all files are loaded directly by Chrome.
