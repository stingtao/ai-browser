# 🤖 Sting AI Browser

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-34.0.0-blue.svg)](https://electronjs.org/)

A minimal, privacy-focused Electron-based browser with an integrated AI Assistant side panel. The assistant supports local models (Ollama), Gemini, and OpenAI-compatible APIs, designed to feel like a native part of the browser UI.

GitHub: https://github.com/stingtao/ai-browser

> **⚠️ Note**: This is a hobby project in active development. Not recommended for security-critical workflows.

## Features

- Chrome-like layout: tabs, address bar, content area, status bar
- Find in page (real-time highlight + match count + next/prev): `Cmd/Ctrl+F`
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
  - Per-tab AI Assistant panel (open/close is independent per tab)
  - Per-tab chat conversations (history list is shared)
  - Chat-style conversation UI with conversation history
  - Send button turns into Stop to cancel an in-flight chat/agent run (with an in-chat “Generating…” indicator)
  - Real-time voice input with Gemini Live API (speech-to-text)
  - Prompt shortcuts + prompt manager (template placeholders: `{{content}}`, `{{title}}`, `{{url}}`)
  - Safe Markdown rendering (sanitized HTML)
  - AI settings modal (provider/model/context mode)
  - Support for local Ollama models, Gemini API, and OpenAI-compatible APIs
  - Experimental Browser Agent mode (Playwright): can snapshot/navigate/click (incl. double-click)/hover/scroll/type/press in the active tab (reuses your login session)
  - Agent step trace UI (auto-collapses on completion; toggle to expand)
  - Agent max steps limit (configurable in AI settings)
  - Gemini API key manager with encryption support (save/update/clear) with validation
  - AI panel font size (5 levels)
  - Context modes: auto-selection, selection-only, or full page content
- App icon: `assets/app-icon.svg` (used for the UI favicon + macOS Dock icon in dev)

## Recent Updates

### Unreleased
- 🔎 **Find in Page**: Real-time highlight + match count refresh as you type
- 🛑 **AI Stop UX**: Send button becomes Stop (in place) + in-chat “Generating…” indicator
- 🎨 **App Icon**: New `assets/app-icon.svg` used for favicon + macOS Dock icon in dev
- 🧭 **Browser Agent**: Hover/scroll tools + double-click support, auto-repair for invalid JSON tool outputs, and improved Google Docs/Slides typing verification (includes `snapshot.axText`)

### v0.1.0 - December 15, 2025
- 🎙️ **Real-time Voice Input**: Added Gemini Live API integration for real-time speech-to-text
- 📥 **Download Manager**: Complete download tracking with progress bars, file management, and folder access
- 🔎 **Find in Page**: Added a Find Bar UI (`Cmd/Ctrl+F`) with match count and next/prev navigation
- 🌐 **Enhanced Multi-language Support**: Improved internationalization (English, Spanish, Traditional Chinese)
- ⚙️ **Advanced AI Settings**: Multiple context modes (auto-selection, selection-only, full page)
- 🧠 **AI Assistant Improvements**: Per-tab conversations, per-tab panel open/close, and a Stop button for in-flight runs
- 🧭 **Browser Agent UX**: Collapsible step trace + configurable max steps
- 🔧 **Browser Customization**: System theme support, custom user agent strings, enhanced startup options
- 🎨 **UI Improvements**: Better responsive design, improved accessibility, enhanced visual feedback
- 🔒 **Security Enhancements**: Encrypted API key storage with fallback to safe storage
- 📝 **Prompt Manager**: Advanced prompt template system with page content integration
- 🗣️ **Voice Models**: Support for Gemini voice models with audio transcription capabilities
- 💾 **Settings Persistence**: Robust settings management with validation and sanitization

## 📋 Requirements

### System Requirements
- **Node.js**: LTS version recommended (18+)
- **Operating System**: macOS 10.15+, Windows 10+, Linux (Ubuntu 18.04+)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB free space

### Optional Dependencies
- **Ollama**: For local AI models (https://ollama.com)
- **Gemini API Key**: For Google's Gemini models
- **OpenAI-compatible API**: For alternative AI providers

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

## OpenAI-compatible APIs

Use this if you have an OpenAI-compatible endpoint (for example: local servers, self-hosted gateways, or providers exposing `/v1/chat/completions`).

- Open AI settings (`⚙`)
- Set Provider to `OpenAI-compatible`
- Set:
  - Base URL (example: `http://127.0.0.1:11434/v1`)
  - Model (example: `gpt-4o-mini` or `llama3.1:8b`)
  - Optional API key (Save/Update), or use `OPENAI_API_KEY`

```bash
export OPENAI_API_KEY="YOUR_KEY"
```

## Browser Agent (Playwright)

In AI settings → Agent → Mode, switch to `Browser agent (Playwright)`.

- Runs a tool-using agent loop that can operate the current tab (so it can reuse your login state)
- Uses Chromium CDP on `127.0.0.1` by default
- Shows intermediate tool steps in a collapsible “Agent steps” trace (auto-collapses when finished)
- Uses trusted CDP mouse/key input (better compatibility with apps like Google Docs/Slides than `element.click()`)
- Tools: `snapshot`, `click` (id or x/y, optional `count=2` for double-click), `hover` (id or x/y), `scroll` (deltaY/deltaX), `type`, `press`, `navigate`, `waitForLoad`
- `type` supports both element targeting and typing into the currently focused element (useful for canvas-style editors); on `docs.google.com` it uses trusted key events + post-typing verification (click the editable canvas area first; sometimes double-click or press Enter)
- On `docs.google.com`, `snapshot` also includes `axText` (Accessibility tree excerpt) to help verify text in canvas-style editors like Google Slides.
- If the model returns non-JSON (or extra text), the agent will ask once for a JSON-only retry instead of immediately failing with “Agent returned invalid JSON”.
- `Max steps` is configurable in AI settings (prevents runaway loops)
- Use the Stop button (Send → Stop) to cancel an in-flight agent run

Environment variables:

```bash
export STING_CDP_ENABLE=1
export STING_CDP_PORT=9222
export STING_CDP_ADDRESS=127.0.0.1
```

Security note: CDP grants powerful control of the browser; keep it bound to localhost and avoid running untrusted local processes.

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
- OpenAI-compatible API key is stored using Electron `safeStorage` encryption when available; otherwise it falls back to plaintext storage on the device.
- AI Assistant options, prompts, chat history, and page zoom are stored in renderer `localStorage`.

## 🏗️ Architecture & Technologies

### Core Technologies
- **Electron**: Cross-platform desktop app framework
- **Playwright**: Browser automation for AI agent functionality
- **WebSocket**: Real-time voice communication with Gemini Live API
- **Web APIs**: Native browser APIs for web content interaction

### Project Structure
- **Main Process** (`main.js`): Window management, IPC communication, settings persistence, system integration
- **Preload Script** (`preload.js`): Secure IPC bridge between main and renderer processes
- **Renderer Process** (`renderer/`): Web-based UI with browser tabs, AI assistant panel, and user interactions
  - `renderer.js`: Main application logic
  - `index.html`: UI structure and templates
  - `styles.css`: Responsive design with light/dark theme support

### Key Features Implementation
- **AI Integration**: Multi-provider support (Ollama, Gemini, OpenAI-compatible)
- **Browser Agent**: CDP-based automation using Playwright Core
- **Download Manager**: Electron session-based download tracking
- **Voice Input**: WebSocket-based real-time audio streaming
- **Settings System**: JSON storage with encrypted API key management
- **Internationalization**: Built-in i18n system supporting 3 languages

### Security Features
- **Context Isolation**: Electron security best practices
- **API Key Encryption**: SafeStorage with fallback mechanisms
- **CSP Headers**: Content Security Policy implementation
- **Input Sanitization**: XSS protection for user-generated content

## 🚀 Roadmap

### Planned Features
- [ ] **Extension System**: Browser extension API support
- [ ] **Sync**: Cross-device settings synchronization
- [ ] **Performance**: Better memory management and tab unloading
- [ ] **Privacy**: Enhanced tracking protection and cookie management
- [ ] **Accessibility**: Screen reader improvements and keyboard navigation

### Known Issues
- Browser Agent mode is experimental and may have stability issues
- On Google Slides/Docs, entering text-edit mode can still be finicky; try precise clicks, `click` with `count=2`, or `press` → `Enter` before `type`
- Some models may output non-JSON in Agent mode; the app retries once, but persistent formatting issues can still interrupt runs
- Voice input requires stable internet connection
- Large page content may impact AI response performance

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/ai-browser.git`
3. Install dependencies: `npm install`
4. Start development: `npm start`

### Project Structure

- `main.js` - Electron main process (window management, IPC, settings)
- `preload.js` - Secure IPC bridge between main and renderer
- `renderer/` - Web-based UI (browser tabs, AI assistant, interactions)
  - `renderer.js` - Main renderer logic
  - `index.html` - UI structure
  - `styles.css` - Styling
- `scripts/` - Development and build scripts
- `assets/` - Static assets (icons, logos)

## 🙏 Acknowledgments

- **Electron**: For the amazing cross-platform framework
- **Google Gemini**: For powerful AI models and Live API
- **Ollama**: For making local AI accessible
- **Playwright**: For browser automation capabilities
- **OpenAI**: For the API standards that enable interoperability

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Security Disclaimer

This is an MVP hobby project. Do not use it as a hardened/secure browser for sensitive workflows. Always review AI output before acting on it. API keys are stored with encryption when available, but implement additional security measures for production use.
