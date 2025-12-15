# AI Browser (Sting AI Browser)

A minimal Electron-based browser with an integrated AI Assistant side panel. The assistant can use local models (Ollama) or Gemini, and is designed to feel like a native part of the browser UI.

## Features

- Chrome-like layout: tabs, address bar, content area, status bar
- Browser Settings:
  - Theme: light / dark / system
  - Home page, search engine, startup behavior
  - History viewer + clear browsing data
  - First-run "Import from Chrome" modal
  - Multi-language support (English, Spanish, Traditional Chinese)
  - Customizable user agent string
- Print: `Cmd/Ctrl+P`
- Page zoom: `Cmd/Ctrl +` / `Cmd/Ctrl -` / `Cmd/Ctrl 0` (persists across restarts)
- Download Manager: built-in download tracking with progress bars and file management
- AI Assistant:
  - Integrated, resizable side panel
  - Chat-style conversation UI with conversation history
  - Real-time voice input with Gemini Live API (speech-to-text)
  - Prompt shortcuts + prompt manager (template placeholders: `{{content}}`, `{{title}}`, `{{url}}`)
  - Safe Markdown rendering (sanitized HTML)
  - AI settings modal (provider/model/context mode)
  - Support for both local Ollama models and Gemini API
  - Gemini API key manager with encryption support (save/update/clear) with validation
  - AI panel font size (5 levels)
  - Context modes: auto-selection, selection-only, or full page content

## Recent Updates

### v0.1.0 - December 15, 2025
- 🎙️ **Real-time Voice Input**: Added Gemini Live API integration for real-time speech-to-text
- 📥 **Download Manager**: Complete download tracking with progress bars, file management, and folder access
- 🌐 **Enhanced Multi-language Support**: Improved internationalization (English, Spanish, Traditional Chinese)
- ⚙️ **Advanced AI Settings**: Multiple context modes (auto-selection, selection-only, full page)
- 🔧 **Browser Customization**: System theme support, custom user agent strings, enhanced startup options
- 🎨 **UI Improvements**: Better responsive design, improved accessibility, enhanced visual feedback
- 🔒 **Security Enhancements**: Encrypted API key storage with fallback to safe storage
- 📝 **Prompt Manager**: Advanced prompt template system with page content integration
- 🗣️ **Voice Models**: Support for Gemini voice models with audio transcription capabilities
- 💾 **Settings Persistence**: Robust settings management with validation and sanitization

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

The `npm start` script properly handles Electron startup and ensures `ELECTRON_RUN_AS_NODE` is not set.

### Available Scripts

- `npm start` - Start the application in development mode
- `npm run fix-electron` - Fix Electron installation issues (useful for CI/CD)
- `npm run postinstall` - Automatically runs after npm install to fix Electron setup

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

## Project Architecture

- **Electron Main Process** (`main.js`): Handles window management, IPC communication, settings persistence, and system integration
- **Preload Script** (`preload.js`): Secure IPC bridge between main and renderer processes
- **Renderer Process** (`renderer/`): Web-based UI with browser tabs, AI assistant panel, and all user interactions
- **WebSocket Integration**: Real-time voice communication with Gemini Live API
- **Settings Storage**: JSON-based configuration with encrypted API key storage
- **Multi-language Support**: Built-in internationalization system

## Security Disclaimer

This is an MVP hobby project. Do not use it as a hardened/secure browser for sensitive workflows. Always review AI output before acting on it. API keys are stored with encryption when available, but implement additional security measures for production use.
