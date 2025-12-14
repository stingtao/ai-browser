# AI Browser (Sting AI Browser)

A minimal Electron-based browser with an integrated AI Assistant side panel. The assistant can use local models (Ollama) or Gemini, and is designed to feel like a native part of the browser UI.

## Features

- Chrome-like layout: tabs, address bar, content area, status bar
- Browser Settings:
  - Theme: light / dark
  - Home page, search engine, startup behavior
  - History viewer + clear browsing data
  - First-run “Import from Chrome” modal
- Print: `Cmd/Ctrl+P`
- Page zoom: `Cmd/Ctrl +` / `Cmd/Ctrl -` / `Cmd/Ctrl 0` (persists across restarts)
- AI Assistant:
  - Integrated, resizable side panel
  - Chat-style conversation UI with conversation history
  - Prompt shortcuts + prompt manager (template placeholders: `{{content}}`, `{{title}}`, `{{url}}`)
  - Safe Markdown rendering (sanitized HTML)
  - AI settings modal (provider/model/context mode)
  - Gemini API key manager (save/update/clear) with basic validation
  - AI panel font size (5 levels)

## Requirements

- Node.js (LTS recommended)
- macOS / Windows / Linux (Electron)
- Optional: Ollama for local models
- Optional: Gemini API key for Gemini models

## Getting Started (Development)

```bash
npm install
npm start
```

If `npm start` fails with `app.whenReady is undefined`, make sure `ELECTRON_RUN_AS_NODE` is not set:

```bash
env -u ELECTRON_RUN_AS_NODE npm start
```

## Local Models (Ollama)

1. Install Ollama: https://ollama.com
2. Make sure the Ollama service is running (default: `http://127.0.0.1:11434`)
3. Open AI settings (`⚙`) → set Provider to `Local (Ollama)` → refresh/pull models

## Gemini

Recommended: set it inside the app.

- Open AI settings (`⚙`)
- Set Provider to `Gemini API`
- Paste API key → Save/Update (you can Clear anytime)
- Pick a model from the predefined list (saved immediately)

Alternative: set an environment variable:

```bash
export GEMINI_API_KEY="YOUR_KEY"
```

## Keyboard Shortcuts

- Settings: `Cmd/Ctrl+,`
- History: `Cmd/Ctrl+Y`
- Toggle AI Assistant: `Cmd/Ctrl+Shift+A`
- Focus address bar: `Cmd/Ctrl+L`
- New tab: `Cmd/Ctrl+T`
- Close tab: `Cmd/Ctrl+W`
- Find in page: `Cmd/Ctrl+F`
- Print: `Cmd/Ctrl+P`
- Zoom: `Cmd/Ctrl +` / `Cmd/Ctrl -` / `Cmd/Ctrl 0`

## Data Storage Notes

- Browser settings are stored in Electron `userData` as JSON.
- Gemini API key is stored using Electron `safeStorage` encryption when available; otherwise it falls back to plaintext storage on the device.
- AI Assistant options, prompts, chat history, and page zoom are stored in renderer `localStorage`.

## Security Disclaimer

This is an MVP hobby project. Do not use it as a hardened/secure browser for sensitive workflows. Always review AI output before acting on it.
