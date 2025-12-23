const DEFAULT_HOME_URL = "https://www.google.com";
const DEFAULT_SEARCH_TEMPLATE = "https://www.google.com/search?q={query}";
const DEFAULT_USER_AGENT_NAME = "stingtaoAI";
const DEFAULT_FAVICON = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <rect width="16" height="16" rx="4" fill="#e8eaed"/>
    <path d="M8 3.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Zm0 1.2c.75 0 1.46.21 2.06.58-.44.25-.9.44-1.38.56A5.4 5.4 0 0 0 8 4.4Zm-2.9.84c.57-.51 1.28-.84 2.06-.94-.33.32-.62.7-.85 1.12-.43.07-.84.22-1.21.42Zm-.64 1.32c.43-.28.91-.46 1.42-.54-.1.3-.18.62-.23.95H4.32c.02-.14.07-.27.14-.41Zm0 2.84a4.04 4.04 0 0 1-.14-.41h1.33c.05.33.13.65.23.95-.51-.08-.99-.26-1.42-.54Zm.64 1.32c.37.2.78.35 1.21.42.23.42.52.8.85 1.12-.78-.1-1.49-.43-2.06-.94Zm5.8-.84c-.57.51-1.28.84-2.06.94.33-.32.62-.7.85-1.12.43-.07.84-.22 1.21-.42Zm.64-1.32c-.43.28-.91.46-1.42.54.1-.3.18-.62.23-.95h1.33c-.02.14-.07.27-.14.41Zm0-2.84c.07.14.12.27.14.41h-1.33c-.05-.33-.13-.65-.23-.95.51.08.99.26 1.42.54Zm-.64-1.32c-.37-.2-.78-.35-1.21-.42-.23-.42-.52-.8-.85-1.12.78.1 1.49.43 2.06.94Z" fill="#9aa0a6"/>
  </svg>`
)}`;

const SUPPORTED_UI_LANGUAGES = ["en", "es", "zh-TW"];

let launchInitialUrl = "";
try {
  launchInitialUrl = new URLSearchParams(window.location.search).get("initialUrl") || "";
} catch {
  launchInitialUrl = "";
}

function resolveUiLanguage(input) {
  const raw = String(input || "").trim();
  if (!raw) return "en";
  const lower = raw.toLowerCase().replaceAll("_", "-");
  if (lower === "en" || lower.startsWith("en-")) return "en";
  if (lower === "es" || lower.startsWith("es-")) return "es";
  if (lower === "zh-tw" || lower.startsWith("zh-tw-")) return "zh-TW";
  if (lower.startsWith("zh-") || lower === "zh") return "zh-TW";
  return "en";
}

const UI_I18N = {
  en: {
    "tabs.scrollLeft": "Scroll tabs left",
    "tabs.scrollRight": "Scroll tabs right",
    "tabs.label": "Tabs",
    "tabs.new": "New tab",
    "tabs.newTitle": "New Tab",
    "tabs.untitled": "Untitled",
    "tabs.close": "Close tab",

    "nav.back": "Back",
    "nav.forward": "Forward",
    "nav.reload": "Reload",
    "nav.stop": "Stop",
    "nav.home": "Home",

    "address.placeholder": "Search or enter address",
    "address.clear": "Clear",
    "address.suggestions": "Suggestions",

    "pageError.title": "This site can’t be reached",
    "pageError.retry": "Reload",
    "pageError.copyUrl": "Copy URL",

    "downloads.title": "Downloads",
    "downloads.openFolder": "Open downloads folder",
    "downloads.close": "Close downloads",
    "downloads.list": "Downloads list",
    "downloads.status.downloading": "Downloading…",
    "downloads.status.completed": "Completed",
    "downloads.status.cancelled": "Cancelled",
    "downloads.status.interrupted": "Failed",
    "downloads.action.open": "Open",
    "downloads.action.show": "Show in folder",
    "downloads.action.cancel": "Cancel",

    "ai.label": "AI Assistant",
    "ai.settings": "AI Assistant settings",
    "ai.resize": "Resize AI Assistant",
    "ai.close": "Close AI Assistant",
    "ai.newConversation": "New conversation",
    "ai.history": "Conversation history",
    "ai.history.title": "Conversation history",
    "ai.history.close": "Close history",
    "ai.agent.stop": "Stop agent",
    "ai.agent.stopped": "Agent stopped.",
    "ai.chat.stopped": "Stopped.",
    "ai.agent.steps.title": "Agent steps",
    "ai.history.list": "Conversation list",
    "ai.history.empty": "No conversations yet.",
    "ai.history.count": "{{count}} messages",
    "ai.history.newConversationTitle": "New conversation",
    "ai.chat.aria": "AI conversation",
    "ai.prompts.shortcuts": "Prompt shortcuts",
    "ai.chat.placeholder": "Type a message…",
    "ai.chat.send": "Send",
    "ai.chat.stop": "Stop",
    "ai.chat.sending": "Generating…",
    "ai.chat.copy": "Copy",
    "ai.chat.copied": "Copied",
    "ai.voice.button": "Voice input",
    "ai.voice.listening": "Listening…",
    "ai.voice.transcribing": "Transcribing…",
    "ai.voice.error.notSupported": "Voice input is not supported in this environment.",
    "ai.voice.error.micPermission": "Microphone permission denied.",
    "ai.voice.error.noGeminiKey": "Gemini API key not set. Open AI settings to add it.",
    "ai.meta.user": "You",
    "ai.meta.assistant": "AI",
    "ai.meta.stopped": "Stopped",
    "ai.meta.error": "Error",
    "ai.meta.provider.local": "Local",
    "ai.meta.provider.gemini": "Gemini",
    "ai.meta.provider.openai": "OpenAI-compatible",
    "ai.context.currentPage": "Current page content",
    "ai.context.selection": "Selection",
    "ai.context.pageTitle": "Page title",
    "ai.context.url": "URL",
    "ai.context.attachedNote": "({{label}} is included in the context)",
    "ai.error.selectionMissing":
      "No selection found: select some text on the page, or switch to \"Full page\" mode.",
    "ai.error.localModelMissing": "No local model selected. Install one in AI settings (Pull) and select it.",
    "ai.systemPrompt":
      "You are the user's browser AI assistant. Answer using the provided page context. Respond in English.",

    "status.loading": "Loading…",

    "aiSettings.title": "AI Assistant Settings",
    "aiSettings.close": "Close",
    "aiSettings.section.modelSource": "Model Source",
    "aiSettings.section.agent": "Agent",
    "aiSettings.section.integrations": "Integrations",
    "aiSettings.provider.label": "Provider",
    "aiSettings.provider.local": "Local (Ollama)",
    "aiSettings.provider.gemini": "Gemini API",
    "aiSettings.provider.openai": "OpenAI-compatible",
    "aiSettings.local.label": "Local",
    "aiSettings.refresh": "Refresh",
    "aiSettings.pull.label": "Pull",
    "aiSettings.pull.button": "Download model",
    "aiSettings.pull.downloading": "Downloading…",
    "aiSettings.gemini.model": "Model",
    "aiSettings.gemini.defaultModelOption": "gemini-2.5-flash (default)",
    "aiSettings.gemini.apiKey": "API Key",
    "aiSettings.gemini.toggleKey": "Show/Hide",
    "aiSettings.gemini.toggleKeyAria": "Toggle API key visibility",
    "aiSettings.gemini.keyStatus.notSet": "Not set",
    "aiSettings.gemini.keyStatus.env": "Set (environment variable GEMINI_API_KEY)",
    "aiSettings.gemini.keyStatus.savedEncrypted": "Saved (encrypted)",
    "aiSettings.gemini.keyStatus.savedPlain": "Saved (plain text)",
    "aiSettings.gemini.keyStatus.saved": "Saved",
    "aiSettings.gemini.keyStatus.notSetEncryptedAvailable": "Not set (can be saved encrypted here)",
    "aiSettings.gemini.keyStatus.notSetNoEncryption":
      "Not set (this device can't encrypt; it will be stored in plain text)",
    "aiSettings.gemini.keyStatus.saving": "Saving…",
    "aiSettings.gemini.keySave": "Save/Update",
    "aiSettings.gemini.keySave.saving": "Saving…",
    "aiSettings.gemini.keyClear": "Clear",
    "aiSettings.gemini.keyClearConfirm": "Clear the saved Gemini API key?",
    "aiSettings.gemini.keyError.invalid":
      "Invalid API key format. Please paste the full key (often starts with AIza...).",

    "aiSettings.openai.baseUrl": "Base URL",
    "aiSettings.openai.model": "Model",
    "aiSettings.openai.apiKey": "API Key",
    "aiSettings.openai.toggleKey": "Show/Hide",
    "aiSettings.openai.toggleKeyAria": "Toggle API key visibility",
    "aiSettings.openai.keyStatus.notSet": "Not set",
    "aiSettings.openai.keyStatus.env": "Set (environment variable OPENAI_API_KEY)",
    "aiSettings.openai.keyStatus.savedEncrypted": "Saved (encrypted)",
    "aiSettings.openai.keyStatus.savedPlain": "Saved (plain text)",
    "aiSettings.openai.keyStatus.saved": "Saved",
    "aiSettings.openai.keyStatus.notSetEncryptedAvailable": "Not set (can be saved encrypted here)",
    "aiSettings.openai.keyStatus.notSetNoEncryption":
      "Not set (this device can't encrypt; it will be stored in plain text)",
    "aiSettings.openai.keyStatus.saving": "Saving…",
    "aiSettings.openai.keySave": "Save/Update",
    "aiSettings.openai.keySave.saving": "Saving…",
    "aiSettings.openai.keyClear": "Clear",
    "aiSettings.openai.keyClearConfirm": "Clear the saved OpenAI-compatible API key?",
    "aiSettings.openai.keyError.invalid": "Invalid API key format.",

    "aiSettings.google.status.label": "Status",
    "aiSettings.google.status.connected": "Connected",
    "aiSettings.google.status.disconnected": "Not connected",
    "aiSettings.google.status.clientSecretSaved": "Client secret saved",
    "aiSettings.google.status.refreshTokenSaved": "Refresh token saved",
    "aiSettings.google.clientId": "Client ID",
    "aiSettings.google.clientSecret": "Client Secret",
    "aiSettings.google.scopes": "Scopes",
    "aiSettings.google.scope.sheets": "Google Sheets",
    "aiSettings.google.scope.docs": "Google Docs",
    "aiSettings.google.scope.slides": "Google Slides",
    "aiSettings.google.scope.driveFile": "Drive (files you create/open)",
    "aiSettings.google.saveClientId": "Save",
    "aiSettings.google.saveClientSecret": "Save",
    "aiSettings.google.toggleSecret": "Show/Hide",
    "aiSettings.google.toggleSecretAria": "Toggle client secret visibility",
    "aiSettings.google.connect": "Connect",
    "aiSettings.google.reconnect": "Reconnect",
    "aiSettings.google.connecting": "Connecting…",
    "aiSettings.google.disconnect": "Disconnect",
    "aiSettings.google.disconnectConfirm": "Disconnect Google OAuth? You can reconnect later.",
    "aiSettings.google.clear": "Clear",
    "aiSettings.google.clearConfirm": "Clear Google OAuth client and tokens? You'll need to set client id/secret again.",
    "aiSettings.google.hint":
      "Create an OAuth client (Desktop app) in Google Cloud Console. Redirect URI will be a temporary localhost URL.",

    "aiSettings.agent.mode": "Mode",
    "aiSettings.agent.mode.chat": "Chat",
    "aiSettings.agent.mode.browser": "Browser agent (Playwright)",
    "aiSettings.agent.confirm.label": "Actions",
    "aiSettings.agent.confirm": "Ask before actions",
    "aiSettings.agent.maxSteps.label": "Max steps",

    "aiSettings.section.context": "Context",
    "aiSettings.context.label": "Content",
    "aiSettings.context.auto": "Auto (use selection when available)",
    "aiSettings.context.selection": "Selection only",
    "aiSettings.context.page": "Full page text",

    "aiSettings.section.appearance": "Appearance",
    "aiSettings.fontSize.label": "Font size",
    "aiSettings.fontSize.1": "Smallest",
    "aiSettings.fontSize.2": "Small",
    "aiSettings.fontSize.3": "Standard",
    "aiSettings.fontSize.4": "Large",
    "aiSettings.fontSize.5": "Largest",

    "aiSettings.section.voice": "Voice input",
    "aiSettings.voice.model": "Model",
    "aiSettings.voice.hint": "Requires Gemini API key; realtime speech-to-text (Gemini Live).",

    "aiSettings.section.prompts": "Prompts",
    "aiSettings.prompt.label": "Prompt",
    "aiSettings.prompt.name": "Name",
    "aiSettings.prompt.namePlaceholder": "Prompt name",
    "aiSettings.prompt.id": "ID",
    "aiSettings.prompt.pageContent": "Page content",
    "aiSettings.prompt.includeContent": "Attach current page content",
    "aiSettings.prompt.add": "Add",
    "aiSettings.prompt.save": "Save",
    "aiSettings.prompt.delete": "Delete",
    "aiSettings.prompt.reset": "Reset defaults",
    "aiSettings.prompt.templatePlaceholder": "Edit the prompt template here…",

    "prompts.add.title": "New prompt name",
    "prompts.add.defaultName": "New prompt",
    "prompts.add.defaultTemplate": "Write your prompt template here…",
    "prompts.delete.confirm": "Delete prompt \"{{name}}\"?",
    "prompts.reset.confirm": "Reset prompts back to defaults?",

    "appSettings.title": "Browser Settings",
    "appSettings.close": "Close",
    "appSettings.section.appearance": "Appearance",
    "appSettings.theme.label": "Theme",
    "appSettings.theme.light": "Light",
    "appSettings.theme.dark": "Dark",
    "appSettings.language.label": "Language",
    "appSettings.userAgentName.label": "Browser agent",
    "appSettings.userAgentName.placeholder": "stingtaoAI",
    "appSettings.userAgentName.hint":
      "Used as the User-Agent token for web requests. Takes effect on new navigations.",
    "appSettings.userAgentName.error.invalid":
      "Use letters, digits, ., _, -, optional /version (no spaces).",
    "appSettings.section.startup": "On startup",
    "appSettings.startup.aria": "Startup mode",
    "appSettings.startup.home": "Open the home page",
    "appSettings.startup.continue": "Continue where you left off (experimental)",
    "appSettings.startup.urls": "Open specific pages",
    "appSettings.startup.urlsPlaceholder": "One URL per line (http/https only)",
    "appSettings.startup.hint":
      "Tip: When \"Open specific pages\" is selected, these URLs will open at every startup.",
    "appSettings.section.home": "Home page",
    "appSettings.home.url": "URL",
    "appSettings.home.apply": "Apply",
    "appSettings.section.search": "Search engine",
    "appSettings.search.default": "Default",
    "appSettings.search.custom": "Custom",
    "appSettings.search.template": "Template",
    "appSettings.search.templateHint.prefix": "Custom templates must include ",
    "appSettings.search.templateHint.suffix": ", which will be replaced with the search query.",
    "appSettings.section.privacy": "Privacy",
    "appSettings.privacy.clearHistory": "Clear browsing data",
    "appSettings.privacy.clearHistoryConfirm": "Clear all browsing history?",
    "appSettings.section.import": "Import",
    "appSettings.import.chrome": "Import from Chrome",
    "appSettings.import.confirm": "Import settings from Chrome?",
    "appSettings.import.status.importing": "Importing…",
    "appSettings.import.status.imported": "Imported",
    "appSettings.import.status.importedPath": "Imported: {{path}}",

    "history.title": "History",
    "history.close": "Close",
    "history.search.label": "Search",
    "history.search.placeholder": "Search title or URL…",
    "history.clear": "Clear",
    "history.delete": "Delete",
    "history.empty": "No browsing history yet.",
    "history.empty.filtered": "No matching history entries.",

    "chromeImport.title": "Import settings from Chrome?",
    "chromeImport.close": "Close",
    "chromeImport.firstLaunch": "First launch",
    "chromeImport.intro":
      "You can import common settings from Chrome to make the experience feel familiar.",
    "chromeImport.item.home": "Home page URL",
    "chromeImport.item.search": "Default search engine",
    "chromeImport.item.startup": "Startup behavior (specific pages / continue session)",
    "chromeImport.skip": "Skip",
    "chromeImport.import": "Import",

    "error.aiChatStoreSave": "Failed to save AI conversation history",
    "error.promptsSave": "Failed to save prompts",
    "error.printFailed": "Print failed",
    "error.aiGeneric": "AI error",
    "error.emptyPrompt": "Empty prompt",
    "error.noActiveTab": "No active tab",

    "findInPage.prompt": "Find in page",
    "findInPage.inputPlaceholder": "Find in page…",
    "findInPage.inputLabel": "Find in page",
    "findInPage.prev": "Previous",
    "findInPage.next": "Next",
    "findInPage.close": "Close",
    "aiSettings.localModel.missing": "{{model}} (not downloaded or Ollama not installed)",
    "aiSettings.localModel.unavailable": "Ollama is not available (install/start Ollama, then click Refresh).",
    "aiSettings.localModel.noneInstalled": "No local models installed (use Pull to download one)."
  },
  es: {
    "tabs.scrollLeft": "Desplazar pestañas a la izquierda",
    "tabs.scrollRight": "Desplazar pestañas a la derecha",
    "tabs.label": "Pestañas",
    "tabs.new": "Nueva pestaña",
    "tabs.newTitle": "Nueva pestaña",
    "tabs.untitled": "Sin título",
    "tabs.close": "Cerrar pestaña",

    "nav.back": "Atrás",
    "nav.forward": "Adelante",
    "nav.reload": "Recargar",
    "nav.stop": "Detener",
    "nav.home": "Inicio",

    "address.placeholder": "Buscar o introducir dirección",
    "address.clear": "Borrar",
    "address.suggestions": "Sugerencias",

    "pageError.title": "No se puede acceder a este sitio",
    "pageError.retry": "Recargar",
    "pageError.copyUrl": "Copiar URL",

    "downloads.title": "Descargas",
    "downloads.openFolder": "Abrir carpeta de descargas",
    "downloads.close": "Cerrar descargas",
    "downloads.list": "Lista de descargas",
    "downloads.status.downloading": "Descargando…",
    "downloads.status.completed": "Completado",
    "downloads.status.cancelled": "Cancelado",
    "downloads.status.interrupted": "Falló",
    "downloads.action.open": "Abrir",
    "downloads.action.show": "Mostrar en carpeta",
    "downloads.action.cancel": "Cancelar",

    "ai.label": "Asistente de IA",
    "ai.settings": "Ajustes del asistente de IA",
    "ai.resize": "Cambiar tamaño del asistente de IA",
    "ai.close": "Cerrar asistente de IA",
    "ai.newConversation": "Nueva conversación",
    "ai.history": "Historial de conversaciones",
    "ai.history.title": "Historial de conversaciones",
    "ai.history.close": "Cerrar historial",
    "ai.agent.stop": "Detener agente",
    "ai.agent.stopped": "Agente detenido.",
    "ai.chat.stopped": "Detenido.",
    "ai.agent.steps.title": "Pasos del agente",
    "ai.history.list": "Lista de conversaciones",
    "ai.history.empty": "Aún no hay conversaciones.",
    "ai.history.count": "{{count}} mensajes",
    "ai.history.newConversationTitle": "Nueva conversación",
    "ai.chat.aria": "Conversación con IA",
    "ai.prompts.shortcuts": "Atajos de prompts",
    "ai.chat.placeholder": "Escribe un mensaje…",
    "ai.chat.send": "Enviar",
    "ai.chat.stop": "Detener",
    "ai.chat.sending": "Generando…",
    "ai.chat.copy": "Copiar",
    "ai.chat.copied": "Copiado",
    "ai.voice.button": "Entrada de voz",
    "ai.voice.listening": "Escuchando…",
    "ai.voice.transcribing": "Transcribiendo…",
    "ai.voice.error.notSupported": "La entrada de voz no es compatible con este entorno.",
    "ai.voice.error.micPermission": "Permiso de micrófono denegado.",
    "ai.voice.error.noGeminiKey": "La clave de Gemini API no está configurada. Abre ajustes de IA para añadirla.",
    "ai.meta.user": "Tú",
    "ai.meta.assistant": "IA",
    "ai.meta.stopped": "Detenido",
    "ai.meta.error": "Error",
    "ai.meta.provider.local": "Local",
    "ai.meta.provider.gemini": "Gemini",
    "ai.meta.provider.openai": "OpenAI-compatible",
    "ai.context.currentPage": "Contenido de la página actual",
    "ai.context.selection": "Selección",
    "ai.context.pageTitle": "Título de la página",
    "ai.context.url": "URL",
    "ai.context.attachedNote": "({{label}} está incluido en el contexto)",
    "ai.error.selectionMissing":
      "No hay texto seleccionado: selecciona texto en la página o cambia al modo \"Página completa\".",
    "ai.error.localModelMissing": "No hay un modelo local seleccionado. Instala uno en Ajustes de IA (Descargar) y selecciónalo.",
    "ai.systemPrompt":
      "Eres el asistente de IA del navegador del usuario. Responde utilizando el contexto de la página proporcionado. Responde en español.",

    "status.loading": "Cargando…",

    "aiSettings.title": "Ajustes del asistente de IA",
    "aiSettings.close": "Cerrar",
    "aiSettings.section.modelSource": "Origen del modelo",
    "aiSettings.section.agent": "Agente",
    "aiSettings.section.integrations": "Integraciones",
    "aiSettings.provider.label": "Proveedor",
    "aiSettings.provider.local": "Local (Ollama)",
    "aiSettings.provider.gemini": "Gemini API",
    "aiSettings.provider.openai": "OpenAI-compatible",
    "aiSettings.local.label": "Local",
    "aiSettings.refresh": "Actualizar",
    "aiSettings.pull.label": "Descargar",
    "aiSettings.pull.button": "Descargar modelo",
    "aiSettings.pull.downloading": "Descargando…",
    "aiSettings.gemini.model": "Modelo",
    "aiSettings.gemini.defaultModelOption": "gemini-2.5-flash (predeterminado)",
    "aiSettings.gemini.apiKey": "Clave API",
    "aiSettings.gemini.toggleKey": "Mostrar/Ocultar",
    "aiSettings.gemini.toggleKeyAria": "Mostrar u ocultar la clave API",
    "aiSettings.gemini.keyStatus.notSet": "No configurado",
    "aiSettings.gemini.keyStatus.env": "Configurado (variable de entorno GEMINI_API_KEY)",
    "aiSettings.gemini.keyStatus.savedEncrypted": "Guardado (cifrado)",
    "aiSettings.gemini.keyStatus.savedPlain": "Guardado (texto plano)",
    "aiSettings.gemini.keyStatus.saved": "Guardado",
    "aiSettings.gemini.keyStatus.notSetEncryptedAvailable": "No configurado (puedes guardarlo cifrado aquí)",
    "aiSettings.gemini.keyStatus.notSetNoEncryption":
      "No configurado (este dispositivo no puede cifrar; se guardará en texto plano)",
    "aiSettings.gemini.keyStatus.saving": "Guardando…",
    "aiSettings.gemini.keySave": "Guardar/Actualizar",
    "aiSettings.gemini.keySave.saving": "Guardando…",
    "aiSettings.gemini.keyClear": "Borrar",
    "aiSettings.gemini.keyClearConfirm": "¿Borrar la clave API de Gemini guardada?",
    "aiSettings.gemini.keyError.invalid":
      "Formato de clave API no válido. Pega la clave completa (a menudo empieza por AIza...).",

    "aiSettings.openai.baseUrl": "Base URL",
    "aiSettings.openai.model": "Modelo",
    "aiSettings.openai.apiKey": "Clave API",
    "aiSettings.openai.toggleKey": "Mostrar/Ocultar",
    "aiSettings.openai.toggleKeyAria": "Mostrar u ocultar la clave API",
    "aiSettings.openai.keyStatus.notSet": "No configurado",
    "aiSettings.openai.keyStatus.env": "Configurado (variable de entorno OPENAI_API_KEY)",
    "aiSettings.openai.keyStatus.savedEncrypted": "Guardado (cifrado)",
    "aiSettings.openai.keyStatus.savedPlain": "Guardado (texto plano)",
    "aiSettings.openai.keyStatus.saved": "Guardado",
    "aiSettings.openai.keyStatus.notSetEncryptedAvailable": "No configurado (puedes guardarlo cifrado aquí)",
    "aiSettings.openai.keyStatus.notSetNoEncryption":
      "No configurado (este dispositivo no puede cifrar; se guardará en texto plano)",
    "aiSettings.openai.keyStatus.saving": "Guardando…",
    "aiSettings.openai.keySave": "Guardar/Actualizar",
    "aiSettings.openai.keySave.saving": "Guardando…",
    "aiSettings.openai.keyClear": "Borrar",
    "aiSettings.openai.keyClearConfirm": "¿Borrar la clave API OpenAI-compatible guardada?",
    "aiSettings.openai.keyError.invalid": "Formato de clave API no válido.",

    "aiSettings.google.status.label": "Estado",
    "aiSettings.google.status.connected": "Conectado",
    "aiSettings.google.status.disconnected": "No conectado",
    "aiSettings.google.status.clientSecretSaved": "Secreto de cliente guardado",
    "aiSettings.google.status.refreshTokenSaved": "Token de actualización guardado",
    "aiSettings.google.clientId": "ID de cliente",
    "aiSettings.google.clientSecret": "Secreto de cliente",
    "aiSettings.google.scopes": "Permisos",
    "aiSettings.google.scope.sheets": "Google Sheets",
    "aiSettings.google.scope.docs": "Google Docs",
    "aiSettings.google.scope.slides": "Google Slides",
    "aiSettings.google.scope.driveFile": "Drive (archivos que creas/abres)",
    "aiSettings.google.saveClientId": "Guardar",
    "aiSettings.google.saveClientSecret": "Guardar",
    "aiSettings.google.toggleSecret": "Mostrar/Ocultar",
    "aiSettings.google.toggleSecretAria": "Mostrar u ocultar el secreto de cliente",
    "aiSettings.google.connect": "Conectar",
    "aiSettings.google.reconnect": "Reconectar",
    "aiSettings.google.connecting": "Conectando…",
    "aiSettings.google.disconnect": "Desconectar",
    "aiSettings.google.disconnectConfirm": "¿Desconectar Google OAuth? Puedes reconectar más tarde.",
    "aiSettings.google.clear": "Borrar",
    "aiSettings.google.clearConfirm":
      "¿Borrar el cliente y los tokens de Google OAuth? Tendrás que configurar el ID/secreto de cliente otra vez.",
    "aiSettings.google.hint":
      "Crea un cliente OAuth (Aplicación de escritorio) en Google Cloud Console. El URI de redirección será un localhost temporal.",

    "aiSettings.agent.mode": "Modo",
    "aiSettings.agent.mode.chat": "Chat",
    "aiSettings.agent.mode.browser": "Agente del navegador (Playwright)",
    "aiSettings.agent.confirm.label": "Acciones",
    "aiSettings.agent.confirm": "Pedir confirmación antes de actuar",
    "aiSettings.agent.maxSteps.label": "Máx. pasos",

    "aiSettings.section.context": "Contexto",
    "aiSettings.context.label": "Contenido",
    "aiSettings.context.auto": "Automático (usar selección cuando exista)",
    "aiSettings.context.selection": "Solo selección",
    "aiSettings.context.page": "Texto de la página completa",

    "aiSettings.section.appearance": "Apariencia",
    "aiSettings.fontSize.label": "Tamaño de fuente",
    "aiSettings.fontSize.1": "Más pequeño",
    "aiSettings.fontSize.2": "Pequeño",
    "aiSettings.fontSize.3": "Estándar",
    "aiSettings.fontSize.4": "Grande",
    "aiSettings.fontSize.5": "Más grande",

    "aiSettings.section.voice": "Entrada de voz",
    "aiSettings.voice.model": "Modelo",
    "aiSettings.voice.hint": "Requiere una clave de Gemini API; voz a texto en tiempo real (Gemini Live).",

    "aiSettings.section.prompts": "Prompts",
    "aiSettings.prompt.label": "Prompt",
    "aiSettings.prompt.name": "Nombre",
    "aiSettings.prompt.namePlaceholder": "Nombre del prompt",
    "aiSettings.prompt.id": "ID",
    "aiSettings.prompt.pageContent": "Contenido de la página",
    "aiSettings.prompt.includeContent": "Incluir contenido de la página actual",
    "aiSettings.prompt.add": "Añadir",
    "aiSettings.prompt.save": "Guardar",
    "aiSettings.prompt.delete": "Eliminar",
    "aiSettings.prompt.reset": "Restablecer predeterminados",
    "aiSettings.prompt.templatePlaceholder": "Edita aquí la plantilla del prompt…",

    "prompts.add.title": "Nombre del nuevo prompt",
    "prompts.add.defaultName": "Nuevo prompt",
    "prompts.add.defaultTemplate": "Escribe aquí la plantilla del prompt…",
    "prompts.delete.confirm": "¿Eliminar el prompt \"{{name}}\"?",
    "prompts.reset.confirm": "¿Restablecer los prompts a los predeterminados?",

    "appSettings.title": "Ajustes del navegador",
    "appSettings.close": "Cerrar",
    "appSettings.section.appearance": "Apariencia",
    "appSettings.theme.label": "Tema",
    "appSettings.theme.light": "Claro",
    "appSettings.theme.dark": "Oscuro",
    "appSettings.language.label": "Idioma",
    "appSettings.userAgentName.label": "Agente del navegador",
    "appSettings.userAgentName.placeholder": "stingtaoAI",
    "appSettings.userAgentName.hint":
      "Se usa como token de User-Agent para solicitudes web. Se aplica en nuevas navegaciones.",
    "appSettings.userAgentName.error.invalid":
      "Usa letras, números, ., _, -, /versión opcional (sin espacios).",
    "appSettings.section.startup": "Al iniciar",
    "appSettings.startup.aria": "Modo de inicio",
    "appSettings.startup.home": "Abrir la página de inicio",
    "appSettings.startup.continue": "Continuar donde lo dejaste (experimental)",
    "appSettings.startup.urls": "Abrir páginas específicas",
    "appSettings.startup.urlsPlaceholder": "Una URL por línea (solo http/https)",
    "appSettings.startup.hint":
      "Consejo: Cuando se selecciona \"Abrir páginas específicas\", estas URLs se abrirán en cada inicio.",
    "appSettings.section.home": "Página de inicio",
    "appSettings.home.url": "URL",
    "appSettings.home.apply": "Aplicar",
    "appSettings.section.search": "Motor de búsqueda",
    "appSettings.search.default": "Predeterminado",
    "appSettings.search.custom": "Personalizado",
    "appSettings.search.template": "Plantilla",
    "appSettings.search.templateHint.prefix": "Las plantillas personalizadas deben incluir ",
    "appSettings.search.templateHint.suffix": ", que se reemplazará por la consulta.",
    "appSettings.section.privacy": "Privacidad",
    "appSettings.privacy.clearHistory": "Borrar historial de navegación",
    "appSettings.privacy.clearHistoryConfirm": "¿Borrar todo el historial de navegación?",
    "appSettings.section.import": "Importar",
    "appSettings.import.chrome": "Importar desde Chrome",
    "appSettings.import.confirm": "¿Importar ajustes desde Chrome?",
    "appSettings.import.status.importing": "Importando…",
    "appSettings.import.status.imported": "Importado",
    "appSettings.import.status.importedPath": "Importado: {{path}}",

    "history.title": "Historial",
    "history.close": "Cerrar",
    "history.search.label": "Buscar",
    "history.search.placeholder": "Buscar título o URL…",
    "history.clear": "Borrar",
    "history.delete": "Eliminar",
    "history.empty": "Aún no hay historial.",
    "history.empty.filtered": "No hay entradas que coincidan.",

    "chromeImport.title": "¿Importar ajustes desde Chrome?",
    "chromeImport.close": "Cerrar",
    "chromeImport.firstLaunch": "Primer inicio",
    "chromeImport.intro":
      "Puedes importar ajustes comunes de Chrome para que la experiencia sea familiar.",
    "chromeImport.item.home": "URL de la página de inicio",
    "chromeImport.item.search": "Motor de búsqueda predeterminado",
    "chromeImport.item.startup": "Comportamiento al iniciar (páginas específicas / continuar sesión)",
    "chromeImport.skip": "Omitir",
    "chromeImport.import": "Importar",

    "error.aiChatStoreSave": "No se pudo guardar el historial de conversaciones de IA",
    "error.promptsSave": "No se pudieron guardar los prompts",
    "error.printFailed": "Error al imprimir",
    "error.aiGeneric": "Error de IA",
    "error.emptyPrompt": "Prompt vacío",
    "error.noActiveTab": "No hay pestaña activa",

    "findInPage.prompt": "Buscar en la página",
    "findInPage.inputPlaceholder": "Buscar en la página…",
    "findInPage.inputLabel": "Buscar en la página",
    "findInPage.prev": "Anterior",
    "findInPage.next": "Siguiente",
    "findInPage.close": "Cerrar",
    "aiSettings.localModel.missing": "{{model}} (no descargado o Ollama no instalado)",
    "aiSettings.localModel.unavailable": "Ollama no está disponible (instala/inicia Ollama y luego pulsa Actualizar).",
    "aiSettings.localModel.noneInstalled": "No hay modelos locales instalados (usa Descargar para instalar uno)."
  },
  "zh-TW": {
    "tabs.scrollLeft": "向左捲動分頁",
    "tabs.scrollRight": "向右捲動分頁",
    "tabs.label": "分頁",
    "tabs.new": "新增分頁",
    "tabs.newTitle": "新增分頁",
    "tabs.untitled": "未命名",
    "tabs.close": "關閉分頁",

    "nav.back": "上一頁",
    "nav.forward": "下一頁",
    "nav.reload": "重新載入",
    "nav.stop": "停止",
    "nav.home": "首頁",

    "address.placeholder": "搜尋或輸入網址",
    "address.clear": "清除",
    "address.suggestions": "建議",

    "pageError.title": "無法連上這個網站",
    "pageError.retry": "重新載入",
    "pageError.copyUrl": "複製網址",

    "downloads.title": "下載",
    "downloads.openFolder": "開啟下載資料夾",
    "downloads.close": "關閉下載列",
    "downloads.list": "下載列表",
    "downloads.status.downloading": "下載中…",
    "downloads.status.completed": "已完成",
    "downloads.status.cancelled": "已取消",
    "downloads.status.interrupted": "下載失敗",
    "downloads.action.open": "開啟",
    "downloads.action.show": "在資料夾中顯示",
    "downloads.action.cancel": "取消",

    "ai.label": "AI Assistant",
    "ai.settings": "AI Assistant 設定",
    "ai.resize": "調整 AI Assistant 寬度",
    "ai.close": "關閉 AI Assistant",
    "ai.newConversation": "新增對話",
    "ai.history": "對話紀錄",
    "ai.history.title": "對話紀錄",
    "ai.history.close": "關閉紀錄",
    "ai.agent.stop": "停止代理",
    "ai.agent.stopped": "代理已停止。",
    "ai.chat.stopped": "已停止。",
    "ai.agent.steps.title": "代理步驟",
    "ai.history.list": "對話列表",
    "ai.history.empty": "尚無對話紀錄。",
    "ai.history.count": "{{count}} 則",
    "ai.history.newConversationTitle": "新對話",
    "ai.chat.aria": "AI 對話",
    "ai.prompts.shortcuts": "Prompt 快捷鍵",
	    "ai.chat.placeholder": "輸入訊息…",
	    "ai.chat.send": "送出",
	    "ai.chat.stop": "停止",
	    "ai.chat.sending": "生成中...",
	    "ai.chat.copy": "複製",
	    "ai.chat.copied": "已複製",
	    "ai.voice.button": "語音輸入",
    "ai.voice.listening": "錄音中…",
    "ai.voice.transcribing": "轉文字中…",
    "ai.voice.error.notSupported": "目前環境不支援語音輸入。",
    "ai.voice.error.micPermission": "麥克風權限被拒絕。",
    "ai.voice.error.noGeminiKey": "尚未設定 Gemini API Key，請先到 AI 設定新增。",
    "ai.meta.user": "你",
    "ai.meta.assistant": "AI",
    "ai.meta.stopped": "已停止",
    "ai.meta.error": "錯誤",
    "ai.meta.provider.local": "本地",
    "ai.meta.provider.gemini": "Gemini",
    "ai.meta.provider.openai": "OpenAI 相容",
    "ai.context.currentPage": "目前網頁內容",
    "ai.context.selection": "選取文字",
    "ai.context.pageTitle": "頁面標題",
    "ai.context.url": "網址",
	    "ai.context.attachedNote": "（{{label}} 已附在上下文）",
	    "ai.error.selectionMissing": "尚未選取文字：請先在頁面上選取一段文字，或改用「整頁文字」模式。",
	    "ai.error.localModelMissing": "尚未選擇本機模型。請到 AI Assistant 設定下載並選擇一個 Ollama 模型。",
	    "ai.systemPrompt": "你是使用者的瀏覽器 AI 助手。請根據使用者提供的網頁上下文回答問題。請使用繁體中文回答。",

    "status.loading": "載入中…",

    "aiSettings.title": "AI Assistant 設定",
    "aiSettings.close": "關閉",
    "aiSettings.section.modelSource": "模型來源",
    "aiSettings.section.agent": "代理",
    "aiSettings.section.integrations": "整合",
    "aiSettings.provider.label": "Provider",
    "aiSettings.provider.local": "Local (Ollama)",
    "aiSettings.provider.gemini": "Gemini API",
    "aiSettings.provider.openai": "OpenAI 相容",
    "aiSettings.local.label": "Local",
    "aiSettings.refresh": "刷新",
    "aiSettings.pull.label": "Pull",
    "aiSettings.pull.button": "下載模型",
    "aiSettings.pull.downloading": "下載中...",
    "aiSettings.gemini.model": "Model",
    "aiSettings.gemini.defaultModelOption": "gemini-2.5-flash (預設)",
    "aiSettings.gemini.apiKey": "API Key",
    "aiSettings.gemini.toggleKey": "顯示/隱藏",
    "aiSettings.gemini.toggleKeyAria": "切換 API Key 顯示",
    "aiSettings.gemini.keyStatus.notSet": "尚未設定",
    "aiSettings.gemini.keyStatus.env": "已設定（環境變數 GEMINI_API_KEY）",
    "aiSettings.gemini.keyStatus.savedEncrypted": "已儲存（加密）",
    "aiSettings.gemini.keyStatus.savedPlain": "已儲存（明文）",
    "aiSettings.gemini.keyStatus.saved": "已儲存",
    "aiSettings.gemini.keyStatus.notSetEncryptedAvailable": "尚未設定（可於此處加密儲存）",
    "aiSettings.gemini.keyStatus.notSetNoEncryption": "尚未設定（此裝置無法加密，將以明文儲存）",
    "aiSettings.gemini.keyStatus.saving": "儲存中...",
    "aiSettings.gemini.keySave": "儲存/更新",
    "aiSettings.gemini.keySave.saving": "儲存中...",
    "aiSettings.gemini.keyClear": "清除",
    "aiSettings.gemini.keyClearConfirm": "確定清除已儲存的 Gemini API Key？",
    "aiSettings.gemini.keyError.invalid": "API Key 格式不正確，請貼上完整 key（通常以 AIza... 開頭）。",

    "aiSettings.openai.baseUrl": "Base URL",
    "aiSettings.openai.model": "Model",
    "aiSettings.openai.apiKey": "API Key",
    "aiSettings.openai.toggleKey": "顯示/隱藏",
    "aiSettings.openai.toggleKeyAria": "切換 API Key 顯示",
    "aiSettings.openai.keyStatus.notSet": "尚未設定",
    "aiSettings.openai.keyStatus.env": "已設定（環境變數 OPENAI_API_KEY）",
    "aiSettings.openai.keyStatus.savedEncrypted": "已儲存（加密）",
    "aiSettings.openai.keyStatus.savedPlain": "已儲存（明文）",
    "aiSettings.openai.keyStatus.saved": "已儲存",
    "aiSettings.openai.keyStatus.notSetEncryptedAvailable": "尚未設定（可於此處加密儲存）",
    "aiSettings.openai.keyStatus.notSetNoEncryption": "尚未設定（此裝置無法加密，將以明文儲存）",
    "aiSettings.openai.keyStatus.saving": "儲存中...",
    "aiSettings.openai.keySave": "儲存/更新",
    "aiSettings.openai.keySave.saving": "儲存中...",
    "aiSettings.openai.keyClear": "清除",
    "aiSettings.openai.keyClearConfirm": "確定清除已儲存的 OpenAI 相容 API Key？",
    "aiSettings.openai.keyError.invalid": "API Key 格式不正確。",

    "aiSettings.google.status.label": "狀態",
    "aiSettings.google.status.connected": "已連結",
    "aiSettings.google.status.disconnected": "未連結",
    "aiSettings.google.status.clientSecretSaved": "已儲存 Client Secret",
    "aiSettings.google.status.refreshTokenSaved": "已儲存 Refresh Token",
    "aiSettings.google.clientId": "Client ID",
    "aiSettings.google.clientSecret": "Client Secret",
    "aiSettings.google.scopes": "權限",
    "aiSettings.google.scope.sheets": "Google Sheets",
    "aiSettings.google.scope.docs": "Google Docs",
    "aiSettings.google.scope.slides": "Google Slides",
    "aiSettings.google.scope.driveFile": "Drive（你建立/開啟的檔案）",
    "aiSettings.google.saveClientId": "儲存",
    "aiSettings.google.saveClientSecret": "儲存",
    "aiSettings.google.toggleSecret": "顯示/隱藏",
    "aiSettings.google.toggleSecretAria": "切換 Client Secret 顯示",
    "aiSettings.google.connect": "連結",
    "aiSettings.google.reconnect": "重新連結",
    "aiSettings.google.connecting": "連結中...",
    "aiSettings.google.disconnect": "解除連結",
    "aiSettings.google.disconnectConfirm": "確定要解除 Google OAuth 連結？之後可以重新連結。",
    "aiSettings.google.clear": "清除",
    "aiSettings.google.clearConfirm": "清除 Google OAuth Client 與 token？之後需要重新設定 Client ID/Secret。",
    "aiSettings.google.hint": "請在 Google Cloud Console 建立 OAuth client（桌面應用程式）。Redirect URI 會使用暫時的 localhost URL。",

    "aiSettings.agent.mode": "模式",
    "aiSettings.agent.mode.chat": "Chat",
    "aiSettings.agent.mode.browser": "瀏覽器代理（Playwright）",
    "aiSettings.agent.confirm.label": "動作",
    "aiSettings.agent.confirm": "執行前先詢問確認",
    "aiSettings.agent.maxSteps.label": "最大步數",

    "aiSettings.section.context": "上下文",
    "aiSettings.context.label": "內容",
    "aiSettings.context.auto": "自動（有選取先用選取）",
    "aiSettings.context.selection": "只用選取文字",
    "aiSettings.context.page": "整頁文字",

    "aiSettings.section.appearance": "外觀",
    "aiSettings.fontSize.label": "字體",
    "aiSettings.fontSize.1": "最小",
    "aiSettings.fontSize.2": "小",
    "aiSettings.fontSize.3": "標準",
    "aiSettings.fontSize.4": "大",
    "aiSettings.fontSize.5": "最大",

    "aiSettings.section.voice": "語音輸入",
    "aiSettings.voice.model": "模型",
    "aiSettings.voice.hint": "需要 Gemini API Key；即時語音轉文字（Gemini Live）。",

    "aiSettings.section.prompts": "Prompts",
    "aiSettings.prompt.label": "Prompt",
    "aiSettings.prompt.name": "名稱",
    "aiSettings.prompt.namePlaceholder": "Prompt 名稱",
    "aiSettings.prompt.id": "ID",
    "aiSettings.prompt.pageContent": "網頁內容",
    "aiSettings.prompt.includeContent": "附帶目前網頁內容",
    "aiSettings.prompt.add": "新增",
    "aiSettings.prompt.save": "儲存",
    "aiSettings.prompt.delete": "刪除",
    "aiSettings.prompt.reset": "重置預設",
    "aiSettings.prompt.templatePlaceholder": "可在這裡改寫 prompt...",

    "prompts.add.title": "新 Prompt 名稱",
    "prompts.add.defaultName": "新 Prompt",
    "prompts.add.defaultTemplate": "請輸入你的 prompt 模板…",
    "prompts.delete.confirm": "確定刪除 Prompt「{{name}}」？",
    "prompts.reset.confirm": "重置後將回到預設 prompts，確定？",

    "appSettings.title": "瀏覽器設定",
    "appSettings.close": "關閉",
    "appSettings.section.appearance": "外觀",
    "appSettings.theme.label": "主題",
    "appSettings.theme.light": "淺色",
    "appSettings.theme.dark": "深色",
    "appSettings.language.label": "語系",
    "appSettings.userAgentName.label": "瀏覽器 Agent",
    "appSettings.userAgentName.placeholder": "stingtaoAI",
    "appSettings.userAgentName.hint": "用於網頁請求的 User-Agent token，會在新的導覽生效。",
    "appSettings.userAgentName.error.invalid": "請使用英數與 . _ -（可選 /版本），不可包含空白。",
    "appSettings.section.startup": "啟動時",
    "appSettings.startup.aria": "啟動模式",
    "appSettings.startup.home": "開啟首頁",
    "appSettings.startup.continue": "繼續上次瀏覽（實驗性）",
    "appSettings.startup.urls": "開啟特定頁面",
    "appSettings.startup.urlsPlaceholder": "每行一個網址（僅支援 https/http）",
    "appSettings.startup.hint": "提示：選擇「開啟特定頁面」時，會在每次啟動開啟這些網址。",
    "appSettings.section.home": "首頁",
    "appSettings.home.url": "網址",
    "appSettings.home.apply": "套用",
    "appSettings.section.search": "搜尋引擎",
    "appSettings.search.default": "預設",
    "appSettings.search.custom": "自訂",
    "appSettings.search.template": "模板",
    "appSettings.search.templateHint.prefix": "自訂模板需包含 ",
    "appSettings.search.templateHint.suffix": "，會自動用關鍵字取代。",
    "appSettings.section.privacy": "隱私",
    "appSettings.privacy.clearHistory": "清除瀏覽紀錄",
    "appSettings.privacy.clearHistoryConfirm": "確定清除所有瀏覽紀錄？",
    "appSettings.section.import": "匯入",
    "appSettings.import.chrome": "從 Chrome 匯入",
    "appSettings.import.confirm": "確定從 Chrome 匯入設定？",
    "appSettings.import.status.importing": "匯入中...",
    "appSettings.import.status.imported": "已匯入",
    "appSettings.import.status.importedPath": "已匯入：{{path}}",

    "history.title": "歷史紀錄",
    "history.close": "關閉",
    "history.search.label": "搜尋",
    "history.search.placeholder": "搜尋標題或網址...",
    "history.clear": "清除",
    "history.delete": "刪除",
    "history.empty": "尚無瀏覽歷史紀錄。",
    "history.empty.filtered": "找不到符合的歷史紀錄。",

    "chromeImport.title": "從 Chrome 匯入設定？",
    "chromeImport.close": "關閉",
    "chromeImport.firstLaunch": "第一次啟動",
    "chromeImport.intro": "你可以從 Chrome 匯入常用設定，讓使用體驗更接近原本的瀏覽器。",
    "chromeImport.item.home": "首頁網址",
    "chromeImport.item.search": "預設搜尋引擎",
    "chromeImport.item.startup": "啟動時行為（開啟特定頁面/繼續上次瀏覽）",
    "chromeImport.skip": "略過",
    "chromeImport.import": "匯入",

    "error.aiChatStoreSave": "無法儲存 AI 對話紀錄",
    "error.promptsSave": "無法儲存 prompts",
    "error.printFailed": "列印失敗",
    "error.aiGeneric": "AI 發生錯誤",
    "error.emptyPrompt": "Prompt 為空",
    "error.noActiveTab": "沒有作用中的分頁",

    "findInPage.prompt": "在頁面中搜尋",
    "findInPage.inputPlaceholder": "在頁面中搜尋…",
    "findInPage.inputLabel": "在頁面中搜尋",
    "findInPage.prev": "上一個",
    "findInPage.next": "下一個",
    "findInPage.close": "關閉",
	    "aiSettings.localModel.missing": "{{model}}（未下載/或未安裝 Ollama）",
	    "aiSettings.localModel.unavailable": "Ollama 不可用（請安裝/啟動 Ollama 後按重新整理）。",
	    "aiSettings.localModel.noneInstalled": "尚未安裝本機模型（請使用下載來安裝）。"
	  }
};

function interpolateI18n(text, params) {
  const input = String(text ?? "");
  if (!params || typeof params !== "object") return input;
  return input.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
    const value = params[key];
    return value == null ? "" : String(value);
  });
}

function t(key, params) {
  const lang = SUPPORTED_UI_LANGUAGES.includes(uiLanguage) ? uiLanguage : "en";
  const dict = UI_I18N[lang] || UI_I18N.en;
  const fallback = UI_I18N.en || {};
  const value = dict[key] ?? fallback[key] ?? String(key);
  if (typeof value === "function") return value(params);
  return interpolateI18n(value, params);
}

function applyI18nToDom() {
  document.documentElement.lang = uiLanguage;
  for (const el of document.querySelectorAll("[data-i18n]")) {
    const key = el.dataset.i18n;
    if (!key) continue;
    el.textContent = t(key);
  }
  for (const el of document.querySelectorAll("[data-i18n-attrs]")) {
    const raw = el.dataset.i18nAttrs;
    if (!raw) continue;
    const pairs = raw
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    for (const pair of pairs) {
      const [attr, k] = pair.split(":").map((x) => x.trim());
      if (!attr || !k) continue;
      el.setAttribute(attr, t(k));
    }
  }
}

function setUiLanguage(nextLanguage) {
  const next = resolveUiLanguage(nextLanguage);
  const prev = uiLanguage;
  if (next === uiLanguage) {
    applyI18nToDom();
    return;
  }
  uiLanguage = next;
  if (languageSelect && Array.from(languageSelect.options).some((o) => o.value === uiLanguage)) {
    languageSelect.value = uiLanguage;
  }
  applyI18nToDom();

  for (const btn of Array.from(tabStrip.querySelectorAll(".tabClose"))) {
    btn.title = t("tabs.close");
    btn.setAttribute("aria-label", t("tabs.close"));
  }

  if (hasLoadedPrompts) {
    const selectedId = promptSelect?.value || null;
    const fromLang = promptsStorageLanguage || prev;
    prompts = syncDefaultPromptsForLanguageChange(prompts, fromLang, uiLanguage);
    promptsStorageLanguage = uiLanguage;
    persistPromptsToStorage(prompts);
    renderPromptSelect(selectedId);
  }

  syncAiContext();
  updateLoadingUI();
  updateStatusMeta();
  renderDownloadsShelf();
  renderHistoryList();
  if (isAiHistoryOpen) renderAiConversationHistoryList();
  setChatSending(isSendingChat);

	  syncGeminiKeySaveState();
	  if (!aiSettingsModal.classList.contains("hidden")) {
	    loadAiSettings();
	  }
	  syncUserAgentNameInputState();
	}

const tabStrip = document.getElementById("tabStrip");
const newTabBtn = document.getElementById("newTabBtn");
const tabsScrollLeftBtn = document.getElementById("tabsScrollLeftBtn");
const tabsScrollRightBtn = document.getElementById("tabsScrollRightBtn");
const webviewArea = document.getElementById("webviewArea");
const findBar = document.getElementById("findBar");
const findInput = document.getElementById("findInput");
const findMatchCount = document.getElementById("findMatchCount");
const findPrevBtn = document.getElementById("findPrevBtn");
const findNextBtn = document.getElementById("findNextBtn");
const findCloseBtn = document.getElementById("findCloseBtn");
const loadErrorOverlay = document.getElementById("loadErrorOverlay");
const loadErrorTitle = document.getElementById("loadErrorTitle");
const loadErrorUrl = document.getElementById("loadErrorUrl");
const loadErrorMessage = document.getElementById("loadErrorMessage");
const loadErrorRetryBtn = document.getElementById("loadErrorRetryBtn");
const loadErrorCopyBtn = document.getElementById("loadErrorCopyBtn");

const urlInput = document.getElementById("urlInput");
const clearUrlBtn = document.getElementById("clearUrlBtn");
const suggestionsEl = document.getElementById("suggestions");
const addressStatusIcon = document.getElementById("addressStatusIcon");
const backBtn = document.getElementById("backBtn");
const forwardBtn = document.getElementById("forwardBtn");
const reloadBtn = document.getElementById("reloadBtn");
const homeBtn = document.getElementById("homeBtn");
const downloadsFolderBtn = document.getElementById("downloadsFolderBtn");
const downloadsBadge = document.getElementById("downloadsBadge");
const aiToggleBtn = document.getElementById("aiToggleBtn");
const aiSettingsBtn = document.getElementById("aiSettingsBtn");
const aiPanel = document.getElementById("aiPanel");
const aiCloseBtn = document.getElementById("aiCloseBtn");
const aiNewConversationBtn = document.getElementById("aiNewConversationBtn");
const aiHistoryBtn = document.getElementById("aiHistoryBtn");
const aiHistoryDrawer = document.getElementById("aiHistoryDrawer");
const aiHistoryCloseBtn = document.getElementById("aiHistoryCloseBtn");
const aiHistoryList = document.getElementById("aiHistoryList");
const aiContextTitle = document.getElementById("aiContextTitle");
const aiContextUrl = document.getElementById("aiContextUrl");
const aiChatMessages = document.getElementById("aiChatMessages");
const promptShortcuts = document.getElementById("promptShortcuts");
const chatInput = document.getElementById("chatInput");
const chatMicBtn = document.getElementById("chatMicBtn");
const chatSendBtn = document.getElementById("chatSendBtn");
const aiAgentStopBtn = document.getElementById("aiAgentStopBtn");
const aiSettingsModal = document.getElementById("aiSettingsModal");
const aiSettingsCloseBtn = document.getElementById("aiSettingsCloseBtn");
const appSettingsModal = document.getElementById("appSettingsModal");
const appSettingsCloseBtn = document.getElementById("appSettingsCloseBtn");
const themeSelect = document.getElementById("themeSelect");
const languageSelect = document.getElementById("languageSelect");
const userAgentNameInput = document.getElementById("userAgentNameInput");
const userAgentNameHint = document.getElementById("userAgentNameHint");
const userAgentNameErrorRow = document.getElementById("userAgentNameErrorRow");
const userAgentNameError = document.getElementById("userAgentNameError");
const startupModeGroup = document.getElementById("startupModeGroup");
const startupUrlsInput = document.getElementById("startupUrlsInput");
const homePageInput = document.getElementById("homePageInput");
const saveHomePageBtn = document.getElementById("saveHomePageBtn");
const searchEngineSelect = document.getElementById("searchEngineSelect");
const searchEngineTemplateRow = document.getElementById("searchEngineTemplateRow");
const searchEngineTemplateInput = document.getElementById("searchEngineTemplateInput");
const saveSearchTemplateBtn = document.getElementById("saveSearchTemplateBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const importChromeBtn = document.getElementById("importChromeBtn");
const importChromeStatus = document.getElementById("importChromeStatus");
const historyModal = document.getElementById("historyModal");
const historyCloseBtn = document.getElementById("historyCloseBtn");
const historySearchInput = document.getElementById("historySearchInput");
const historyClearBtn = document.getElementById("historyClearBtn");
const historyList = document.getElementById("historyList");
const chromeImportModal = document.getElementById("chromeImportModal");
const chromeImportCloseBtn = document.getElementById("chromeImportCloseBtn");
const chromeImportSkipBtn = document.getElementById("chromeImportSkipBtn");
const chromeImportConfirmBtn = document.getElementById("chromeImportConfirmBtn");
const chromeImportHint = document.getElementById("chromeImportHint");
const aiResizeHandle = document.getElementById("aiResizeHandle");
const dragShield = document.getElementById("dragShield");
const loadingBar = document.getElementById("loadingBar");
const statusTextEl = document.getElementById("statusText");
const statusMetaEl = document.getElementById("statusMeta");
const downloadsShelf = document.getElementById("downloadsShelf");
const downloadsShelfOpenFolderBtn = document.getElementById("downloadsShelfOpenFolderBtn");
const downloadsShelfCloseBtn = document.getElementById("downloadsShelfCloseBtn");
const downloadsList = document.getElementById("downloadsList");

const contextModeSelect = document.getElementById("contextModeSelect");
contextModeSelect.addEventListener("change", () => persistAiAssistantOptions());
const providerSelect = document.getElementById("providerSelect");
const aiModeSelect = document.getElementById("aiModeSelect");
const agentConfirmCheckbox = document.getElementById("agentConfirmCheckbox");
const agentMaxStepsInput = document.getElementById("agentMaxStepsInput");
aiModeSelect?.addEventListener("change", () => persistAiAssistantOptions());
agentConfirmCheckbox?.addEventListener("change", () => persistAiAssistantOptions());
agentMaxStepsInput?.addEventListener("change", () => {
  if (agentMaxStepsInput) agentMaxStepsInput.value = String(clampAgentMaxSteps(agentMaxStepsInput.value));
  persistAiAssistantOptions();
});
const localModelSelect = document.getElementById("localModelSelect");
localModelSelect.addEventListener("change", () => persistAiAssistantOptions());
const refreshModelsBtn = document.getElementById("refreshModelsBtn");
const pullModelInput = document.getElementById("pullModelInput");
const pullModelBtn = document.getElementById("pullModelBtn");
const localModelRow = document.getElementById("localModelRow");
const pullModelRow = document.getElementById("pullModelRow");
const geminiRow = document.getElementById("geminiRow");
const geminiModelSelect = document.getElementById("geminiModelSelect");
const geminiApiKeyInput = document.getElementById("geminiApiKeyInput");
const toggleGeminiKeyBtn = document.getElementById("toggleGeminiKeyBtn");
const saveGeminiKeyBtn = document.getElementById("saveGeminiKeyBtn");
const clearGeminiKeyBtn = document.getElementById("clearGeminiKeyBtn");
const geminiKeyStatus = document.getElementById("geminiKeyStatus");
const geminiKeyErrorRow = document.getElementById("geminiKeyErrorRow");
const geminiKeyError = document.getElementById("geminiKeyError");
const openAiRow = document.getElementById("openAiRow");
const openAiBaseUrlInput = document.getElementById("openAiBaseUrlInput");
const openAiModelInput = document.getElementById("openAiModelInput");
const openAiApiKeyInput = document.getElementById("openAiApiKeyInput");
const toggleOpenAiKeyBtn = document.getElementById("toggleOpenAiKeyBtn");
const saveOpenAiKeyBtn = document.getElementById("saveOpenAiKeyBtn");
const clearOpenAiKeyBtn = document.getElementById("clearOpenAiKeyBtn");
	const openAiKeyStatus = document.getElementById("openAiKeyStatus");
	const openAiKeyErrorRow = document.getElementById("openAiKeyErrorRow");
	const openAiKeyError = document.getElementById("openAiKeyError");

  const googleOauthStatus = document.getElementById("googleOauthStatus");
  const googleOauthClientIdInput = document.getElementById("googleOauthClientIdInput");
  const googleOauthSaveClientIdBtn = document.getElementById("googleOauthSaveClientIdBtn");
  const googleOauthClientSecretInput = document.getElementById("googleOauthClientSecretInput");
  const toggleGoogleOauthSecretBtn = document.getElementById("toggleGoogleOauthSecretBtn");
  const googleOauthSaveClientSecretBtn = document.getElementById("googleOauthSaveClientSecretBtn");
  const googleOauthConnectBtn = document.getElementById("googleOauthConnectBtn");
  const googleOauthDisconnectBtn = document.getElementById("googleOauthDisconnectBtn");
  const googleOauthClearBtn = document.getElementById("googleOauthClearBtn");
  const googleOauthScopeInputs = Array.from(document.querySelectorAll('input[name="googleOauthScope"]'));

const aiFontSizeSelect = document.getElementById("aiFontSizeSelect");
const voiceModelSelect = document.getElementById("voiceModelSelect");

const promptSelect = document.getElementById("promptSelect");
const promptNameInput = document.getElementById("promptNameInput");
const promptIdInput = document.getElementById("promptIdInput");
const promptIncludeContentCheckbox = document.getElementById("promptIncludeContentCheckbox");
const addPromptBtn = document.getElementById("addPromptBtn");
const savePromptBtn = document.getElementById("savePromptBtn");
const deletePromptBtn = document.getElementById("deletePromptBtn");
const resetPromptsBtn = document.getElementById("resetPromptsBtn");
	const customPromptInput = document.getElementById("customPromptInput");
	
	const DEFAULT_LOCAL_MODEL = "MaziyarPanahi/calme-3.2-instruct-78b";
	const DEFAULT_VOICE_MODEL = "gemini-2.5-flash-native-audio-preview-12-2025";
	  const DEFAULT_GOOGLE_OAUTH_SCOPES = [
	    "https://www.googleapis.com/auth/spreadsheets",
	    "https://www.googleapis.com/auth/documents",
	    "https://www.googleapis.com/auth/presentations"
	  ];

	  const AGENT_CONTROL_UI_STYLE_ID = "sting-agent-control-ui-style";
	  const AGENT_CONTROL_UI_ROOT_ID = "sting-agent-control-ui-root";
	  const AGENT_CONTROL_UI_CURSOR_SVG =
	    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
	    '<path d="M5 3 L19 16 L13 16 L15.6 22 L12.7 23 L10 16.7 L6.7 20 Z" fill="rgba(255,255,255,0.96)" stroke="rgba(0,0,0,0.65)" stroke-width="1.2" stroke-linejoin="round"/>' +
	    "</svg>";
	  const AGENT_CONTROL_UI_CSS = `
	    #${AGENT_CONTROL_UI_ROOT_ID} {
	      position: fixed;
	      inset: 0;
	      z-index: 2147483647;
	      pointer-events: none;
	      display: none;
	      contain: layout style paint;
	      --sting-agent-flicker-alpha: 0.06;
	      --sting-agent-jitter-x: 0px;
	      --sting-agent-jitter-y: 0px;
	      --sting-agent-cursor-x: 16px;
	      --sting-agent-cursor-y: 16px;
	    }
	    #${AGENT_CONTROL_UI_ROOT_ID}[data-enabled="true"] { display: block; }
	    #${AGENT_CONTROL_UI_ROOT_ID} .stingAgentFlicker {
	      position: absolute;
	      inset: 0;
	      opacity: var(--sting-agent-flicker-alpha);
	      transform: translate3d(var(--sting-agent-jitter-x), var(--sting-agent-jitter-y), 0);
	      background:
	        repeating-linear-gradient(
	          180deg,
	          rgba(0,0,0,0.00) 0px,
	          rgba(0,0,0,0.00) 2px,
	          rgba(0,0,0,0.035) 3px,
	          rgba(0,0,0,0.00) 7px
	        );
	      mix-blend-mode: overlay;
	      animation: stingAgentScan 1.7s linear infinite;
	      will-change: opacity, transform;
	    }
	    #${AGENT_CONTROL_UI_ROOT_ID} .stingAgentFlicker::before {
	      content: "";
	      position: absolute;
	      inset: 0;
	      background:
	        radial-gradient(1200px 800px at 28% 12%, rgba(66,133,244,0.12), rgba(0,0,0,0) 60%),
	        radial-gradient(900px 650px at 72% 88%, rgba(15,157,88,0.10), rgba(0,0,0,0) 62%),
	        radial-gradient(800px 560px at 80% 20%, rgba(244,180,0,0.08), rgba(0,0,0,0) 58%);
	      opacity: 0.95;
	    }
	    #${AGENT_CONTROL_UI_ROOT_ID} .stingAgentBorder {
	      position: absolute;
	      inset: 0;
	      margin: 6px;
	      border-radius: 12px;
	      box-shadow:
	        0 0 0 2px rgba(66,133,244,0.22) inset,
	        0 0 0 1px rgba(255,255,255,0.06) inset,
	        0 12px 40px rgba(0,0,0,0.08);
	      opacity: 0.6;
	      animation: stingAgentBorderPulse 1.6s ease-in-out infinite;
	    }
	    #${AGENT_CONTROL_UI_ROOT_ID} .stingAgentBadge {
	      position: absolute;
	      top: 10px;
	      right: 10px;
	      display: inline-flex;
	      align-items: center;
	      gap: 8px;
	      padding: 7px 10px;
	      border-radius: 999px;
	      background: rgba(17,19,24,0.62);
	      border: 1px solid rgba(255,255,255,0.14);
	      color: rgba(255,255,255,0.92);
	      font: 700 11px/1 system-ui, -apple-system, Segoe UI, Roboto, Arial;
	      letter-spacing: 0.4px;
	      backdrop-filter: blur(8px);
	      box-shadow: 0 10px 26px rgba(0,0,0,0.18);
	      user-select: none;
	      -webkit-font-smoothing: antialiased;
	    }
	    #${AGENT_CONTROL_UI_ROOT_ID} .stingAgentBadgeDot {
	      width: 8px;
	      height: 8px;
	      border-radius: 50%;
	      background: #34a853;
	      box-shadow: 0 0 0 0 rgba(52,168,83,0.0);
	      animation: stingAgentDot 1.2s ease-in-out infinite;
	    }
	    #${AGENT_CONTROL_UI_ROOT_ID} .stingAgentCursor {
	      position: absolute;
	      left: 0;
	      top: 0;
	      width: 22px;
	      height: 22px;
	      transform: translate3d(calc(var(--sting-agent-cursor-x) - 2px), calc(var(--sting-agent-cursor-y) - 2px), 0);
	      transition: transform 70ms linear;
	      filter: drop-shadow(0 2px 2px rgba(0,0,0,0.45));
	      opacity: 0;
	      will-change: transform, opacity;
	    }
	    #${AGENT_CONTROL_UI_ROOT_ID}[data-has-cursor="true"] .stingAgentCursor { opacity: 1; }
	    #${AGENT_CONTROL_UI_ROOT_ID} .stingAgentCursor svg { width: 100%; height: 100%; display: block; }
	    #${AGENT_CONTROL_UI_ROOT_ID} .stingAgentRipple {
	      position: absolute;
	      width: 14px;
	      height: 14px;
	      border-radius: 999px;
	      border: 2px solid rgba(66,133,244,0.95);
	      box-shadow: 0 0 0 4px rgba(66,133,244,0.12);
	      transform: translate(-50%, -50%) scale(0.18);
	      opacity: 0;
	      animation: stingAgentRipple 420ms ease-out forwards;
	    }
	    #${AGENT_CONTROL_UI_ROOT_ID} .stingAgentScrollChip {
	      position: absolute;
	      transform: translate(-50%, -50%);
	      padding: 4px 8px;
	      border-radius: 999px;
	      background: rgba(17,19,24,0.58);
	      border: 1px solid rgba(255,255,255,0.14);
	      color: rgba(255,255,255,0.92);
	      font: 700 11px/1 system-ui, -apple-system, Segoe UI, Roboto, Arial;
	      letter-spacing: 0.2px;
	      backdrop-filter: blur(8px);
	      box-shadow: 0 10px 24px rgba(0,0,0,0.16);
	      opacity: 0;
	      animation: stingAgentScrollChip 520ms ease-out forwards;
	      will-change: transform, opacity;
	    }

	    @keyframes stingAgentScan {
	      from { background-position: 0 0; }
	      to { background-position: 0 80px; }
	    }
	    @keyframes stingAgentBorderPulse {
	      0%, 100% { opacity: 0.45; }
	      50% { opacity: 0.9; }
	    }
	    @keyframes stingAgentDot {
	      0% { transform: scale(0.92); box-shadow: 0 0 0 0 rgba(52,168,83,0.0); }
	      50% { transform: scale(1); box-shadow: 0 0 0 8px rgba(52,168,83,0.12); }
	      100% { transform: scale(0.92); box-shadow: 0 0 0 0 rgba(52,168,83,0.0); }
	    }
	    @keyframes stingAgentRipple {
	      0% { opacity: 0; transform: translate(-50%, -50%) scale(0.18); }
	      20% { opacity: 1; }
	      100% { opacity: 0; transform: translate(-50%, -50%) scale(4.2); }
	    }
	    @keyframes stingAgentScrollChip {
	      0% { opacity: 0; transform: translate(-50%, -50%) translateY(0) scale(0.98); }
	      18% { opacity: 1; }
	      100% { opacity: 0; transform: translate(-50%, -50%) translateY(var(--sting-agent-scroll-dy, 0px)) scale(1.02); }
	    }
	  `.trim();
		const AGENT_MAX_STEPS_MIN = 1;
		const AGENT_MAX_STEPS_MAX = 50;
		const AGENT_MAX_STEPS_DEFAULT = 10;
pullModelInput.value = DEFAULT_LOCAL_MODEL;
pullModelInput.addEventListener("input", () => persistAiAssistantOptions());

const AI_ASSISTANT_OPTIONS_KEY = "sting.aiAssistant.options.v1";
const PROMPTS_STORAGE_KEY = "sting.prompts.v1";
const AI_CHAT_STORE_KEY = "sting.aiChat.store.v1";
const AI_CHAT_MAX_CONVERSATIONS = 60;
const AI_FONT_SIZE_LEVEL_MIN = 1;
const AI_FONT_SIZE_LEVEL_MAX = 5;
const AI_FONT_SIZE_LEVEL_DEFAULT = 3;
const AI_FONT_SCALE_BY_LEVEL = {
  1: 0.85,
  2: 0.93,
  3: 1,
  4: 1.1,
  5: 1.22
};
const AI_PANEL_WIDTH_KEY = "sting.aiPanel.width.v1";
const AI_PANEL_MIN_WIDTH = 280;
const AI_PANEL_DEFAULT_WIDTH = 360;
const LAST_SESSION_TABS_KEY = "sting.session.lastTabs.v1";
const PAGE_ZOOM_KEY = "sting.pageZoomFactor.v1";
const PAGE_ZOOM_MIN = 0.25;
const PAGE_ZOOM_MAX = 5;
const PAGE_ZOOM_STEP = 0.1;

let aiConversation = [];
let aiChatConversations = [];
let aiActiveConversationId = null;
let isAiHistoryOpen = false;
let isSendingChat = false;
let isAgentRunning = false;
let agentRunSeq = 0;
let chatRunSeq = 0;
let activeChatRun = null;
let activeAgentRun = null;
let isSyncingAiAssistantOptions = false;
let geminiApiKeySource = "none";
let openAiApiKeySource = "none";
let isFindBarOpen = false;
let findDebounceTimer = null;

let homeUrl = DEFAULT_HOME_URL;
let searchEngineTemplate = DEFAULT_SEARCH_TEMPLATE;
let startupMode = "home";
let startupUrls = [];
let themeMode = "light";
let userAgentName = DEFAULT_USER_AGENT_NAME;
let uiLanguage = resolveUiLanguage(navigator.language);
let hasShownChromeImportModal = false;
let pageZoomFactor = loadPageZoomFactor();

applyI18nToDom();

let tabs = [];
let activeTabId = null;

let downloads = [];
let isDownloadsShelfDismissed = false;

const DEFAULT_PROMPTS_BY_LANGUAGE = {
  en: [
    {
      id: "summary",
      name: "Summarize this page",
      template: "Please summarize the following web page content (key points, key data, conclusions):",
      includePageContent: true
    },
    {
      id: "painpoints_ideas",
      name: "Pain points & business ideas",
      template:
        "Analyze the following web page content. List user pain points and needs, then propose 3–5 business ideas (target audience / value proposition / feasibility):",
      includePageContent: true
    }
  ],
  es: [
    {
      id: "summary",
      name: "Resume esta página",
      template:
        "Resume el siguiente contenido de la página web (puntos clave, datos relevantes y conclusiones):",
      includePageContent: true
    },
    {
      id: "painpoints_ideas",
      name: "Dolores y ideas de negocio",
      template:
        "Analiza el siguiente contenido de la página web. Enumera los dolores y necesidades del usuario y propone 3–5 ideas de negocio (cliente objetivo / propuesta de valor / viabilidad):",
      includePageContent: true
    }
  ],
  "zh-TW": [
    {
      id: "summary",
      name: "摘要本頁文件",
      template: "請用繁體中文摘要以下網頁內容，抓出重點、關鍵數據與結論：",
      includePageContent: true
    },
    {
      id: "painpoints_ideas",
      name: "抓出痛點/需求與商業 idea",
      template:
        "請分析以下網頁內容，列出使用者痛點與需求，並提出 3-5 個可發展成商業 idea 的建議（含目標客群/價值主張/可行性）：",
      includePageContent: true
    }
  ]
};

const HISTORY_KEY = "sting.history.v1";
const HISTORY_LIMIT = 500;
let historyItems = loadHistory();

let currentSuggestions = [];
let activeSuggestionIndex = -1;
let isUrlInputComposing = false;
let isChatInputComposing = false;
let isVoiceRecording = false;
let isVoiceTranscribing = false;
let voiceStream = null;
let voiceAutoStopTimer = null;
let voiceAudioContext = null;
let voiceSourceNode = null;
let voiceProcessorNode = null;
let voiceSilenceGainNode = null;
let voiceDictationActive = false;
let voiceDictationBaseText = "";
let voiceDictationCommittedText = "";
let voiceDictationCurrentText = "";
let voiceDictationLastTranscriptionText = "";
let unsubscribeLiveVoiceEvents = null;
let voiceSessionSeq = 0;

const LIVE_VOICE_SAMPLE_RATE = 16000;
const LIVE_VOICE_MIME_TYPE = `audio/pcm;rate=${LIVE_VOICE_SAMPLE_RATE}`;

let prompts = [];
let hasLoadedPrompts = false;
let promptsStorageLanguage = null;

function safeCall(fn, fallback) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

function createAiConversationRecord() {
  const now = Date.now();
  return {
    id: `conv_${now}_${Math.random().toString(16).slice(2)}`,
    createdAt: now,
    updatedAt: now,
    messages: []
  };
}

function sanitizeAiConversationMessage(msg) {
  if (!msg || typeof msg !== "object") return null;
  const role = msg.role === "user" || msg.role === "assistant" ? msg.role : null;
  if (!role) return null;
  const content = String(msg.content ?? "").trim();
  if (!content) return null;
  const meta = typeof msg.meta === "string" && msg.meta.trim() ? msg.meta.trim() : null;
  const ts = Number(msg.ts);
  const timestamp = Number.isFinite(ts) && ts > 0 ? ts : Date.now();
  const skipContext = Boolean(msg.skipContext);
  return { role, content, meta, ts: timestamp, skipContext };
}

function sanitizeAiConversationRecord(conv) {
  if (!conv || typeof conv !== "object") return null;
  const id = String(conv.id || "").trim();
  if (!id) return null;
  const createdAtRaw = Number(conv.createdAt);
  const updatedAtRaw = Number(conv.updatedAt);
  const createdAt = Number.isFinite(createdAtRaw) && createdAtRaw > 0 ? createdAtRaw : Date.now();
  const updatedAt = Number.isFinite(updatedAtRaw) && updatedAtRaw > 0 ? updatedAtRaw : createdAt;
  const messages = Array.isArray(conv.messages)
    ? conv.messages.map(sanitizeAiConversationMessage).filter(Boolean)
    : [];
  return { id, createdAt, updatedAt, messages };
}

function pruneAiChatConversations() {
  const activeId = aiActiveConversationId;
  const seen = new Set();
  aiChatConversations = aiChatConversations.filter((c) => {
    if (!c || typeof c !== "object") return false;
    if (!c.id || typeof c.id !== "string") return false;
    if (seen.has(c.id)) return false;
    const keep = c.id === activeId || (Array.isArray(c.messages) && c.messages.length);
    if (!keep) return false;
    seen.add(c.id);
    return true;
  });
  aiChatConversations.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  if (aiChatConversations.length <= AI_CHAT_MAX_CONVERSATIONS) return;
  const keep = aiChatConversations.slice(0, AI_CHAT_MAX_CONVERSATIONS);
  if (activeId && !keep.some((c) => c.id === activeId)) {
    const active = aiChatConversations.find((c) => c.id === activeId);
    if (active) keep[keep.length - 1] = active;
  }
  aiChatConversations = keep;
}

function getAiChatStoreSnapshot() {
  pruneAiChatConversations();
  return {
    version: 1,
    activeConversationId: aiActiveConversationId,
    conversations: aiChatConversations.map((c) => ({
      id: c.id,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      messages: (c.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
        meta: m.meta,
        ts: m.ts,
        skipContext: Boolean(m.skipContext)
      }))
    }))
  };
}

function persistAiChatStore() {
  const snapshot = getAiChatStoreSnapshot();
  try {
    localStorage.setItem(AI_CHAT_STORE_KEY, JSON.stringify(snapshot));
  } catch (err) {
    window.aiBridge.showError(err?.message || t("error.aiChatStoreSave"));
  }
}

function loadAiChatStoreFromStorage() {
  return safeCall(() => {
    const raw = localStorage.getItem(AI_CHAT_STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const conversations = Array.isArray(parsed.conversations)
      ? parsed.conversations.map(sanitizeAiConversationRecord).filter(Boolean)
      : [];
    const activeConversationId = typeof parsed.activeConversationId === "string" ? parsed.activeConversationId : null;
    return { activeConversationId, conversations };
  }, null);
}

function getAiConversationRecord(id) {
  const key = String(id || "").trim();
  if (!key) return null;
  return aiChatConversations.find((c) => c.id === key) ?? null;
}

function getActiveAiConversationRecord() {
  return getAiConversationRecord(aiActiveConversationId);
}

function syncAiConversationForActiveTab() {
  const tab = getActiveTab();
  const tabConvId = String(tab?.aiConversationId || "").trim();
  const conv = tabConvId ? getAiConversationRecord(tabConvId) : null;
  if (!conv) {
    aiActiveConversationId = null;
    aiConversation = [];
    if (tab && tabConvId) tab.aiConversationId = null;
    renderAiConversationMessages(aiConversation);
    if (isAiHistoryOpen) renderAiConversationHistoryList();
    return;
  }
  aiActiveConversationId = conv.id;
  aiConversation = conv.messages;
  pruneAiChatConversations();
  renderAiConversationMessages(aiConversation);
  if (isAiHistoryOpen) renderAiConversationHistoryList();
}

function ensureActiveAiConversation() {
  const tab = getActiveTab();
  const tabConvId = String(tab?.aiConversationId || "").trim();
  let active = tabConvId ? getAiConversationRecord(tabConvId) : null;
  if (!active) {
    active = createAiConversationRecord();
    aiChatConversations.unshift(active);
    if (tab) tab.aiConversationId = active.id;
  }
  aiActiveConversationId = active.id;
  aiConversation = active.messages;
  pruneAiChatConversations();
}

function renderAiConversationMessages(messages) {
  aiChatMessages.innerHTML = "";
  for (const msg of Array.isArray(messages) ? messages : []) {
    if (!msg || typeof msg !== "object") continue;
    if (msg.role === "assistant") {
      createAiChatMessage({ role: "assistant", meta: msg.meta || t("ai.meta.assistant"), markdown: msg.content });
      continue;
    }
    if (msg.role === "user") {
      createAiChatMessage({ role: "user", meta: msg.meta || t("ai.meta.user"), text: msg.content });
    }
  }
  scrollAiChatToBottom({ behavior: "auto" });
}

function setActiveAiConversation(id) {
  const conv = getAiConversationRecord(id);
  if (!conv) return;
  aiActiveConversationId = conv.id;
  aiConversation = conv.messages;
  const tab = getActiveTab();
  if (tab) tab.aiConversationId = conv.id;
  persistAiChatStore();
  renderAiConversationMessages(aiConversation);
  if (isAiHistoryOpen) renderAiConversationHistoryList();
}

function startNewAiConversation() {
  const conv = createAiConversationRecord();
  aiChatConversations.unshift(conv);
  aiActiveConversationId = conv.id;
  aiConversation = conv.messages;
  const tab = getActiveTab();
  if (tab) tab.aiConversationId = conv.id;
  persistAiChatStore();
  renderAiConversationMessages(aiConversation);
  setAiHistoryOpen(false);
}

function normalizeAiHistoryPreviewText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateAiHistoryPreview(text, maxLen) {
  const input = normalizeAiHistoryPreviewText(text);
  if (input.length <= maxLen) return input;
  return `${input.slice(0, Math.max(0, maxLen - 1)).trimEnd()}…`;
}

function formatAiHistoryTime(ts) {
  const t = Number(ts);
  if (!Number.isFinite(t) || t <= 0) return "";
  try {
    return new Date(t).toLocaleString();
  } catch {
    return "";
  }
}

function buildConversationTitle(conv) {
  const msgs = Array.isArray(conv?.messages) ? conv.messages : [];
  const firstUser = msgs.find((m) => m && m.role === "user" && typeof m.content === "string" && m.content.trim());
  if (firstUser) return truncateAiHistoryPreview(firstUser.content, 72);
  return t("ai.history.newConversationTitle");
}

function buildConversationSnippet(conv) {
  const msgs = Array.isArray(conv?.messages) ? conv.messages : [];
  const lastAssistant = [...msgs].reverse().find((m) => m && m.role === "assistant" && typeof m.content === "string");
  const text = lastAssistant?.content || msgs.at?.(-1)?.content || "";
  return truncateAiHistoryPreview(text, 120);
}

function renderAiConversationHistoryList() {
  if (!aiHistoryList) return;
  aiHistoryList.innerHTML = "";
  pruneAiChatConversations();
  const visible = aiChatConversations.filter((c) => Array.isArray(c.messages) && c.messages.length);
  if (!visible.length) {
    const empty = document.createElement("div");
    empty.className = "aiHistoryEmpty";
    empty.textContent = t("ai.history.empty");
    aiHistoryList.appendChild(empty);
    return;
  }

  for (const conv of visible) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `aiHistoryItem${conv.id === aiActiveConversationId ? " active" : ""}`;
    item.dataset.conversationId = conv.id;

    const meta = document.createElement("div");
    meta.className = "aiHistoryItemMeta";

    const timeEl = document.createElement("div");
    timeEl.textContent = formatAiHistoryTime(conv.updatedAt || conv.createdAt);

    const countEl = document.createElement("div");
    countEl.textContent = t("ai.history.count", { count: conv.messages.length });

    meta.appendChild(timeEl);
    meta.appendChild(countEl);

    const title = document.createElement("div");
    title.className = "aiHistoryItemTitle";
    title.textContent = buildConversationTitle(conv);

    const snippet = document.createElement("div");
    snippet.className = "aiHistoryItemSnippet";
    snippet.textContent = buildConversationSnippet(conv);

    item.appendChild(meta);
    item.appendChild(title);
    item.appendChild(snippet);

    aiHistoryList.appendChild(item);
  }
}

function setAiHistoryOpen(open) {
  const next = Boolean(open);
  isAiHistoryOpen = next;
  if (!aiHistoryDrawer) return;
  aiHistoryDrawer.classList.toggle("hidden", !next);
  aiHistoryDrawer.setAttribute("aria-hidden", next ? "false" : "true");
  if (next) {
    renderAiConversationHistoryList();
    aiHistoryCloseBtn?.focus?.();
  }
}

function applyTheme(mode) {
  document.body.classList.remove("theme-dark");
  if (mode === "dark") document.body.classList.add("theme-dark");
}

function isValidUserAgentName(value) {
  const text = String(value || "").trim();
  if (!text) return true;
  if (text.length > 80) return false;
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,39}(?:\/[A-Za-z0-9][A-Za-z0-9._-]{0,39})?$/.test(text);
}

function sanitizeUserAgentName(value) {
  const text = String(value || "").trim();
  if (!text) return DEFAULT_USER_AGENT_NAME;
  return isValidUserAgentName(text) ? text : DEFAULT_USER_AGENT_NAME;
}

function setUserAgentNameError(message) {
  if (!userAgentNameErrorRow || !userAgentNameError) return;
  const text = String(message || "").trim();
  userAgentNameError.textContent = text;
  userAgentNameErrorRow.classList.toggle("hidden", !text);
}

function syncUserAgentNameInputState() {
  if (!userAgentNameInput) return;
  const ok = isValidUserAgentName(userAgentNameInput.value);
  setUserAgentNameError(ok ? "" : t("appSettings.userAgentName.error.invalid"));
}

function stripElectronTokenFromUserAgent(userAgent) {
  const ua = String(userAgent || "");
  return ua.replace(/\sElectron\/[0-9.]+/g, "").trim();
}

function buildWebviewUserAgent() {
  const base = stripElectronTokenFromUserAgent(navigator.userAgent);
  const token = sanitizeUserAgentName(userAgentName);
  if (!token) return base;
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.includes(token)) return base;
  return `${base} ${token}`.trim();
}

function applyUserAgentToWebview(webview) {
  if (!webview) return;
  safeCall(() => webview.setAttribute("useragent", buildWebviewUserAgent()), null);
}

function applyUserAgentToAllWebviews() {
  for (const tab of tabs) {
    applyUserAgentToWebview(tab.webview);
  }
}

function clampPageZoomFactor(factor) {
  const raw = Number(factor);
  if (!Number.isFinite(raw)) return 1;
  const clamped = Math.max(PAGE_ZOOM_MIN, Math.min(PAGE_ZOOM_MAX, raw));
  return Math.round(clamped * 100) / 100;
}

function loadPageZoomFactor() {
  try {
    const raw = localStorage.getItem(PAGE_ZOOM_KEY);
    if (!raw) return 1;
    return clampPageZoomFactor(Number(raw));
  } catch {
    return 1;
  }
}

function persistPageZoomFactor() {
  try {
    localStorage.setItem(PAGE_ZOOM_KEY, String(pageZoomFactor));
  } catch {
  }
}

function applyPageZoomToWebview(webview) {
  if (!webview) return;
  safeCall(() => webview.setZoomFactor(pageZoomFactor), null);
}

function applyPageZoomToAllWebviews() {
  for (const tab of tabs) {
    applyPageZoomToWebview(tab.webview);
  }
}

function setPageZoomFactor(nextFactor) {
  const next = clampPageZoomFactor(nextFactor);
  if (next === pageZoomFactor) return;
  pageZoomFactor = next;
  persistPageZoomFactor();
  applyPageZoomToAllWebviews();
  updateStatusMeta();
}

function getSearchTemplateForChoice(choice) {
  if (choice === "bing") return "https://www.bing.com/search?q={query}";
  if (choice === "duckduckgo") return "https://duckduckgo.com/?q={query}";
  return DEFAULT_SEARCH_TEMPLATE;
}

function inferSearchChoiceFromTemplate(template) {
  const t = String(template || "").toLowerCase();
  if (t.includes("duckduckgo.com")) return "duckduckgo";
  if (t.includes("bing.com")) return "bing";
  if (t.includes("google.")) return "google";
  if (t === DEFAULT_SEARCH_TEMPLATE.toLowerCase()) return "google";
  return "custom";
}

function syncBrowserSettingsUI() {
  themeSelect.value = themeMode;
  if (languageSelect && Array.from(languageSelect.options).some((o) => o.value === uiLanguage)) {
    languageSelect.value = uiLanguage;
  }
  if (userAgentNameInput) {
    userAgentNameInput.value = userAgentName || "";
    setUserAgentNameError("");
  }

  const radio = startupModeGroup.querySelector(`input[name="startupMode"][value="${startupMode}"]`);
  if (radio) radio.checked = true;

  startupUrlsInput.value = Array.isArray(startupUrls) ? startupUrls.join("\n") : "";
  startupUrlsInput.disabled = startupMode !== "urls";
  startupUrlsInput.classList.toggle("hidden", startupMode !== "urls");

  homePageInput.value = homeUrl || DEFAULT_HOME_URL;

  const searchChoice = inferSearchChoiceFromTemplate(searchEngineTemplate);
  searchEngineSelect.value = searchChoice;
  const showCustom = searchChoice === "custom";
  searchEngineTemplateRow.classList.toggle("hidden", !showCustom);
  searchEngineTemplateInput.value = searchEngineTemplate || DEFAULT_SEARCH_TEMPLATE;

  importChromeStatus.textContent = "";
}

function applyBrowserSettings(browser) {
  const b = browser && typeof browser === "object" ? browser : {};
  homeUrl = typeof b.homePage === "string" && b.homePage.trim() ? b.homePage.trim() : DEFAULT_HOME_URL;
  searchEngineTemplate =
    typeof b.searchEngineTemplate === "string" && b.searchEngineTemplate.trim()
      ? b.searchEngineTemplate.trim()
      : DEFAULT_SEARCH_TEMPLATE;
  startupMode = b.startupMode === "continue" || b.startupMode === "urls" ? b.startupMode : "home";
  startupUrls = Array.isArray(b.startupUrls) ? b.startupUrls.filter(Boolean) : [];
  themeMode = b.theme === "dark" || b.theme === "light" ? b.theme : "light";
  applyTheme(themeMode);
  setUiLanguage(resolveUiLanguage(b.language));
  userAgentName = sanitizeUserAgentName(b.userAgentName);
  applyUserAgentToAllWebviews();
}

async function loadAppSettings() {
  const res = await window.aiBridge.getAppSettings();
  if (!res.ok) {
    window.aiBridge.showError(res.error);
    return null;
  }
  const s = res.settings || {};
  hasShownChromeImportModal = Boolean(s.hasShownChromeImportModal);
  applyBrowserSettings(s.browser);
  syncBrowserSettingsUI();
  return s;
}

async function saveBrowserSettings(browserPatch) {
  const res = await window.aiBridge.setBrowserSettings(browserPatch);
  if (!res.ok) {
    window.aiBridge.showError(res.error);
    return null;
  }
  applyBrowserSettings(res.browser);
  syncBrowserSettingsUI();
  return res.browser;
}

function loadAiAssistantOptionsFromStorage() {
  return safeCall(() => {
    const raw = localStorage.getItem(AI_ASSISTANT_OPTIONS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  }, null);
}

function getAiPanelDefaultWidth() {
  const overlay = window.matchMedia("(max-width: 900px)").matches;
  return overlay ? Math.min(420, window.innerWidth) : AI_PANEL_DEFAULT_WIDTH;
}

function getAiPanelWidthConstraints() {
  const overlay = window.matchMedia("(max-width: 900px)").matches;
  if (overlay) {
    return { min: AI_PANEL_MIN_WIDTH, max: Math.max(AI_PANEL_MIN_WIDTH, window.innerWidth) };
  }
  const maxByRatio = Math.floor(window.innerWidth * 0.45);
  const max = Math.max(AI_PANEL_MIN_WIDTH, maxByRatio);
  return { min: AI_PANEL_MIN_WIDTH, max };
}

function clampAiPanelWidth(widthPx) {
  const { min, max } = getAiPanelWidthConstraints();
  const value = Number(widthPx);
  if (!Number.isFinite(value)) return getAiPanelDefaultWidth();
  return Math.max(min, Math.min(max, Math.floor(value)));
}

function clampAiFontSizeLevel(level) {
  const raw = Number(level);
  if (!Number.isFinite(raw)) return AI_FONT_SIZE_LEVEL_DEFAULT;
  const intValue = Math.round(raw);
  return Math.max(AI_FONT_SIZE_LEVEL_MIN, Math.min(AI_FONT_SIZE_LEVEL_MAX, intValue));
}

function clampAgentMaxSteps(value) {
  const raw = Number(value);
  if (!Number.isFinite(raw)) return AGENT_MAX_STEPS_DEFAULT;
  const intValue = Math.round(raw);
  return Math.max(AGENT_MAX_STEPS_MIN, Math.min(AGENT_MAX_STEPS_MAX, intValue));
}

function getAiFontScaleForLevel(level) {
  const key = clampAiFontSizeLevel(level);
  const scale = AI_FONT_SCALE_BY_LEVEL[key];
  return typeof scale === "number" && Number.isFinite(scale) ? scale : 1;
}

let aiFontSizeLevel = safeCall(() => {
  const stored = loadAiAssistantOptionsFromStorage();
  const fromPacked = Number(stored?.fontSizeLevel);
  if (Number.isFinite(fromPacked)) return fromPacked;
  return AI_FONT_SIZE_LEVEL_DEFAULT;
}, AI_FONT_SIZE_LEVEL_DEFAULT);

function applyAiFontSizeLevel(nextLevel) {
  aiFontSizeLevel = clampAiFontSizeLevel(nextLevel);
  const scale = getAiFontScaleForLevel(aiFontSizeLevel);
  aiPanel.style.setProperty("--aiScale", String(scale));
  if (aiFontSizeSelect && aiFontSizeSelect.value !== String(aiFontSizeLevel)) {
    aiFontSizeSelect.value = String(aiFontSizeLevel);
  }
}

let aiPanelWidthPx = safeCall(() => {
  const stored = loadAiAssistantOptionsFromStorage();
  const fromPacked = Number(stored?.panelWidthPx);
  if (Number.isFinite(fromPacked)) return fromPacked;

  const raw = localStorage.getItem(AI_PANEL_WIDTH_KEY);
  const value = Number(raw);
  return Number.isFinite(value) ? value : getAiPanelDefaultWidth();
}, getAiPanelDefaultWidth());

function persistAiPanelWidth(widthPx) {
  persistAiAssistantOptions();
}

function applyAiPanelWidth(nextWidthPx) {
  aiPanelWidthPx = clampAiPanelWidth(nextWidthPx);
  aiPanel.style.width = `${aiPanelWidthPx}px`;
  const { min, max } = getAiPanelWidthConstraints();
  aiResizeHandle.setAttribute("aria-valuemin", String(min));
  aiResizeHandle.setAttribute("aria-valuemax", String(max));
  aiResizeHandle.setAttribute("aria-valuenow", String(aiPanelWidthPx));
}

applyAiPanelWidth(aiPanelWidthPx);
applyAiFontSizeLevel(aiFontSizeLevel);

function getAiAssistantOptionsSnapshot() {
  return {
    version: 1,
    provider: String(providerSelect.value || "local"),
    mode: String(aiModeSelect?.value || "chat"),
    agentConfirm: Boolean(agentConfirmCheckbox?.checked),
    agentMaxSteps: clampAgentMaxSteps(agentMaxStepsInput?.value),
    localModel: String(localModelSelect.value || ""),
    geminiModel: String(geminiModelSelect.value || ""),
    voiceModel: String(voiceModelSelect?.value || ""),
    contextMode: String(contextModeSelect.value || "auto"),
    promptId: String(promptSelect.value || ""),
    fontSizeLevel: aiFontSizeLevel,
    panelWidthPx: aiPanelWidthPx,
    pullModelInput: String(pullModelInput.value || "")
  };
}

function persistAiAssistantOptions() {
  if (isSyncingAiAssistantOptions) return;
  const snapshot = getAiAssistantOptionsSnapshot();
  try {
    localStorage.setItem(AI_ASSISTANT_OPTIONS_KEY, JSON.stringify(snapshot));
  } catch {
  }
}

let isResizingAiPanel = false;
let aiResizeStartX = 0;
let aiResizeStartWidth = 0;

function stopAiPanelResize() {
  if (!isResizingAiPanel) return;
  isResizingAiPanel = false;
  dragShield.classList.add("hidden");
  document.body.classList.remove("isResizingAiPanel");
  window.removeEventListener("pointermove", onAiPanelResizeMove);
  persistAiPanelWidth(aiPanelWidthPx);
}

function onAiPanelResizeMove(e) {
  if (!isResizingAiPanel) return;
  const dx = e.clientX - aiResizeStartX;
  applyAiPanelWidth(aiResizeStartWidth - dx);
}

aiResizeHandle.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  isResizingAiPanel = true;
  aiResizeStartX = e.clientX;
  aiResizeStartWidth = aiPanel.getBoundingClientRect().width || aiPanelWidthPx;
  dragShield.classList.remove("hidden");
  document.body.classList.add("isResizingAiPanel");
  window.addEventListener("pointermove", onAiPanelResizeMove);
  window.addEventListener("pointerup", stopAiPanelResize, { once: true });
  window.addEventListener("pointercancel", stopAiPanelResize, { once: true });
  e.preventDefault();
});

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeLinkHref(href) {
  const raw = String(href || "").trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^mailto:/i.test(raw)) return raw;
  return null;
}

function renderInlineMarkdown(rawText) {
  const raw = String(rawText ?? "");
  const parts = raw.split("`");
  let out = "";

  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i];
    if (i % 2 === 1) {
      out += `<code>${escapeHtml(seg)}</code>`;
      continue;
    }

    let text = escapeHtml(seg);

    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    text = text.replace(/_([^_]+)_/g, "<em>$1</em>");

    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, href) => {
      const safeHref = sanitizeLinkHref(href);
      if (!safeHref) return label;
      return `<a href="${safeHref}">${label}</a>`;
    });

    out += text;
  }

  return out;
}

function markdownToHtml(markdownText) {
  const input = String(markdownText ?? "").replace(/\r\n?/g, "\n");
  const lines = input.split("\n");

  let html = "";
  let inCode = false;
  let codeLang = "";
  let codeLines = [];

  let listType = null; // "ul" | "ol"
  let listItems = [];

  let inQuote = false;
  let quoteLines = [];

  let paragraphLines = [];

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    const text = paragraphLines.join("\n").trimEnd();
    paragraphLines = [];
    if (!text.trim()) return;
    html += `<p>${renderInlineMarkdown(text).replaceAll("\n", "<br>")}</p>`;
  };

  const flushList = () => {
    if (!listType || !listItems.length) {
      listType = null;
      listItems = [];
      return;
    }
    const itemsHtml = listItems
      .map((item) => `<li>${renderInlineMarkdown(item)}</li>`)
      .join("");
    html += `<${listType}>${itemsHtml}</${listType}>`;
    listType = null;
    listItems = [];
  };

  const flushQuote = () => {
    if (!inQuote) return;
    const text = quoteLines.join("\n").trimEnd();
    quoteLines = [];
    inQuote = false;
    if (!text.trim()) return;
    html += `<blockquote>${renderInlineMarkdown(text).replaceAll("\n", "<br>")}</blockquote>`;
  };

  const flushAll = () => {
    flushQuote();
    flushList();
    flushParagraph();
  };

  const flushCode = () => {
    const code = codeLines.join("\n");
    codeLines = [];
    inCode = false;
    const lang = String(codeLang || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");
    codeLang = "";
    const classAttr = lang ? ` class="language-${lang}"` : "";
    html += `<pre><code${classAttr}>${escapeHtml(code)}</code></pre>`;
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];

    if (inCode) {
      if (line.trim().startsWith("```")) {
        flushCode();
        continue;
      }
      codeLines.push(line);
      continue;
    }

    if (line.trim().startsWith("```")) {
      flushAll();
      inCode = true;
      codeLang = line.trim().slice(3);
      continue;
    }

    if (/^>\s?/.test(line)) {
      flushParagraph();
      flushList();
      inQuote = true;
      quoteLines.push(line.replace(/^>\s?/, ""));
      continue;
    }

    if (inQuote) {
      flushQuote();
    }

    if (/^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      flushAll();
      html += "<hr>";
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushAll();
      const level = headingMatch[1].length;
      const text = headingMatch[2] || "";
      html += `<h${level}>${renderInlineMarkdown(text)}</h${level}>`;
      continue;
    }

    const ulMatch = line.match(/^\s*[-*+]\s+(.*)$/);
    const olMatch = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ulMatch || olMatch) {
      flushParagraph();
      const nextType = ulMatch ? "ul" : "ol";
      if (listType && listType !== nextType) flushList();
      if (!listType) listType = nextType;
      listItems.push((ulMatch ? ulMatch[1] : olMatch[1]) || "");
      continue;
    }

    if (!line.trim()) {
      flushAll();
      continue;
    }

    paragraphLines.push(line);
  }

  if (inCode) flushCode();
  flushAll();
  return html;
}

function sanitizeHtml(html) {
  const allowedTags = new Set([
    "a",
    "blockquote",
    "br",
    "code",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "li",
    "ol",
    "p",
    "pre",
    "strong",
    "ul"
  ]);

  const allowedAttrs = {
    a: new Set(["href", "title", "target", "rel"]),
    code: new Set(["class"])
  };

  const parser = new DOMParser();
  const doc = parser.parseFromString(String(html || ""), "text/html");
  const nodes = Array.from(doc.body.querySelectorAll("*"));

  for (let i = nodes.length - 1; i >= 0; i--) {
    const el = nodes[i];
    const tag = el.tagName.toLowerCase();

    if (!allowedTags.has(tag)) {
      if (tag === "script" || tag === "style") {
        el.remove();
        continue;
      }
      const parent = el.parentNode;
      if (!parent) continue;
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
      el.remove();
      continue;
    }

    const allow = allowedAttrs[tag] || new Set();
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (!allow.has(name)) el.removeAttribute(attr.name);
    }

    if (tag === "a") {
      const href = el.getAttribute("href");
      const safeHref = sanitizeLinkHref(href);
      if (!safeHref) {
        const text = doc.createTextNode(el.textContent || "");
        el.replaceWith(text);
        continue;
      }
      el.setAttribute("href", safeHref);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }

    if (tag === "code" && el.hasAttribute("class")) {
      const cls = String(el.getAttribute("class") || "");
      if (!/^language-[a-z0-9-]+$/.test(cls)) el.removeAttribute("class");
    }
  }

  return doc.body.innerHTML;
}

function renderAiMarkdownToSanitizedHtml(markdownText) {
  const markdown = String(markdownText ?? "");
  const html = markdownToHtml(markdown);
  return sanitizeHtml(html);
}

function scrollAiChatToBottom({ behavior = "auto" } = {}) {
  requestAnimationFrame(() => {
    aiChatMessages.scrollTo({ top: aiChatMessages.scrollHeight, behavior });
  });
}

function createAiChatMessage({ role, meta, text, markdown, parentEl }) {
  const parent = parentEl || aiChatMessages;
  const root = document.createElement("div");
  root.className = `aiMsg ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "aiMsgBubble";

  const initialCopyText = markdown != null ? String(markdown ?? "") : String(text ?? "");
  try {
    root.dataset.copyText = initialCopyText;
  } catch {
  }

  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.className = "aiMsgCopyBtn iconBtn iconBtnSm";
  copyBtn.textContent = "⧉";
  copyBtn.title = t("ai.chat.copy");
  copyBtn.setAttribute("aria-label", t("ai.chat.copy"));
  copyBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const value = String(root.dataset.copyText || "").trim() || String(contentEl?.innerText || "").trim();
    if (!value) return;
    const res = window.aiBridge?.copyText?.(value);
    if (res && res.ok === false) {
      window.aiBridge?.showError?.(res.error || "Failed to copy");
      return;
    }
    const prev = copyBtn.textContent;
    copyBtn.textContent = "✓";
    copyBtn.title = t("ai.chat.copied");
    setTimeout(() => {
      copyBtn.textContent = prev;
      copyBtn.title = t("ai.chat.copy");
    }, 900);
  });

  const metaEl = document.createElement("div");
  metaEl.className = "aiMsgMeta";
  metaEl.textContent = String(meta || "");

  const contentEl = document.createElement("div");

  if (markdown != null) {
    contentEl.className = "aiMarkdown";
    contentEl.innerHTML = renderAiMarkdownToSanitizedHtml(markdown);
  } else {
    contentEl.className = "aiMsgText";
    contentEl.textContent = String(text ?? "");
  }

  bubble.appendChild(copyBtn);
  bubble.appendChild(metaEl);
  bubble.appendChild(contentEl);
  root.appendChild(bubble);
  parent.appendChild(root);
  scrollAiChatToBottom();

  return { root, bubble, metaEl, contentEl, copyBtn };
}

function createAiAgentStepsGroup({ meta, title }) {
  const root = document.createElement("div");
  root.className = "aiMsg assistant aiAgentStepsMsg";

  const bubble = document.createElement("div");
  bubble.className = "aiMsgBubble aiAgentStepsBubble";

  const metaEl = document.createElement("div");
  metaEl.className = "aiMsgMeta";
  metaEl.textContent = String(meta || "");

  const detailsEl = document.createElement("details");
  detailsEl.className = "aiAgentStepsDetails";
  detailsEl.open = true;

  const summaryEl = document.createElement("summary");
  summaryEl.className = "aiAgentStepsSummary";

  const titleEl = document.createElement("span");
  titleEl.className = "aiAgentStepsSummaryTitle";
  titleEl.textContent = String(title || "");

  const metaCountEl = document.createElement("span");
  metaCountEl.className = "aiAgentStepsSummaryMeta";
  metaCountEl.textContent = "";

  summaryEl.appendChild(titleEl);
  summaryEl.appendChild(metaCountEl);

  const listEl = document.createElement("div");
  listEl.className = "aiAgentStepsList";

  detailsEl.appendChild(summaryEl);
  detailsEl.appendChild(listEl);

  bubble.appendChild(metaEl);
  bubble.appendChild(detailsEl);
  root.appendChild(bubble);
  aiChatMessages.appendChild(root);
  scrollAiChatToBottom();

  return { root, bubble, metaEl, detailsEl, summaryEl, titleEl, metaCountEl, listEl };
}

function normalizeAiPendingText(text) {
  const raw = String(text ?? "").trim();
  if (!raw) return raw;
  return raw.replace(/[.…]+$/g, "").trim() || raw;
}

function setAiAssistantMessagePending(msg) {
  if (!msg?.contentEl) return;
  const base = normalizeAiPendingText(t("ai.chat.sending")) || t("ai.chat.sending");
  msg.contentEl.className = "aiMsgText aiPending";
  msg.contentEl.innerHTML = "";

  const wrap = document.createElement("span");
  wrap.className = "aiPendingInline";

  const textEl = document.createElement("span");
  textEl.className = "aiPendingText";
  textEl.textContent = base;

  const dots = document.createElement("span");
  dots.className = "aiPendingDots";
  dots.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("span");
    dot.textContent = ".";
    dots.appendChild(dot);
  }

  wrap.append(textEl, dots);
  msg.contentEl.appendChild(wrap);
  try {
    msg.root?.setAttribute?.("aria-busy", "true");
  } catch {
  }
}

function getTab(tabId) {
  return tabs.find((t) => t.id === tabId) ?? null;
}

function getActiveTab() {
  return getTab(activeTabId);
}

function getActiveWebview() {
  return getActiveTab()?.webview ?? null;
}

function resetFindInPageState(tab, { clearQuery = false } = {}) {
  if (!tab) return;
  if (clearQuery) tab.findQuery = "";
  tab.findRequestId = 0;
  tab.findMatches = 0;
  tab.findActiveMatchOrdinal = 0;
}

function updateFindMatchCountUi(tab) {
  if (!findMatchCount) return;
  const query = String(tab?.findQuery || "").trim();
  if (!query) {
    findMatchCount.textContent = "";
    return;
  }
  const matches = Math.max(0, Number(tab?.findMatches || 0) || 0);
  const active = Math.max(0, Number(tab?.findActiveMatchOrdinal || 0) || 0);
  const activeShown = matches > 0 ? Math.max(1, Math.min(active, matches)) : 0;
  findMatchCount.textContent = `${activeShown}/${matches}`;
}

function requestFindInPage({ findNext = false, forward = true } = {}) {
  const tab = getActiveTab();
  const webview = getActiveWebview();
  if (!tab || !webview || !findInput) return;

  const prevQuery = String(tab.findQuery || "");
  const query = String(findInput.value || "").trim();
  const queryChanged = query !== prevQuery;
  tab.findQuery = query;

  if (!query) {
    safeCall(() => webview.stopFindInPage("clearSelection"), null);
    resetFindInPageState(tab, { clearQuery: true });
    if (tab.id === activeTabId) updateFindMatchCountUi(tab);
    return;
  }

  if (!findNext && queryChanged) {
    safeCall(() => webview.stopFindInPage("clearSelection"), null);
    resetFindInPageState(tab, { clearQuery: false });
  }

  const requestId = safeCall(() => webview.findInPage(query, { forward, findNext }), null);
  if (typeof requestId === "number") tab.findRequestId = requestId;
  if (tab.id === activeTabId) updateFindMatchCountUi(tab);
}

function scheduleFindInPage() {
  if (findDebounceTimer) clearTimeout(findDebounceTimer);
  findDebounceTimer = setTimeout(() => {
    findDebounceTimer = null;
    requestFindInPage({ findNext: false, forward: true });
  }, 120);
}

async function openFindBar({ prefillSelection = false } = {}) {
  if (!findBar || !findInput) return;

  isFindBarOpen = true;
  findBar.classList.remove("hidden");
  findBar.setAttribute("aria-hidden", "false");

  const tab = getActiveTab();
  const webview = getActiveWebview();

  let value = String(tab?.findQuery || "");
  if (prefillSelection && webview) {
    try {
      const sel = await webview.executeJavaScript("String(window.getSelection && window.getSelection() || '')", true);
      const next = String(sel || "").trim();
      if (next) value = next.slice(0, 200);
    } catch {
    }
  }

  if (tab) tab.findQuery = value;
  findInput.value = value;
  findInput.focus();
  findInput.select();
  if (tab?.id === activeTabId) updateFindMatchCountUi(tab);
  if (value) requestFindInPage({ findNext: false, forward: true });
}

function closeFindBar() {
  if (!findBar) return;
  isFindBarOpen = false;
  findBar.classList.add("hidden");
  findBar.setAttribute("aria-hidden", "true");
  if (findMatchCount) findMatchCount.textContent = "";
  const webview = getActiveWebview();
  safeCall(() => webview?.stopFindInPage?.("clearSelection"), null);
  safeCall(() => webview?.focus?.(), null);
}

function syncFindBarForActiveTab() {
  if (!isFindBarOpen || !findBar || !findInput) return;
  const tab = getActiveTab();
  findInput.value = String(tab?.findQuery || "");
  updateFindMatchCountUi(tab);
  if (String(tab?.findQuery || "").trim()) requestFindInPage({ findNext: false, forward: true });
}

function buildSearchUrl(queryText) {
  const q = encodeURIComponent(String(queryText || "").trim());
  const template = String(searchEngineTemplate || DEFAULT_SEARCH_TEMPLATE);
  if (!template.includes("{query}")) return DEFAULT_SEARCH_TEMPLATE.replaceAll("{query}", q);
  return template.replaceAll("{query}", q);
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x.url === "string")
      .map((x) => ({
        url: x.url,
        title: typeof x.title === "string" ? x.title : "",
        lastVisited: typeof x.lastVisited === "number" ? x.lastVisited : 0
      }))
      .slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function persistHistory() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(historyItems.slice(0, HISTORY_LIMIT)));
  } catch {
    // ignore
  }
}

function recordHistoryVisit(url, title) {
  const cleanUrl = (url || "").trim();
  if (!cleanUrl) return;
  if (/^(about|chrome|devtools):/i.test(cleanUrl)) return;

  const now = Date.now();
  const existingIdx = historyItems.findIndex((x) => x.url === cleanUrl);
  const entry = {
    url: cleanUrl,
    title: (title || "").trim(),
    lastVisited: now
  };

  if (existingIdx === -1) historyItems.unshift(entry);
  else historyItems.splice(existingIdx, 1, entry);

  historyItems.sort((a, b) => (b.lastVisited || 0) - (a.lastVisited || 0));
  historyItems = historyItems.slice(0, HISTORY_LIMIT);
  persistHistory();
}

function clearHistory() {
  historyItems = [];
  persistHistory();
  updateSuggestions();
  if (!historyModal.classList.contains("hidden")) renderHistoryList();
}

function deleteHistoryEntry(url) {
  const target = String(url || "").trim();
  if (!target) return;
  const idx = historyItems.findIndex((x) => x.url === target);
  if (idx === -1) return;
  historyItems.splice(idx, 1);
  persistHistory();
  updateSuggestions();
  if (!historyModal.classList.contains("hidden")) renderHistoryList();
}

function formatHistoryTime(ts) {
  const t = Number(ts);
  if (!Number.isFinite(t) || t <= 0) return "";
  try {
    return new Date(t).toLocaleString();
  } catch {
    return "";
  }
}

function renderHistoryList() {
  const q = String(historySearchInput.value || "").trim().toLowerCase();
  const items = historyItems
    .filter((x) => {
      if (!q) return true;
      const url = String(x.url || "").toLowerCase();
      const title = String(x.title || "").toLowerCase();
      return url.includes(q) || title.includes(q);
    })
    .sort((a, b) => (b.lastVisited || 0) - (a.lastVisited || 0))
    .slice(0, 500);

  historyList.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "formHint";
    empty.textContent = q ? t("history.empty.filtered") : t("history.empty");
    historyList.appendChild(empty);
    return;
  }

  for (const item of items) {
    const el = document.createElement("div");
    el.className = "historyItem";
    el.dataset.url = item.url;

    const header = document.createElement("div");
    header.className = "historyItemHeader";

    const titleEl = document.createElement("div");
    titleEl.className = "historyItemTitle";
    titleEl.textContent = item.title || item.url;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "historyItemDeleteBtn";
    deleteBtn.textContent = "🗑";
    deleteBtn.title = t("history.delete");
    deleteBtn.setAttribute("aria-label", t("history.delete"));
    deleteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      deleteHistoryEntry(item.url);
    });

    header.appendChild(titleEl);
    header.appendChild(deleteBtn);

    const urlEl = document.createElement("div");
    urlEl.className = "historyItemUrl";
    urlEl.textContent = item.url;

    const timeEl = document.createElement("div");
    timeEl.className = "historyItemTime";
    timeEl.textContent = formatHistoryTime(item.lastVisited);

    el.appendChild(header);
    el.appendChild(urlEl);
    el.appendChild(timeEl);

    el.addEventListener("click", () => {
      createTab(item.url, { makeActive: true });
      setHistoryModalOpen(false);
    });

    historyList.appendChild(el);
  }
}

function setStatusText(text) {
  statusTextEl.textContent = text || "";
}

function updateStatusMeta() {
  const active = getActiveTab();
  if (!active) {
    statusMetaEl.textContent = "";
    return;
  }
  const idx = tabs.findIndex((t) => t.id === activeTabId);
  const parts = [];
  if (idx >= 0) parts.push(`${idx + 1}/${tabs.length}`);
  if (active.isLoading) parts.push(t("status.loading"));
  const zoomPct = Math.round(pageZoomFactor * 100);
  if (zoomPct !== 100) parts.push(`${zoomPct}%`);
  statusMetaEl.textContent = parts.join(" • ");
}

function updateLoadingUI() {
  const active = getActiveTab();
  const isLoading = Boolean(active?.isLoading);
  loadingBar.classList.toggle("hidden", !isLoading);
  addressStatusIcon.textContent = isLoading ? "⏳" : "🌐";

  if (isLoading) {
    reloadBtn.textContent = "✕";
    reloadBtn.title = t("nav.stop");
    reloadBtn.setAttribute("aria-label", t("nav.stop"));
  } else {
    reloadBtn.textContent = "⟳";
    reloadBtn.title = t("nav.reload");
    reloadBtn.setAttribute("aria-label", t("nav.reload"));
  }
  updateStatusMeta();
}

function updateNavButtons() {
  const webview = getActiveWebview();
  backBtn.disabled = !webview || !safeCall(() => webview.canGoBack(), false);
  forwardBtn.disabled = !webview || !safeCall(() => webview.canGoForward(), false);
  reloadBtn.disabled = !webview;
  homeBtn.disabled = !webview;
}

function syncClearButton() {
  clearUrlBtn.classList.toggle("hidden", urlInput.value.trim().length === 0);
}

function hideSuggestions() {
  currentSuggestions = [];
  activeSuggestionIndex = -1;
  suggestionsEl.innerHTML = "";
  suggestionsEl.classList.add("hidden");
}

function setActiveSuggestionIndex(nextIdx) {
  if (!currentSuggestions.length) {
    activeSuggestionIndex = -1;
    return;
  }

  activeSuggestionIndex = Math.max(0, Math.min(currentSuggestions.length - 1, nextIdx));
  const children = Array.from(suggestionsEl.children);
  for (let i = 0; i < children.length; i++) {
    children[i].classList.toggle("active", i === activeSuggestionIndex);
    children[i].setAttribute("aria-selected", i === activeSuggestionIndex ? "true" : "false");
  }

  const activeEl = children[activeSuggestionIndex];
  activeEl?.scrollIntoView({ block: "nearest" });
}

function renderSuggestions(list) {
  suggestionsEl.innerHTML = "";
  currentSuggestions = list;
  activeSuggestionIndex = -1;

  if (!list.length) {
    suggestionsEl.classList.add("hidden");
    return;
  }

  for (let i = 0; i < list.length; i++) {
    const s = list[i];
    const item = document.createElement("div");
    item.className = "suggestionItem";
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", "false");
    item.dataset.index = String(i);

    const icon = document.createElement("div");
    icon.className = "suggestionIcon";
    icon.textContent = s.icon;

    const text = document.createElement("div");
    text.className = "suggestionText";

    const primary = document.createElement("div");
    primary.className = "suggestionPrimary";
    primary.textContent = s.primary;

    const secondary = document.createElement("div");
    secondary.className = "suggestionSecondary";
    secondary.textContent = s.secondary || "";

    text.append(primary, secondary);
    item.append(icon, text);

    item.addEventListener("mouseenter", () => setActiveSuggestionIndex(i));
    suggestionsEl.appendChild(item);
  }

  suggestionsEl.classList.remove("hidden");
}

function buildSuggestions(query) {
  const raw = (query || "").trim();
  const q = raw.toLowerCase();

  const suggestions = [];
  if (!raw) {
    const recent = historyItems.slice(0, 8);
    for (const item of recent) {
      suggestions.push({
        type: "history",
        icon: "🕘",
        primary: item.title || item.url,
        secondary: item.title ? item.url : "",
        url: item.url
      });
    }
    return suggestions;
  }

  const navUrl = getNavigationUrl(raw);
  const isSearch = navUrl && navUrl.includes("/search?q=");
  suggestions.push({
    type: isSearch ? "search" : "go",
    icon: isSearch ? "🔎" : "🌐",
    primary: isSearch ? `Search: ${raw}` : raw,
    secondary: isSearch ? navUrl : `Go to ${navUrl}`,
    url: navUrl,
    fill: raw
  });

  const matches = historyItems
    .filter((item) => {
      const hay1 = item.url.toLowerCase();
      const hay2 = (item.title || "").toLowerCase();
      return hay1.includes(q) || hay2.includes(q);
    })
    .slice(0, 8);

  for (const item of matches) {
    if (item.url === navUrl) continue;
    suggestions.push({
      type: "history",
      icon: "🕘",
      primary: item.title || item.url,
      secondary: item.title ? item.url : "",
      url: item.url,
      fill: item.url
    });
  }
  return suggestions;
}

function updateSuggestions() {
  const isFocused = document.activeElement === urlInput;
  if (!isFocused) return;
  renderSuggestions(buildSuggestions(urlInput.value));
}

function syncStatusBar() {
  const active = getActiveTab();
  if (!active) {
    setStatusText("");
    updateStatusMeta();
    return;
  }
  if (active.hoverUrl) setStatusText(active.hoverUrl);
  else if (active.isLoading) setStatusText("Loading…");
  else setStatusText("");
  updateStatusMeta();
}

function formatWebviewLoadErrorText(err) {
  if (!err || typeof err !== "object") return "";
  const description = String(err.description || err.errorDescription || "").trim();
  const code = Number(err.code);
  if (description && Number.isFinite(code)) return `${description} (${code})`;
  if (description) return description;
  if (Number.isFinite(code)) return `Error (${code})`;
  return "";
}

function applyActiveWebviewVisibility() {
  for (const t of tabs) {
    const isActive = t.id === activeTabId;
    const shouldHide = !isActive || Boolean(isActive && t.loadError);
    t.webview.classList.toggle("hiddenWebview", shouldHide);
  }
}

function updateLoadErrorOverlay() {
  if (!loadErrorOverlay) return;
  const tab = getActiveTab();
  const err = tab?.loadError && typeof tab.loadError === "object" ? tab.loadError : null;
  const shouldShow = Boolean(tab && err);

  loadErrorOverlay.classList.toggle("hidden", !shouldShow);
  loadErrorOverlay.setAttribute("aria-hidden", shouldShow ? "false" : "true");

  if (!shouldShow) {
    if (loadErrorUrl) loadErrorUrl.textContent = "";
    if (loadErrorMessage) loadErrorMessage.textContent = "";
    applyActiveWebviewVisibility();
    return;
  }

  const url = String(err.url || tab.url || "").trim();
  if (loadErrorUrl) loadErrorUrl.textContent = url;

  const message = formatWebviewLoadErrorText(err);
  if (loadErrorMessage) loadErrorMessage.textContent = message;

  applyActiveWebviewVisibility();
}

function setDownloadsShelfOpen(open) {
  const isOpen = Boolean(open);
  downloadsShelf?.classList.toggle("hidden", !isOpen);
  downloadsShelf?.setAttribute("aria-hidden", isOpen ? "false" : "true");
}

function isDownloadActive(d) {
  return Boolean(d && d.state === "progressing" && !d.paused);
}

function formatBytes(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  const digits = i === 0 ? 0 : v >= 10 ? 1 : 2;
  return `${v.toFixed(digits)} ${units[i]}`;
}

function getDownloadProgressPercent(d) {
  const received = Number(d?.receivedBytes || 0);
  const total = Number(d?.totalBytes || 0);
  if (!Number.isFinite(received) || !Number.isFinite(total) || total <= 0) return null;
  return Math.max(0, Math.min(100, Math.round((received / total) * 100)));
}

function getDownloadStatusText(d) {
  const state = String(d?.state || "").toLowerCase();
  if (state === "completed") return t("downloads.status.completed");
  if (state === "cancelled") return t("downloads.status.cancelled");
  if (state === "interrupted") return t("downloads.status.interrupted");
  if (Boolean(d?.paused)) return `${t("downloads.status.downloading")} (paused)`;
  const pct = getDownloadProgressPercent(d);
  if (pct === null) return t("downloads.status.downloading");
  const received = formatBytes(d?.receivedBytes);
  const total = formatBytes(d?.totalBytes);
  return `${t("downloads.status.downloading")} ${pct}% · ${received} / ${total}`;
}

function syncDownloadsBadge() {
  if (!downloadsBadge) return;
  const activeCount = downloads.filter(isDownloadActive).length;
  downloadsBadge.classList.toggle("hidden", activeCount <= 0);
  downloadsBadge.textContent = activeCount > 9 ? "9+" : String(activeCount);
  downloadsBadge.setAttribute("aria-hidden", activeCount > 0 ? "false" : "true");
}

function renderDownloadsShelf() {
  if (!downloadsList) return;
  const items = downloads
    .slice()
    .sort((a, b) => Number(b.startTime || 0) - Number(a.startTime || 0))
    .slice(0, 8);

  downloadsList.innerHTML = "";
  for (const d of items) {
    const id = String(d?.id || "");
    if (!id) continue;

    const itemEl = document.createElement("div");
    itemEl.className = "downloadItem";
    itemEl.dataset.downloadId = id;

    const topRow = document.createElement("div");
    topRow.className = "downloadTopRow";

    const nameEl = document.createElement("div");
    nameEl.className = "downloadName";
    nameEl.textContent = String(d.filename || d.savePath || id);

    const statusEl = document.createElement("div");
    statusEl.className = "downloadStatus";
    statusEl.textContent = getDownloadStatusText(d);

    topRow.append(nameEl, statusEl);

    const progressBar = document.createElement("div");
    progressBar.className = "downloadProgressBar";
    const progressInner = document.createElement("div");
    progressInner.className = "downloadProgressBarInner";
    const pct = getDownloadProgressPercent(d);
    progressInner.style.width = pct === null ? "0%" : `${pct}%`;
    progressBar.appendChild(progressInner);

    const actions = document.createElement("div");
    actions.className = "downloadActions";

    const state = String(d?.state || "").toLowerCase();
    if (state === "progressing") {
      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "secondary";
      cancelBtn.textContent = t("downloads.action.cancel");
      cancelBtn.addEventListener("click", async () => {
        const res = await window.aiBridge.cancelDownload(id);
        if (!res?.ok) window.aiBridge.showError(res?.error || t("error.aiGeneric"));
      });
      actions.appendChild(cancelBtn);
    } else if (state === "completed") {
      const openBtn = document.createElement("button");
      openBtn.type = "button";
      openBtn.className = "primaryBtn";
      openBtn.textContent = t("downloads.action.open");
      openBtn.addEventListener("click", async () => {
        const res = await window.aiBridge.openDownloadedFile(id);
        if (!res?.ok) window.aiBridge.showError(res?.error || t("error.aiGeneric"));
      });

      const showBtn = document.createElement("button");
      showBtn.type = "button";
      showBtn.className = "secondary";
      showBtn.textContent = t("downloads.action.show");
      showBtn.addEventListener("click", async () => {
        const res = await window.aiBridge.showDownloadInFolder(id);
        if (!res?.ok) window.aiBridge.showError(res?.error || t("error.aiGeneric"));
      });

      actions.append(showBtn, openBtn);
    } else {
      const showBtn = document.createElement("button");
      showBtn.type = "button";
      showBtn.className = "secondary";
      showBtn.textContent = t("downloads.action.show");
      showBtn.addEventListener("click", async () => {
        const res = await window.aiBridge.showDownloadInFolder(id);
        if (!res?.ok) window.aiBridge.showError(res?.error || t("error.aiGeneric"));
      });
      actions.append(showBtn);
    }

    itemEl.append(topRow, progressBar, actions);
    downloadsList.appendChild(itemEl);
  }

  syncDownloadsBadge();

  const shouldShow = !isDownloadsShelfDismissed && downloads.length > 0;
  setDownloadsShelfOpen(shouldShow);
}

async function initDownloads() {
  if (!window.aiBridge?.listDownloads || !window.aiBridge?.onDownloadEvent) return;
  const res = await window.aiBridge.listDownloads();
  if (res?.ok && Array.isArray(res.downloads)) {
    downloads = res.downloads;
  }
  renderDownloadsShelf();
  window.aiBridge.onDownloadEvent((evt) => {
    const type = String(evt?.type || "");
    const d = evt?.download && typeof evt.download === "object" ? evt.download : null;
    if (!d?.id) return;

    if (type === "created") {
      isDownloadsShelfDismissed = false;
    }

    const id = String(d.id);
    const idx = downloads.findIndex((x) => x && x.id === id);
    if (idx >= 0) downloads[idx] = d;
    else downloads.unshift(d);
    downloads = downloads.slice(0, 80);
    renderDownloadsShelf();
  });
}

function syncAiContext() {
  const active = getActiveTab();
  if (!active) {
    aiContextTitle.textContent = "";
    aiContextUrl.textContent = "";
    return;
  }
  aiContextTitle.textContent = active.title || t("tabs.untitled");
  aiContextUrl.textContent = active.url || "";
}

function updateTabScrollButtons() {
  const hasOverflow = tabStrip.scrollWidth > tabStrip.clientWidth + 2;
  tabsScrollLeftBtn.classList.toggle("hidden", !hasOverflow);
  tabsScrollRightBtn.classList.toggle("hidden", !hasOverflow);

  if (!hasOverflow) return;
  tabsScrollLeftBtn.disabled = tabStrip.scrollLeft <= 0;
  const maxScrollLeft = tabStrip.scrollWidth - tabStrip.clientWidth;
  tabsScrollRightBtn.disabled = tabStrip.scrollLeft >= maxScrollLeft - 1;
}

function createTabElement(tab) {
  const el = document.createElement("div");
  el.className = "tab";
  el.dataset.tabId = tab.id;
  el.setAttribute("role", "tab");
  el.setAttribute("aria-selected", "false");
  el.tabIndex = -1;

  const faviconEl = document.createElement("img");
  faviconEl.className = "tabFavicon";
  faviconEl.alt = "";
  faviconEl.src = tab.favicon || DEFAULT_FAVICON;
  faviconEl.addEventListener("error", () => {
    faviconEl.src = DEFAULT_FAVICON;
  });

  const titleEl = document.createElement("span");
  titleEl.className = "tabTitle";
  titleEl.textContent = tab.title || t("tabs.newTitle");

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "tabClose";
  closeBtn.title = t("tabs.close");
  closeBtn.setAttribute("aria-label", t("tabs.close"));
  closeBtn.textContent = "×";

  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeTab(tab.id);
  });

  el.addEventListener("click", () => setActiveTab(tab.id));
  el.addEventListener("auxclick", (e) => {
    if (e.button === 1) closeTab(tab.id);
  });
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveTab(tab.id);
    }
  });

  el.append(faviconEl, titleEl, closeBtn);
  tabStrip.appendChild(el);

  tab.tabEl = el;
  tab.faviconEl = faviconEl;
  tab.titleEl = titleEl;

  updateTabElement(tab.id);
  updateTabScrollButtons();
}

function updateTabElement(tabId) {
  const tab = getTab(tabId);
  if (!tab?.tabEl) return;

  const isActive = tabId === activeTabId;
  tab.tabEl.classList.toggle("active", isActive);
  tab.tabEl.classList.toggle("loading", Boolean(tab.isLoading));
  tab.tabEl.setAttribute("aria-selected", isActive ? "true" : "false");
  tab.tabEl.tabIndex = isActive ? 0 : -1;

  tab.titleEl.textContent = tab.title || t("tabs.newTitle");
  tab.faviconEl.src = tab.favicon || DEFAULT_FAVICON;
}

function attachWebviewEvents(tab) {
  const webview = tab.webview;
  applyPageZoomToWebview(webview);

  webview.addEventListener("dom-ready", () => {
    applyPageZoomToWebview(webview);
  });

  webview.addEventListener("did-start-loading", () => {
    tab.isLoading = true;
    tab.loadError = null;
    updateTabElement(tab.id);
    if (tab.id === activeTabId) {
      updateLoadingUI();
      syncStatusBar();
      updateNavButtons();
      updateLoadErrorOverlay();
    }
  });

  webview.addEventListener("did-stop-loading", () => {
    tab.isLoading = false;
    updateTabElement(tab.id);
    if (tab.id === activeTabId) {
      updateLoadingUI();
      syncStatusBar();
      updateNavButtons();
    }
  });

  webview.addEventListener("did-finish-load", () => {
    tab.loadError = null;
    if (tab.id === activeTabId) updateLoadErrorOverlay();
  });

  webview.addEventListener("page-title-updated", (e) => {
    tab.title = e.title || tab.title;
    recordHistoryVisit(tab.url, tab.title);
    updateTabElement(tab.id);
    if (tab.id === activeTabId) syncAiContext();
  });

  webview.addEventListener("page-favicon-updated", (e) => {
    const favicon = Array.isArray(e.favicons) ? e.favicons[0] : null;
    if (favicon) tab.favicon = favicon;
    updateTabElement(tab.id);
  });

		  const syncUrlFromWebview = () => {
		    tab.url = safeCall(() => webview.getURL(), tab.url);
		    resetFindInPageState(tab);
		    if (tab.id === activeTabId) updateFindMatchCountUi(tab);
		    recordHistoryVisit(tab.url, tab.title);
		    persistLastSessionTabs();
		    if (tab.id === activeTabId && document.activeElement !== urlInput) {
		      urlInput.value = tab.url || "";
	      syncClearButton();
	    }
		    updateNavButtons();
		    if (tab.id === activeTabId) syncAiContext();
		  };

	  webview.addEventListener("did-navigate", syncUrlFromWebview);
	  webview.addEventListener("did-navigate-in-page", syncUrlFromWebview);

	  webview.addEventListener("found-in-page", (e) => {
	    const result = e?.result && typeof e.result === "object" ? e.result : e;
	    const requestId = Number(result?.requestId);
	    if (!Number.isFinite(requestId) || requestId <= 0) return;
	    if (tab.findRequestId && requestId < tab.findRequestId) return;
	    if (requestId > tab.findRequestId) tab.findRequestId = requestId;
	    tab.findActiveMatchOrdinal = Number(result?.activeMatchOrdinal || 0) || 0;
	    tab.findMatches = Number(result?.matches || 0) || 0;
	    if (tab.id === activeTabId) updateFindMatchCountUi(tab);
	  });

  webview.addEventListener("update-target-url", (e) => {
    tab.hoverUrl = e.url || "";
    if (tab.id === activeTabId) syncStatusBar();
  });

  webview.addEventListener("new-window", (e) => {
    if (!e?.url) return;
    if (typeof e.preventDefault === "function") e.preventDefault();
    createTab(e.url, { makeActive: true });
  });

  webview.addEventListener("did-fail-load", (e) => {
    const isMainFrame = typeof e?.isMainFrame === "boolean" ? e.isMainFrame : true;
    if (!isMainFrame) return;

    const code = Number(e?.errorCode);
    if (code === -3) return; // ERR_ABORTED

    tab.isLoading = false;
    tab.loadError = {
      code,
      description: String(e?.errorDescription || "").trim() || "LOAD_FAILED",
      url: String(e?.validatedURL || e?.url || tab.url || "").trim()
    };

    updateTabElement(tab.id);
    if (tab.id !== activeTabId) return;
    updateLoadingUI();
    syncStatusBar();
    updateNavButtons();
    updateLoadErrorOverlay();
  });
}

function createTab(initialUrl = homeUrl || DEFAULT_HOME_URL, { makeActive = true } = {}) {
  const id = `tab_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const webview = document.createElement("webview");
  webview.className = "tabWebview hiddenWebview";
  webview.setAttribute("allowpopups", "");
  applyUserAgentToWebview(webview);
  webview.src = initialUrl;
  webviewArea.appendChild(webview);

		  const tab = {
		    id,
		    url: initialUrl,
		    title: t("tabs.newTitle"),
		    favicon: null,
		    isLoading: false,
		    loadError: null,
		    hoverUrl: "",
	    aiPanelOpen: Boolean(getActiveTab()?.aiPanelOpen),
	    aiConversationId: null,
	    findQuery: "",
	    findRequestId: 0,
	    findMatches: 0,
	    findActiveMatchOrdinal: 0,
		    webview,
		    tabEl: null,
		    faviconEl: null,
		    titleEl: null
		  };
  tabs.push(tab);
  attachWebviewEvents(tab);
  createTabElement(tab);

	  if (makeActive) setActiveTab(id);
	  else updateStatusMeta();
	  persistLastSessionTabs();

	  return tab;
	}

function setActiveTab(tabId) {
  const tab = getTab(tabId);
  if (!tab) return;
  activeTabId = tabId;

  applyActiveWebviewVisibility();
  for (const t of tabs) updateTabElement(t.id);

  if (document.activeElement !== urlInput) {
    urlInput.value = tab.url || safeCall(() => tab.webview.getURL(), "") || "";
    syncClearButton();
  }

  updateNavButtons();
  updateLoadingUI();
	  syncStatusBar();
	  syncAiContext();
	  syncAiConversationForActiveTab();
	  syncAiPanelOpenForActiveTab({ focus: false });
	  syncFindBarForActiveTab();
	  updateLoadErrorOverlay();

  tab.tabEl?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
}

function closeTab(tabId) {
  const idx = tabs.findIndex((t) => t.id === tabId);
  if (idx === -1) return;

  const [tab] = tabs.splice(idx, 1);
  tab.tabEl?.remove();
  tab.webview?.remove();

  if (activeTabId === tabId) {
    const fallback = tabs[idx] || tabs[idx - 1] || tabs[0] || null;
    if (fallback) setActiveTab(fallback.id);
    else createTab(homeUrl || DEFAULT_HOME_URL, { makeActive: true });
  } else {
    updateStatusMeta();
    updateTabScrollButtons();
  }
  persistLastSessionTabs();
}

function getNavigationUrl(input) {
  const text = (input || "").trim();
  if (!text) return null;
  if (/^(about|file|chrome|view-source):/i.test(text)) return text;
  if (/^https?:\/\//i.test(text)) return text;

  const hasSpaces = /\s/.test(text);
  const looksLikeHost =
    !hasSpaces && (text.includes(".") || text.startsWith("localhost") || /^[^/]+:\d+/.test(text));

  if (looksLikeHost) return `https://${text}`;
  return buildSearchUrl(text);
}

function navigateActiveTab(input) {
  const url = getNavigationUrl(input);
  if (!url) return;
  const webview = getActiveWebview();
  if (!webview) return;
  webview.loadURL(url);
  urlInput.blur();
}

function getSelectedPrompt() {
  const id = String(promptSelect?.value || "");
  return prompts.find((p) => p.id === id) || null;
}

function getPromptDraftFromEditor() {
  return {
    name: String(promptNameInput?.value || "").trim(),
    template: String(customPromptInput?.value || "").trim(),
    includePageContent: Boolean(promptIncludeContentCheckbox?.checked)
  };
}

function setPromptEditorFromPrompt(prompt) {
  if (!prompt) {
    promptNameInput.value = "";
    promptIdInput.value = "";
    customPromptInput.value = "";
    if (promptIncludeContentCheckbox) promptIncludeContentCheckbox.checked = true;
    return;
  }
  promptNameInput.value = prompt.name ?? "";
  promptIdInput.value = prompt.id ?? "";
  customPromptInput.value = prompt.template ?? "";
  if (promptIncludeContentCheckbox) {
    promptIncludeContentCheckbox.checked = prompt.includePageContent !== false;
  }
}

function isPromptEditorDirty(prompt) {
  const draft = getPromptDraftFromEditor();
  if (!prompt) return Boolean(draft.name || draft.template);
  const sameName = String(prompt.name ?? "") === draft.name;
  const sameTemplate = String(prompt.template ?? "") === draft.template;
  const sameInclude = Boolean(prompt.includePageContent !== false) === Boolean(draft.includePageContent);
  return !(sameName && sameTemplate && sameInclude);
}

function syncPromptEditorButtons() {
  const prompt = getSelectedPrompt();
  const draft = getPromptDraftFromEditor();
  const templateOk = Boolean(draft.template);
  const dirty = isPromptEditorDirty(prompt);
  if (savePromptBtn) savePromptBtn.disabled = !prompt || !dirty || !templateOk;
  if (deletePromptBtn) deletePromptBtn.disabled = !prompt;
}

function syncPromptFields() {
  setPromptEditorFromPrompt(getSelectedPrompt());
  syncPromptEditorButtons();
}

function renderPromptShortcuts() {
  if (!promptShortcuts) return;
  promptShortcuts.innerHTML = "";

  for (const p of prompts.filter((x) => String(x?.template || "").trim())) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "promptShortcutBtn";
    btn.dataset.promptId = p.id;
    btn.textContent = p.name || p.id;
    btn.title = p.name || p.id;
    promptShortcuts.appendChild(btn);
  }

  syncPromptShortcutsDisabledState();
}

function syncPromptShortcutsDisabledState() {
  if (!promptShortcuts) return;
  const disabled = isSendingChat || isAgentRunning || !prompts.length;
  promptShortcuts.classList.toggle("disabled", disabled);
  for (const btn of Array.from(promptShortcuts.querySelectorAll(".promptShortcutBtn"))) {
    btn.disabled = disabled;
  }
}

function renderPromptSelect(selectedId) {
  promptSelect.innerHTML = "";
  for (const p of prompts) {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name || p.id;
    promptSelect.appendChild(opt);
  }
  if (selectedId && prompts.some((p) => p.id === selectedId)) {
    promptSelect.value = selectedId;
  } else if (prompts.length) {
    promptSelect.value = prompts[0].id;
  }
  syncPromptFields();
  renderPromptShortcuts();
}

function getNextPromptName(baseName) {
  const base = String(baseName || "").trim() || t("prompts.add.defaultName");
  const existing = new Set(prompts.map((p) => String(p?.name || "").trim()).filter(Boolean));
  if (!existing.has(base)) return base;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base} ${i}`;
    if (!existing.has(candidate)) return candidate;
  }
  return `${base} ${Date.now()}`;
}

function getDefaultPrompts(language = uiLanguage) {
  const lang = resolveUiLanguage(language);
  const seeded = DEFAULT_PROMPTS_BY_LANGUAGE[lang] || DEFAULT_PROMPTS_BY_LANGUAGE.en || [];
  return seeded.map((p) => ({ ...p }));
}

function looksLikeDefaultPrompts(list, language) {
  const clean = sanitizePromptsList(list);
  const defaults = getDefaultPrompts(language);
  if (!defaults.length) return false;
  for (const def of defaults) {
    const found = clean.find((p) => p.id === def.id);
    if (!found) return false;
    if (found.name !== def.name) return false;
    if ((found.template || "") !== (def.template || "")) return false;
    if (Boolean(found.includePageContent) !== Boolean(def.includePageContent)) return false;
  }
  return true;
}

function syncDefaultPromptsForLanguageChange(list, fromLanguage, toLanguage) {
  const clean = sanitizePromptsList(list);
  const fromLang = resolveUiLanguage(fromLanguage);
  const toLang = resolveUiLanguage(toLanguage);
  const fromDefaults = getDefaultPrompts(fromLang);
  const toDefaults = getDefaultPrompts(toLang);

  const fromById = new Map(fromDefaults.map((p) => [p.id, p]));
  const toById = new Map(toDefaults.map((p) => [p.id, p]));

  const next = clean.map((p) => {
    const target = toById.get(p.id);
    if (!target) return p;
    const prevDefault = fromById.get(p.id);
    if (
      prevDefault &&
      p.name === prevDefault.name &&
      (p.template || "") === (prevDefault.template || "") &&
      Boolean(p.includePageContent) === Boolean(prevDefault.includePageContent)
    ) {
      return { ...p, name: target.name, template: target.template, includePageContent: target.includePageContent };
    }
    return p;
  });

  const existingIds = new Set(next.map((p) => p.id));
  for (const def of toDefaults) {
    if (!existingIds.has(def.id)) next.push({ ...def });
  }

  return sanitizePromptsList(next);
}

function stripContentPlaceholderFromTemplate(template) {
  const raw = String(template || "");
  if (!raw) return "";
  const withoutLine = raw.replace(/^[ \t]*\{\{content\}\}[ \t]*\r?\n?/gim, "");
  const withoutToken = withoutLine.replaceAll("{{content}}", "");
  return withoutToken.replace(/\n{3,}/g, "\n\n").trim();
}

function sanitizePromptItem(prompt) {
  if (!prompt || typeof prompt !== "object") return null;
  const id = String(prompt.id || "").trim();
  if (!id) return null;
  const name = typeof prompt.name === "string" && prompt.name.trim() ? prompt.name.trim() : id;
  const templateRaw = typeof prompt.template === "string" ? prompt.template : "";
  const template = stripContentPlaceholderFromTemplate(templateRaw);
  if (!template) return null;

  const includePageContentRaw = prompt.includePageContent;
  let includePageContent =
    typeof includePageContentRaw === "boolean" ? includePageContentRaw : templateRaw.includes("{{content}}");
  if (typeof includePageContentRaw !== "boolean") includePageContent = true;

  return { id, name, template, includePageContent };
}

function sanitizePromptsList(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const normalized = sanitizePromptItem(item);
    if (!normalized) continue;
    if (seen.has(normalized.id)) continue;
    seen.add(normalized.id);
    out.push(normalized);
  }
  return out;
}

function loadPromptsFromStorage() {
  return safeCall(() => {
    const raw = localStorage.getItem(PROMPTS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return { language: null, prompts: sanitizePromptsList(parsed) };
    }
    if (!parsed || typeof parsed !== "object") return null;
    const list = Array.isArray(parsed.prompts) ? parsed.prompts : null;
    if (!Array.isArray(list)) return null;
    const languageRaw = typeof parsed.language === "string" ? parsed.language.trim() : "";
    const language = languageRaw ? resolveUiLanguage(languageRaw) : null;
    return { language, prompts: sanitizePromptsList(list) };
  }, null);
}

function persistPromptsToStorage(list) {
  const clean = sanitizePromptsList(list);
  try {
    localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify({ version: 1, language: uiLanguage, prompts: clean }));
    return true;
  } catch (err) {
    window.aiBridge.showError(err?.message || t("error.promptsSave"));
    return false;
  }
}

async function persistPrompts() {
  persistPromptsToStorage(prompts);
}

async function loadPrompts(preferredId) {
  const stored = loadPromptsFromStorage();
  if (stored) {
    prompts = stored.prompts;
    promptsStorageLanguage = stored.language;
    let fromLang = promptsStorageLanguage;
    if (!fromLang) {
      if (looksLikeDefaultPrompts(prompts, "zh-TW")) fromLang = "zh-TW";
      else if (looksLikeDefaultPrompts(prompts, "es")) fromLang = "es";
      else if (looksLikeDefaultPrompts(prompts, "en")) fromLang = "en";
      else fromLang = uiLanguage;
    }
    prompts = syncDefaultPromptsForLanguageChange(prompts, fromLang, uiLanguage);
    promptsStorageLanguage = uiLanguage;
    persistPromptsToStorage(prompts);
  } else {
    let seeded = null;
    try {
      const res = await window.aiBridge.listPrompts();
      if (res?.ok && Array.isArray(res.prompts)) seeded = res.prompts;
    } catch {
    }
    const seededClean = sanitizePromptsList(seeded && seeded.length ? seeded : []);
    if (seededClean.length) {
      prompts = uiLanguage !== "zh-TW" && looksLikeDefaultPrompts(seededClean, "zh-TW")
        ? getDefaultPrompts(uiLanguage)
        : seededClean;
    } else {
      prompts = getDefaultPrompts(uiLanguage);
    }
    prompts = syncDefaultPromptsForLanguageChange(prompts, uiLanguage, uiLanguage);
    promptsStorageLanguage = uiLanguage;
    persistPromptsToStorage(prompts);
  }

  hasLoadedPrompts = true;

  const desired = typeof preferredId === "string" ? preferredId : "";
  const preferred =
    desired && prompts.some((p) => p.id === desired)
      ? desired
      : prompts.find((p) => p.id === "summary")
        ? "summary"
        : prompts[0]?.id;
  renderPromptSelect(preferred);
  persistAiAssistantOptions();
}

promptSelect.addEventListener("change", () => {
  syncPromptFields();
  persistAiAssistantOptions();
});

promptNameInput.addEventListener("input", syncPromptEditorButtons);
customPromptInput.addEventListener("input", syncPromptEditorButtons);
promptIncludeContentCheckbox?.addEventListener("change", syncPromptEditorButtons);

addPromptBtn.addEventListener("click", async () => {
  const id = `custom_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const name = getNextPromptName(t("prompts.add.defaultName"));
  prompts.push({ id, name, template: "", includePageContent: true });
  renderPromptSelect(id);
  persistAiAssistantOptions();
  customPromptInput.focus();
});

savePromptBtn.addEventListener("click", async () => {
  const id = promptSelect.value;
  const idx = prompts.findIndex((p) => p.id === id);
  if (idx === -1) return;
  const draft = getPromptDraftFromEditor();
  if (!draft.template) {
    window.aiBridge.showError(t("error.emptyPrompt"));
    customPromptInput.focus();
    return;
  }
  prompts[idx] = {
    ...prompts[idx],
    name: draft.name || prompts[idx].name,
    template: draft.template,
    includePageContent: Boolean(draft.includePageContent)
  };
  await persistPrompts();
  renderPromptSelect(id);
  persistAiAssistantOptions();
});

deletePromptBtn.addEventListener("click", async () => {
  const p = getSelectedPrompt();
  if (!p) return;
  if (!confirm(t("prompts.delete.confirm", { name: p.name }))) return;
  prompts = prompts.filter((x) => x.id !== p.id);
  await persistPrompts();
  renderPromptSelect(prompts[0]?.id);
  persistAiAssistantOptions();
});

resetPromptsBtn.addEventListener("click", async () => {
  if (!confirm(t("prompts.reset.confirm"))) return;
  prompts = getDefaultPrompts();
  await persistPrompts();
  renderPromptSelect(prompts.find((p) => p.id === "summary") ? "summary" : prompts[0]?.id);
  persistAiAssistantOptions();
});

urlInput.addEventListener("compositionstart", () => {
  isUrlInputComposing = true;
});
urlInput.addEventListener("compositionend", () => {
  isUrlInputComposing = false;
});

urlInput.addEventListener("keydown", (e) => {
  if (isUrlInputComposing || e.isComposing || e.keyCode === 229) return;
  if (e.key === "ArrowDown") {
    if (suggestionsEl.classList.contains("hidden")) updateSuggestions();
    setActiveSuggestionIndex(activeSuggestionIndex + 1);
    e.preventDefault();
    return;
  }

  if (e.key === "ArrowUp") {
    if (suggestionsEl.classList.contains("hidden")) updateSuggestions();
    setActiveSuggestionIndex(activeSuggestionIndex - 1);
    e.preventDefault();
    return;
  }

  if (e.key === "Escape") {
    hideSuggestions();
    e.preventDefault();
    return;
  }

  if (e.key === "Enter") {
    e.preventDefault();
    if (activeSuggestionIndex >= 0 && currentSuggestions[activeSuggestionIndex]?.url) {
      const s = currentSuggestions[activeSuggestionIndex];
      urlInput.value = s.fill ?? s.url;
      syncClearButton();
      navigateActiveTab(s.url);
      hideSuggestions();
      return;
    }

    navigateActiveTab(urlInput.value);
    hideSuggestions();
  }
});

urlInput.addEventListener("input", () => {
  syncClearButton();
  updateSuggestions();
});

urlInput.addEventListener("focus", () => {
  updateSuggestions();
});

urlInput.addEventListener("blur", () => {
  isUrlInputComposing = false;
  setTimeout(() => {
    if (document.activeElement !== urlInput) hideSuggestions();
  }, 120);
});

clearUrlBtn.addEventListener("click", () => {
  urlInput.value = "";
  syncClearButton();
  updateSuggestions();
  urlInput.focus();
});

suggestionsEl.addEventListener("mousedown", (e) => {
  const target = e.target.closest?.(".suggestionItem");
  if (!target) return;
  e.preventDefault();
  const idx = Number(target.dataset.index);
  const s = currentSuggestions[idx];
  if (!s?.url) return;
  urlInput.value = s.fill ?? s.url;
  syncClearButton();
  navigateActiveTab(s.url);
  hideSuggestions();
});

backBtn.addEventListener("click", () => {
  const webview = getActiveWebview();
  if (!webview) return;
  if (safeCall(() => webview.canGoBack(), false)) webview.goBack();
});

forwardBtn.addEventListener("click", () => {
  const webview = getActiveWebview();
  if (!webview) return;
  if (safeCall(() => webview.canGoForward(), false)) webview.goForward();
});

reloadBtn.addEventListener("click", () => {
  const tab = getActiveTab();
  const webview = tab?.webview;
  if (!tab || !webview) return;
  if (tab.isLoading) webview.stop();
  else webview.reload();
});

homeBtn.addEventListener("click", () => {
  const webview = getActiveWebview();
  if (!webview) return;
  webview.loadURL(homeUrl || DEFAULT_HOME_URL);
});

async function openDownloadsFolder() {
  if (!window.aiBridge?.openDownloadsFolder) return;
  const res = await window.aiBridge.openDownloadsFolder();
  if (!res?.ok) window.aiBridge.showError(res?.error || "Failed to open downloads folder");
}

downloadsFolderBtn?.addEventListener("click", openDownloadsFolder);
downloadsShelfOpenFolderBtn?.addEventListener("click", openDownloadsFolder);
downloadsShelfCloseBtn?.addEventListener("click", () => {
  isDownloadsShelfDismissed = true;
  setDownloadsShelfOpen(false);
  syncDownloadsBadge();
});

loadErrorRetryBtn?.addEventListener("click", () => {
  const tab = getActiveTab();
  if (!tab?.webview) return;
  tab.loadError = null;
  updateLoadErrorOverlay();
  try {
    tab.webview.reload();
  } catch {
    if (tab.url) tab.webview.loadURL(tab.url);
  }
});

loadErrorCopyBtn?.addEventListener("click", async () => {
  const tab = getActiveTab();
  const url = String(tab?.loadError?.url || tab?.url || "").trim();
  if (!url) return;
  try {
    await navigator.clipboard.writeText(url);
    return;
  } catch {
  }
  try {
    const el = document.createElement("textarea");
    el.value = url;
    el.style.position = "fixed";
    el.style.left = "-9999px";
    el.style.top = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    el.remove();
  } catch {
  }
});

findInput?.addEventListener("input", () => {
  if (!isFindBarOpen) return;
  scheduleFindInPage();
});

findInput?.addEventListener("keydown", (e) => {
  if (!isFindBarOpen) return;
  if (e.key === "Enter") {
    e.preventDefault();
    requestFindInPage({ findNext: true, forward: !e.shiftKey });
    return;
  }
  if (e.key === "Escape") {
    e.preventDefault();
    closeFindBar();
  }
});

findPrevBtn?.addEventListener("click", () => requestFindInPage({ findNext: true, forward: false }));
findNextBtn?.addEventListener("click", () => requestFindInPage({ findNext: true, forward: true }));
findCloseBtn?.addEventListener("click", closeFindBar);

function applyAiPanelOpenState(open, { focus = true } = {}) {
  const isOpen = Boolean(open);
  if (!isOpen) setAiHistoryOpen(false);
  if (!isOpen) stopVoiceRecording();
  aiPanel.classList.toggle("hidden", !isOpen);
  aiPanel.setAttribute("aria-hidden", isOpen ? "false" : "true");
  aiToggleBtn.classList.toggle("active", isOpen);
  aiToggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  if (isOpen) {
    applyAiPanelWidth(aiPanelWidthPx);
    syncAiContext();
    syncAiConversationForActiveTab();
    if (focus) chatInput.focus();
  }
}

function setAiPanelOpen(open, { focus = true } = {}) {
  const tab = getActiveTab();
  if (tab) tab.aiPanelOpen = Boolean(open);
  applyAiPanelOpenState(open, { focus });
}

function syncAiPanelOpenForActiveTab({ focus = false } = {}) {
  const tab = getActiveTab();
  applyAiPanelOpenState(Boolean(tab?.aiPanelOpen), { focus });
}

aiToggleBtn.addEventListener("click", () => {
  const tab = getActiveTab();
  setAiPanelOpen(!tab?.aiPanelOpen);
});

aiCloseBtn.addEventListener("click", () => {
  setAiPanelOpen(false);
});

aiNewConversationBtn?.addEventListener("click", () => {
  startNewAiConversation();
});

aiHistoryBtn?.addEventListener("click", () => {
  setAiHistoryOpen(!isAiHistoryOpen);
});

aiHistoryCloseBtn?.addEventListener("click", () => setAiHistoryOpen(false));

aiHistoryList?.addEventListener("click", (e) => {
  const item = e.target?.closest?.(".aiHistoryItem");
  if (!item) return;
  const id = item.dataset.conversationId;
  if (!id) return;
  setActiveAiConversation(id);
  setAiHistoryOpen(false);
});

function setAiSettingsModalOpen(open) {
  const isOpen = Boolean(open);
  aiSettingsModal.classList.toggle("hidden", !isOpen);
  aiSettingsModal.setAttribute("aria-hidden", isOpen ? "false" : "true");
  if (isOpen) {
    loadAiSettings();
    providerSelect.focus();
  }
}

aiSettingsBtn.addEventListener("click", () => setAiSettingsModalOpen(true));
aiSettingsCloseBtn.addEventListener("click", () => setAiSettingsModalOpen(false));

aiSettingsModal.addEventListener("mousedown", (e) => {
  if (e.target === aiSettingsModal) setAiSettingsModalOpen(false);
});

function setAppSettingsModalOpen(open) {
  const isOpen = Boolean(open);
  appSettingsModal.classList.toggle("hidden", !isOpen);
  appSettingsModal.setAttribute("aria-hidden", isOpen ? "false" : "true");
  if (isOpen) {
    syncBrowserSettingsUI();
    themeSelect.focus();
  }
}

appSettingsCloseBtn.addEventListener("click", () => setAppSettingsModalOpen(false));

appSettingsModal.addEventListener("mousedown", (e) => {
  if (e.target === appSettingsModal) setAppSettingsModalOpen(false);
});

function setHistoryModalOpen(open) {
  const isOpen = Boolean(open);
  historyModal.classList.toggle("hidden", !isOpen);
  historyModal.setAttribute("aria-hidden", isOpen ? "false" : "true");
  if (isOpen) {
    historySearchInput.value = "";
    renderHistoryList();
    historySearchInput.focus();
  }
}

historyCloseBtn.addEventListener("click", () => setHistoryModalOpen(false));

historyModal.addEventListener("mousedown", (e) => {
  if (e.target === historyModal) setHistoryModalOpen(false);
});

function setChromeImportModalOpen(open) {
  const isOpen = Boolean(open);
  chromeImportModal.classList.toggle("hidden", !isOpen);
  chromeImportModal.setAttribute("aria-hidden", isOpen ? "false" : "true");
  if (isOpen) {
    chromeImportHint.textContent = "";
  }
}

async function dismissChromeImportModal() {
  setChromeImportModalOpen(false);
  if (hasShownChromeImportModal) return;
  hasShownChromeImportModal = true;
  await window.aiBridge.markChromeImportModalShown();
}

chromeImportCloseBtn.addEventListener("click", dismissChromeImportModal);
chromeImportSkipBtn.addEventListener("click", dismissChromeImportModal);

chromeImportModal.addEventListener("mousedown", (e) => {
  if (e.target === chromeImportModal) dismissChromeImportModal();
});

themeSelect.addEventListener("change", async () => {
  await saveBrowserSettings({ theme: themeSelect.value });
});

languageSelect.addEventListener("change", async () => {
  await saveBrowserSettings({ language: languageSelect.value });
});

userAgentNameInput?.addEventListener("input", () => {
  syncUserAgentNameInputState();
});

userAgentNameInput?.addEventListener("keydown", (e) => {
  if (e.isComposing || e.keyCode === 229) return;
  if (e.key !== "Enter") return;
  e.preventDefault();
  userAgentNameInput.blur();
});

userAgentNameInput?.addEventListener("blur", async () => {
  syncUserAgentNameInputState();
  if (!isValidUserAgentName(userAgentNameInput.value)) return;
  await saveBrowserSettings({ userAgentName: userAgentNameInput.value });
});

startupModeGroup.addEventListener("change", async (e) => {
  const target = e.target;
  if (!target || target.name !== "startupMode") return;
  await saveBrowserSettings({ startupMode: target.value });
});

function parseStartupUrlsInput() {
  return startupUrlsInput.value
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 12);
}

let startupUrlsSaveTimer = null;
startupUrlsInput.addEventListener("input", () => {
  if (startupUrlsSaveTimer) clearTimeout(startupUrlsSaveTimer);
  startupUrlsSaveTimer = setTimeout(() => {
    saveBrowserSettings({ startupUrls: parseStartupUrlsInput() });
  }, 450);
});

startupUrlsInput.addEventListener("blur", () => saveBrowserSettings({ startupUrls: parseStartupUrlsInput() }));

saveHomePageBtn.addEventListener("click", () => saveBrowserSettings({ homePage: homePageInput.value }));

homePageInput.addEventListener("keydown", (e) => {
  if (e.isComposing || e.keyCode === 229) return;
  if (e.key === "Enter") {
    e.preventDefault();
    saveBrowserSettings({ homePage: homePageInput.value });
  }
});

searchEngineSelect.addEventListener("change", async () => {
  const choice = searchEngineSelect.value;
  if (choice === "custom") {
    searchEngineTemplateRow.classList.remove("hidden");
    searchEngineTemplateInput.focus();
    return;
  }
  searchEngineTemplateRow.classList.add("hidden");
  await saveBrowserSettings({ searchEngineTemplate: getSearchTemplateForChoice(choice) });
});

saveSearchTemplateBtn.addEventListener("click", async () => {
  searchEngineSelect.value = "custom";
  searchEngineTemplateRow.classList.remove("hidden");
  await saveBrowserSettings({ searchEngineTemplate: searchEngineTemplateInput.value });
});

searchEngineTemplateInput.addEventListener("keydown", (e) => {
  if (e.isComposing || e.keyCode === 229) return;
  if (e.key === "Enter") {
    e.preventDefault();
    saveSearchTemplateBtn.click();
  }
});

clearHistoryBtn.addEventListener("click", () => {
  if (!confirm(t("appSettings.privacy.clearHistoryConfirm"))) return;
  clearHistory();
});

historySearchInput.addEventListener("input", () => renderHistoryList());

historyClearBtn.addEventListener("click", () => {
  if (!confirm(t("appSettings.privacy.clearHistoryConfirm"))) return;
  clearHistory();
  renderHistoryList();
});

async function runChromeImport({ showHintEl = null } = {}) {
  const hintEl = showHintEl || importChromeStatus;
  hintEl.textContent = t("appSettings.import.status.importing");
  try {
    const res = await window.aiBridge.importChromePreferences();
    if (!res.ok) {
      hintEl.textContent = "";
      window.aiBridge.showError(res.error);
      return false;
    }
    hasShownChromeImportModal = true;
    await loadAppSettings();
    hintEl.textContent = res.sourcePath
      ? t("appSettings.import.status.importedPath", { path: res.sourcePath })
      : t("appSettings.import.status.imported");
    return true;
  } finally {
    // keep status text
  }
}

importChromeBtn.addEventListener("click", async () => {
  if (!confirm(t("appSettings.import.confirm"))) return;
  await runChromeImport();
});

chromeImportConfirmBtn.addEventListener("click", async () => {
  chromeImportConfirmBtn.disabled = true;
  chromeImportSkipBtn.disabled = true;
  chromeImportCloseBtn.disabled = true;
  const ok = await runChromeImport({ showHintEl: chromeImportHint });
  if (ok) setChromeImportModalOpen(false);
  chromeImportConfirmBtn.disabled = false;
  chromeImportSkipBtn.disabled = false;
  chromeImportCloseBtn.disabled = false;
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!chromeImportModal.classList.contains("hidden")) {
    dismissChromeImportModal();
    return;
  }
  if (!appSettingsModal.classList.contains("hidden")) {
    setAppSettingsModalOpen(false);
    return;
  }
  if (!aiSettingsModal.classList.contains("hidden")) {
    setAiSettingsModalOpen(false);
    return;
  }
  if (isAiHistoryOpen) {
    setAiHistoryOpen(false);
    return;
  }
  if (!historyModal.classList.contains("hidden")) {
    setHistoryModalOpen(false);
  }
});

function setProviderUI(provider) {
  const key = String(provider || "").trim();
  localModelRow.classList.toggle("hidden", key !== "local");
  pullModelRow.classList.toggle("hidden", key !== "local");
  geminiRow.classList.toggle("hidden", key !== "gemini");
  openAiRow.classList.toggle("hidden", key !== "openai");
}

providerSelect.addEventListener("change", () => {
  setProviderUI(providerSelect.value);
  persistAiAssistantOptions();
});

aiFontSizeSelect?.addEventListener("change", () => {
  applyAiFontSizeLevel(aiFontSizeSelect.value);
  persistAiAssistantOptions();
});

voiceModelSelect?.addEventListener("change", () => {
  persistAiAssistantOptions();
});

function normalizeGeminiApiKeyInput(apiKey) {
  let key = String(apiKey ?? "");
  key = key.replace(/[\u200B-\u200D\u2060\uFEFF]/g, ""); // zero-width/invisible
  key = key.trim();
  key = key.replace(/^["'`]+/, "").replace(/["'`]+$/, "");
  key = key.replace(/\s+/g, "");
  key = key.replace(/[\u2010-\u2015\u2212\uFE63\uFF0D]/g, "-"); // dashes
  key = key.replace(/\uFF3F/g, "_"); // fullwidth underscore
  return key;
}

function isValidGeminiApiKey(apiKey) {
  const key = normalizeGeminiApiKeyInput(apiKey);
  if (!key) return false;
  if (key.length < 20) return false;
  if (key.length > 240) return false;
  if (!/^[0-9A-Za-z_-]+$/.test(key)) return false;
  if (key.startsWith("AIza") && key.length < 32) return false;
  return true;
}

function isValidOpenAiApiKey(apiKey) {
  const key = String(apiKey || "").trim();
  if (!key) return false;
  if (key.length < 8) return false;
  if (key.length > 400) return false;
  if (/\\s/.test(key)) return false;
  return true;
}

function setGeminiKeyError(message) {
  const text = String(message || "").trim();
  geminiKeyError.textContent = text;
  geminiKeyErrorRow.classList.toggle("hidden", !text);
}

function setOpenAiKeyError(message) {
  const text = String(message || "").trim();
  openAiKeyError.textContent = text;
  openAiKeyErrorRow.classList.toggle("hidden", !text);
}

function syncGeminiKeySaveState() {
  const key = normalizeGeminiApiKeyInput(geminiApiKeyInput.value);
  if (!key) {
    saveGeminiKeyBtn.disabled = true;
    setGeminiKeyError("");
    return;
  }
  const ok = isValidGeminiApiKey(key);
  saveGeminiKeyBtn.disabled = !ok;
  setGeminiKeyError(ok ? "" : t("aiSettings.gemini.keyError.invalid"));
}

function syncOpenAiKeySaveState() {
  const key = openAiApiKeyInput.value.trim();
  if (!key) {
    saveOpenAiKeyBtn.disabled = true;
    setOpenAiKeyError("");
    return;
  }
  const ok = isValidOpenAiApiKey(key);
  saveOpenAiKeyBtn.disabled = !ok;
  setOpenAiKeyError(ok ? "" : t("aiSettings.openai.keyError.invalid"));
}

function syncGoogleOauthSaveState() {
  const clientId = String(googleOauthClientIdInput?.value || "").trim();
  if (googleOauthSaveClientIdBtn) googleOauthSaveClientIdBtn.disabled = !clientId;
  const secret = String(googleOauthClientSecretInput?.value || "").trim();
  if (googleOauthSaveClientSecretBtn) googleOauthSaveClientSecretBtn.disabled = !secret;
}

async function loadAiSettings() {
  const res = await window.aiBridge.getSettings();
  if (!res.ok) {
    window.aiBridge.showError(res.error);
    return;
  }

  const s = res.settings || {};
  const model = typeof s.geminiModel === "string" ? s.geminiModel : "";
  if (model && Array.from(geminiModelSelect.options).some((o) => o.value === model)) {
    geminiModelSelect.value = model;
  }

	  const source = s.geminiApiKeySource;
	  const format = s.geminiApiKeyFormat;
	  const encryptionAvailable = Boolean(s.encryptionAvailable);
	  geminiApiKeySource = source === "stored" || source === "env" ? source : "none";

	  if (source === "stored") {
	    const storageText =
	      format === "safeStorage"
        ? t("aiSettings.gemini.keyStatus.savedEncrypted")
        : format === "plain"
          ? t("aiSettings.gemini.keyStatus.savedPlain")
          : t("aiSettings.gemini.keyStatus.saved");
    geminiKeyStatus.textContent = storageText;
    clearGeminiKeyBtn.disabled = false;
  } else if (source === "env") {
    geminiKeyStatus.textContent = t("aiSettings.gemini.keyStatus.env");
    clearGeminiKeyBtn.disabled = true;
  } else {
    geminiKeyStatus.textContent = encryptionAvailable
      ? t("aiSettings.gemini.keyStatus.notSetEncryptedAvailable")
      : t("aiSettings.gemini.keyStatus.notSetNoEncryption");
    clearGeminiKeyBtn.disabled = true;
  }

  syncGeminiKeySaveState();

  openAiBaseUrlInput.value = typeof s.openAiBaseUrl === "string" ? s.openAiBaseUrl : "";
  openAiModelInput.value = typeof s.openAiModel === "string" ? s.openAiModel : "";

  const openAiSource = s.openAiApiKeySource;
  const openAiFormat = s.openAiApiKeyFormat;
  openAiApiKeySource = openAiSource === "stored" || openAiSource === "env" ? openAiSource : "none";

  if (openAiSource === "stored") {
    const storageText =
      openAiFormat === "safeStorage"
        ? t("aiSettings.openai.keyStatus.savedEncrypted")
        : openAiFormat === "plain"
          ? t("aiSettings.openai.keyStatus.savedPlain")
          : t("aiSettings.openai.keyStatus.saved");
    openAiKeyStatus.textContent = storageText;
    clearOpenAiKeyBtn.disabled = false;
  } else if (openAiSource === "env") {
    openAiKeyStatus.textContent = t("aiSettings.openai.keyStatus.env");
    clearOpenAiKeyBtn.disabled = true;
  } else {
    openAiKeyStatus.textContent = encryptionAvailable
      ? t("aiSettings.openai.keyStatus.notSetEncryptedAvailable")
      : t("aiSettings.openai.keyStatus.notSetNoEncryption");
    clearOpenAiKeyBtn.disabled = true;
  }

  syncOpenAiKeySaveState();

  const googleOauth = s.googleOauth && typeof s.googleOauth === "object" ? s.googleOauth : {};
  const googleClientId = String(googleOauth.clientId || "").trim();
  const googleHasClientSecret = Boolean(googleOauth.hasClientSecret);
  const googleHasRefreshToken = Boolean(googleOauth.hasRefreshToken);
  const googleConnectedAt = Number(googleOauth.connectedAt) || 0;
  const googleScopes = Array.isArray(googleOauth.scopes) ? googleOauth.scopes.map((x) => String(x || "").trim()).filter(Boolean) : [];

  if (googleOauthClientIdInput) googleOauthClientIdInput.value = googleClientId;

  const effectiveScopes = googleScopes.length ? googleScopes : DEFAULT_GOOGLE_OAUTH_SCOPES;
  for (const input of googleOauthScopeInputs) {
    const value = String(input?.value || "").trim();
    if (!value) continue;
    input.checked = effectiveScopes.includes(value);
  }

  if (googleOauthStatus) {
    const parts = [];
    parts.push(googleHasRefreshToken ? t("aiSettings.google.status.connected") : t("aiSettings.google.status.disconnected"));
    if (googleConnectedAt) parts.push(new Date(googleConnectedAt).toLocaleString());
    if (googleHasClientSecret) parts.push(t("aiSettings.google.status.clientSecretSaved"));
    if (googleHasRefreshToken) parts.push(t("aiSettings.google.status.refreshTokenSaved"));
    googleOauthStatus.textContent = parts.join(" · ");
  }
  if (googleOauthConnectBtn) {
    googleOauthConnectBtn.disabled = !(googleClientId && googleHasClientSecret);
    googleOauthConnectBtn.textContent = googleHasRefreshToken ? t("aiSettings.google.reconnect") : t("aiSettings.google.connect");
  }
  if (googleOauthDisconnectBtn) googleOauthDisconnectBtn.disabled = !googleHasRefreshToken;
  if (googleOauthClearBtn) googleOauthClearBtn.disabled = !(googleClientId || googleHasClientSecret || googleHasRefreshToken);

  syncGoogleOauthSaveState();
  persistAiAssistantOptions();
}

geminiModelSelect.addEventListener("change", async () => {
  const model = geminiModelSelect.value;
  const res = await window.aiBridge.setGeminiModel(model);
  if (!res.ok) {
    window.aiBridge.showError(res.error);
    await loadAiSettings();
    return;
  }
  persistAiAssistantOptions();
});

toggleGeminiKeyBtn.addEventListener("click", () => {
  geminiApiKeyInput.type = geminiApiKeyInput.type === "password" ? "text" : "password";
});

geminiApiKeyInput.addEventListener("input", syncGeminiKeySaveState);

saveGeminiKeyBtn.addEventListener("click", async () => {
  const key = normalizeGeminiApiKeyInput(geminiApiKeyInput.value);
  if (!isValidGeminiApiKey(key)) {
    syncGeminiKeySaveState();
    return;
  }
  saveGeminiKeyBtn.disabled = true;
  const prevText = saveGeminiKeyBtn.textContent;
  saveGeminiKeyBtn.textContent = t("aiSettings.gemini.keySave.saving");
  try {
    const res = await window.aiBridge.setGeminiApiKey(key);
    if (!res.ok) {
      window.aiBridge.showError(res.error);
      return;
    }
    geminiApiKeyInput.value = "";
    geminiApiKeyInput.type = "password";
    setGeminiKeyError("");
    await loadAiSettings();
  } finally {
    saveGeminiKeyBtn.textContent = prevText;
    syncGeminiKeySaveState();
  }
});

clearGeminiKeyBtn.addEventListener("click", async () => {
  if (!confirm(t("aiSettings.gemini.keyClearConfirm"))) return;
  clearGeminiKeyBtn.disabled = true;
  const res = await window.aiBridge.clearGeminiApiKey();
  if (!res.ok) {
    window.aiBridge.showError(res.error);
    return;
  }
  await loadAiSettings();
});

openAiBaseUrlInput.addEventListener("change", async () => {
  const baseUrl = String(openAiBaseUrlInput.value || "").trim();
  const res = await window.aiBridge.setOpenAiBaseUrl(baseUrl);
  if (!res.ok) {
    window.aiBridge.showError(res.error);
    await loadAiSettings();
    return;
  }
  if (typeof res.openAiBaseUrl === "string") openAiBaseUrlInput.value = res.openAiBaseUrl;
});

openAiModelInput.addEventListener("change", async () => {
  const model = String(openAiModelInput.value || "").trim();
  const res = await window.aiBridge.setOpenAiModel(model);
  if (!res.ok) {
    window.aiBridge.showError(res.error);
    await loadAiSettings();
    return;
  }
  if (typeof res.openAiModel === "string") openAiModelInput.value = res.openAiModel;
});

toggleOpenAiKeyBtn.addEventListener("click", () => {
  openAiApiKeyInput.type = openAiApiKeyInput.type === "password" ? "text" : "password";
});

openAiApiKeyInput.addEventListener("input", syncOpenAiKeySaveState);

saveOpenAiKeyBtn.addEventListener("click", async () => {
  const key = openAiApiKeyInput.value.trim();
  if (!isValidOpenAiApiKey(key)) {
    syncOpenAiKeySaveState();
    return;
  }
  saveOpenAiKeyBtn.disabled = true;
  const prevText = saveOpenAiKeyBtn.textContent;
  saveOpenAiKeyBtn.textContent = t("aiSettings.openai.keySave.saving");
  try {
    const res = await window.aiBridge.setOpenAiApiKey(key);
    if (!res.ok) {
      window.aiBridge.showError(res.error);
      return;
    }
    openAiApiKeyInput.value = "";
    openAiApiKeyInput.type = "password";
    setOpenAiKeyError("");
    await loadAiSettings();
  } finally {
    saveOpenAiKeyBtn.textContent = prevText;
    syncOpenAiKeySaveState();
  }
});

clearOpenAiKeyBtn.addEventListener("click", async () => {
  if (!confirm(t("aiSettings.openai.keyClearConfirm"))) return;
  clearOpenAiKeyBtn.disabled = true;
  const res = await window.aiBridge.clearOpenAiApiKey();
  if (!res.ok) {
    window.aiBridge.showError(res.error);
    return;
  }
  await loadAiSettings();
});

toggleGoogleOauthSecretBtn?.addEventListener("click", () => {
  if (!googleOauthClientSecretInput) return;
  googleOauthClientSecretInput.type = googleOauthClientSecretInput.type === "password" ? "text" : "password";
});

googleOauthClientIdInput?.addEventListener("input", syncGoogleOauthSaveState);
googleOauthClientSecretInput?.addEventListener("input", syncGoogleOauthSaveState);

googleOauthSaveClientIdBtn?.addEventListener("click", async () => {
  const clientId = String(googleOauthClientIdInput?.value || "").trim();
  if (!clientId) {
    syncGoogleOauthSaveState();
    return;
  }
  googleOauthSaveClientIdBtn.disabled = true;
  const res = await window.aiBridge.setGoogleOauthClientId(clientId);
  if (!res.ok) {
    window.aiBridge.showError(res.error);
    await loadAiSettings();
    return;
  }
  await loadAiSettings();
});

googleOauthSaveClientSecretBtn?.addEventListener("click", async () => {
  const clientSecret = String(googleOauthClientSecretInput?.value || "").trim();
  if (!clientSecret) {
    syncGoogleOauthSaveState();
    return;
  }
  googleOauthSaveClientSecretBtn.disabled = true;
  const res = await window.aiBridge.setGoogleOauthClientSecret(clientSecret);
  if (!res.ok) {
    window.aiBridge.showError(res.error);
    await loadAiSettings();
    return;
  }
  if (googleOauthClientSecretInput) {
    googleOauthClientSecretInput.value = "";
    googleOauthClientSecretInput.type = "password";
  }
  await loadAiSettings();
});

for (const input of googleOauthScopeInputs) {
  input?.addEventListener?.("change", async () => {
    const scopes = googleOauthScopeInputs
      .filter((el) => el && el.checked)
      .map((el) => String(el.value || "").trim())
      .filter(Boolean)
      .slice(0, 12);
    const res = await window.aiBridge.setGoogleOauthScopes(scopes);
    if (!res.ok) {
      window.aiBridge.showError(res.error);
      await loadAiSettings();
      return;
    }
    await loadAiSettings();
  });
}

googleOauthConnectBtn?.addEventListener("click", async () => {
  googleOauthConnectBtn.disabled = true;
  const prevText = googleOauthConnectBtn.textContent;
  googleOauthConnectBtn.textContent = t("aiSettings.google.connecting");
  try {
    const res = await window.aiBridge.googleOauthConnect({ openExternal: true });
    if (!res.ok) {
      window.aiBridge.showError(res.error);
      return;
    }
    await loadAiSettings();
  } finally {
    googleOauthConnectBtn.textContent = prevText;
    await loadAiSettings();
  }
});

googleOauthDisconnectBtn?.addEventListener("click", async () => {
  if (!confirm(t("aiSettings.google.disconnectConfirm"))) return;
  googleOauthDisconnectBtn.disabled = true;
  const res = await window.aiBridge.disconnectGoogleOauth();
  if (!res.ok) {
    window.aiBridge.showError(res.error);
    await loadAiSettings();
    return;
  }
  await loadAiSettings();
});

googleOauthClearBtn?.addEventListener("click", async () => {
  if (!confirm(t("aiSettings.google.clearConfirm"))) return;
  googleOauthClearBtn.disabled = true;
  const res = await window.aiBridge.clearGoogleOauthClient();
  if (!res.ok) {
    window.aiBridge.showError(res.error);
    await loadAiSettings();
    return;
  }
  await loadAiSettings();
});

async function refreshLocalModels() {
  const desired = String(localModelSelect.value || "").trim() || String(loadAiAssistantOptionsFromStorage()?.localModel || "").trim();
  localModelSelect.innerHTML = "";
  localModelSelect.disabled = true;
  const res = await window.aiBridge.listLocalModels();
  if (!res.ok) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = t("aiSettings.localModel.unavailable");
    opt.disabled = true;
    localModelSelect.appendChild(opt);
    persistAiAssistantOptions();
    return;
  }
  const models = Array.isArray(res.models) ? res.models.map((m) => String(m || "").trim()).filter(Boolean) : [];
  if (!models.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = t("aiSettings.localModel.noneInstalled");
    opt.disabled = true;
    localModelSelect.appendChild(opt);
    persistAiAssistantOptions();
    return;
  }
  for (const m of models) {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    localModelSelect.appendChild(opt);
  }
  localModelSelect.disabled = false;
  localModelSelect.value = models.includes(desired) ? desired : models[0];
  persistAiAssistantOptions();
}

refreshModelsBtn.addEventListener("click", refreshLocalModels);

pullModelBtn.addEventListener("click", async () => {
  const name = pullModelInput.value.trim();
  if (!name) return;
  pullModelBtn.disabled = true;
  pullModelBtn.textContent = t("aiSettings.pull.downloading");
  const res = await window.aiBridge.pullLocalModel(name);
  pullModelBtn.disabled = false;
  pullModelBtn.textContent = t("aiSettings.pull.button");
  if (!res.ok) {
    window.aiBridge.showError(res.error);
    return;
  }
  await refreshLocalModels();
});

function setChatSending(sending) {
  isSendingChat = Boolean(sending);
  syncAiComposerUiState();
}

function setAgentRunning(running) {
  isAgentRunning = Boolean(running);
  syncAiComposerUiState();
}

function syncAiStopButtonState() {
  if (!aiAgentStopBtn) return;
  aiAgentStopBtn.classList.add("hidden");
  aiAgentStopBtn.disabled = true;
}

function syncAiComposerUiState() {
  const busy = isSendingChat || isAgentRunning;
  chatInput.disabled = busy;
  chatSendBtn.disabled = false;
  chatSendBtn.classList.toggle("stopMode", busy);
  chatSendBtn.textContent = busy ? t("ai.chat.stop") : t("ai.chat.send");
  chatSendBtn.title = busy ? t("ai.chat.stop") : t("ai.chat.send");
  chatSendBtn.setAttribute("aria-label", chatSendBtn.title);
  syncPromptShortcutsDisabledState();
  syncChatMicButtonState();
  syncAiStopButtonState();
}

function stopAgentRun() {
  if (!isAgentRunning) return;
  agentRunSeq++;
  setAgentRunning(false);
  setChatSending(false);
}

function stopChatRun() {
  if (!isSendingChat || isAgentRunning) return;
  const run = activeChatRun && typeof activeChatRun === "object" ? activeChatRun : null;
  if (run) run.stopped = true;

  chatRunSeq++;
  setChatSending(false);

  const stoppedText = t("ai.chat.stopped");
  const stoppedMeta = `${t("ai.meta.assistant")} · ${t("ai.meta.stopped")}`;

	  const assistantMsg = run?.assistantMsg;
	  if (assistantMsg?.root?.isConnected) {
	    assistantMsg.metaEl.textContent = stoppedMeta;
	    assistantMsg.contentEl.className = "aiMsgText";
	    assistantMsg.contentEl.textContent = stoppedText;
	    try {
	      assistantMsg.root.dataset.copyText = stoppedText;
	    } catch {
	    }
	    try {
	      assistantMsg.root.removeAttribute("aria-busy");
	    } catch {
	    }
	    try {
	      aiChatMessages.appendChild(assistantMsg.root);
	    } catch {
	    }
	  }

  const conv = run?.conversationRecord;
  if (conv && Array.isArray(conv.messages)) {
    const ts = Date.now();
    conv.messages.push({ role: "assistant", meta: stoppedMeta, content: stoppedText, ts, skipContext: true });
    conv.updatedAt = ts;
    persistAiChatStore();

    if (
      !assistantMsg?.root?.isConnected &&
      run?.tabId &&
      run.tabId === activeTabId &&
      getActiveTab()?.aiConversationId === run?.conversationId
    ) {
      renderAiConversationMessages(conv.messages);
    }
  }

  if (activeChatRun?.seq === run?.seq) activeChatRun = null;
  scrollAiChatToBottom({ behavior: "smooth" });
}

function stopAgentFlow() {
  if (!isAgentRunning) return;
  const run = activeAgentRun && typeof activeAgentRun === "object" ? activeAgentRun : null;
  if (run) {
    run.stopped = true;
    run.uiStopped = true;
  }

  const stoppedText = t("ai.agent.stopped");
  const stoppedMeta = `${t("ai.meta.assistant")} · Agent · ${t("ai.meta.stopped")}`;
	  const assistantMsg = run?.assistantMsg;
	  if (assistantMsg?.root?.isConnected) {
	    assistantMsg.metaEl.textContent = stoppedMeta;
	    assistantMsg.contentEl.className = "aiMsgText";
	    assistantMsg.contentEl.textContent = stoppedText;
	    try {
	      assistantMsg.root.dataset.copyText = stoppedText;
	    } catch {
	    }
	    try {
	      assistantMsg.root.removeAttribute("aria-busy");
	    } catch {
	    }
	  }

  const stepsGroup = run?.stepsGroup;
  if (stepsGroup?.root) {
    try {
      stepsGroup.root.classList.add("done");
    } catch {
    }
    try {
      if (stepsGroup.detailsEl) stepsGroup.detailsEl.open = false;
    } catch {
    }
  }

  const conv = run?.conversationRecord;
  if (conv && Array.isArray(conv.messages)) {
    const ts = Date.now();
    conv.messages.push({ role: "assistant", meta: stoppedMeta, content: stoppedText, ts, skipContext: true });
    conv.updatedAt = ts;
    persistAiChatStore();

    if (
      !assistantMsg?.root?.isConnected &&
      run?.tabId &&
      run.tabId === activeTabId &&
      getActiveTab()?.aiConversationId === run?.conversationId
    ) {
      renderAiConversationMessages(conv.messages);
    }
  }

  stopAgentRun();
  if (activeAgentRun?.seq === run?.seq) activeAgentRun = null;
  scrollAiChatToBottom({ behavior: "smooth" });
}

function stopAiFlow() {
  if (isAgentRunning) return stopAgentFlow();
  return stopChatRun();
}

aiAgentStopBtn?.addEventListener("click", stopAiFlow);

function syncChatMicButtonState() {
  if (!chatMicBtn) return;
  const disabled = (isSendingChat || isAgentRunning) && !isVoiceRecording && !isVoiceTranscribing;
  chatMicBtn.disabled = disabled;
  chatMicBtn.classList.toggle("recording", isVoiceRecording);
  chatMicBtn.classList.toggle("busy", isVoiceTranscribing);
  if (isVoiceRecording || isVoiceTranscribing) {
    chatMicBtn.textContent = "⏹";
    chatMicBtn.title = isVoiceRecording ? t("ai.voice.listening") : t("ai.voice.transcribing");
    chatMicBtn.setAttribute("aria-label", chatMicBtn.title);
    return;
  }
  chatMicBtn.textContent = "🎙";
  chatMicBtn.title = t("ai.voice.button");
  chatMicBtn.setAttribute("aria-label", t("ai.voice.button"));
}

function stopVoiceStreamTracks(stream) {
  const tracks = stream?.getTracks?.() || [];
  for (const track of tracks) {
    try {
      track.stop();
    } catch {
    }
  }
}

const CJK_CHAR_RE = /[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uAC00-\uD7AF]/;
const CJK_PUNCT_RE = /[，。！？；：、]/;
const CJK_OPEN_BRACKET_RE = /[（【「『《〈]/;
const CJK_CLOSE_BRACKET_RE = /[）】」』》〉]/;
const CJK_SPACE_RE = /[ \t\u00A0]+/g;

function isCjkChar(ch) {
  return Boolean(ch) && CJK_CHAR_RE.test(ch);
}

function isCjkPunct(ch) {
  return Boolean(ch) && CJK_PUNCT_RE.test(ch);
}

function normalizeCjkSpacing(text) {
  let out = String(text ?? "");
  out = out
    .replace(
      /([\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uAC00-\uD7AF])[ \t\u00A0]+([\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uAC00-\uD7AF])/g,
      "$1$2"
    )
    .replace(
      /([\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uAC00-\uD7AF])[ \t\u00A0]+([，。！？；：、])/g,
      "$1$2"
    )
    .replace(
      /([，。！？；：、])[ \t\u00A0]+([\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uAC00-\uD7AF])/g,
      "$1$2"
    )
    .replace(/([（【「『《〈])[ \t\u00A0]+/g, "$1")
    .replace(/[ \t\u00A0]+([）】」』》〉])/g, "$1");
  return out;
}

function joinTextSmart(a, b) {
  const left = String(a ?? "");
  const right = String(b ?? "");
  if (!left) return right;
  if (!right) return left;
  if (/\s$/.test(left) || /^\s/.test(right)) return `${left}${right}`;

  const leftChar = left[left.length - 1];
  const rightChar = right[0];

  if (CJK_OPEN_BRACKET_RE.test(leftChar) || CJK_CLOSE_BRACKET_RE.test(rightChar)) return `${left}${right}`;
  if ((isCjkChar(leftChar) || isCjkPunct(leftChar)) && (isCjkChar(rightChar) || isCjkPunct(rightChar))) {
    return `${left}${right}`;
  }
  if (isCjkChar(leftChar) && isCjkPunct(rightChar)) return `${left}${right}`;
  if (isCjkPunct(leftChar) && isCjkChar(rightChar)) return `${left}${right}`;

  return `${left} ${right}`;
}

function applyVoiceDictationToChatInput() {
  if (!voiceDictationActive) return;
  const committed = String(voiceDictationCommittedText || "").trim();
  const current = String(voiceDictationCurrentText || "").trim();
  const dictation = joinTextSmart(committed, current).trim();
  const base = String(voiceDictationBaseText || "");
  chatInput.value = joinTextSmart(base, dictation).trimStart();
  chatInput.scrollTop = chatInput.scrollHeight;
}

function commitVoiceDictationCurrentText() {
  const current = String(voiceDictationCurrentText || "").trim();
  if (!current) return;
  const committed = String(voiceDictationCommittedText || "").trim();
  voiceDictationCommittedText = joinTextSmart(committed, current).trim();
  voiceDictationCurrentText = "";
}

function ensureLiveVoiceEventListener() {
  if (unsubscribeLiveVoiceEvents || !window.aiBridge?.onLiveVoiceEvent) return;
  unsubscribeLiveVoiceEvents = window.aiBridge.onLiveVoiceEvent((evt) => {
	    if (!voiceDictationActive) return;
	    const type = String(evt?.type || "");
	    if (type === "inputTranscription") {
      const text = normalizeCjkSpacing(String(evt?.text ?? "").replace(CJK_SPACE_RE, " ")).trim();
      if (!text) return;

      const committed = String(voiceDictationCommittedText || "").trim();
      const current = String(voiceDictationCurrentText || "").trim();
      const displayed = joinTextSmart(committed, current).trim();
      const last = String(voiceDictationLastTranscriptionText || "").trim();

      let nextCommitted = committed;
      let nextCurrent = current;

      if (displayed && text.length >= displayed.length && text.startsWith(displayed)) {
        nextCommitted = "";
        nextCurrent = text;
      } else if (committed && text.length >= committed.length && text.startsWith(committed)) {
        nextCurrent = text.slice(committed.length).trimStart();
      } else if (last && text.length >= last.length && text.startsWith(last)) {
        nextCurrent = text;
      } else {
        if (current) nextCommitted = joinTextSmart(committed, current).trim();
        nextCurrent = text;
      }

      voiceDictationCommittedText = nextCommitted;
      voiceDictationCurrentText = nextCurrent;
      voiceDictationLastTranscriptionText = text;
      applyVoiceDictationToChatInput();
      return;
    }
    if (type === "turnComplete") {
      commitVoiceDictationCurrentText();
      voiceDictationLastTranscriptionText = "";
      applyVoiceDictationToChatInput();
      return;
    }
    if (type === "error") {
      const message = String(evt?.error || t("error.aiGeneric"));
      window.aiBridge.showError(message);
      stopVoiceRecording();
      return;
    }
    if (type === "closed" && (isVoiceRecording || isVoiceTranscribing)) {
      const reason = String(evt?.reason || "").trim();
      const clean = Boolean(evt?.clean);
      if (reason && !clean) window.aiBridge.showError(reason);
      stopVoiceRecording();
    }
  });
}

function pickVoiceRecorderMimeType() {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg"
  ];
  for (const mimeType of candidates) {
    if (MediaRecorder.isTypeSupported(mimeType)) return mimeType;
  }
  return "";
}

function decodeAudioData(audioContext, arrayBuffer) {
  return new Promise((resolve, reject) => {
    const maybePromise = audioContext.decodeAudioData(arrayBuffer, resolve, reject);
    if (maybePromise && typeof maybePromise.then === "function") {
      maybePromise.then(resolve).catch(reject);
    }
  });
}

function writeWavString(view, offset, text) {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

function floatTo16BitPCM(view, offset, input) {
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}

function downsampleFloat32Buffer(buffer, inputSampleRate, outputSampleRate) {
  const inRate = Number(inputSampleRate);
  const outRate = Number(outputSampleRate);
  if (!Number.isFinite(inRate) || !Number.isFinite(outRate)) return buffer;
  if (outRate >= inRate) return buffer;
  const sampleRateRatio = inRate / outRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = count ? accum / count : 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

function mixAudioBufferToMono(audioBuffer) {
  const channels = Number(audioBuffer?.numberOfChannels || 0);
  if (!channels) return new Float32Array();
  if (channels === 1) return audioBuffer.getChannelData(0);
  const length = audioBuffer.length;
  const mixed = new Float32Array(length);
  for (let ch = 0; ch < channels; ch++) {
    const data = audioBuffer.getChannelData(ch);
    for (let i = 0; i < length; i++) mixed[i] += data[i] / channels;
  }
  return mixed;
}

function encodePcmAsWav(samples, sampleRate) {
  const dataLength = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  writeWavString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeWavString(view, 8, "WAVE");
  writeWavString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeWavString(view, 36, "data");
  view.setUint32(40, dataLength, true);
  floatTo16BitPCM(view, 44, samples);

  return buffer;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error("Failed to read audio"));
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(blob);
  });
}

async function convertAudioBlobToWav(blob) {
  const mime = String(blob?.type || "").toLowerCase();
  if (mime === "audio/wav" || mime === "audio/wave") return blob;
  const arrayBuffer = await blob.arrayBuffer();
  const AudioContextImpl = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextImpl) throw new Error(t("ai.voice.error.notSupported"));
  const audioContext = new AudioContextImpl();
  try {
    const decoded = await decodeAudioData(audioContext, arrayBuffer.slice(0));
    const mono = mixAudioBufferToMono(decoded);
    const inRate = Number(decoded.sampleRate) || 48000;
    const outRate = inRate > 16000 ? 16000 : inRate;
    const samples = outRate === inRate ? mono : downsampleFloat32Buffer(mono, inRate, outRate);
    const wavArrayBuffer = encodePcmAsWav(samples, outRate);
    return new Blob([wavArrayBuffer], { type: "audio/wav" });
  } finally {
    try {
      await audioContext.close();
    } catch {
    }
  }
}

async function transcribeVoiceAudioBlob(blob) {
  if (!window.aiBridge?.transcribeAudio) throw new Error(t("ai.voice.error.notSupported"));
  const wavBlob = await convertAudioBlobToWav(blob);
  const base64 = await blobToBase64(wavBlob);
  const model = String(voiceModelSelect?.value || DEFAULT_VOICE_MODEL).trim() || DEFAULT_VOICE_MODEL;
  const res = await window.aiBridge.transcribeAudio({
    model,
    audio: { mimeType: wavBlob.type || "audio/wav", data: base64 }
  });
  if (!res?.ok) throw new Error(res?.error || t("error.aiGeneric"));
  return String(res.text || "").trim();
}

async function stopVoiceRecording() {
  clearTimeout(voiceAutoStopTimer);
  voiceAutoStopTimer = null;

  if (!isVoiceRecording && !isVoiceTranscribing) return;
  voiceSessionSeq++;

  isVoiceRecording = false;
  isVoiceTranscribing = true;
  syncChatMicButtonState();

  try {
    voiceProcessorNode?.disconnect?.();
  } catch {
  }
  try {
    voiceSourceNode?.disconnect?.();
  } catch {
  }
  try {
    voiceSilenceGainNode?.disconnect?.();
  } catch {
  }
  try {
    voiceProcessorNode && (voiceProcessorNode.onaudioprocess = null);
  } catch {
  }
  voiceProcessorNode = null;
  voiceSourceNode = null;
  voiceSilenceGainNode = null;

  const stream = voiceStream;
  voiceStream = null;
  stopVoiceStreamTracks(stream);

  try {
    await voiceAudioContext?.close?.();
  } catch {
  }
  voiceAudioContext = null;

  try {
    await window.aiBridge?.liveVoiceStop?.();
  } catch {
  }

  commitVoiceDictationCurrentText();
  applyVoiceDictationToChatInput();
  voiceDictationActive = false;
  voiceDictationLastTranscriptionText = "";

  isVoiceTranscribing = false;
  syncChatMicButtonState();
}

async function startVoiceRecording() {
  const AudioContextImpl = window.AudioContext || window.webkitAudioContext;
  if (!navigator.mediaDevices?.getUserMedia || !AudioContextImpl) {
    window.aiBridge.showError(t("ai.voice.error.notSupported"));
    return;
  }
  if (!window.aiBridge?.liveVoiceStart || !window.aiBridge?.liveVoiceSendAudio || !window.aiBridge?.liveVoiceStop) {
    window.aiBridge.showError(t("ai.voice.error.notSupported"));
    return;
  }
  if (isVoiceRecording || isVoiceTranscribing || isSendingChat) return;

  if (geminiApiKeySource === "none") {
    window.aiBridge.showError(t("ai.voice.error.noGeminiKey"));
    setAiSettingsModalOpen(true);
    return;
  }

  const seq = ++voiceSessionSeq;
  ensureLiveVoiceEventListener();

  voiceDictationActive = true;
  voiceDictationBaseText = String(chatInput.value || "");
  voiceDictationCommittedText = "";
  voiceDictationCurrentText = "";
  voiceDictationLastTranscriptionText = "";

  isVoiceTranscribing = true;
  syncChatMicButtonState();

  stopVoiceStreamTracks(voiceStream);
  voiceStream = null;
  try {
    await voiceAudioContext?.close?.();
  } catch {
  }
  voiceAudioContext = null;

  try {
    voiceStream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } });
  } catch (err) {
    isVoiceTranscribing = false;
    voiceDictationActive = false;
    syncChatMicButtonState();
    window.aiBridge.showError(
      err?.name === "NotAllowedError" ? t("ai.voice.error.micPermission") : err?.message || err
    );
    return;
  }
  if (seq !== voiceSessionSeq) {
    stopVoiceStreamTracks(voiceStream);
    voiceStream = null;
    isVoiceTranscribing = false;
    voiceDictationActive = false;
    syncChatMicButtonState();
    return;
  }

  const model = String(voiceModelSelect?.value || DEFAULT_VOICE_MODEL).trim() || DEFAULT_VOICE_MODEL;
  const startRes = await window.aiBridge.liveVoiceStart({ model });
  if (seq !== voiceSessionSeq) {
    try {
      await window.aiBridge.liveVoiceStop();
    } catch {
    }
    stopVoiceStreamTracks(voiceStream);
    voiceStream = null;
    isVoiceTranscribing = false;
    voiceDictationActive = false;
    syncChatMicButtonState();
    return;
  }
  if (!startRes?.ok) {
    isVoiceTranscribing = false;
    syncChatMicButtonState();
    stopVoiceStreamTracks(voiceStream);
    voiceStream = null;
    voiceDictationActive = false;
    window.aiBridge.showError(startRes?.error || t("error.aiGeneric"));
    return;
  }

  let audioContext;
  try {
    audioContext = new AudioContextImpl({ sampleRate: LIVE_VOICE_SAMPLE_RATE });
  } catch {
    audioContext = new AudioContextImpl();
  }
  voiceAudioContext = audioContext;

  if (seq !== voiceSessionSeq) {
    stopVoiceStreamTracks(voiceStream);
    voiceStream = null;
    try {
      await audioContext.close?.();
    } catch {
    }
    voiceAudioContext = null;
    isVoiceTranscribing = false;
    voiceDictationActive = false;
    syncChatMicButtonState();
    return;
  }

  const sourceNode = audioContext.createMediaStreamSource(voiceStream);
  const processor = audioContext.createScriptProcessor(2048, 1, 1);
  const gain = audioContext.createGain();
  gain.gain.value = 0;

  processor.onaudioprocess = (evt) => {
    if (!isVoiceRecording || !voiceDictationActive) return;
    const input = evt?.inputBuffer?.getChannelData?.(0);
    if (!input || !input.length) return;

    const inRate = Number(audioContext.sampleRate) || LIVE_VOICE_SAMPLE_RATE;
    const mono = inRate > LIVE_VOICE_SAMPLE_RATE ? downsampleFloat32Buffer(input, inRate, LIVE_VOICE_SAMPLE_RATE) : input;
    const pcmBuffer = new ArrayBuffer(mono.length * 2);
    const view = new DataView(pcmBuffer);
    floatTo16BitPCM(view, 0, mono);
    window.aiBridge.liveVoiceSendAudio({ audio: { mimeType: LIVE_VOICE_MIME_TYPE, bytes: pcmBuffer } });
  };

  sourceNode.connect(processor);
  processor.connect(gain);
  gain.connect(audioContext.destination);

  voiceSourceNode = sourceNode;
  voiceProcessorNode = processor;
  voiceSilenceGainNode = gain;

  try {
    await audioContext.resume?.();
  } catch {
  }

  isVoiceRecording = true;
  isVoiceTranscribing = false;
  syncChatMicButtonState();
  voiceAutoStopTimer = setTimeout(() => stopVoiceRecording(), 30_000);
}

async function buildAiPageContext(webviewOverride) {
  const webview = webviewOverride || getActiveWebview();
  if (!webview) throw new Error(t("error.noActiveTab"));

  const pageTitle = await webview.executeJavaScript("document.title");
  const pageUrl = safeCall(() => webview.getURL(), "");

  const contextMode = contextModeSelect.value;
  let contextLabel = t("ai.context.currentPage");
  let content = "";

  if (contextMode === "selection" || contextMode === "auto") {
    const selection = await webview.executeJavaScript(
      "window.getSelection ? window.getSelection().toString() : ''"
    );
    const selectedText = String(selection || "").trim();
    if (selectedText) {
      contextLabel = t("ai.context.selection");
      content = selectedText;
    } else if (contextMode === "selection") {
      throw new Error(t("ai.error.selectionMissing"));
    }
  }

  if (!content) {
    contextLabel = t("ai.context.currentPage");
    content = await webview.executeJavaScript("document.body ? document.body.innerText : ''");
  }

  return {
    pageTitle: String(pageTitle || "").trim(),
    pageUrl: String(pageUrl || "").trim(),
    contextLabel,
    pageContent: String(content || "").trim().slice(0, 20000)
  };
}

function buildAiSystemPrompt({ pageTitle, pageUrl, contextLabel, pageContent }) {
  return t("ai.systemPrompt");
}

function buildAiContextBlock({ pageTitle, pageUrl, contextLabel, pageContent }) {
  const title = String(pageTitle || "").trim();
  const url = String(pageUrl || "").trim();
  const label = String(contextLabel || "").trim() || t("ai.context.currentPage");
  const content = String(pageContent || "").trim();

  const chunks = [];
  if (title) chunks.push(`【${t("ai.context.pageTitle")}】${title}`);
  if (url) chunks.push(`【${t("ai.context.url")}】${url}`);
  if (content) chunks.push(`【${label}】\n${content}`);
  return chunks.join("\n\n").trim();
}

function applyPromptTemplateVars(template, { pageTitle, pageUrl }) {
  const title = String(pageTitle || "");
  const url = String(pageUrl || "");
  return String(template || "").replaceAll("{{title}}", title).replaceAll("{{url}}", url);
}

function buildPromptInstructionFromPrompt(prompt, { pageTitle, pageUrl, contextLabel }) {
  const template = String(prompt?.template || "").trim();
  if (!template) return "";
  let text = applyPromptTemplateVars(template, { pageTitle, pageUrl }).trim();
  if (prompt?.includePageContent === false) return text;
  const note = t("ai.context.attachedNote", { label: String(contextLabel || t("ai.context.currentPage")) });
  return `${text}\n\n${note}`.trim();
}

function buildPromptMessageFromPrompt(prompt, ctx) {
  const template = String(prompt?.template || "").trim();
  if (!template) return "";
  let text = applyPromptTemplateVars(template, ctx || {}).trim();
  if (prompt?.includePageContent === false) return text;
  const ctxBlock = buildAiContextBlock(ctx || {});
  if (!ctxBlock) return text;
  return `${text}\n\n${ctxBlock}`.trim();
}

async function sendAiChatMessage({ displayText, buildUserMessage }) {
  const shown = String(displayText ?? "").trim();
  if (!shown) return;
  if (isSendingChat) return;

  const seq = ++chatRunSeq;
  const tab = getActiveTab();
  const tabId = tab?.id || null;
  const webview = tab?.webview || null;

  const userMsg = createAiChatMessage({ role: "user", meta: t("ai.meta.user"), text: shown });
  const assistantMsg = createAiChatMessage({
    role: "assistant",
    meta: t("ai.meta.assistant"),
    text: t("ai.chat.sending")
  });
  setAiAssistantMessagePending(assistantMsg);
  setChatSending(true);

  ensureActiveAiConversation();
  const conversationId = aiActiveConversationId;
  const conv = conversationId ? getAiConversationRecord(conversationId) : null;
  const historyForAi = (Array.isArray(conv?.messages) ? conv.messages : [])
    .filter((m) => m && !m.skipContext && (m.role === "user" || m.role === "assistant"))
    .map((m) => ({ role: m.role, content: m.content }));

  const now = Date.now();
  const userRecord = {
    role: "user",
    meta: t("ai.meta.user"),
    content: shown,
    ts: now,
    skipContext: false
  };
  if (conv && Array.isArray(conv.messages)) {
    conv.messages.push(userRecord);
    conv.updatedAt = now;
    persistAiChatStore();
  }

  activeChatRun = {
    seq,
    tabId,
    conversationId,
    conversationRecord: conv,
    assistantMsg,
    userMsg,
    userRecord,
    stopped: false
  };

  try {
    const ctx = await buildAiPageContext(webview);
    if (seq !== chatRunSeq) return;

    if (tabId && tabId === activeTabId) {
      if (ctx.pageTitle) aiContextTitle.textContent = ctx.pageTitle;
      if (ctx.pageUrl) aiContextUrl.textContent = ctx.pageUrl;
    }

    const providerValue = String(providerSelect.value || "").trim();
    const provider = providerValue === "gemini" ? "gemini" : providerValue === "openai" ? "openai" : "local";
    let model = "";
    let baseUrl = "";
    if (provider === "local") {
      model = String(localModelSelect.value || "").trim();
      if (!model) throw new Error(t("ai.error.localModelMissing"));
    } else if (provider === "gemini") {
      model = String(geminiModelSelect.value || "gemini-2.5-flash");
    } else {
      model = String(openAiModelInput.value || "").trim();
      baseUrl = String(openAiBaseUrlInput.value || "").trim();
      if (!model) throw new Error("OpenAI-compatible model not set");
    }

    const built = typeof buildUserMessage === "function" ? buildUserMessage(ctx) : "";
    const historyText =
      typeof built === "string" ? built : built && typeof built === "object" ? built.history : "";
    const aiText = typeof built === "string" ? built : built && typeof built === "object" ? built.ai : "";
    const userMessage = String(historyText || "").trim();
    const aiMessage = String(aiText || "").trim();
    if (!aiMessage) throw new Error(t("error.emptyPrompt"));

    if (userMessage && userMessage !== shown) {
      userRecord.content = userMessage;
      if (userMsg?.root?.isConnected) userMsg.contentEl.textContent = userMessage;
      try {
        if (userMsg?.root) userMsg.root.dataset.copyText = userMessage;
      } catch {
      }
    }

    const systemPrompt = buildAiSystemPrompt(ctx);

    const messages = [
      { role: "system", content: systemPrompt },
      ...historyForAi,
      { role: "user", content: aiMessage }
    ];

    const res = await window.aiBridge.generate({ provider, model, baseUrl, messages, prompt: aiMessage });
    if (seq !== chatRunSeq) return;
    if (!res.ok) throw new Error(res.error || t("error.aiGeneric"));

    const providerLabel =
      provider === "local"
        ? t("ai.meta.provider.local")
        : provider === "gemini"
          ? t("ai.meta.provider.gemini")
          : t("ai.meta.provider.openai");
    const assistantMeta = `${t("ai.meta.assistant")} · ${providerLabel} · ${model}`;
	    const assistantText = String(res.text ?? "").trim();
	    if (assistantMsg?.root?.isConnected) {
	      assistantMsg.metaEl.textContent = assistantMeta;
	      assistantMsg.contentEl.className = "aiMarkdown";
	      assistantMsg.contentEl.innerHTML = renderAiMarkdownToSanitizedHtml(assistantText);
	      try {
	        assistantMsg.root.dataset.copyText = assistantText;
	      } catch {
	      }
	      try {
	        assistantMsg.root.removeAttribute("aria-busy");
	      } catch {
	      }
	    }
    const doneAt = Date.now();
    if (conv && Array.isArray(conv.messages)) {
      conv.messages.push({
        role: "assistant",
        meta: assistantMeta,
        content: assistantText,
        ts: doneAt,
        skipContext: false
      });
      conv.updatedAt = doneAt;
      persistAiChatStore();
    }

    if (
      !assistantMsg?.root?.isConnected &&
      tabId &&
      tabId === activeTabId &&
      getActiveTab()?.aiConversationId === conversationId
    ) {
      renderAiConversationMessages(conv?.messages || []);
    }
  } catch (err) {
    if (seq !== chatRunSeq) return;
    const message = String(err?.message || err);
	    const errorMeta = `${t("ai.meta.assistant")} · ${t("ai.meta.error")}`;
	    if (assistantMsg?.root?.isConnected) {
	      assistantMsg.metaEl.textContent = errorMeta;
	      assistantMsg.contentEl.className = "aiMsgText";
	      assistantMsg.contentEl.textContent = message;
	      try {
	        assistantMsg.root.dataset.copyText = message;
	      } catch {
	      }
	      try {
	        assistantMsg.root.removeAttribute("aria-busy");
	      } catch {
	      }
	    }
    if (conv && Array.isArray(conv.messages)) {
      const ts = Date.now();
      conv.messages.push({ role: "assistant", meta: errorMeta, content: message, ts, skipContext: true });
      conv.updatedAt = ts;
      persistAiChatStore();
    }
    if (
      !assistantMsg?.root?.isConnected &&
      tabId &&
      tabId === activeTabId &&
      getActiveTab()?.aiConversationId === conversationId
    ) {
      renderAiConversationMessages(conv?.messages || []);
    }
    window.aiBridge.showError(message);
  } finally {
    if (activeChatRun?.seq === seq) activeChatRun = null;
    if (seq === chatRunSeq) setChatSending(false);
    if (seq === chatRunSeq) scrollAiChatToBottom({ behavior: "smooth" });
  }
}

function isBrowserAgentMode() {
  return String(aiModeSelect?.value || "chat") === "browser";
}

function parseJsonObjectFromText(text) {
  const raw = String(text ?? "").trim();
  if (!raw) return null;
  const coerce = (value) => {
    if (!value || typeof value !== "object") return null;
    if (Array.isArray(value)) {
      const first = value[0];
      if (first && typeof first === "object" && !Array.isArray(first)) return first;
      return null;
    }
    return value;
  };

  const extractFirstJsonValue = (source) => {
    const s = String(source ?? "");
    const start = s.search(/[{[]/);
    if (start < 0) return null;
    const stack = [];
    let inString = false;
    let escaped = false;
    for (let i = start; i < s.length; i++) {
      const ch = s[i];
      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (ch === "\\") {
          escaped = true;
        } else if (ch === "\"") {
          inString = false;
        }
        continue;
      }
      if (ch === "\"") {
        inString = true;
        continue;
      }
      if (ch === "{" || ch === "[") {
        stack.push(ch);
        continue;
      }
      if (ch === "}" || ch === "]") {
        const open = stack.pop();
        const ok = (open === "{" && ch === "}") || (open === "[" && ch === "]");
        if (!ok) return null;
        if (stack.length === 0) return s.slice(start, i + 1);
      }
    }
    return null;
  };

  try {
    return coerce(JSON.parse(raw));
  } catch {
  }

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced && fenced[1]) {
    try {
      return coerce(JSON.parse(fenced[1]));
    } catch {
    }
  }

  const extracted = extractFirstJsonValue(raw);
  if (extracted) {
    try {
      return coerce(JSON.parse(extracted));
    } catch {
    }
  }

  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first >= 0 && last > first) {
    const slice = raw.slice(first, last + 1);
    try {
      return coerce(JSON.parse(slice));
    } catch {
    }
  }
  return null;
}

function truncateText(text, maxLen = 900) {
  const raw = String(text ?? "");
  if (raw.length <= maxLen) return raw;
  return `${raw.slice(0, maxLen)}… (truncated, ${raw.length} chars)`;
}

function agentDebugLog(message, data) {
  try {
    window.aiBridge?.logToMain?.({ scope: "agent", message: String(message || ""), data });
  } catch {
  }
}

function coerceJsonObject(value) {
  if (!value) return null;
  if (typeof value !== "object") return null;
  if (Array.isArray(value)) return null;
  return value;
}

function coerceJsonObjectFromText(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return coerceJsonObject(parsed);
  } catch {
    return null;
  }
}

function normalizeBrowserAgentToolName(tool) {
  const raw = String(tool || "").trim();
  if (!raw) return null;
  const compact = raw.toLowerCase().replace(/[^a-z]/g, "");
  if (!compact) return null;
  if (["snapshot", "observe", "inspect", "scan"].includes(compact)) return "snapshot";
  if (["screenshot", "capturescreenshot", "screencap", "screen", "captureimage"].includes(compact)) return "screenshot";
  if (["findelements", "findelement", "find", "query", "search", "locate"].includes(compact)) return "findElements";
  if (["readelement", "getelement", "elementinfo", "elementdetails"].includes(compact)) return "readElement";
  if (["collectlinks", "getlinks", "extractlinks", "linklist", "listlinks"].includes(compact)) return "collectLinks";
  if (["extractstructureddata", "structureddata", "extractjsonld", "extractldjson", "jsonld"].includes(compact)) {
    return "extractStructuredData";
  }
  if (["extracttables", "readtables", "tables"].includes(compact)) return "extractTables";
  if (["readerextract", "readability", "extractarticle", "articleextract", "extractcontent"].includes(compact)) return "readerExtract";
  if (["scrollintoview", "bringintoview", "scrolltoelement"].includes(compact)) return "scrollIntoView";
  if (["click", "tap"].includes(compact)) return "click";
  if (["clickbytext", "clicktext", "clickontxt", "clicklabel"].includes(compact)) return "clickByText";
  if (["clickbyselector", "clickselector", "clickcss"].includes(compact)) return "clickBySelector";
  if (["hover", "mouseover", "mousemove", "move"].includes(compact)) return "hover";
  if (["scroll", "wheel", "mousewheel", "scrollby", "scrollto"].includes(compact)) return "scroll";
  if (["filltext", "focusandtype", "clickandtype", "smarttype"].includes(compact)) return "fillText";
  if (["type", "fill", "input", "setvalue"].includes(compact)) return "type";
  if (["hotkey", "shortcut", "keycombo", "keycombination"].includes(compact)) return "hotkey";
  if (["press", "keypress", "key"].includes(compact)) return "press";
  if (["navigate", "goto", "open", "visit"].includes(compact)) return "navigate";
  if (["waitfor", "waitforselector", "waitfortext", "waitforurl", "waitcondition"].includes(compact)) return "waitFor";
  if (["wait", "waitforload", "waitfornavigation", "waituntil"].includes(compact)) return "waitForLoad";
  if (["tablist", "listtabs", "tabs"].includes(compact)) return "tabList";
  if (["tabactivate", "activatetab", "switchtab", "focustab"].includes(compact)) return "tabActivate";
  if (["tabopen", "opentab", "newtab", "createtab", "addtab"].includes(compact)) return "tabOpen";
  if (["tabclose", "closetab", "removetab", "deletetab"].includes(compact)) return "tabClose";
  if (["reportcreate", "createreport", "buildreport", "renderreport", "makereport"].includes(compact)) return "reportCreate";
  if (["exportfile", "writefile", "savefile", "workspacewrite", "export"].includes(compact)) return "exportFile";
  if (["downloadswait", "downloadwait", "waitdownload", "waitfordownload"].includes(compact)) return "downloadsWait";
  if (["uploadfile", "setinputfiles", "attachfile", "upload"].includes(compact)) return "uploadFile";
  if (["paginateandcollect", "scrollandcollect", "collectwithscroll", "autoscrollcollect"].includes(compact)) return "paginateAndCollect";
  if (["multitabresearch", "batchresearch", "researchbatch", "bulkresearch"].includes(compact)) return "multiTabResearch";
  if (["networkgetresponses", "networkresponses", "capturenetwork", "networklog", "getresponses"].includes(compact)) return "networkGetResponses";
  if (["cookieexport", "exportcookies", "cookiesexport"].includes(compact)) return "cookieExport";
  if (["cookieimport", "importcookies", "cookiesimport"].includes(compact)) return "cookieImport";
  if (["googlesheetsappendrows", "sheetsappendrows", "sheetappendrows", "sheetsappend"].includes(compact)) return "googleSheetsAppendRows";
  if (["googledocscreateorappend", "docscreateorappend", "docsappend", "docscreate"].includes(compact)) return "googleDocsCreateOrAppend";
  if (["googleslidescreatedeck", "slidescreatedeck", "slidescreate", "createdeck"].includes(compact)) return "googleSlidesCreateDeck";
  return null;
}

function inferBrowserAgentToolNameFromArgsObject(obj, rawText) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return null;

  const hasOwn = (key) => Object.prototype.hasOwnProperty.call(obj, key);
  const get = (key) => {
    if (!hasOwn(key)) return null;
    const value = obj[key];
    if (value == null) return null;
    const text = String(value).trim();
    return text ? text : null;
  };

  const hasAny = (keys) => keys.some((key) => get(key) != null);
  const keyCount = Object.keys(obj).length;

  if (hasAny(["markdown", "md"]) || (hasAny(["title"]) && /report|summary|簡報|報告/i.test(String(rawText || "")))) {
    return "reportCreate";
  }
  if (hasAny(["filename", "fileName"]) || (hasAny(["format"]) && hasAny(["content", "text", "data"]))) {
    return "exportFile";
  }
  if (hasAny(["includeJsonLd", "includeTables", "maxTables", "maxJsonLd", "jsonLd", "tables"])) {
    return "extractStructuredData";
  }
  if (hasAny(["sameOrigin", "urlIncludes", "textIncludes"]) && !hasAny(["fields", "paths", "deltaY", "selector"])) {
    return "collectLinks";
  }
  if (hasAny(["maxChars"]) && !hasAny(["fields", "paths", "deltaY", "selector"])) return "readerExtract";
  if (hasAny(["makeActive", "background"]) && hasAny(["url", "toUrl", "href"])) return "tabOpen";

  if (hasAny(["url", "toUrl", "href"])) return "navigate";
  if (hasAny(["state", "waitUntil", "wait_until"])) return "waitForLoad";
  if (hasAny(["selector", "css", "querySelector", "urlIncludes", "timeoutMs", "timeout_ms"])) return "waitFor";
  if (hasAny(["key", "keys"])) return "press";
  if (hasAny(["deltaY", "deltaX", "dy", "dx"])) return "scroll";
  if (hasAny(["fullPage", "full_page", "format", "mimeType"])) return "screenshot";
  if (hasAny(["fields", "field"])) return "readElement";
  if (hasAny(["paths", "path", "filePath", "file_path"])) return "uploadFile";
  if (hasAny(["tabId", "tab_id", "tabIndex", "tab_index"])) return "tabActivate";
  if ((get("x") && get("y")) || (get("clientX") && get("clientY"))) {
    const raw = String(rawText || "");
    if (/(hover|mouseover|mousemove|悬停|移到|停留)/i.test(raw)) return "hover";
    return "click";
  }

  const hasId = hasAny(["id", "elementId", "element_id", "selectorId"]);
  const hasText = hasAny(["text", "value"]);
  const hasFillMeta = hasAny(["count", "clickCount", "enter", "pressEnter", "retries", "retry"]);
  if (hasText && hasFillMeta) return "fillText";
  if (hasText) return "type";

  const raw = String(rawText || "");
  if (hasId) {
    if (/(type|fill|input|enter|paste|輸入|填入)/i.test(raw)) return "type";
    if (/(hover|mouseover|mousemove|悬停|移到|停留)/i.test(raw)) return "hover";
    if (/(click|tap|點擊|點選|按一下|選擇)/i.test(raw)) return "click";
    return "click";
  }

  if (keyCount === 0) return "snapshot";

  if (/(navigate|goto|go to|open|visit|前往|打開|開啟|進入)/i.test(raw)) return "navigate";
  if (/(scroll|wheel|mousewheel|滾動|捲動|滑動)/i.test(raw)) return "scroll";
  if (/(wait|loading|networkidle|等待|載入)/i.test(raw)) return "waitForLoad";
  if (/(press|pagedown|page down|pgdn|enter|tab|按下|按鍵)/i.test(raw)) return "press";
  if (/(type|fill|input|輸入|填入)/i.test(raw)) return "type";
  if (/(click|tap|點擊|點選|按一下|選擇)/i.test(raw)) return "click";
  if (/(snapshot|observe|screen|inspect|快照|截圖|查看)/i.test(raw)) return "snapshot";
  return null;
}

function normalizeBrowserAgentArgs(tool, args) {
  const raw = args && typeof args === "object" ? args : {};
  const out = { ...raw };

  if (
    tool === "click" ||
    tool === "hover" ||
    tool === "type" ||
    tool === "fillText" ||
    tool === "readElement" ||
    tool === "scrollIntoView" ||
    tool === "screenshot" ||
    tool === "uploadFile"
  ) {
    if (out.id == null && out.elementId != null) out.id = out.elementId;
    if (out.id == null && out.element_id != null) out.id = out.element_id;
    if (out.id == null && out.selectorId != null) out.id = out.selectorId;
    out.id = String(out.id ?? "").trim();
  }

  if (tool === "click" || tool === "hover" || tool === "fillText") {
    if (out.x == null && out.clientX != null) out.x = out.clientX;
    if (out.y == null && out.clientY != null) out.y = out.clientY;
    const nx = out.x == null ? NaN : Number(out.x);
    const ny = out.y == null ? NaN : Number(out.y);
    if (Number.isFinite(nx) && Number.isFinite(ny)) {
      out.x = nx;
      out.y = ny;
    } else {
      delete out.x;
      delete out.y;
    }
  }

  if (tool === "click" || tool === "fillText") {
    if (out.count == null && out.clickCount != null) out.count = out.clickCount;
    const n = out.count == null ? NaN : Number(out.count);
    const c = Math.floor(n);
    if (Number.isFinite(c) && c >= 1 && c <= 3) out.count = c;
    else delete out.count;
  }

  if (tool === "scroll") {
    if (out.deltaY == null && out.dy != null) out.deltaY = out.dy;
    if (out.deltaX == null && out.dx != null) out.deltaX = out.dx;

    const ndx = out.deltaX == null ? NaN : Number(out.deltaX);
    const ndy = out.deltaY == null ? NaN : Number(out.deltaY);
    if (Number.isFinite(ndx)) out.deltaX = ndx;
    else delete out.deltaX;
    if (Number.isFinite(ndy)) out.deltaY = ndy;
    else delete out.deltaY;

    if (out.x == null && out.clientX != null) out.x = out.clientX;
    if (out.y == null && out.clientY != null) out.y = out.clientY;
    const nx = out.x == null ? NaN : Number(out.x);
    const ny = out.y == null ? NaN : Number(out.y);
    if (Number.isFinite(nx) && Number.isFinite(ny)) {
      out.x = nx;
      out.y = ny;
    } else {
      delete out.x;
      delete out.y;
    }
  }

  if (tool === "type" || tool === "fillText") {
    if (out.text == null && out.value != null) out.text = out.value;
    out.text = String(out.text ?? "");
  }

  if (tool === "fillText") {
    if (out.enter == null && out.pressEnter != null) out.enter = out.pressEnter;
    if (out.enter == null && out.enterKey != null) out.enter = out.enterKey;
    if (out.enter != null) out.enter = Boolean(out.enter);
    else delete out.enter;

    if (out.retries == null && out.retry != null) out.retries = out.retry;
    const n = out.retries == null ? NaN : Number(out.retries);
    const r = Math.floor(n);
    if (Number.isFinite(r) && r >= 0 && r <= 5) out.retries = r;
    else delete out.retries;
  }

  if (tool === "hotkey") {
    if (out.keys == null && out.combo != null) out.keys = out.combo;
    if (out.keys == null && out.shortcut != null) out.keys = out.shortcut;
    out.keys = String(out.keys ?? "").trim();
  }

  if (tool === "press") {
    if (out.key == null && out.keys != null) out.key = out.keys;
    out.key = String(out.key ?? "").trim();
  }

  if (tool === "navigate") {
    if (out.url == null && out.toUrl != null) out.url = out.toUrl;
    if (out.url == null && out.href != null) out.url = out.href;
    out.url = String(out.url ?? "").trim();
  }

  if (tool === "findElements") {
    if (out.text == null && out.query != null) out.text = out.query;
    if (out.text == null && out.q != null) out.text = out.q;
    out.text = String(out.text ?? "").trim();
    out.selector = String(out.selector ?? out.css ?? "").trim();
    out.role = String(out.role ?? "").trim();
    out.tag = String(out.tag ?? "").trim();
    const n = out.limit == null ? NaN : Number(out.limit);
    const lim = Math.floor(n);
    if (Number.isFinite(lim)) out.limit = lim;
    else delete out.limit;
  }

  if (tool === "readElement") {
    if (out.fields == null && out.field != null) out.fields = out.field;
    if (typeof out.fields === "string") out.fields = [out.fields];
    if (Array.isArray(out.fields)) {
      out.fields = out.fields.map((f) => String(f || "").trim()).filter(Boolean).slice(0, 24);
    } else {
      delete out.fields;
    }
  }

  if (tool === "screenshot") {
    if (out.fullPage == null && out.full_page != null) out.fullPage = out.full_page;
    if (out.fullPage != null) out.fullPage = Boolean(out.fullPage);
    else delete out.fullPage;
    out.format = String(out.format ?? "").trim();
    if (!out.format) delete out.format;
  }

  if (tool === "waitFor") {
    out.selector = String(out.selector ?? out.css ?? "").trim();
    out.text = String(out.text ?? "").trim();
    if (out.urlIncludes == null && out.url_contains != null) out.urlIncludes = out.url_contains;
    out.urlIncludes = String(out.urlIncludes ?? "").trim();
    const n = out.timeoutMs == null ? NaN : Number(out.timeoutMs);
    const ms = Math.floor(n);
    if (Number.isFinite(ms) && ms > 0) out.timeoutMs = ms;
    else delete out.timeoutMs;
  }

  if (tool === "waitForLoad") {
    if (out.state == null && out.waitUntil != null) out.state = out.waitUntil;
    if (out.state == null && out.wait_until != null) out.state = out.wait_until;
    out.state = String(out.state ?? "").trim();
  }

  if (tool === "tabActivate") {
    if (out.tabId == null && out.tab_id != null) out.tabId = out.tab_id;
    if (out.tabId == null && out.tabIndex != null) out.tabId = out.tabIndex;
    const n = out.tabId == null ? NaN : Number(out.tabId);
    if (Number.isFinite(n) && n > 0) out.tabId = Math.floor(n);
    else out.tabId = String(out.tabId ?? "").trim();
  }

  if (tool === "downloadsWait") {
    if (out.id == null && out.downloadId != null) out.id = out.downloadId;
    out.id = String(out.id ?? "").trim();
    const since = out.since == null ? NaN : Number(out.since);
    if (Number.isFinite(since) && since >= 0) out.since = Math.floor(since);
    else delete out.since;
    out.state = String(out.state ?? "").trim();
    const ms = out.timeoutMs == null ? NaN : Number(out.timeoutMs);
    if (Number.isFinite(ms) && ms > 0) out.timeoutMs = Math.floor(ms);
    else delete out.timeoutMs;
  }

  if (tool === "uploadFile") {
    if (out.paths == null && out.files != null) out.paths = out.files;
    if (out.paths == null && out.filePath != null) out.paths = [out.filePath];
    if (out.paths == null && out.file_path != null) out.paths = [out.file_path];
    if (out.paths == null && out.path != null) out.paths = [out.path];
    if (typeof out.paths === "string") out.paths = [out.paths];
    if (Array.isArray(out.paths)) {
      out.paths = out.paths.map((p) => String(p || "").trim()).filter(Boolean).slice(0, 10);
    } else {
      delete out.paths;
    }
  }

  if (tool === "tabOpen") {
    if (out.url == null && out.toUrl != null) out.url = out.toUrl;
    if (out.url == null && out.href != null) out.url = out.href;
    out.url = String(out.url ?? "").trim();
    if (out.makeActive == null && out.active != null) out.makeActive = out.active;
    if (out.makeActive == null && out.openInNewTab != null) out.makeActive = out.openInNewTab;
    if (out.makeActive == null && out.background != null) out.makeActive = !Boolean(out.background);
    if (out.makeActive != null) out.makeActive = Boolean(out.makeActive);
    else delete out.makeActive;
  }

  if (tool === "tabClose") {
    if (out.tabId == null && out.tab_id != null) out.tabId = out.tab_id;
    if (out.tabId == null && out.tabIndex != null) out.tabId = out.tabIndex;
    const n = out.tabId == null ? NaN : Number(out.tabId);
    if (Number.isFinite(n) && n > 0) out.tabId = Math.floor(n);
    else out.tabId = String(out.tabId ?? "").trim();
    if (!out.tabId) delete out.tabId;
  }

  if (tool === "collectLinks") {
    const n = out.limit == null ? NaN : Number(out.limit);
    const lim = Math.floor(n);
    if (Number.isFinite(lim) && lim > 0) out.limit = lim;
    else delete out.limit;
    if (out.sameOrigin == null && out.same_origin != null) out.sameOrigin = out.same_origin;
    if (out.sameOrigin != null) out.sameOrigin = Boolean(out.sameOrigin);
    else delete out.sameOrigin;
    if (out.urlIncludes == null && out.url_contains != null) out.urlIncludes = out.url_contains;
    out.urlIncludes = String(out.urlIncludes ?? "").trim();
    if (!out.urlIncludes) delete out.urlIncludes;
    if (out.textIncludes == null && out.text_contains != null) out.textIncludes = out.text_contains;
    out.textIncludes = String(out.textIncludes ?? "").trim();
    if (!out.textIncludes) delete out.textIncludes;
    out.selector = String(out.selector ?? out.css ?? "").trim();
    if (!out.selector) delete out.selector;
  }

  if (tool === "extractStructuredData") {
    if (out.includeJsonLd == null && out.include_jsonld != null) out.includeJsonLd = out.include_jsonld;
    if (out.includeJsonLd != null) out.includeJsonLd = Boolean(out.includeJsonLd);
    else delete out.includeJsonLd;
    if (out.includeTables == null && out.include_tables != null) out.includeTables = out.include_tables;
    if (out.includeTables != null) out.includeTables = Boolean(out.includeTables);
    else delete out.includeTables;

    const mj = out.maxJsonLd == null ? NaN : Number(out.maxJsonLd);
    const maxJsonLd = Math.floor(mj);
    if (Number.isFinite(maxJsonLd) && maxJsonLd >= 0) out.maxJsonLd = maxJsonLd;
    else delete out.maxJsonLd;
    const mjc = out.maxJsonLdChars == null ? NaN : Number(out.maxJsonLdChars);
    const maxJsonLdChars = Math.floor(mjc);
    if (Number.isFinite(maxJsonLdChars) && maxJsonLdChars > 0) out.maxJsonLdChars = maxJsonLdChars;
    else delete out.maxJsonLdChars;

    const mt = out.maxTables == null ? NaN : Number(out.maxTables);
    const maxTables = Math.floor(mt);
    if (Number.isFinite(maxTables) && maxTables >= 0) out.maxTables = maxTables;
    else delete out.maxTables;
    const mr = out.maxRows == null ? NaN : Number(out.maxRows);
    const maxRows = Math.floor(mr);
    if (Number.isFinite(maxRows) && maxRows > 0) out.maxRows = maxRows;
    else delete out.maxRows;
    const mc = out.maxCols == null ? NaN : Number(out.maxCols);
    const maxCols = Math.floor(mc);
    if (Number.isFinite(maxCols) && maxCols > 0) out.maxCols = maxCols;
    else delete out.maxCols;
  }

  if (tool === "readerExtract") {
    const n = out.maxChars == null ? NaN : Number(out.maxChars);
    const maxChars = Math.floor(n);
    if (Number.isFinite(maxChars) && maxChars > 0) out.maxChars = maxChars;
    else delete out.maxChars;
  }

  if (tool === "reportCreate") {
    if (out.title == null && out.name != null) out.title = out.name;
    out.title = String(out.title ?? "").trim();
    if (out.markdown == null && out.md != null) out.markdown = out.md;
    if (out.markdown == null && out.content != null) out.markdown = out.content;
    if (out.markdown == null && out.text != null) out.markdown = out.text;
    out.markdown = String(out.markdown ?? "");
    if (out.makeActive == null && out.active != null) out.makeActive = out.active;
    if (out.makeActive == null && out.openInNewTab != null) out.makeActive = out.openInNewTab;
    if (out.makeActive != null) out.makeActive = Boolean(out.makeActive);
    else delete out.makeActive;
  }

  if (tool === "exportFile") {
    if (out.filename == null && out.fileName != null) out.filename = out.fileName;
    if (out.filename == null && out.name != null) out.filename = out.name;
    out.filename = String(out.filename ?? "").trim();
    if (!out.filename) delete out.filename;
    out.format = String(out.format ?? "").trim();
    if (!out.format) delete out.format;
    if (out.content == null && out.text != null) out.content = out.text;
    if (out.content == null && out.markdown != null) out.content = out.markdown;
    if (out.content != null) out.content = String(out.content ?? "");
    else delete out.content;
    if (out.data != null && typeof out.data !== "object") delete out.data;
  }

  if (tool === "clickByText") {
    if (out.text == null && out.query != null) out.text = out.query;
    if (out.text == null && out.q != null) out.text = out.q;
    out.text = String(out.text ?? "").trim();
    out.selector = String(out.selector ?? out.css ?? "").trim();
    out.role = String(out.role ?? "").trim();
    out.tag = String(out.tag ?? "").trim();
    const n = out.limit == null ? NaN : Number(out.limit);
    const lim = Math.floor(n);
    if (Number.isFinite(lim) && lim > 0) out.limit = lim;
    else delete out.limit;
    if (out.count == null && out.clickCount != null) out.count = out.clickCount;
    const c = out.count == null ? NaN : Number(out.count);
    const clickCount = Math.floor(c);
    if (Number.isFinite(clickCount) && clickCount >= 1 && clickCount <= 3) out.count = clickCount;
    else delete out.count;
  }

  if (tool === "clickBySelector") {
    out.selector = String(out.selector ?? out.css ?? "").trim();
    if (out.count == null && out.clickCount != null) out.count = out.clickCount;
    const c = out.count == null ? NaN : Number(out.count);
    const clickCount = Math.floor(c);
    if (Number.isFinite(clickCount) && clickCount >= 1 && clickCount <= 3) out.count = clickCount;
    else delete out.count;
    const n = out.timeoutMs == null ? NaN : Number(out.timeoutMs);
    const ms = Math.floor(n);
    if (Number.isFinite(ms) && ms > 0) out.timeoutMs = ms;
    else delete out.timeoutMs;
  }

  if (tool === "extractTables") {
    const mt = out.maxTables == null ? NaN : Number(out.maxTables);
    const maxTables = Math.floor(mt);
    if (Number.isFinite(maxTables) && maxTables >= 0) out.maxTables = maxTables;
    else delete out.maxTables;
    const mr = out.maxRows == null ? NaN : Number(out.maxRows);
    const maxRows = Math.floor(mr);
    if (Number.isFinite(maxRows) && maxRows > 0) out.maxRows = maxRows;
    else delete out.maxRows;
    const mc = out.maxCols == null ? NaN : Number(out.maxCols);
    const maxCols = Math.floor(mc);
    if (Number.isFinite(maxCols) && maxCols > 0) out.maxCols = maxCols;
    else delete out.maxCols;
  }

  if (tool === "paginateAndCollect") {
    const n = out.limit == null ? NaN : Number(out.limit);
    const lim = Math.floor(n);
    if (Number.isFinite(lim) && lim > 0) out.limit = lim;
    else delete out.limit;
    const s = out.scrolls == null ? NaN : Number(out.scrolls ?? out.pages ?? out.steps);
    const scrolls = Math.floor(s);
    if (Number.isFinite(scrolls) && scrolls > 0) out.scrolls = scrolls;
    else delete out.scrolls;
    const dy = out.deltaY == null ? NaN : Number(out.deltaY ?? out.dy);
    const deltaY = Math.floor(dy);
    if (Number.isFinite(deltaY) && deltaY !== 0) out.deltaY = deltaY;
    else delete out.deltaY;
    if (out.sameOrigin == null && out.same_origin != null) out.sameOrigin = out.same_origin;
    if (out.sameOrigin != null) out.sameOrigin = Boolean(out.sameOrigin);
    else delete out.sameOrigin;
    if (out.urlIncludes == null && out.url_contains != null) out.urlIncludes = out.url_contains;
    out.urlIncludes = String(out.urlIncludes ?? "").trim();
    if (!out.urlIncludes) delete out.urlIncludes;
    if (out.textIncludes == null && out.text_contains != null) out.textIncludes = out.text_contains;
    out.textIncludes = String(out.textIncludes ?? "").trim();
    if (!out.textIncludes) delete out.textIncludes;
    out.selector = String(out.selector ?? out.css ?? "").trim();
    if (!out.selector) delete out.selector;
    const wait = out.waitMs == null ? NaN : Number(out.waitMs);
    const waitMs = Math.floor(wait);
    if (Number.isFinite(waitMs) && waitMs >= 0) out.waitMs = waitMs;
    else delete out.waitMs;
  }

  if (tool === "multiTabResearch") {
    if (out.urls == null && out.url != null) out.urls = [out.url];
    if (out.urls == null && out.links != null) out.urls = out.links;
    if (typeof out.urls === "string") out.urls = [out.urls];
    if (Array.isArray(out.urls)) {
      out.urls = out.urls.map((u) => String(u || "").trim()).filter(Boolean).slice(0, 12);
    } else {
      delete out.urls;
    }
    const m = out.maxPages == null ? NaN : Number(out.maxPages);
    const maxPages = Math.floor(m);
    if (Number.isFinite(maxPages) && maxPages > 0) out.maxPages = maxPages;
    else delete out.maxPages;
    const pc = out.perPageMaxChars == null ? NaN : Number(out.perPageMaxChars);
    const perPageMaxChars = Math.floor(pc);
    if (Number.isFinite(perPageMaxChars) && perPageMaxChars > 0) out.perPageMaxChars = perPageMaxChars;
    else delete out.perPageMaxChars;
    if (out.includeLinks != null) out.includeLinks = Boolean(out.includeLinks);
    else delete out.includeLinks;
    if (out.includeStructuredData != null) out.includeStructuredData = Boolean(out.includeStructuredData);
    else delete out.includeStructuredData;
    if (out.keepTabs != null) out.keepTabs = Boolean(out.keepTabs);
    else delete out.keepTabs;
  }

  if (tool === "networkGetResponses") {
    if (out.urlIncludes == null && out.url_contains != null) out.urlIncludes = out.url_contains;
    out.urlIncludes = String(out.urlIncludes ?? "").trim();
    if (!out.urlIncludes) delete out.urlIncludes;
    out.method = String(out.method ?? "").trim();
    if (!out.method) delete out.method;
    const n = out.limit == null ? NaN : Number(out.limit);
    const lim = Math.floor(n);
    if (Number.isFinite(lim) && lim > 0) out.limit = lim;
    else delete out.limit;
    const mb = out.maxBodyChars == null ? NaN : Number(out.maxBodyChars);
    const maxBodyChars = Math.floor(mb);
    if (Number.isFinite(maxBodyChars) && maxBodyChars > 0) out.maxBodyChars = maxBodyChars;
    else delete out.maxBodyChars;
  }

  if (tool === "cookieExport") {
    if (out.urls == null && out.url != null) out.urls = [out.url];
    if (typeof out.urls === "string") out.urls = [out.urls];
    if (Array.isArray(out.urls)) {
      out.urls = out.urls.map((u) => String(u || "").trim()).filter(Boolean).slice(0, 40);
    } else {
      delete out.urls;
    }
    const n = out.limit == null ? NaN : Number(out.limit);
    const lim = Math.floor(n);
    if (Number.isFinite(lim) && lim > 0) out.limit = lim;
    else delete out.limit;
  }

  if (tool === "cookieImport") {
    out.cookieJarId = String(out.cookieJarId ?? out.jarId ?? out.cookie_jar_id ?? "").trim();
    if (!out.cookieJarId) delete out.cookieJarId;
    if (out.cookies == null && out.cookie != null) out.cookies = out.cookie;
    if (out.cookies == null && out.data != null) out.cookies = out.data;
    if (Array.isArray(out.cookies)) {
      out.cookies = out.cookies.slice(0, 1200);
    } else {
      delete out.cookies;
    }
  }

  if (tool === "googleSheetsAppendRows") {
    if (out.spreadsheetId == null && out.sheetId != null) out.spreadsheetId = out.sheetId;
    if (out.spreadsheetId == null && out.id != null) out.spreadsheetId = out.id;
    out.spreadsheetId = String(out.spreadsheetId ?? "").trim();
    if (!out.spreadsheetId) delete out.spreadsheetId;
    out.sheetName = String(out.sheetName ?? out.sheet ?? "").trim();
    if (!out.sheetName) delete out.sheetName;
    out.range = String(out.range ?? "").trim();
    if (!out.range) delete out.range;
    if (out.values == null && out.rows != null) out.values = out.rows;
    if (Array.isArray(out.values)) {
      out.values = out.values.filter((r) => Array.isArray(r)).slice(0, 200).map((r) => r.slice(0, 60));
    } else {
      delete out.values;
    }
  }

  if (tool === "googleDocsCreateOrAppend") {
    if (out.documentId == null && out.docId != null) out.documentId = out.docId;
    if (out.documentId == null && out.id != null) out.documentId = out.id;
    out.documentId = String(out.documentId ?? "").trim();
    if (!out.documentId) delete out.documentId;
    out.title = String(out.title ?? out.name ?? "").trim();
    if (!out.title) delete out.title;
    if (out.text == null && out.content != null) out.text = out.content;
    if (out.text == null && out.markdown != null) out.text = out.markdown;
    out.text = String(out.text ?? "");
  }

  if (tool === "googleSlidesCreateDeck") {
    out.title = String(out.title ?? out.name ?? "").trim();
    if (!out.title) delete out.title;
    if (out.slides == null && out.pages != null) out.slides = out.pages;
    if (Array.isArray(out.slides)) {
      out.slides = out.slides
        .filter((s) => s && typeof s === "object" && !Array.isArray(s))
        .slice(0, 30)
        .map((s) => ({
          title: String(s.title ?? s.name ?? "").trim(),
          body: String(s.body ?? s.text ?? "").trim(),
          bullets: Array.isArray(s.bullets) ? s.bullets.slice(0, 20).map((b) => String(b ?? "").trim()).filter(Boolean) : undefined
        }));
    } else {
      delete out.slides;
    }
  }

  return out;
}

function normalizeBrowserAgentAction(parsed, rawText) {
  let obj = parsed;
  if (Array.isArray(obj)) {
    obj = obj.find((item) => item && typeof item === "object" && !Array.isArray(item));
  }
  if (obj && typeof obj === "object" && obj.action && typeof obj.action === "object") {
    obj = obj.action;
  }

  if (!obj || typeof obj !== "object") {
    return { ok: false, error: "Agent returned invalid JSON object." };
  }

  const typeRaw = String(obj.type ?? obj.kind ?? obj.responseType ?? obj.response_type ?? "").trim().toLowerCase();
  const typeCompact = typeRaw.replace(/[^a-z]/g, "");
  const finalCandidate = obj.final ?? obj.answer ?? obj.response;
  const finalText = typeof finalCandidate === "string" ? finalCandidate : null;

  const isExplicitTool = typeCompact === "tool";
  const isExplicitFinal = ["final", "finalanswer", "done", "answer", "result", "output"].includes(typeCompact);
  const type = isExplicitFinal || (finalText != null && !isExplicitTool) ? "final" : "tool";

  if (type === "final") {
    return { ok: true, type: "final", final: String(finalText || "").trim() };
  }

  let toolName = obj.tool ?? obj.toolName ?? obj.tool_name ?? obj.name ?? obj.action ?? obj.command ?? null;
  let argsRaw =
    obj.args ?? obj.arguments ?? obj.params ?? obj.parameters ?? obj.input ?? obj.data ?? null;

  if (!toolName && obj.function_call && typeof obj.function_call === "object") {
    toolName = obj.function_call.name;
    argsRaw = obj.function_call.arguments;
  }

  const toolCalls = Array.isArray(obj.tool_calls) ? obj.tool_calls : null;
  if (!toolName && toolCalls && toolCalls.length) {
    const call = toolCalls[0];
    const fn = call?.function && typeof call.function === "object" ? call.function : call;
    toolName = fn?.name ?? call?.name ?? null;
    argsRaw = fn?.arguments ?? call?.arguments ?? null;
  }

  if (!toolName && obj.tool_call && typeof obj.tool_call === "object") {
    toolName = obj.tool_call.name ?? obj.tool_call.tool ?? obj.tool_call.action ?? null;
    argsRaw = obj.tool_call.arguments ?? obj.tool_call.args ?? null;
  }

  if (!toolName && typeCompact && !isExplicitTool && !isExplicitFinal) {
    toolName = obj.type;
  }

  if (!toolName) {
    const inferred = inferBrowserAgentToolNameFromArgsObject(obj, rawText);
    if (inferred) toolName = inferred;
    if (!argsRaw) argsRaw = obj;
  }

  const tool = normalizeBrowserAgentToolName(toolName);
	  if (!tool) {
	    const printable = truncateText(typeof rawText === "string" ? rawText : JSON.stringify(obj), 900);
	    return {
	      ok: false,
	      error:
	        `Unknown tool: ${String(toolName || "").trim() || "(missing)"}.\n` +
	        `Expected one of: snapshot, screenshot, findElements, readElement, collectLinks, extractStructuredData, extractTables, readerExtract, scrollIntoView, click, clickByText, clickBySelector, hover, scroll, type, fillText, hotkey, press, navigate, waitFor, waitForLoad, tabList, tabActivate, tabOpen, tabClose, paginateAndCollect, multiTabResearch, networkGetResponses, cookieExport, cookieImport, googleSheetsAppendRows, googleDocsCreateOrAppend, googleSlidesCreateDeck, reportCreate, downloadsWait, uploadFile, exportFile.\n\n` +
	        `Raw response:\n${printable}`
	    };
	  }

  let args = null;
  if (typeof argsRaw === "string") {
    args = coerceJsonObjectFromText(argsRaw);
  } else {
    args = coerceJsonObject(argsRaw);
  }

  if (!args) {
    const fallback = obj && typeof obj === "object" ? obj : {};
    args = coerceJsonObject(fallback) || {};
  }

  const normalizedArgs = normalizeBrowserAgentArgs(tool, args);
  if (tool === "findElements") {
    if (!normalizedArgs.text && !normalizedArgs.selector && !normalizedArgs.role && !normalizedArgs.tag) {
      return { ok: false, error: "Missing query/selector/role/tag for tool: findElements." };
    }
  }
  if (tool === "readElement") {
    if (!normalizedArgs.id) return { ok: false, error: "Missing element id for tool: readElement." };
  }
  if (tool === "scrollIntoView") {
    if (!normalizedArgs.id) return { ok: false, error: "Missing element id for tool: scrollIntoView." };
  }
	  if (tool === "click" || tool === "hover") {
	    const hasId = Boolean(normalizedArgs.id);
	    const hasXY = Number.isFinite(normalizedArgs.x) && Number.isFinite(normalizedArgs.y);
	    if (!hasId && !hasXY) return { ok: false, error: `Missing element id (or x/y) for tool: ${tool}.` };
	  }
	  if (tool === "clickByText") {
	    if (!normalizedArgs.text && !normalizedArgs.selector && !normalizedArgs.role && !normalizedArgs.tag) {
	      return { ok: false, error: "Missing text/selector/role/tag for tool: clickByText." };
	    }
	  }
	  if (tool === "clickBySelector") {
	    if (!normalizedArgs.selector) return { ok: false, error: "Missing selector for tool: clickBySelector." };
	  }
	  if (tool === "scroll") {
	    const dx = Number(normalizedArgs.deltaX);
	    const dy = Number(normalizedArgs.deltaY);
	    const hasDx = Number.isFinite(dx) && dx !== 0;
    const hasDy = Number.isFinite(dy) && dy !== 0;
    if (!hasDx && !hasDy) return { ok: false, error: "Missing deltaX/deltaY for tool: scroll." };
  }
  if (tool === "press") {
    if (!normalizedArgs.key) {
      return { ok: false, error: "Missing key for tool: press." };
    }
  }
  if (tool === "hotkey") {
    if (!normalizedArgs.keys) return { ok: false, error: "Missing keys for tool: hotkey." };
  }
  if (tool === "navigate") {
    if (!normalizedArgs.url) {
      return { ok: false, error: "Missing url for tool: navigate." };
    }
  }
	  if (tool === "waitFor") {
	    if (!normalizedArgs.selector && !normalizedArgs.text && !normalizedArgs.urlIncludes) {
	      return { ok: false, error: "Missing selector/text/urlIncludes for tool: waitFor." };
	    }
	  }
	  if (tool === "multiTabResearch") {
	    if (!Array.isArray(normalizedArgs.urls) || !normalizedArgs.urls.length) {
	      return { ok: false, error: "Missing urls for tool: multiTabResearch." };
	    }
	  }
		  if (tool === "cookieImport") {
		    const hasJar = Boolean(String(normalizedArgs.cookieJarId || "").trim());
		    const hasCookies = Array.isArray(normalizedArgs.cookies) && normalizedArgs.cookies.length;
		    if (!hasJar && !hasCookies) return { ok: false, error: "Missing cookieJarId/cookies for tool: cookieImport." };
		  }
	  if (tool === "googleSheetsAppendRows") {
	    if (!normalizedArgs.spreadsheetId) return { ok: false, error: "Missing spreadsheetId for tool: googleSheetsAppendRows." };
	    if (!Array.isArray(normalizedArgs.values) || !normalizedArgs.values.length) {
	      return { ok: false, error: "Missing values for tool: googleSheetsAppendRows." };
	    }
	  }
	  if (tool === "googleDocsCreateOrAppend") {
	    if (!String(normalizedArgs.text || "").trim()) return { ok: false, error: "Missing text for tool: googleDocsCreateOrAppend." };
	  }
	  if (tool === "tabActivate") {
	    const raw = normalizedArgs.tabId;
	    const ok =
	      (typeof raw === "string" && Boolean(String(raw).trim())) ||
      (typeof raw === "number" && Number.isFinite(raw) && raw > 0);
    if (!ok) return { ok: false, error: "Missing tabId for tool: tabActivate." };
  }
  if (tool === "tabOpen") {
    if (!normalizedArgs.url) return { ok: false, error: "Missing url for tool: tabOpen." };
  }
  if (tool === "reportCreate") {
    if (!String(normalizedArgs.markdown || "").trim()) {
      return { ok: false, error: "Missing markdown for tool: reportCreate." };
    }
  }
  if (tool === "uploadFile") {
    if (!normalizedArgs.id) return { ok: false, error: "Missing element id for tool: uploadFile." };
    if (!Array.isArray(normalizedArgs.paths) || !normalizedArgs.paths.length) {
      return { ok: false, error: "Missing paths for tool: uploadFile." };
    }
  }
  if (tool === "fillText") {
    const hasId = Boolean(normalizedArgs.id);
    const hasXY = Number.isFinite(normalizedArgs.x) && Number.isFinite(normalizedArgs.y);
    if (!hasId && !hasXY) return { ok: false, error: "Missing element id (or x/y) for tool: fillText." };
    if (!String(normalizedArgs.text || "")) return { ok: false, error: "Missing text for tool: fillText." };
  }
  if (tool === "exportFile") {
    const hasData = normalizedArgs.data && typeof normalizedArgs.data === "object";
    const hasContent = Boolean(String(normalizedArgs.content || "").trim());
    if (!hasData && !hasContent) {
      return { ok: false, error: "Missing content (or data) for tool: exportFile." };
    }
  }

  const reason = String(obj.reason || "").trim();
  return { ok: true, type: "tool", tool, args: normalizedArgs, reason };
}

function getAgentLanguageHint() {
  if (uiLanguage === "zh-TW") return "Traditional Chinese";
  if (uiLanguage === "es") return "Spanish";
  return "English";
}

function buildBrowserAgentSystemPrompt() {
  const lang = getAgentLanguageHint();
  return [
    "You are a browser automation agent running inside an Electron browser.",
    "You can control the currently active tab using tools (Playwright over CDP).",
    "Always respond with a single JSON object and nothing else (no Markdown).",
    "Element ids (data-sting-agent-id) persist for this agent run, so you can reuse ids across steps (but still verify with snapshot when the page changes).",
    "On Google Docs/Slides (docs.google.com), entering edit mode can require a precise click; if typing doesn't apply, prefer fillText (macro) or try click with count=2 (double-click) or click then press Enter before typing.",
    "After performing an action, verify via the next snapshot that it actually worked before moving on (especially after type: confirm the intended text appears in snapshot.visibleText or snapshot.axText or in element text/value/aria-label).",
    "",
    "CRITICAL REASONING AND PLANNING:",
    "- BEFORE each step, perform self-reflection: assess what you've learned, evaluate progress, and decide if you should continue or conclude.",
    "- Actively count and track what you've collected (e.g., 'I've analyzed 3 articles, gathered 15 key points, collected data from 4 pages').",
    "- Ask yourself: 'Do I have enough information to provide a meaningful answer to the user's task?'",
    "- If you notice repetitive patterns (e.g., clicking similar links, extracting similar content), it's time to synthesize and conclude.",
    "- When you have collected sufficient data (typically 3-5 examples or when patterns emerge), STOP collecting and START organizing.",
    "- Use reportCreate tool to create structured reports with findings, conclusions, and recommendations.",
    "- Use exportFile to save organized summaries in markdown format.",
    "- Provide final answers that include: key findings, patterns observed, actionable insights, and clear conclusions.",
    "- If the task is exploratory, conclude when you can provide a comprehensive overview rather than continuing indefinitely.",
    "- Move decisively toward completion - do not keep exploring unless specifically needed for the task.",
    "",
    "SOURCE CITATION REQUIREMENTS:",
    "- Track all URLs where you collect data, extract content, or read information.",
    "- In final answers, ALWAYS include clickable source links for each piece of summarized information.",
    "- Use Markdown link format: [Source Title or Description](URL)",
    "- When summarizing web content, indicate the source URL for each major point or section.",
    "- Group sources at the end of relevant sections or provide a 'Sources' section at the end of your response.",
    "- If you extract content from multiple pages, clearly attribute each piece of information to its source.",
    "- Example: 'According to the article [Backing up Spotify](https://news.ycombinator.com/item?id=46338339), ...'",
    "",
    "Only return a final answer after verifying the task is complete in the latest snapshot; if something is missing, keep using tools to fix it.",
    `For the final answer, respond in ${lang}.`
  ].join("\n");
}

function buildBrowserAgentUserPrompt({ task, snapshot, steps, maxSteps }) {
  const safeTask = String(task || "").trim();
  const snap = snapshot && typeof snapshot === "object" ? snapshot : {};
  const elements = Array.isArray(snap.elements) ? snap.elements : [];
  const compactElements = elements.slice(0, 160).map((e) => ({
    id: String(e?.id || ""),
    tag: String(e?.tag || ""),
    role: String(e?.role || ""),
    text: String(e?.text || ""),
    ariaLabel: String(e?.ariaLabel || ""),
    placeholder: String(e?.placeholder || ""),
    name: String(e?.name || ""),
    type: String(e?.type || ""),
    href: String(e?.href || ""),
    value: String(e?.value || ""),
    rect: e?.rect || null
  }));

  const history = Array.isArray(steps) ? steps.slice(-12) : [];

  return [
    `TASK:\n${safeTask}`,
    "",
    "CURRENT_PAGE_SNAPSHOT (JSON):",
    JSON.stringify(
      {
        url: String(snap.url || ""),
        title: String(snap.title || ""),
        scroll: snap.scroll || null,
        viewport: snap.viewport || null,
        active: snap.active || null,
        visibleText: String(snap.visibleText || ""),
        axText: String(snap.axText || ""),
        elements: compactElements
      },
      null,
      2
    ),
    "",
    "PREVIOUS_STEPS (JSON):",
    JSON.stringify(history, null, 2),
    "",
    "PROGRESS REFLECTION:",
    `- You have completed ${history.length} steps so far.`,
    `- Review what you've accomplished and ask: "Do I have enough data to provide a meaningful answer?"`,
    `- If you've been doing similar actions repeatedly, consider synthesizing your findings.`,
    `- Remember: Quality over quantity - 3-5 well-analyzed examples are often sufficient.`,
    `- Track your data sources: Remember which URLs you visited and what content you extracted from each.`,
    `- When concluding, ensure you can attribute information to specific sources.`,
    "",
	    "TOOLS:",
	    '- snapshot: {}',
	    '- screenshot: {}',
	    '- screenshot: {"id":"<elementId>"}',
	    '- screenshot: {"fullPage":true}',
	    '- findElements: {"text":"...","limit":10}',
	    '- findElements: {"selector":"button[type=submit]"}',
	    '- readElement: {"id":"<elementId>","fields":["value","text","ariaLabel","rect","checked","disabled"]}',
	    '- collectLinks: {"limit":30,"sameOrigin":true,"textIncludes":"pricing"}',
	    '- extractStructuredData: {"includeJsonLd":true,"includeTables":true}',
	    '- extractTables: {"maxTables":8,"maxRows":25,"maxCols":16}',
	    '- readerExtract: {"maxChars":12000}',
	    '- scrollIntoView: {"id":"<elementId>"}',
	    '- click: {"id":"<elementId>"}',
	    '- click: {"x":123,"y":456}',
	    '- click: {"x":123,"y":456,"count":2}',
	    '- clickByText: {"text":"Log in","limit":3}',
	    '- clickBySelector: {"selector":"button[type=submit]","timeoutMs":15000}',
	    '- hover: {"id":"<elementId>"}',
	    '- hover: {"x":123,"y":456}',
	    '- scroll: {"deltaY":600}',
	    '- scroll: {"deltaY":600,"x":123,"y":456}',
	    '- paginateAndCollect: {"limit":120,"scrolls":8,"deltaY":900,"sameOrigin":true}',
	    '- fillText: {"id":"<elementId>","text":"..."}',
	    '- fillText: {"x":123,"y":456,"text":"..."}',
	    '- fillText: {"id":"<elementId>","text":"...","count":2,"enter":true,"retries":2}',
	    '- type: {"text":"..."}',
	    '- type: {"id":"<elementId>","text":"..."}',
	    '- hotkey: {"keys":"Ctrl+L"}',
	    '- press: {"key":"Enter|Tab|Escape|Backspace|Delete|PageUp|PageDown|Home|End|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Space"}',
	    '- navigate: {"url":"https://..."}',
	    '- waitFor: {"selector":"...","timeoutMs":15000}',
	    '- waitFor: {"text":"...","timeoutMs":15000}',
	    '- waitFor: {"urlIncludes":"...","timeoutMs":15000}',
	    '- waitForLoad: {"state":"domcontentloaded|load|networkidle"}',
	    '- tabList: {}',
	    '- tabActivate: {"tabId":123}',
	    '- tabOpen: {"url":"https://example.com","makeActive":true}',
	    '- tabClose: {"tabId":"<tabId>"}',
	    '- multiTabResearch: {"urls":["https://...","https://..."],"perPageMaxChars":8000,"includeLinks":true,"keepTabs":false}',
	    '- networkGetResponses: {"urlIncludes":"/api/","limit":10,"maxBodyChars":4000}',
	    '- cookieExport: {"urls":["https://example.com"],"limit":200}',
	    '- cookieImport: {"cookieJarId":"<cookieJarId>"}',
	    '- cookieImport: {"cookies":[{"name":"sid","value":"...","domain":".example.com","path":"/"}]}',
	    '- googleSheetsAppendRows: {"spreadsheetId":"...","sheetName":"Sheet1","values":[["a","b"],["c","d"]]}',
	    '- googleDocsCreateOrAppend: {"documentId":"...","title":"Notes","text":"..."}',
	    '- googleSlidesCreateDeck: {"title":"Deck","slides":[{"title":"Slide 1","bullets":["a","b"]}]}',
	    '- reportCreate: {"title":"Research Report","markdown":"# ...","makeActive":true}',
	    '- downloadsWait: {"since":1730000000000,"timeoutMs":30000}',
	    '- uploadFile: {"id":"<elementId>","paths":["/absolute/path/to/file"]}',
	    '- exportFile: {"filename":"report.md","format":"md","content":"..."}',
    "",
    "RESPONSE_SCHEMA (choose one):",
    '{"type":"tool","tool":"snapshot","args":{},"reason":"..."}',
    '{"type":"tool","tool":"findElements","args":{"text":"login"},"reason":"..."}',
    '{"type":"tool","tool":"readElement","args":{"id":"12","fields":["value"]},"reason":"..."}',
    '{"type":"tool","tool":"collectLinks","args":{"limit":20,"sameOrigin":true},"reason":"..."}',
    '{"type":"tool","tool":"readerExtract","args":{"maxChars":12000},"reason":"..."}',
	    '{"type":"tool","tool":"scrollIntoView","args":{"id":"12"},"reason":"..."}',
	    '{"type":"tool","tool":"click","args":{"id":"12"},"reason":"..."}',
	    '{"type":"tool","tool":"click","args":{"x":123,"y":456},"reason":"..."}',
	    '{"type":"tool","tool":"click","args":{"x":123,"y":456,"count":2},"reason":"..."}',
	    '{"type":"tool","tool":"clickByText","args":{"text":"login"},"reason":"..."}',
	    '{"type":"tool","tool":"clickBySelector","args":{"selector":"button[type=submit]"},"reason":"..."}',
	    '{"type":"tool","tool":"hover","args":{"id":"12"},"reason":"..."}',
	    '{"type":"tool","tool":"hover","args":{"x":123,"y":456},"reason":"..."}',
	    '{"type":"tool","tool":"scroll","args":{"deltaY":600},"reason":"..."}',
	    '{"type":"tool","tool":"paginateAndCollect","args":{"limit":60,"scrolls":6},"reason":"..."}',
	    '{"type":"tool","tool":"fillText","args":{"id":"5","text":"hello"},"reason":"..."}',
	    '{"type":"tool","tool":"fillText","args":{"x":123,"y":456,"text":"hello","count":2},"reason":"..."}',
	    '{"type":"tool","tool":"type","args":{"text":"hello"},"reason":"..."}',
	    '{"type":"tool","tool":"type","args":{"id":"5","text":"hello"},"reason":"..."}',
    '{"type":"tool","tool":"hotkey","args":{"keys":"Ctrl+L"},"reason":"..."}',
    '{"type":"tool","tool":"press","args":{"key":"Enter"},"reason":"..."}',
    '{"type":"tool","tool":"navigate","args":{"url":"https://example.com"},"reason":"..."}',
	    '{"type":"tool","tool":"waitFor","args":{"selector":"button[type=submit]","timeoutMs":15000},"reason":"..."}',
	    '{"type":"tool","tool":"waitForLoad","args":{"state":"networkidle"},"reason":"..."}',
	    '{"type":"tool","tool":"multiTabResearch","args":{"urls":["https://example.com","https://news.ycombinator.com/"]},"reason":"..."}',
	    '{"type":"tool","tool":"networkGetResponses","args":{"urlIncludes":"/api/","limit":5},"reason":"..."}',
	    '{"type":"tool","tool":"googleDocsCreateOrAppend","args":{"title":"Notes","text":"Hello"},"reason":"..."}',
	    '{"type":"tool","tool":"reportCreate","args":{"title":"Report","markdown":"# Title\\n..."},"reason":"..."}',
	    '{"type":"tool","tool":"exportFile","args":{"filename":"report.md","format":"md","content":"..."},"reason":"..."}',
    '{"type":"final","final":"## Analysis Summary\\n\\nKey findings from Hacker News:\\n- Popular discussion about data backup solutions\\n- Users sharing Spotify backup experiences\\n\\n**Sources:**\\n- [Hacker News Main Page](https://news.ycombinator.com/)\\n- [Backing up Spotify Discussion](https://news.ycombinator.com/item?id=46338339)"}',
    "",
    `RULES:\n- Output valid JSON only (a single object).\n- For tool steps, always output {"type":"tool","tool":"...","args":{...},"reason":"..."} (do NOT output only args like {"id":"23"}).\n- tool must be one of: snapshot | screenshot | findElements | readElement | collectLinks | extractStructuredData | extractTables | readerExtract | scrollIntoView | click | clickByText | clickBySelector | hover | scroll | paginateAndCollect | type | fillText | hotkey | press | navigate | waitFor | waitForLoad | tabList | tabActivate | tabOpen | tabClose | multiTabResearch | networkGetResponses | cookieExport | cookieImport | googleSheetsAppendRows | googleDocsCreateOrAppend | googleSlidesCreateDeck | reportCreate | downloadsWait | uploadFile | exportFile.\n- Use at most ${maxSteps} tool steps.\n- Prefer snapshot before interacting.\n- click/hover can use elementId OR viewport coordinates (x,y). click supports optional count (2 = double-click).\n- scroll uses deltaY (positive = down, negative = up); optional x/y sets the wheel point.\n- fillText is a macro: click (optional double-click/Enter/retries) + type; prefer it for finicky editors like Google Docs/Slides.\n- type can omit id to type into the currently focused element.\n- waitFor is for dynamic SPA waits (selector/text/urlIncludes).\n- When verifying typed text, check snapshot.visibleText first; if it's missing (common on Google Slides), also check snapshot.axText and element ariaLabel/value.\n- On Google Docs/Slides (docs.google.com), prefer clicking the exact editable area (textbox/contenteditable or canvas coordinates) before typing; Tab/Enter focus may not work.\n- Avoid destructive actions unless clearly required by TASK.\n- PROGRESS TRACKING: Count your steps and collected data. After 3-5 similar actions, evaluate if you should conclude.\n- CONCLUDE PROACTIVELY: When you have meaningful data, use reportCreate to organize findings or return final answer with comprehensive summary.\n- AVOID ENDLESS LOOPS: If you're repeating similar patterns, synthesize what you've learned and provide conclusions.\n- SOURCE CITATION: In final answers, ALWAYS include clickable Markdown links [text](url) for all sources you used.`
	  ].join("\n");
	}

async function ensureWebviewHasAgentMarker(webview, marker) {
  const wv = webview || getActiveWebview();
  if (!wv) throw new Error(t("error.noActiveTab"));
  const m = String(marker || "").trim();
  if (!m) return null;
  try {
    const res = await wv.executeJavaScript(
      `(() => {
        const marker = ${JSON.stringify(m)};
        const makePageId = () => String(Date.now()) + "_" + Math.random().toString(16).slice(2);
        let didReset = false;
        try { window.__stingAgentMarker = marker; } catch {}
        try {
          if (window.__stingAgentIdSession !== marker) {
            didReset = true;
            window.__stingAgentIdSession = marker;
            window.__stingAgentNextId = 1;
            try { window.__stingAgentPageId = makePageId(); } catch {}
            try {
              document
                .querySelectorAll("[data-sting-agent-id]")
                .forEach((el) => el.removeAttribute("data-sting-agent-id"));
            } catch {}
          }
        } catch {}
        try {
          if (!window.__stingAgentPageId) window.__stingAgentPageId = makePageId();
        } catch {}
        return { ok: true, pageId: String(window.__stingAgentPageId || ""), didReset };
      })()`
    );
    if (res && typeof res === "object") return res;
  } catch {
  }
  return null;
}

function buildWebviewAgentControlUiExpression({ marker, enabled, event } = {}) {
  const payload = {
    marker: String(marker || ""),
    enabled: enabled !== false,
    event: event && typeof event === "object" ? event : null
  };
  return `(() => {
    const payload = ${JSON.stringify(payload)};
    const marker = String(payload.marker || "");
    const enabled = payload.enabled !== false;
    const event = payload.event && typeof payload.event === "object" ? payload.event : null;

    const STYLE_ID = ${JSON.stringify(AGENT_CONTROL_UI_STYLE_ID)};
    const ROOT_ID = ${JSON.stringify(AGENT_CONTROL_UI_ROOT_ID)};
    const cssText = ${JSON.stringify(AGENT_CONTROL_UI_CSS)};
    const cursorSvg = ${JSON.stringify(AGENT_CONTROL_UI_CURSOR_SVG)};

    const getMount = () => document.body || document.documentElement || document;

    const install = () => {
      try {
        let styleEl = document.getElementById(STYLE_ID);
        if (!styleEl) {
          styleEl = document.createElement("style");
          styleEl.id = STYLE_ID;
          styleEl.textContent = cssText;
          (document.head || getMount()).appendChild(styleEl);
        }

        let root = document.getElementById(ROOT_ID);
        if (!root) {
          root = document.createElement("div");
          root.id = ROOT_ID;
          root.setAttribute("aria-hidden", "true");
          root.dataset.enabled = "false";
          root.dataset.hasCursor = "false";
          root.innerHTML =
            '<div class="stingAgentFlicker"></div>' +
            '<div class="stingAgentBorder"></div>' +
            '<div class="stingAgentBadge"><span class="stingAgentBadgeDot"></span><span>AI 控制中</span></div>' +
            '<div class="stingAgentCursor">' + cursorSvg + "</div>";
          getMount().appendChild(root);
        }

        const ui = {
          __installed: true,
          root,
          enabled: false,
          marker: "",
          flickerTimer: null,
          setEnabled(nextEnabled, nextMarker) {
            const want = Boolean(nextEnabled);
            const mk = String(nextMarker || "");
            if (!want) {
              if (mk && this.marker && mk !== this.marker) return { ok: true, enabled: this.enabled, marker: this.marker, ignored: true };
              this.enabled = false;
              root.dataset.enabled = "false";
              try { root.dataset.hasCursor = "false"; } catch {}
              try {
                if (this.flickerTimer) {
                  clearTimeout(this.flickerTimer);
                  this.flickerTimer = null;
                }
              } catch {}
              return { ok: true, enabled: this.enabled, marker: this.marker };
            }

            this.enabled = true;
            if (mk) this.marker = mk;
            root.dataset.enabled = "true";

            const tick = () => {
              try {
                if (!this.enabled) return;
                const burst = Math.random() < 0.16;
                const alpha = burst ? 0.14 + Math.random() * 0.18 : 0.04 + Math.random() * 0.06;
                const jx = (Math.random() - 0.5) * 3.2;
                const jy = (Math.random() - 0.5) * 3.2;
                root.style.setProperty("--sting-agent-flicker-alpha", alpha.toFixed(3));
                root.style.setProperty("--sting-agent-jitter-x", jx.toFixed(2) + "px");
                root.style.setProperty("--sting-agent-jitter-y", jy.toFixed(2) + "px");
              } catch {}
              const delay = 120 + Math.random() * 260;
              const next = delay * (Math.random() < 0.12 ? 0.55 : 1);
              try { this.flickerTimer = setTimeout(tick, next); } catch {}
            };
            if (!this.flickerTimer) tick();
            return { ok: true, enabled: this.enabled, marker: this.marker };
          },
          setCursor(x, y) {
            try {
              const vw = Number(window.innerWidth) || 0;
              const vh = Number(window.innerHeight) || 0;
              const px = Number.isFinite(Number(x)) ? Number(x) : Math.floor((vw || 1) / 2);
              const py = Number.isFinite(Number(y)) ? Number(y) : Math.floor((vh || 1) / 2);
              root.style.setProperty("--sting-agent-cursor-x", px + "px");
              root.style.setProperty("--sting-agent-cursor-y", py + "px");
              root.dataset.hasCursor = "true";
              return { x: px, y: py };
            } catch {
              return { x: 0, y: 0 };
            }
          },
          event(evt) {
            try {
              if (!this.enabled) return { ok: false, error: "disabled" };
              const e = evt && typeof evt === "object" ? evt : {};
              const type = String(e.type || "").trim();
              const pos = this.setCursor(e.x, e.y);

              if (type === "click") {
                const ripple = document.createElement("div");
                ripple.className = "stingAgentRipple";
                ripple.style.left = pos.x + "px";
                ripple.style.top = pos.y + "px";
                root.appendChild(ripple);
                setTimeout(() => {
                  try { ripple.remove(); } catch {}
                }, 480);
              } else if (type === "scroll") {
                const dy = Number(e.deltaY) || 0;
                const chip = document.createElement("div");
                chip.className = "stingAgentScrollChip";
                chip.style.left = pos.x + "px";
                chip.style.top = pos.y + "px";
                chip.style.setProperty("--sting-agent-scroll-dy", (dy < 0 ? "-12px" : "12px"));
                chip.textContent = dy < 0 ? "▲ scroll" : "▼ scroll";
                root.appendChild(chip);
                setTimeout(() => {
                  try { chip.remove(); } catch {}
                }, 620);
              }
              return { ok: true, type, x: pos.x, y: pos.y };
            } catch (err) {
              return { ok: false, error: String(err && err.message ? err.message : err) };
            }
          }
        };

        try {
          window.__stingAgentControlUi = ui;
        } catch {}
        return ui;
      } catch (err) {
        return null;
      }
    };

    const existing = (() => {
      try {
        const ui = window.__stingAgentControlUi;
        return ui && typeof ui === "object" && ui.__installed ? ui : null;
      } catch {
        return null;
      }
    })();
    const ui = existing || install();
    if (!ui || typeof ui !== "object") return { ok: false, error: "install failed" };
    const state = ui.setEnabled(enabled, marker);
    if (event) ui.event(event);
    return { ok: true, state };
  })()`;
}

async function applyWebviewAgentControlUi(webview, { marker, enabled, event, tabId, touchedTabIds } = {}) {
  const wv = webview || getActiveWebview();
  if (!wv) return null;
  try {
    const res = await wv.executeJavaScript(buildWebviewAgentControlUiExpression({ marker, enabled, event }), true);
    if (enabled !== false && touchedTabIds && tabId) touchedTabIds.add(tabId);
    return res && typeof res === "object" ? res : null;
  } catch {
    return null;
  }
}

function compactAgentToolOutput(tool, toolRes) {
  const res = toolRes && typeof toolRes === "object" ? toolRes : {};
  const safeText = (value, maxLen = 180) => {
    const text = String(value ?? "");
    if (text.length <= maxLen) return text;
    return `${text.slice(0, maxLen)}…`;
  };
  const pickRect = (rect) => {
    if (!rect || typeof rect !== "object") return null;
    const x = Number(rect.x);
    const y = Number(rect.y);
    const w = Number(rect.w ?? rect.width);
    const h = Number(rect.h ?? rect.height);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h)) return null;
    return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
  };

  if (tool === "click") {
    const r = res.result && typeof res.result === "object" ? res.result : null;
    if (!r) return null;
    return {
      x: Number.isFinite(r.x) ? r.x : undefined,
      y: Number.isFinite(r.y) ? r.y : undefined,
      clickCount: Number.isFinite(r.clickCount) ? r.clickCount : undefined,
      usedTrustedInput: typeof r.usedTrustedInput === "boolean" ? r.usedTrustedInput : undefined
    };
  }
  if (tool === "clickByText") {
    const match = res.match && typeof res.match === "object" ? res.match : null;
    const click = res.click && typeof res.click === "object" ? res.click : null;
    return {
      clickedId: String(res.clickedId || ""),
      totalMatches: Number.isFinite(res.totalMatches) ? res.totalMatches : undefined,
      match: match
        ? {
          id: String(match.id || ""),
          tag: String(match.tag || ""),
          role: String(match.role || ""),
          text: safeText(match.text || "", 180),
          ariaLabel: safeText(match.ariaLabel || "", 180),
          rect: pickRect(match.rect)
        }
        : null,
      click: click
        ? {
          x: Number.isFinite(click.x) ? click.x : undefined,
          y: Number.isFinite(click.y) ? click.y : undefined,
          clickCount: Number.isFinite(click.clickCount) ? click.clickCount : undefined,
          usedTrustedInput: typeof click.usedTrustedInput === "boolean" ? click.usedTrustedInput : undefined
        }
        : null
    };
  }
  if (tool === "clickBySelector") {
    const wait = res.wait && typeof res.wait === "object" ? res.wait : null;
    const click = res.click && typeof res.click === "object" ? res.click : null;
    return {
      selector: safeText(res.selector || "", 220),
      clickedId: String(res.clickedId || ""),
      wait: wait
        ? {
          waitedMs: Number.isFinite(wait.waitedMs) ? wait.waitedMs : undefined,
          url: safeText(wait.url || "", 420)
        }
        : null,
      click: click
        ? {
          x: Number.isFinite(click.x) ? click.x : undefined,
          y: Number.isFinite(click.y) ? click.y : undefined,
          clickCount: Number.isFinite(click.clickCount) ? click.clickCount : undefined,
          usedTrustedInput: typeof click.usedTrustedInput === "boolean" ? click.usedTrustedInput : undefined
        }
        : null
    };
  }
  if (tool === "hover") {
    const r = res.result && typeof res.result === "object" ? res.result : null;
    if (!r) return null;
    return { x: Number.isFinite(r.x) ? r.x : undefined, y: Number.isFinite(r.y) ? r.y : undefined };
  }
  if (tool === "scroll") {
    const r = res.result && typeof res.result === "object" ? res.result : null;
    if (!r) return null;
    return r;
  }
  if (tool === "findElements") {
    const matches = Array.isArray(res.matches) ? res.matches : [];
    return {
      count: matches.length,
      matches: matches.slice(0, 8).map((m) => ({
        id: String(m?.id || ""),
        tag: String(m?.tag || ""),
        role: String(m?.role || ""),
        text: safeText(m?.text || ""),
        ariaLabel: safeText(m?.ariaLabel || ""),
        placeholder: safeText(m?.placeholder || ""),
        rect: pickRect(m?.rect)
      }))
    };
  }
  if (tool === "readElement") {
    const el = res.element && typeof res.element === "object" ? res.element : null;
    if (!el) return null;
    return {
      id: String(el.id || ""),
      tag: String(el.tag || ""),
      role: String(el.role || ""),
      ariaLabel: safeText(el.ariaLabel || ""),
      placeholder: safeText(el.placeholder || ""),
      name: safeText(el.name || ""),
      type: safeText(el.type || ""),
      value: safeText(el.value || "", 260),
      text: safeText(el.text || "", 260),
      checked: typeof el.checked === "boolean" ? el.checked : undefined,
      disabled: typeof el.disabled === "boolean" ? el.disabled : undefined,
      isContentEditable: typeof el.isContentEditable === "boolean" ? el.isContentEditable : undefined,
      rect: pickRect(el.rect)
    };
  }
  if (tool === "collectLinks") {
    const links = Array.isArray(res.links) ? res.links : [];
    return {
      count: links.length,
      links: links.slice(0, 10).map((l) => ({
        id: String(l?.id || ""),
        text: safeText(l?.text || "", 140),
        href: safeText(l?.href || "", 360),
        rect: pickRect(l?.rect)
      }))
    };
  }
  if (tool === "paginateAndCollect") {
    const links = Array.isArray(res.links) ? res.links : [];
    return {
      count: Number.isFinite(res.count) ? res.count : links.length,
      scrollsDone: Number.isFinite(res.scrollsDone) ? res.scrollsDone : undefined,
      links: links.slice(0, 12).map((l) => ({
        id: String(l?.id || ""),
        text: safeText(l?.text || "", 140),
        href: safeText(l?.href || "", 360),
        rect: pickRect(l?.rect)
      }))
    };
  }
  if (tool === "extractStructuredData") {
    const meta = res.meta && typeof res.meta === "object" ? res.meta : {};
    const jsonLd = Array.isArray(res.jsonLd) ? res.jsonLd : [];
    const tables = Array.isArray(res.tables) ? res.tables : [];
    return {
      meta: {
        title: safeText(meta.title || "", 140),
        description: safeText(meta.description || "", 220),
        canonical: safeText(meta.canonical || "", 280),
        author: safeText(meta.author || "", 120),
        publishedTime: safeText(meta.publishedTime || "", 120)
      },
      jsonLdCount: jsonLd.length,
      tablesCount: tables.length
    };
  }
  if (tool === "extractTables") {
    const tables = Array.isArray(res.tables) ? res.tables : [];
    return {
      tablesCount: tables.length,
      tables: tables.slice(0, 6).map((t) => {
        const table = t && typeof t === "object" ? t : {};
        const headers = Array.isArray(table.headers) ? table.headers.map((h) => safeText(h, 80)).slice(0, 20) : [];
        const rows = Array.isArray(table.rows)
          ? table.rows
            .filter((r) => Array.isArray(r))
            .slice(0, 18)
            .map((r) => r.map((c) => safeText(c, 120)).slice(0, 20))
          : [];
        return { caption: safeText(table.caption || "", 160), headers, rows };
      })
    };
  }
  if (tool === "readerExtract") {
    const a = res.article && typeof res.article === "object" ? res.article : null;
    if (!a) return null;
    const text = String(a.text ?? "");
    return {
      title: safeText(a.title || "", 140),
      author: safeText(a.author || "", 120),
      siteName: safeText(a.siteName || "", 120),
      publishedTime: safeText(a.publishedTime || "", 120),
      excerpt: safeText(a.excerpt || "", 280),
      chars: text.length
    };
  }
  if (tool === "multiTabResearch") {
    const pages = Array.isArray(res.pages) ? res.pages : [];
    return {
      keepTabs: typeof res.keepTabs === "boolean" ? res.keepTabs : undefined,
      pages: pages.slice(0, 12).map((p) => {
        const page = p && typeof p === "object" ? p : {};
        const article = page.article && typeof page.article === "object" ? page.article : null;
        const text = String(article?.text ?? "");
        const excerpt = String(article?.excerpt ?? "");
        const links = Array.isArray(page.links) ? page.links : [];
        return {
          requestedUrl: safeText(page.requestedUrl || "", 420),
          url: safeText(page.url || "", 420),
          title: safeText(page.title || "", 160),
          ok: typeof page.ok === "boolean" ? page.ok : undefined,
          error: safeText(page.error || "", 220),
          excerpt: safeText(excerpt, 320),
          textSample: safeText(text, 1400),
          chars: text.length,
          linksCount: links.length,
          structuredData: page.structuredData ? true : false
        };
      })
    };
  }
  if (tool === "networkGetResponses") {
    const entries = Array.isArray(res.entries) ? res.entries : [];
    const redact = (input) => {
      let out = String(input ?? "");
      if (!out) return out;
      out = out.replace(/\b(eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})\b/g, "REDACTED_JWT");
      out = out.replace(/(Bearer\s+)[a-zA-Z0-9._~+/=-]+/gi, "$1REDACTED");
      out = out.replace(/(\"(?:access_token|id_token|refresh_token|token|authorization)\"\\s*:\\s*\")([^\"]+)(\")/gi, "$1REDACTED$3");
      out = out.replace(/(\b(?:access_token|id_token|refresh_token|token)\b\s*=\s*)([^&\s]+)/gi, "$1REDACTED");
      return out;
    };
    return {
      installed: typeof res.installed === "boolean" ? res.installed : undefined,
      count: entries.length,
      entries: entries.slice(0, 8).map((e) => {
        const entry = e && typeof e === "object" ? e : {};
        const bodyText = redact(entry.bodyText || "");
        return {
          kind: safeText(entry.kind || "", 30),
          method: safeText(entry.method || "", 14),
          status: Number(entry.status) || 0,
          ok: typeof entry.ok === "boolean" ? entry.ok : undefined,
          url: safeText(entry.url || "", 360),
          contentType: safeText(entry.contentType || "", 120),
          durMs: Number(entry.durMs) || 0,
          bodySnippet: safeText(bodyText, 900),
          error: safeText(entry.error || "", 180)
        };
      })
    };
  }
  if (tool === "cookieExport") {
    return { cookieJarId: String(res.cookieJarId || ""), count: Number(res.count) || 0 };
  }
  if (tool === "cookieImport") {
    return { count: Number(res.count) || 0 };
  }
  if (tool === "googleSheetsAppendRows") {
    return {
      spreadsheetId: safeText(res.spreadsheetId || "", 120),
      url: safeText(res.url || "", 360),
      updatedRange: safeText(res.updatedRange || "", 160),
      updatedRows: Number(res.updatedRows) || 0,
      updatedColumns: Number(res.updatedColumns) || 0,
      updatedCells: Number(res.updatedCells) || 0
    };
  }
  if (tool === "googleDocsCreateOrAppend") {
    return { documentId: safeText(res.documentId || "", 120), url: safeText(res.url || "", 360) };
  }
  if (tool === "googleSlidesCreateDeck") {
    return {
      presentationId: safeText(res.presentationId || "", 120),
      url: safeText(res.url || "", 360),
      slidesCount: Number(res.slidesCount) || 0
    };
  }
  if (tool === "scrollIntoView") {
    return { rect: pickRect(res.rect) };
  }
  if (tool === "screenshot") {
    const s = res.screenshot && typeof res.screenshot === "object" ? res.screenshot : null;
    if (!s) return null;
    return { path: String(s.path || ""), mimeType: String(s.mimeType || "") };
  }
  if (tool === "uploadFile") {
    return { filesCount: Number(res.filesCount) || 0 };
  }
  if (tool === "hotkey" || tool === "press" || tool === "type" || tool === "fillText" || tool === "navigate") {
    const r = res.result && typeof res.result === "object" ? res.result : null;
    return r || null;
  }
  if (tool === "waitForLoad" || tool === "waitFor") {
    const r = res.result && typeof res.result === "object" ? res.result : null;
    if (!r) return null;
    const element = r.element && typeof r.element === "object" ? r.element : null;
    return {
      waitedMs: Number.isFinite(r.waitedMs) ? r.waitedMs : undefined,
      quietMs: Number.isFinite(r.quietMs) ? r.quietMs : undefined,
      url: safeText(r.url || "", 420),
      element: element
        ? {
          id: String(element.id || ""),
          tag: String(element.tag || ""),
          role: String(element.role || ""),
          ariaLabel: safeText(element.ariaLabel || ""),
          text: safeText(element.text || ""),
          rect: pickRect(element.rect)
        }
        : null
    };
  }
  if (tool === "downloadsWait") {
    const d = res.download && typeof res.download === "object" ? res.download : null;
    if (!d) return null;
    return {
      id: String(d.id || ""),
      filename: String(d.filename || ""),
      state: String(d.state || ""),
      savePath: String(d.savePath || "")
    };
  }
  if (tool === "tabList") {
    const tabs = Array.isArray(res.tabs) ? res.tabs : [];
    return {
      tabs: tabs.slice(0, 12).map((t) => ({
        tabId: String(t?.tabId || ""),
        title: safeText(t?.title || "", 120),
        url: safeText(t?.url || "", 300),
        isActive: Boolean(t?.isActive)
      }))
    };
  }
  if (tool === "tabActivate") {
    return { tabId: String(res.tabId || "") };
  }
  if (tool === "tabOpen") {
    return { tabId: String(res.tabId || "") };
  }
  if (tool === "tabClose") {
    return { tabId: String(res.tabId || "") };
  }
  if (tool === "reportCreate") {
    return { tabId: String(res.tabId || ""), title: safeText(res.title || "", 140) };
  }
  if (tool === "exportFile") {
    const f = res.file && typeof res.file === "object" ? res.file : null;
    if (!f) return null;
    return {
      path: String(f.path || ""),
      bytes: Number(f.bytes) || 0,
      format: String(f.format || ""),
      mimeType: String(f.mimeType || "")
    };
  }
  return null;
}

async function runBrowserAgentRequest({ displayText, buildUserMessage }) {
  const shown = String(displayText ?? "").trim();
  if (!shown) return;
  if (isSendingChat) return;

  const seq = ++agentRunSeq;
  setAgentRunning(true);

  const tab = getActiveTab();
  const tabId = tab?.id || null;

  const userMsg = createAiChatMessage({ role: "user", meta: t("ai.meta.user"), text: shown });
  const assistantMsg = createAiChatMessage({
    role: "assistant",
    meta: t("ai.meta.assistant"),
    text: t("ai.chat.sending")
  });
  setAiAssistantMessagePending(assistantMsg);
  setChatSending(true);

  ensureActiveAiConversation();
  const conversationId = aiActiveConversationId;
  const conv = conversationId ? getAiConversationRecord(conversationId) : null;
  const historyForAi = (Array.isArray(conv?.messages) ? conv.messages : [])
    .filter((m) => m && !m.skipContext && (m.role === "user" || m.role === "assistant"))
    .map((m) => ({ role: m.role, content: m.content }))
    .slice(-12);

  const now = Date.now();
  const userRecord = {
    role: "user",
    meta: t("ai.meta.user"),
    content: shown,
    ts: now,
    skipContext: false
  };
  if (conv && Array.isArray(conv.messages)) {
    conv.messages.push(userRecord);
    conv.updatedAt = now;
    persistAiChatStore();
  }

  const run = {
    seq,
    tabId,
    conversationId,
    conversationRecord: conv,
    userMsg,
    userRecord,
    assistantMsg,
    stepsGroup: null,
    stopped: false,
    uiStopped: false
  };
  activeAgentRun = run;

  let stepsGroup = null;
  let stepErrors = 0;
  let marker = "";
  const agentUiTouchedTabIds = new Set();

  const updateStepsGroupMeta = (attemptedSteps, maxSteps) => {
    if (!stepsGroup?.metaCountEl) return;
    const total = Number.isFinite(Number(maxSteps)) ? Number(maxSteps) : null;
    const done = Number.isFinite(Number(attemptedSteps)) ? Number(attemptedSteps) : 0;
    const parts = [];
    if (total != null && total > 0) parts.push(`${Math.min(done, total)}/${total}`);
    else if (done) parts.push(String(done));
    if (stepErrors) parts.push(`${stepErrors} ${stepErrors === 1 ? "error" : "errors"}`);
    stepsGroup.metaCountEl.textContent = parts.length ? parts.join(" · ") : "";
  };

  const finalizeStepsGroup = () => {
    if (!stepsGroup) return;
    try {
      stepsGroup.root.classList.add("done");
    } catch {
    }
    try {
      stepsGroup.detailsEl.open = false;
    } catch {
    }
  };

	  const markStopped = () => {
	    if (run.uiStopped) return;
	    run.uiStopped = true;
	    assistantMsg.metaEl.textContent = `${t("ai.meta.assistant")} · Agent · ${t("ai.meta.stopped")}`;
	    assistantMsg.contentEl.className = "aiMsgText";
	    assistantMsg.contentEl.textContent = t("ai.agent.stopped");
	    try {
	      assistantMsg.root.dataset.copyText = t("ai.agent.stopped");
	    } catch {
	    }
	    try {
	      assistantMsg.root.removeAttribute("aria-busy");
	    } catch {
	    }
	    if (assistantMsg.root?.isConnected) {
	      try {
	        aiChatMessages.appendChild(assistantMsg.root);
	      } catch {
	      }
    }
    finalizeStepsGroup();
  };

  try {
    const status = await window.aiBridge.getAgentStatus();
    if (!status?.ok) {
      throw new Error(String(status?.error || "Browser agent is unavailable"));
    }
    agentDebugLog("status", status);
		    if (!status?.cdpEnabled) {
		      throw new Error("Browser agent is unavailable (CDP disabled). Set STING_CDP_ENABLE=1 and restart.");
		    }

    if (seq !== agentRunSeq || !isAgentRunning) {
      markStopped();
      return;
    }

    const ctx = await buildAiPageContext();
    if (seq !== agentRunSeq || !isAgentRunning) {
      markStopped();
      return;
    }

    if (tabId && tabId === activeTabId) {
      if (ctx.pageTitle) aiContextTitle.textContent = ctx.pageTitle;
      if (ctx.pageUrl) aiContextUrl.textContent = ctx.pageUrl;
    }

    const providerValue = String(providerSelect.value || "").trim();
    const provider = providerValue === "gemini" ? "gemini" : providerValue === "openai" ? "openai" : "local";
    let model = "";
    let baseUrl = "";
    if (provider === "local") {
      model = String(localModelSelect.value || "").trim();
      if (!model) throw new Error(t("ai.error.localModelMissing"));
    } else if (provider === "gemini") {
      model = String(geminiModelSelect.value || "gemini-2.5-flash");
    } else {
      model = String(openAiModelInput.value || "").trim();
      baseUrl = String(openAiBaseUrlInput.value || "").trim();
      if (!model) throw new Error("OpenAI-compatible model not set");
    }

    const built = typeof buildUserMessage === "function" ? buildUserMessage(ctx) : "";
    const historyText =
      typeof built === "string" ? built : built && typeof built === "object" ? built.history : "";
    const aiText = typeof built === "string" ? built : built && typeof built === "object" ? built.ai : "";
    const userMessage = String(historyText || "").trim();
    const agentTask = String(aiText || "").trim();
    if (!agentTask) throw new Error(t("error.emptyPrompt"));

    if (userMessage && userMessage !== shown) {
      if (userMsg?.root?.isConnected) userMsg.contentEl.textContent = userMessage;
      try {
        if (userMsg?.root) userMsg.root.dataset.copyText = userMessage;
      } catch {
      }
    }

    const userMessageForHistory = userMessage || shown;
    if (userMessageForHistory) userRecord.content = userMessageForHistory;

				    marker = `agent_${Date.now()}_${Math.random().toString(16).slice(2)}`;
				    const steps = [];
            const cookieJars = new Map();
		        const knownElementIds = new Set();
            const knownElementRects = new Map();
		        let currentPageId = "";
				    const maxSteps = clampAgentMaxSteps(agentMaxStepsInput?.value);
				    let targetUrl = String(ctx.pageUrl || "").trim();
				    let targetTitle = String(ctx.pageTitle || "").trim();

            await ensureWebviewHasAgentMarker(null, marker);
            await applyWebviewAgentControlUi(null, {
              marker,
              enabled: true,
              tabId: String(getActiveTab()?.id || ""),
              touchedTabIds: agentUiTouchedTabIds
            });

            const getApproxPointForElementId = (id) => {
              const key = String(id || "").trim();
              if (!key) return null;
              const r = knownElementRects.get(key);
              if (!r) return null;
              const x = Number(r.x) + Number(r.w) / 2;
              const y = Number(r.y) + Number(r.h) / 2;
              if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
              return { x, y };
            };
            const emitAgentUiEvent = async (event) => {
              try {
                await applyWebviewAgentControlUi(null, {
                  marker,
                  enabled: true,
                  event,
                  tabId: String(getActiveTab()?.id || ""),
                  touchedTabIds: agentUiTouchedTabIds
                });
              } catch {
              }
            };

			    stepsGroup = createAiAgentStepsGroup({
			      meta: `${t("ai.meta.assistant")} · Agent`,
			      title: t("ai.agent.steps.title")
			    });
		    run.stepsGroup = stepsGroup;
		    updateStepsGroupMeta(0, maxSteps);

	    for (let step = 1; step <= maxSteps; step++) {
	      if (seq !== agentRunSeq) {
	        markStopped();
	        return;
	      }
	      if (!isAgentRunning) {
	        markStopped();
	        return;
	      }

					      const markerInfo = await ensureWebviewHasAgentMarker(null, marker);
                await applyWebviewAgentControlUi(null, {
                  marker,
                  enabled: true,
                  tabId: String(getActiveTab()?.id || ""),
                  touchedTabIds: agentUiTouchedTabIds
                });
					      const pageId = String(markerInfo?.pageId || "").trim();
					      if ((pageId && pageId !== currentPageId) || markerInfo?.didReset) {
					        currentPageId = pageId || currentPageId;
					        knownElementIds.clear();
                  knownElementRects.clear();
					      }
				      const snapRes = await window.aiBridge.agentSnapshot({ url: targetUrl, title: targetTitle, marker });
		      if (!snapRes?.ok) throw new Error(snapRes?.error || "Failed to snapshot page");
      const snapshot = snapRes.snapshot || {};
      agentDebugLog(`snapshot ${step}`, {
        url: String(snapshot.url || ""),
        title: String(snapshot.title || ""),
        scroll: snapshot.scroll || null,
        elements: Array.isArray(snapshot.elements) ? snapshot.elements.length : 0
      });
	      targetUrl = String(snapshot.url || targetUrl);
	      targetTitle = String(snapshot.title || targetTitle);
	      const snapshotElements = Array.isArray(snapshot.elements) ? snapshot.elements : [];
	      const snapshotElementIds = new Set(snapshotElements.map((e) => String(e?.id || "").trim()).filter(Boolean));
	      for (const id of snapshotElementIds) knownElementIds.add(id);
        for (const e of snapshotElements) {
          const id = String(e?.id || "").trim();
          if (!id) continue;
          const r = e?.rect && typeof e.rect === "object" ? e.rect : null;
          if (!r) continue;
          const x = Number(r.x);
          const y = Number(r.y);
          const w = Number(r.w ?? r.width);
          const h = Number(r.h ?? r.height);
          if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h)) continue;
          if (w < 2 || h < 2) continue;
          knownElementRects.set(id, { x, y, w, h });
        }
	      const activeId = String(snapshot?.active?.id || "").trim();
	      if (activeId) knownElementIds.add(activeId);
        const activeRect = snapshot?.active?.rect && typeof snapshot.active.rect === "object" ? snapshot.active.rect : null;
        if (activeId && activeRect) {
          const x = Number(activeRect.x);
          const y = Number(activeRect.y);
          const w = Number(activeRect.w ?? activeRect.width);
          const h = Number(activeRect.h ?? activeRect.height);
          if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(w) && Number.isFinite(h) && w >= 2 && h >= 2) {
            knownElementRects.set(activeId, { x, y, w, h });
          }
        }

      const system = buildBrowserAgentSystemPrompt();
      const prompt = buildBrowserAgentUserPrompt({ task: agentTask, snapshot, steps, maxSteps });
      const aiRes = await window.aiBridge.generate({
        provider,
        model,
        baseUrl,
        format: "json",
        messages: [
          { role: "system", content: system },
          ...historyForAi,
          { role: "user", content: prompt }
        ],
        prompt
      });
      if (!aiRes?.ok) throw new Error(aiRes?.error || t("error.aiGeneric"));
      agentDebugLog(`llm ${step}`, truncateText(aiRes.text, 1400));
      if (seq !== agentRunSeq || !isAgentRunning) {
        markStopped();
        return;
      }

	      let rawActionText = String(aiRes.text ?? "");
	      let parsed = parseJsonObjectFromText(rawActionText);
	      let normalized = null;

	      const repairAgentJsonOnce = async (why) => {
	        const reason = String(why || "invalid JSON").trim() || "invalid JSON";
	        const assistantBad = truncateText(rawActionText, 1800);
	        const fixInstruction = [
	          "Your previous response was rejected because it was not a single valid JSON object.",
	          `Reason: ${reason}`,
	          "",
	          "Return ONLY one JSON object (no extra text, no Markdown).",
          "If you intended multiple steps, return only the next immediate step as a tool call.",
          "Use one of:",
          '{"type":"tool","tool":"snapshot","args":{},"reason":"..."}',
          '{"type":"tool","tool":"findElements","args":{"text":"login"},"reason":"..."}',
          '{"type":"tool","tool":"readElement","args":{"id":"12","fields":["value"]},"reason":"..."}',
          '{"type":"tool","tool":"scrollIntoView","args":{"id":"12"},"reason":"..."}',
          '{"type":"tool","tool":"click","args":{"id":"12"},"reason":"..."}',
          '{"type":"tool","tool":"click","args":{"x":123,"y":456,"count":2},"reason":"..."}',
          '{"type":"tool","tool":"hover","args":{"x":123,"y":456},"reason":"..."}',
          '{"type":"tool","tool":"scroll","args":{"deltaY":600},"reason":"..."}',
          '{"type":"tool","tool":"fillText","args":{"id":"12","text":"hello"},"reason":"..."}',
          '{"type":"tool","tool":"type","args":{"text":"..."},"reason":"..."}',
          '{"type":"tool","tool":"hotkey","args":{"keys":"Ctrl+L"},"reason":"..."}',
          '{"type":"tool","tool":"press","args":{"key":"Enter"},"reason":"..."}',
          '{"type":"tool","tool":"navigate","args":{"url":"https://..."},"reason":"..."}',
          '{"type":"tool","tool":"waitFor","args":{"selector":"button[type=submit]","timeoutMs":15000},"reason":"..."}',
          '{"type":"tool","tool":"waitForLoad","args":{"state":"networkidle"},"reason":"..."}',
          '{"type":"tool","tool":"tabList","args":{},"reason":"..."}',
          '{"type":"tool","tool":"tabActivate","args":{"tabId":123},"reason":"..."}',
          '{"type":"tool","tool":"downloadsWait","args":{"timeoutMs":30000},"reason":"..."}',
          '{"type":"tool","tool":"uploadFile","args":{"id":"12","paths":["/absolute/path/to/file"]},"reason":"..."}',
          '{"type":"final","final":"..."}',
          "",
          "PREVIOUS_INVALID_RESPONSE:",
          assistantBad
        ].join("\n");

	        const repairRes = await window.aiBridge.generate({
	          provider,
	          model,
	          baseUrl,
	          format: "json",
	          messages: [
	            { role: "system", content: system },
	            ...historyForAi,
	            { role: "user", content: prompt },
	            { role: "assistant", content: assistantBad },
	            { role: "user", content: fixInstruction }
	          ],
	          prompt: fixInstruction
	        });
	        if (!repairRes?.ok) return null;
	        agentDebugLog(`llm ${step} repair`, truncateText(repairRes.text, 1400));
	        const nextText = String(repairRes.text ?? "");
	        const nextParsed = parseJsonObjectFromText(nextText);
	        if (!nextParsed) return null;
	        return { text: nextText, parsed: nextParsed };
	      };

	      let repaired = false;
	      if (!parsed) {
	        const fixed = await repairAgentJsonOnce("invalid JSON");
	        if (fixed) {
	          repaired = true;
	          rawActionText = fixed.text;
	          parsed = fixed.parsed;
	        }
	      }
	      if (parsed) {
	        normalized = normalizeBrowserAgentAction(parsed, rawActionText);
	        if (!normalized.ok && !repaired) {
	          const fixed = await repairAgentJsonOnce(String(normalized.error || "invalid action"));
	          if (fixed) {
	            rawActionText = fixed.text;
	            parsed = fixed.parsed;
	            normalized = normalizeBrowserAgentAction(parsed, rawActionText);
	          }
	        }
	      }

	      if (!parsed) {
	        const error = `Agent returned invalid JSON.\n\nRaw response:\n${truncateText(rawActionText, 900)}`;
	        agentDebugLog(`action ${step} invalid`, { error });
	        steps.push({ step, tool: "(invalid)", args: null, reason: "", result: "error", error });
	        createAiChatMessage({
	          role: "assistant",
	          meta: `${t("ai.meta.assistant")} · ${t("ai.meta.error")}`,
	          text: error,
	          parentEl: stepsGroup?.listEl
	        });
	        stepErrors++;
	        updateStepsGroupMeta(steps.length, maxSteps);
	        continue;
	      }

	      if (!normalized?.ok) {
	        const error = String(normalized?.error || "Agent returned invalid action");
	        agentDebugLog(`action ${step} invalid`, { parsed, error });
	        steps.push({ step, tool: "(invalid)", args: parsed, reason: "", result: "error", error });
	        createAiChatMessage({
	          role: "assistant",
	          meta: `${t("ai.meta.assistant")} · ${t("ai.meta.error")}`,
	          text: error,
	          parentEl: stepsGroup?.listEl
	        });
	        stepErrors++;
	        updateStepsGroupMeta(steps.length, maxSteps);
	        continue;
	      }
		      agentDebugLog(`action ${step}`, normalized);

		      if (normalized.type === "final") {
		        const finalText = String(normalized.final || "").trim();
		        const providerLabel =
		          provider === "local"
		            ? t("ai.meta.provider.local")
		            : provider === "gemini"
		              ? t("ai.meta.provider.gemini")
		              : t("ai.meta.provider.openai");
		        const assistantMeta = `${t("ai.meta.assistant")} · Agent · ${providerLabel} · ${model}`;
			        if (assistantMsg?.root?.isConnected) {
			          assistantMsg.metaEl.textContent = assistantMeta;
			          assistantMsg.contentEl.className = "aiMarkdown";
			          assistantMsg.contentEl.innerHTML = renderAiMarkdownToSanitizedHtml(finalText || "(no output)");
			          try {
			            assistantMsg.root.dataset.copyText = finalText || "";
			          } catch {
			          }
			          try {
			            assistantMsg.root.removeAttribute("aria-busy");
			          } catch {
			          }
			          try {
			            aiChatMessages.appendChild(assistantMsg.root);
			          } catch {
			          }
			        }
		        finalizeStepsGroup();
		        updateStepsGroupMeta(steps.length, maxSteps);

		        const doneAt = Date.now();
		        if (conv && Array.isArray(conv.messages)) {
		          conv.messages.push({
		            role: "assistant",
		            meta: assistantMeta,
		            content: finalText,
		            ts: doneAt,
		            skipContext: false
		          });
		          conv.updatedAt = doneAt;
		          persistAiChatStore();
		        }
		        if (
		          !assistantMsg?.root?.isConnected &&
		          tabId &&
		          tabId === activeTabId &&
		          getActiveTab()?.aiConversationId === conversationId
		        ) {
		          renderAiConversationMessages(conv?.messages || []);
		        }
		        return;
		      }

	      const tool = normalized.tool;
	      const args = normalized.args && typeof normalized.args === "object" ? normalized.args : {};
	      const reason = String(normalized.reason || "").trim();

      const confirmNeeded = Boolean(agentConfirmCheckbox?.checked) && tool !== "snapshot";
	      if (confirmNeeded) {
	        const ok = confirm(`Agent step ${step}: ${tool}\n\n${reason || ""}`.trim());
	        if (!ok) {
	          stopAgentFlow();
	          return;
	        }
	      }

      const stepRecord = { step, tool, args, reason, result: "planned" };
      steps.push(stepRecord);

		      const meta = `${t("ai.meta.assistant")} · Agent · step ${step}`;
		      if (tool === "snapshot") {
		        createAiChatMessage({
		          role: "assistant",
		          meta,
		          markdown: `**snapshot**\n\n${reason || ""}`.trim(),
		          parentEl: stepsGroup?.listEl
		        });
		        stepRecord.result = "ok";
		        updateStepsGroupMeta(steps.length, maxSteps);
		        continue;
		      }

	      let toolRes = { ok: true };
	      const markerInfo2 = await ensureWebviewHasAgentMarker(null, marker);
	      const pageId2 = String(markerInfo2?.pageId || "").trim();
	      if ((pageId2 && pageId2 !== currentPageId) || markerInfo2?.didReset) {
	        currentPageId = pageId2 || currentPageId;
	        knownElementIds.clear();
	      }

	      if (tool === "tabOpen") {
        const rawUrl = String(args.url || "").trim();
        if (!rawUrl) {
          toolRes = { ok: false, error: "Missing url for tool: tabOpen." };
        } else {
          const makeActive = args.makeActive == null ? true : Boolean(args.makeActive);
          const url = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(rawUrl) ? rawUrl : getNavigationUrl(rawUrl) || rawUrl;
          const tab = createTab(url, { makeActive });
          if (makeActive) {
            targetUrl = String(tab?.url || url);
            targetTitle = String(tab?.title || "");
            await ensureWebviewHasAgentMarker(null, marker);
          }
          toolRes = { ok: true, tabId: String(tab?.id || "") };
        }
      } else if (tool === "tabClose") {
        const raw = args.tabId;
        const tabIdFromIndex = Number.isFinite(raw) ? (() => {
          const idx = Math.floor(raw) - 1;
          if (idx < 0 || idx >= tabs.length) return "";
          return String(tabs[idx]?.id || "");
        })() : "";
        const want = tabIdFromIndex || String(raw || "").trim() || String(activeTabId || "").trim();
        const exists = want ? tabs.some((t) => String(t?.id || "") === want) : false;
        if (!want || !exists) {
          toolRes = { ok: false, error: `Invalid tabId: ${want || "(missing)"}` };
        } else {
          const wasActive = want === activeTabId;
          closeTab(want);
          if (wasActive) {
            targetUrl = String(getActiveTab()?.url || safeCall(() => getActiveWebview()?.getURL?.(), "") || "");
            targetTitle = String(getActiveTab()?.title || "");
          }
          await ensureWebviewHasAgentMarker(null, marker);
          toolRes = { ok: true, tabId: want };
        }
      } else if (tool === "reportCreate") {
        const title = String(args.title || "").trim() || "Report";
        const markdown = String(args.markdown ?? args.md ?? args.content ?? "").trim();
        if (!markdown) {
          toolRes = { ok: false, error: "Missing markdown for tool: reportCreate." };
        } else {
          const makeActive = args.makeActive == null ? true : Boolean(args.makeActive);
          const bodyHtml = renderAiMarkdownToSanitizedHtml(markdown);
          const html = `<!doctype html><html><head><meta charset="utf-8" />` +
            `<meta name="viewport" content="width=device-width,initial-scale=1" />` +
            `<title>${escapeHtml(title)}</title>` +
            `<style>
              :root{color-scheme:light dark;}
              body{margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji";line-height:1.55}
              header{padding:22px 22px 0;max-width:920px;margin:0 auto}
              main{padding:8px 22px 40px;max-width:920px;margin:0 auto}
              h1,h2,h3{line-height:1.25}
              pre{overflow:auto;padding:12px;border-radius:10px}
              code{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace}
              a{word-break:break-word}
              @media (prefers-color-scheme: light){
                body{background:#fff;color:#111}
                pre{background:#f6f7f9}
                a{color:#0b57d0}
              }
              @media (prefers-color-scheme: dark){
                body{background:#0f1115;color:#e8eaed}
                pre{background:#171a21}
                a{color:#8ab4f8}
              }
            </style></head><body>` +
            `<header><h1>${escapeHtml(title)}</h1></header>` +
            `<main>${bodyHtml}</main>` +
            `</body></html>`;
          const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
          const tab = createTab(dataUrl, { makeActive });
          tab.title = title;
          updateTabElement(tab.id);
          if (makeActive) {
            targetUrl = String(tab?.url || dataUrl);
            targetTitle = String(tab?.title || title);
            await ensureWebviewHasAgentMarker(null, marker);
          }
          toolRes = { ok: true, tabId: String(tab?.id || ""), url: dataUrl, title };
        }
      } else if (tool === "tabList") {
        const list = tabs
          .slice(0, 20)
          .map((t) => ({
            tabId: String(t?.id || ""),
            title: String(t?.title || ""),
            url: String(t?.url || safeCall(() => t?.webview?.getURL?.(), "") || ""),
            isActive: Boolean(t?.id && t.id === activeTabId)
          }))
          .filter((t) => t.tabId);
        toolRes = { ok: true, tabs: list };
      } else if (tool === "tabActivate") {
        const raw = args.tabId;
        const tabIdFromIndex = Number.isFinite(raw) ? (() => {
          const idx = Math.floor(raw) - 1;
          if (idx < 0 || idx >= tabs.length) return "";
          return String(tabs[idx]?.id || "");
        })() : "";
        const want = tabIdFromIndex || String(raw || "").trim();
        const exists = want ? tabs.some((t) => String(t?.id || "") === want) : false;
        if (!want || !exists) {
          toolRes = { ok: false, error: `Invalid tabId: ${want || "(missing)"}` };
        } else {
          setActiveTab(want);
          targetUrl = String(getActiveTab()?.url || safeCall(() => getActiveWebview()?.getURL?.(), "") || targetUrl);
          targetTitle = String(getActiveTab()?.title || targetTitle);
          await ensureWebviewHasAgentMarker(null, marker);
          toolRes = { ok: true, tabId: want };
        }
      } else if (tool === "downloadsWait") {
        toolRes = await window.aiBridge.agentDownloadsWait({
          id: String(args.id || "").trim(),
          since: Number.isFinite(args.since) ? args.since : undefined,
          state: String(args.state || "").trim() || undefined,
          timeoutMs: Number.isFinite(args.timeoutMs) ? args.timeoutMs : undefined
        });
      } else if (tool === "collectLinks") {
        toolRes = await window.aiBridge.agentCollectLinks({
          url: targetUrl,
          title: targetTitle,
          marker,
          limit: Number.isFinite(args.limit) ? args.limit : undefined,
          sameOrigin: typeof args.sameOrigin === "boolean" ? args.sameOrigin : undefined,
          urlIncludes: args.urlIncludes,
          textIncludes: args.textIncludes,
          selector: args.selector
        });
      } else if (tool === "paginateAndCollect") {
        const limitRaw = Number.isFinite(args.limit) ? args.limit : 120;
        const limit = Math.max(1, Math.min(400, Math.floor(limitRaw)));
        const scrollsRaw = Number.isFinite(args.scrolls) ? args.scrolls : 8;
        const scrolls = Math.max(1, Math.min(30, Math.floor(scrollsRaw)));
        const deltaYRaw = Number.isFinite(args.deltaY) ? args.deltaY : 900;
        const deltaY = Math.max(50, Math.min(4000, Math.floor(deltaYRaw)));
        const waitMsRaw = Number.isFinite(args.waitMs) ? args.waitMs : 0;
        const waitMs = Math.max(0, Math.min(15_000, Math.floor(waitMsRaw)));

        const seen = new Set();
        const collected = [];
        let scrollsDone = 0;

        for (let i = 0; i < scrolls && collected.length < limit; i++) {
          const remaining = limit - collected.length;
          const collectRes = await window.aiBridge.agentCollectLinks({
            url: targetUrl,
            title: targetTitle,
            marker,
            limit: Math.min(80, remaining),
            sameOrigin: typeof args.sameOrigin === "boolean" ? args.sameOrigin : undefined,
            urlIncludes: args.urlIncludes,
            textIncludes: args.textIncludes,
            selector: args.selector
          });
          if (!collectRes?.ok) {
            toolRes = { ok: false, error: String(collectRes?.error || "collectLinks failed") };
            break;
          }
          const links = Array.isArray(collectRes.links) ? collectRes.links : [];
          for (const l of links) {
            const href = String(l?.href || "").trim();
            const key = href || String(l?.id || "").trim();
            if (!key || seen.has(key)) continue;
            seen.add(key);
            collected.push(l);
            const id = String(l?.id || "").trim();
            if (id) knownElementIds.add(id);
            if (collected.length >= limit) break;
          }
          if (collected.length >= limit) break;
          if (i < scrolls - 1) {
            const scrollRes = await window.aiBridge.agentScroll({
              url: targetUrl,
              title: targetTitle,
              marker,
              deltaY
            });
            if (!scrollRes?.ok) {
              toolRes = { ok: false, error: String(scrollRes?.error || "scroll failed") };
              break;
            }
            scrollsDone++;
            if (waitMs) {
              await new Promise((resolve) => setTimeout(resolve, waitMs));
            }
          }
        }

        if (toolRes?.ok === false) {
          // preserve failure
        } else {
          toolRes = { ok: true, count: collected.length, scrollsDone, links: collected.slice(0, limit) };
        }
      } else if (tool === "extractStructuredData") {
        toolRes = await window.aiBridge.agentExtractStructuredData({
          url: targetUrl,
          title: targetTitle,
          marker,
          includeJsonLd: typeof args.includeJsonLd === "boolean" ? args.includeJsonLd : undefined,
          includeTables: typeof args.includeTables === "boolean" ? args.includeTables : undefined,
          maxJsonLd: Number.isFinite(args.maxJsonLd) ? args.maxJsonLd : undefined,
          maxJsonLdChars: Number.isFinite(args.maxJsonLdChars) ? args.maxJsonLdChars : undefined,
          maxTables: Number.isFinite(args.maxTables) ? args.maxTables : undefined,
          maxRows: Number.isFinite(args.maxRows) ? args.maxRows : undefined,
          maxCols: Number.isFinite(args.maxCols) ? args.maxCols : undefined
        });
      } else if (tool === "extractTables") {
        toolRes = await window.aiBridge.agentExtractStructuredData({
          url: targetUrl,
          title: targetTitle,
          marker,
          includeJsonLd: false,
          includeTables: true,
          maxTables: Number.isFinite(args.maxTables) ? args.maxTables : undefined,
          maxRows: Number.isFinite(args.maxRows) ? args.maxRows : undefined,
          maxCols: Number.isFinite(args.maxCols) ? args.maxCols : undefined
        });
      } else if (tool === "readerExtract") {
        toolRes = await window.aiBridge.agentReaderExtract({
          url: targetUrl,
          title: targetTitle,
          marker,
          maxChars: Number.isFinite(args.maxChars) ? args.maxChars : undefined
        });
      } else if (tool === "multiTabResearch") {
        const urls = Array.isArray(args.urls) ? args.urls.map((u) => String(u || "").trim()).filter(Boolean) : [];
        if (!urls.length) {
          toolRes = { ok: false, error: "Missing urls for tool: multiTabResearch." };
        } else {
          const maxPagesRaw = Number.isFinite(args.maxPages) ? args.maxPages : urls.length;
          const maxPages = Math.max(1, Math.min(12, Math.floor(maxPagesRaw)));
          const perPageMaxCharsRaw = Number.isFinite(args.perPageMaxChars) ? args.perPageMaxChars : 6000;
          const perPageMaxChars = Math.max(600, Math.min(50_000, Math.floor(perPageMaxCharsRaw)));
          const includeLinks = args.includeLinks === true;
          const includeStructuredData = args.includeStructuredData === true;
          const keepTabs = args.keepTabs === true;

          const pages = [];
          const openedTabIds = [];

          const waitForWebview = async (webview, timeoutMs = 25_000) => {
            const wv = webview;
            if (!wv) return false;
            return await new Promise((resolve) => {
              let done = false;
              const finish = (ok) => {
                if (done) return;
                done = true;
                try { wv.removeEventListener("dom-ready", onReady); } catch {}
                try { wv.removeEventListener("did-finish-load", onReady); } catch {}
                try { wv.removeEventListener("did-fail-load", onReady); } catch {}
                resolve(Boolean(ok));
              };
              const onReady = () => finish(true);
              try { wv.addEventListener("dom-ready", onReady); } catch {}
              try { wv.addEventListener("did-finish-load", onReady); } catch {}
              try { wv.addEventListener("did-fail-load", onReady); } catch {}
              setTimeout(() => finish(false), timeoutMs);
            });
          };

          for (let i = 0; i < Math.min(urls.length, maxPages); i++) {
            const rawUrl = urls[i];
            const normalizedUrl = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(rawUrl) ? rawUrl : getNavigationUrl(rawUrl) || rawUrl;
            const tabMarker = `${marker}_mt_${i + 1}_${Math.random().toString(16).slice(2)}`;
            const page = { requestedUrl: rawUrl, url: "", title: "", ok: false };

            try {
              const tab = createTab(normalizedUrl, { makeActive: false });
              openedTabIds.push(String(tab?.id || ""));
              page.tabId = String(tab?.id || "");

              await waitForWebview(tab?.webview, 28_000);
              await ensureWebviewHasAgentMarker(tab?.webview, tabMarker);

              try {
                await window.aiBridge.agentWaitForLoad({ url: "", title: "", marker: tabMarker, state: "networkidle" });
              } catch {
              }

              const snapRes = await window.aiBridge.agentSnapshot({ url: "", title: "", marker: tabMarker });
              if (snapRes?.ok) {
                page.url = String(snapRes?.snapshot?.url || "");
                page.title = String(snapRes?.snapshot?.title || "");
              }

              const readerRes = await window.aiBridge.agentReaderExtract({
                url: page.url,
                title: page.title,
                marker: tabMarker,
                maxChars: perPageMaxChars
              });
              if (readerRes?.ok) {
                const article = readerRes.article && typeof readerRes.article === "object" ? readerRes.article : null;
                if (article) {
                  page.article = {
                    title: String(article.title || ""),
                    byline: String(article.byline || ""),
                    siteName: String(article.siteName || ""),
                    excerpt: String(article.excerpt || ""),
                    text: String(article.text || "")
                  };
                }
              }

              if (includeLinks) {
                const linksRes = await window.aiBridge.agentCollectLinks({
                  url: page.url,
                  title: page.title,
                  marker: tabMarker,
                  limit: 60,
                  sameOrigin: true
                });
                if (linksRes?.ok) {
                  page.links = Array.isArray(linksRes.links) ? linksRes.links.slice(0, 60) : [];
                }
              }

              if (includeStructuredData) {
                const dataRes = await window.aiBridge.agentExtractStructuredData({
                  url: page.url,
                  title: page.title,
                  marker: tabMarker,
                  includeJsonLd: true,
                  includeTables: false,
                  maxJsonLd: 8,
                  maxJsonLdChars: 12_000
                });
                if (dataRes?.ok) {
                  page.structuredData = {
                    meta: dataRes.meta || null,
                    jsonLd: Array.isArray(dataRes.jsonLd) ? dataRes.jsonLd.slice(0, 8) : []
                  };
                }
              }

              page.ok = true;
            } catch (err) {
              page.error = String(err?.message || err);
            } finally {
              pages.push(page);
              if (!keepTabs) {
                const tabId = String(page.tabId || "");
                if (tabId) {
                  try {
                    closeTab(tabId);
                  } catch {
                  }
                }
              }
            }
          }

          toolRes = { ok: true, keepTabs, pages, openedTabs: openedTabIds.filter(Boolean) };
        }
      } else if (tool === "networkGetResponses") {
        toolRes = await window.aiBridge.agentNetworkGetResponses({
          url: targetUrl,
          title: targetTitle,
          marker,
          urlIncludes: args.urlIncludes,
          method: args.method,
          limit: Number.isFinite(args.limit) ? args.limit : undefined,
          maxBodyChars: Number.isFinite(args.maxBodyChars) ? args.maxBodyChars : undefined
        });
      } else if (tool === "cookieExport") {
        const exportRes = await window.aiBridge.agentCookieExport({
          url: targetUrl,
          title: targetTitle,
          marker,
          urls: Array.isArray(args.urls) ? args.urls : undefined,
          limit: Number.isFinite(args.limit) ? args.limit : undefined
        });
        if (!exportRes?.ok) {
          toolRes = exportRes;
        } else {
          const jarId = `cookiejar_${Date.now()}_${Math.random().toString(16).slice(2)}`;
          const cookies = Array.isArray(exportRes.cookies) ? exportRes.cookies : [];
          cookieJars.set(jarId, cookies);
          toolRes = { ok: true, cookieJarId: jarId, count: cookies.length };
        }
      } else if (tool === "cookieImport") {
        const jarId = String(args.cookieJarId || "").trim();
        const fromJar = jarId ? cookieJars.get(jarId) : null;
        const cookies = Array.isArray(fromJar) ? fromJar : Array.isArray(args.cookies) ? args.cookies : [];
        toolRes = await window.aiBridge.agentCookieImport({
          url: targetUrl,
          title: targetTitle,
          marker,
          cookies
        });
      } else if (tool === "googleSheetsAppendRows") {
        toolRes = await window.aiBridge.agentGoogleSheetsAppendRows({
          spreadsheetId: args.spreadsheetId,
          sheetName: args.sheetName,
          range: args.range,
          values: args.values
        });
      } else if (tool === "googleDocsCreateOrAppend") {
        toolRes = await window.aiBridge.agentGoogleDocsCreateOrAppend({
          documentId: args.documentId,
          title: args.title,
          text: args.text
        });
      } else if (tool === "googleSlidesCreateDeck") {
        toolRes = await window.aiBridge.agentGoogleSlidesCreateDeck({
          title: args.title,
          slides: args.slides
        });
      } else if (tool === "exportFile") {
        toolRes = await window.aiBridge.agentExportFile({
          filename: args.filename,
          format: args.format,
          content: args.content,
          data: args.data
        });
      } else if (tool === "findElements") {
        toolRes = await window.aiBridge.agentFindElements({
          url: targetUrl,
          title: targetTitle,
          marker,
          text: args.text,
          selector: args.selector,
          role: args.role,
          tag: args.tag,
          limit: Number.isFinite(args.limit) ? args.limit : undefined
        });
      } else if (tool === "readElement") {
	        const id = String(args.id || "").trim();
	        if (id && knownElementIds.size && !knownElementIds.has(id)) {
	          toolRes = { ok: false, error: `Invalid element id: ${id} (unknown for this page; run snapshot/findElements again).` };
	        } else {
	          toolRes = await window.aiBridge.agentReadElement({
	            url: targetUrl,
            title: targetTitle,
            marker,
            elementId: id,
            fields: Array.isArray(args.fields) ? args.fields : undefined
          });
        }
	      } else if (tool === "scrollIntoView") {
	        const id = String(args.id || "").trim();
	        if (id && knownElementIds.size && !knownElementIds.has(id)) {
	          toolRes = { ok: false, error: `Invalid element id: ${id} (unknown for this page; run snapshot/findElements again).` };
	        } else {
	          toolRes = await window.aiBridge.agentScrollIntoView({ url: targetUrl, title: targetTitle, marker, elementId: id });
	        }
	      } else if (tool === "screenshot") {
	        const id = String(args.id || "").trim();
	        if (id && knownElementIds.size && !knownElementIds.has(id)) {
	          toolRes = { ok: false, error: `Invalid element id: ${id} (unknown for this page; run snapshot/findElements again).` };
	        } else {
	          toolRes = await window.aiBridge.agentScreenshot({
	            url: targetUrl,
            title: targetTitle,
            marker,
            elementId: id,
            fullPage: args.fullPage === true,
            format: args.format
          });
        }
	      } else if (tool === "uploadFile") {
	        const id = String(args.id || "").trim();
	        if (id && knownElementIds.size && !knownElementIds.has(id)) {
	          toolRes = { ok: false, error: `Invalid element id: ${id} (unknown for this page; run snapshot/findElements again).` };
	        } else {
	          toolRes = await window.aiBridge.agentUploadFile({
	            url: targetUrl,
            title: targetTitle,
            marker,
            elementId: id,
            paths: Array.isArray(args.paths) ? args.paths : []
          });
        }
      } else if (tool === "hotkey") {
        toolRes = await window.aiBridge.agentHotkey({
          url: targetUrl,
          title: targetTitle,
          marker,
          keys: args.keys
        });
      } else if (tool === "waitFor") {
        toolRes = await window.aiBridge.agentWaitFor({
          url: targetUrl,
          title: targetTitle,
          marker,
          selector: args.selector,
          text: args.text,
          urlIncludes: args.urlIncludes,
          timeoutMs: Number.isFinite(args.timeoutMs) ? args.timeoutMs : undefined
        });
      } else if (tool === "clickBySelector") {
        const selector = String(args.selector || "").trim();
        if (!selector) {
          toolRes = { ok: false, error: "Missing selector for tool: clickBySelector." };
        } else {
          const timeoutMs = Number.isFinite(args.timeoutMs) ? args.timeoutMs : undefined;
          const waitRes = await window.aiBridge.agentWaitFor({
            url: targetUrl,
            title: targetTitle,
            marker,
            selector,
            timeoutMs
          });
          if (!waitRes?.ok) {
            toolRes = waitRes;
          } else {
            const element = waitRes?.result?.element && typeof waitRes.result.element === "object" ? waitRes.result.element : null;
            const id = String(element?.id || "").trim();
            if (id) knownElementIds.add(id);
            if (id) {
              try {
                await window.aiBridge.agentScrollIntoView({ url: targetUrl, title: targetTitle, marker, elementId: id });
              } catch {
              }
            }
	            const rect = element?.rect && typeof element.rect === "object" ? element.rect : null;
	            const x = rect && Number.isFinite(rect.x) && Number.isFinite(rect.w) ? rect.x + rect.w / 2 : null;
	            const y = rect && Number.isFinite(rect.y) && Number.isFinite(rect.h) ? rect.y + rect.h / 2 : null;
              if (Number.isFinite(x) && Number.isFinite(y)) {
                await emitAgentUiEvent({ type: "move", x, y });
              }
	            const clickRes = await window.aiBridge.agentClick({
	              url: targetUrl,
	              title: targetTitle,
	              marker,
              elementId: id || undefined,
              x: Number.isFinite(x) && Number.isFinite(y) ? x : undefined,
	              y: Number.isFinite(x) && Number.isFinite(y) ? y : undefined
	            });
	            if (!clickRes?.ok) toolRes = clickRes;
	            else {
                const cr = clickRes?.result && typeof clickRes.result === "object" ? clickRes.result : null;
                const cx = Number(cr?.x);
                const cy = Number(cr?.y);
                if (Number.isFinite(cx) && Number.isFinite(cy)) {
                  await emitAgentUiEvent({ type: "click", x: cx, y: cy, count: Number(cr?.clickCount) || 1 });
                }
                toolRes = { ok: true, selector, clickedId: id, wait: waitRes.result || null, click: clickRes.result || null };
              }
	          }
	        }
	      } else if (tool === "clickByText") {
        const maxAttempts = Number.isFinite(args.limit) ? Math.max(1, Math.min(8, Math.floor(args.limit))) : 3;
        const findRes = await window.aiBridge.agentFindElements({
          url: targetUrl,
          title: targetTitle,
          marker,
          text: args.text,
          selector: args.selector,
          role: args.role,
          tag: args.tag,
          limit: maxAttempts
        });
        if (!findRes?.ok) {
          toolRes = findRes;
        } else {
          const matches = Array.isArray(findRes.matches) ? findRes.matches : [];
          if (!matches.length) {
            toolRes = { ok: false, error: "No matching elements found." };
          } else {
            for (const m of matches) {
              const id = String(m?.id || "").trim();
              if (id) knownElementIds.add(id);
            }
            const attempts = [];
            let clicked = null;
	            for (const m of matches.slice(0, maxAttempts)) {
	              const id = String(m?.id || "").trim();
	              if (!id) continue;
	              try {
	                await window.aiBridge.agentScrollIntoView({ url: targetUrl, title: targetTitle, marker, elementId: id });
	              } catch {
	              }
                try {
                  const rect = m?.rect && typeof m.rect === "object" ? m.rect : null;
                  const x = rect && Number.isFinite(rect.x) && Number.isFinite(rect.w) ? rect.x + rect.w / 2 : null;
                  const y = rect && Number.isFinite(rect.y) && Number.isFinite(rect.h) ? rect.y + rect.h / 2 : null;
                  if (Number.isFinite(x) && Number.isFinite(y)) await emitAgentUiEvent({ type: "move", x, y });
                } catch {
                }
	              const clickRes = await window.aiBridge.agentClick({
	                url: targetUrl,
	                title: targetTitle,
	                marker,
	                elementId: id
	              });
	              if (clickRes?.ok) {
	                const cr = clickRes?.result && typeof clickRes.result === "object" ? clickRes.result : null;
                  const cx = Number(cr?.x);
                  const cy = Number(cr?.y);
                  if (Number.isFinite(cx) && Number.isFinite(cy)) {
                    await emitAgentUiEvent({ type: "click", x: cx, y: cy, count: Number(cr?.clickCount) || 1 });
                  }
	                clicked = { id, match: m, click: clickRes.result || null };
	                break;
	              }
	              attempts.push({ id, error: String(clickRes?.error || "click failed") });
	            }
            toolRes = clicked
              ? { ok: true, clickedId: clicked.id, match: clicked.match || null, click: clicked.click || null, totalMatches: matches.length }
              : { ok: false, error: `Click failed (${attempts.length} attempts).`, attempts, totalMatches: matches.length };
          }
        }
		      } else if (tool === "click") {
		        const id = String(args.id || "").trim();
		        const x = Number.isFinite(args.x) ? args.x : null;
	        const y = Number.isFinite(args.y) ? args.y : null;
		        const hasXY = Number.isFinite(x) && Number.isFinite(y);
		        const count = Number.isFinite(args.count) ? args.count : undefined;
		        if (id && knownElementIds.size && !knownElementIds.has(id)) {
		          toolRes = { ok: false, error: `Invalid element id: ${id} (unknown for this page; run snapshot/findElements again).` };
		        } else {
              const preview = hasXY ? { x, y } : getApproxPointForElementId(id);
              if (preview && Number.isFinite(preview.x) && Number.isFinite(preview.y)) {
                await emitAgentUiEvent({ type: "move", x: preview.x, y: preview.y });
              }
		          toolRes = await window.aiBridge.agentClick({
		            url: targetUrl,
	            title: targetTitle,
	            marker,
	            elementId: id,
		            clickCount: count,
		            x: hasXY ? x : undefined,
		            y: hasXY ? y : undefined
		          });
              const r = toolRes?.result && typeof toolRes.result === "object" ? toolRes.result : null;
              const rx = Number(r?.x);
              const ry = Number(r?.y);
              if (toolRes?.ok && Number.isFinite(rx) && Number.isFinite(ry)) {
                await emitAgentUiEvent({ type: "click", x: rx, y: ry, count: Number(r?.clickCount) || 1 });
              }
	        }
		      } else if (tool === "hover") {
		        const id = String(args.id || "").trim();
		        const x = Number.isFinite(args.x) ? args.x : null;
		        const y = Number.isFinite(args.y) ? args.y : null;
		        const hasXY = Number.isFinite(x) && Number.isFinite(y);
		        if (id && knownElementIds.size && !knownElementIds.has(id)) {
		          toolRes = { ok: false, error: `Invalid element id: ${id} (unknown for this page; run snapshot/findElements again).` };
		        } else {
              const preview = hasXY ? { x, y } : getApproxPointForElementId(id);
              if (preview && Number.isFinite(preview.x) && Number.isFinite(preview.y)) {
                await emitAgentUiEvent({ type: "move", x: preview.x, y: preview.y });
              }
		          toolRes = await window.aiBridge.agentHover({
		            url: targetUrl,
	            title: targetTitle,
	            marker,
	            elementId: id,
		            x: hasXY ? x : undefined,
		            y: hasXY ? y : undefined
		          });
              const r = toolRes?.result && typeof toolRes.result === "object" ? toolRes.result : null;
              const rx = Number(r?.x);
              const ry = Number(r?.y);
              if (toolRes?.ok && Number.isFinite(rx) && Number.isFinite(ry)) {
                await emitAgentUiEvent({ type: "move", x: rx, y: ry });
              }
	        }
      } else if (tool === "scroll") {
        const deltaX = Number.isFinite(args.deltaX) && args.deltaX !== 0 ? args.deltaX : undefined;
        const deltaY = Number.isFinite(args.deltaY) && args.deltaY !== 0 ? args.deltaY : undefined;
        const x = Number.isFinite(args.x) ? args.x : null;
        const y = Number.isFinite(args.y) ? args.y : null;
        const hasXY = Number.isFinite(x) && Number.isFinite(y);
        toolRes = await window.aiBridge.agentScroll({
          url: targetUrl,
          title: targetTitle,
          marker,
          deltaX,
          deltaY,
          x: hasXY ? x : undefined,
          y: hasXY ? y : undefined
        });
        if (toolRes?.ok) {
          const dx = Number.isFinite(args.deltaX) ? args.deltaX : 0;
          const dy = Number.isFinite(args.deltaY) ? args.deltaY : 0;
          await emitAgentUiEvent({ type: "scroll", x: hasXY ? x : undefined, y: hasXY ? y : undefined, deltaX: dx, deltaY: dy });
        }
      } else if (tool === "fillText") {
        const id = String(args.id || "").trim();
        const x = Number.isFinite(args.x) ? args.x : null;
        const y = Number.isFinite(args.y) ? args.y : null;
        const hasXY = Number.isFinite(x) && Number.isFinite(y);
        const count = Number.isFinite(args.count) ? args.count : undefined;
        const enter = typeof args.enter === "boolean" ? args.enter : undefined;
        const retries = Number.isFinite(args.retries) ? args.retries : undefined;
	        if (!String(args.text || "")) {
	          toolRes = { ok: false, error: "Missing text for tool: fillText." };
	        } else if (id && knownElementIds.size && !knownElementIds.has(id)) {
	          toolRes = { ok: false, error: `Invalid element id: ${id} (unknown for this page; run snapshot/findElements again).` };
	        } else {
	          toolRes = await window.aiBridge.agentFillText({
	            url: targetUrl,
            title: targetTitle,
            marker,
            elementId: id,
            x: hasXY ? x : undefined,
            y: hasXY ? y : undefined,
            clickCount: count,
            text: args.text,
            enter,
            retries
          });
        }
	      } else if (tool === "type") {
	        const id = String(args.id || "").trim();
	        if (id && knownElementIds.size && !knownElementIds.has(id)) {
	          toolRes = { ok: false, error: `Invalid element id: ${id} (unknown for this page; run snapshot/findElements again).` };
	        } else {
	          toolRes = await window.aiBridge.agentType({
	            url: targetUrl,
            title: targetTitle,
            marker,
            elementId: id,
            text: args.text
          });
        }
      } else if (tool === "press") {
        toolRes = await window.aiBridge.agentPress({ url: targetUrl, title: targetTitle, marker, key: args.key });
      } else if (tool === "navigate") {
        toolRes = await window.aiBridge.agentNavigate({ url: targetUrl, title: targetTitle, marker, toUrl: args.url });
      } else if (tool === "waitForLoad") {
        toolRes = await window.aiBridge.agentWaitForLoad({
          url: targetUrl,
          title: targetTitle,
          marker,
          state: args.state
        });
      } else {
        toolRes = { ok: false, error: `Unknown tool: ${tool || "(missing)"}` };
      }

		      if (!toolRes?.ok) {
		        stepRecord.result = "error";
		        stepRecord.error = String(toolRes?.error || "Tool failed");
		        agentDebugLog(`tool ${step} failed`, { tool, args, error: toolRes?.error });
	        createAiChatMessage({
	          role: "assistant",
	          meta: `${t("ai.meta.assistant")} · ${t("ai.meta.error")}`,
	          text: String(toolRes?.error || "Tool failed"),
	          parentEl: stepsGroup?.listEl
	        });
	        stepErrors++;
	        updateStepsGroupMeta(steps.length, maxSteps);
		        continue;
		      }
		      stepRecord.result = "ok";
          const output = compactAgentToolOutput(tool, toolRes);
          if (output != null) stepRecord.output = output;

	          if (tool === "findElements" && Array.isArray(toolRes.matches)) {
	            for (const m of toolRes.matches) {
	              const id = String(m?.id || "").trim();
	              if (id) knownElementIds.add(id);
	              const r = m?.rect && typeof m.rect === "object" ? m.rect : null;
	              if (id && r) {
	                const x = Number(r.x);
	                const y = Number(r.y);
	                const w = Number(r.w ?? r.width);
	                const h = Number(r.h ?? r.height);
	                if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(w) && Number.isFinite(h) && w >= 2 && h >= 2) {
	                  knownElementRects.set(id, { x, y, w, h });
	                }
	              }
	            }
	          } else if (tool === "collectLinks" && Array.isArray(toolRes.links)) {
	            for (const l of toolRes.links) {
	              const id = String(l?.id || "").trim();
	              if (id) knownElementIds.add(id);
	              const r = l?.rect && typeof l.rect === "object" ? l.rect : null;
	              if (id && r) {
	                const x = Number(r.x);
	                const y = Number(r.y);
	                const w = Number(r.w ?? r.width);
	                const h = Number(r.h ?? r.height);
	                if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(w) && Number.isFinite(h) && w >= 2 && h >= 2) {
	                  knownElementRects.set(id, { x, y, w, h });
	                }
	              }
	            }
	          } else if (tool === "readElement") {
	            const id = String(toolRes?.element?.id || "").trim();
	            if (id) knownElementIds.add(id);
	            const r = toolRes?.element?.rect && typeof toolRes.element.rect === "object" ? toolRes.element.rect : null;
	            if (id && r) {
	              const x = Number(r.x);
	              const y = Number(r.y);
	              const w = Number(r.w ?? r.width);
	              const h = Number(r.h ?? r.height);
	              if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(w) && Number.isFinite(h) && w >= 2 && h >= 2) {
	                knownElementRects.set(id, { x, y, w, h });
	              }
	            }
	          } else if (tool === "waitFor") {
	            const id = String(toolRes?.result?.element?.id || "").trim();
	            if (id) knownElementIds.add(id);
	            const r = toolRes?.result?.element?.rect && typeof toolRes.result.element.rect === "object" ? toolRes.result.element.rect : null;
	            if (id && r) {
	              const x = Number(r.x);
	              const y = Number(r.y);
	              const w = Number(r.w ?? r.width);
	              const h = Number(r.h ?? r.height);
	              if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(w) && Number.isFinite(h) && w >= 2 && h >= 2) {
	                knownElementRects.set(id, { x, y, w, h });
	              }
	            }
	          }
		      if (seq !== agentRunSeq || !isAgentRunning) {
		        markStopped();
	        return;
	      }

        if (tool !== "downloadsWait") {
	        try {
	          await ensureWebviewHasAgentMarker(null, marker);
	        } catch {
	        }
	        try {
	          await window.aiBridge.agentWaitForLoad({ url: targetUrl, title: targetTitle, marker, state: "networkidle" });
	        } catch {
	        }
        }
	      if (seq !== agentRunSeq || !isAgentRunning) {
	        markStopped();
	        return;
	      }

          const outputSummary = stepRecord.output != null ? stepRecord.output : null;
          const outputText = outputSummary ? `\n\n\`\`\`json\n${JSON.stringify(outputSummary, null, 2)}\n\`\`\`` : "";
          const reasonText = reason ? `\n\n${reason}` : "";
			      createAiChatMessage({
			        role: "assistant",
			        meta,
			        markdown: `**${tool}**\n\n\`\`\`json\n${JSON.stringify(args || {}, null, 2)}\n\`\`\`${outputText}${reasonText}`.trim(),
			        parentEl: stepsGroup?.listEl
			      });
			      updateStepsGroupMeta(steps.length, maxSteps);
			    }

	    throw new Error("Agent reached max steps without finishing.");
		  } catch (err) {
		    if (seq !== agentRunSeq) {
		      markStopped();
		      return;
		    }
		    const message = String(err?.message || err);
		    const errorMeta = `${t("ai.meta.assistant")} · ${t("ai.meta.error")}`;
			    if (assistantMsg?.root?.isConnected) {
			      assistantMsg.metaEl.textContent = errorMeta;
			      assistantMsg.contentEl.className = "aiMsgText";
			      assistantMsg.contentEl.textContent = message;
			      try {
			        assistantMsg.root.dataset.copyText = message;
			      } catch {
			      }
			      try {
			        assistantMsg.root.removeAttribute("aria-busy");
			      } catch {
			      }
			      try {
			        aiChatMessages.appendChild(assistantMsg.root);
			      } catch {
			      }
			    }
		    finalizeStepsGroup();
		    if (conv && Array.isArray(conv.messages)) {
		      const ts = Date.now();
		      conv.messages.push({ role: "assistant", meta: errorMeta, content: message, ts, skipContext: true });
		      conv.updatedAt = ts;
		      persistAiChatStore();
		    }
		    if (
		      !assistantMsg?.root?.isConnected &&
		      tabId &&
		      tabId === activeTabId &&
		      getActiveTab()?.aiConversationId === conversationId
		    ) {
		      renderAiConversationMessages(conv?.messages || []);
		    }
	    window.aiBridge.showError(message);
		  } finally {
        try {
          if (marker) {
            const ids = Array.from(agentUiTouchedTabIds);
            if (!ids.length) {
              await applyWebviewAgentControlUi(null, { marker, enabled: false });
            } else {
              for (const id of ids) {
                const tab = getTab(id);
                const wv = tab?.webview;
                if (!wv) continue;
                await applyWebviewAgentControlUi(wv, { marker, enabled: false });
              }
            }
          }
        } catch {
        }
		    if (activeAgentRun?.seq === seq) activeAgentRun = null;
		    if (seq === agentRunSeq) setAgentRunning(false);
		    if (seq === agentRunSeq) setChatSending(false);
		    scrollAiChatToBottom({ behavior: "smooth" });
		  }
		}

async function dispatchAiRequest({ displayText, buildUserMessage }) {
  if (isBrowserAgentMode()) return runBrowserAgentRequest({ displayText, buildUserMessage });
  return sendAiChatMessage({ displayText, buildUserMessage });
}

function sendChatFromInput() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";
  dispatchAiRequest({
    displayText: text,
    buildUserMessage: (ctx) => {
      const context = buildAiContextBlock(ctx);
      const ai = context ? `${text}\n\n${context}` : text;
      return { history: text, ai };
    }
  });
}

chatSendBtn.addEventListener("click", () => {
  if (isSendingChat || isAgentRunning) {
    stopAiFlow();
    return;
  }
  sendChatFromInput();
});
chatMicBtn?.addEventListener("click", async () => {
  if (isVoiceRecording || isVoiceTranscribing) {
    stopVoiceRecording();
    return;
  }
  await startVoiceRecording();
});

chatInput.addEventListener("compositionstart", () => {
  isChatInputComposing = true;
});
chatInput.addEventListener("compositionend", () => {
  isChatInputComposing = false;
});
chatInput.addEventListener("blur", () => {
  isChatInputComposing = false;
});

chatInput.addEventListener("keydown", (e) => {
  if (isChatInputComposing || e.isComposing || e.keyCode === 229) return;
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendChatFromInput();
  }
});

promptShortcuts?.addEventListener("click", (e) => {
  const btn = e.target?.closest?.(".promptShortcutBtn");
  if (!btn) return;
  const id = btn.dataset.promptId;
  if (!id) return;
  const p = prompts.find((x) => x.id === id);
  if (!p) return;
  const name = p.name || p.id;
  dispatchAiRequest({
    displayText: name,
    buildUserMessage: (ctx) => ({
      history: buildPromptInstructionFromPrompt(p, ctx),
      ai: buildPromptMessageFromPrompt(p, ctx)
    })
  });
});

aiChatMessages.addEventListener("click", (e) => {
  const a = e.target?.closest?.("a");
  if (!a) return;
  const href = a.getAttribute("href");
  if (!href) return;
  e.preventDefault();

  if (/^https?:\/\//i.test(href)) {
    createTab(href, { makeActive: true });
    return;
  }

  window.aiBridge.openExternal(href);
});

newTabBtn.addEventListener("click", () => createTab(homeUrl || DEFAULT_HOME_URL, { makeActive: true }));

tabsScrollLeftBtn.addEventListener("click", () => {
  tabStrip.scrollBy({ left: -240, behavior: "smooth" });
});

tabsScrollRightBtn.addEventListener("click", () => {
  tabStrip.scrollBy({ left: 240, behavior: "smooth" });
});

tabStrip.addEventListener("scroll", updateTabScrollButtons);

tabStrip.addEventListener(
  "wheel",
  (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      tabStrip.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  },
  { passive: false }
);

window.addEventListener("resize", updateTabScrollButtons);
window.addEventListener("resize", () => applyAiPanelWidth(aiPanelWidthPx));


document.addEventListener("pointerdown", (e) => {
  const addressBar = document.getElementById("addressBar");
  if (!addressBar?.contains(e.target)) hideSuggestions();
});

function loadLastSessionTabs() {
  try {
    const raw = localStorage.getItem(LAST_SESSION_TABS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => typeof x === "string")
      .map((x) => x.trim())
      .filter((x) => /^https?:\/\//i.test(x))
      .slice(0, 12);
  } catch {
    return [];
  }
}

function persistLastSessionTabs() {
  try {
    const urls = tabs
      .map((t) => safeCall(() => t.webview.getURL(), t.url))
      .map((x) => String(x || "").trim())
      .filter((x) => /^https?:\/\//i.test(x))
      .slice(0, 12);
    localStorage.setItem(LAST_SESSION_TABS_KEY, JSON.stringify(urls));
  } catch {
    // ignore
  }
}

function openStartupTabs() {
  const urls = [];
  if (startupMode === "urls" && Array.isArray(startupUrls) && startupUrls.length) {
    urls.push(...startupUrls);
  } else if (startupMode === "continue") {
    urls.push(...loadLastSessionTabs());
  }
  if (!urls.length) urls.push(homeUrl || DEFAULT_HOME_URL);

  let first = true;
  for (const url of urls) {
    createTab(url, { makeActive: first });
    first = false;
  }
}

window.aiBridge.onMenuCommand((msg) => {
  const command = msg?.command;
  if (!command) return;

  if (command === "openUrlInNewTab") {
    const raw = String(msg?.payload?.url || "").trim();
    const url = getNavigationUrl(raw);
    if (!url) return;
    createTab(url, { makeActive: true });
    return;
  }

  if (command === "zoomReset") {
    setPageZoomFactor(1);
    return;
  }
  if (command === "zoomIn") {
    setPageZoomFactor(pageZoomFactor + PAGE_ZOOM_STEP);
    return;
  }
  if (command === "zoomOut") {
    setPageZoomFactor(pageZoomFactor - PAGE_ZOOM_STEP);
    return;
  }

  if (command === "newTab") {
    createTab(homeUrl || DEFAULT_HOME_URL, { makeActive: true });
    return;
  }
  if (command === "closeTab") {
    if (activeTabId) closeTab(activeTabId);
    return;
  }
  if (command === "focusAddressBar") {
    urlInput.focus();
    urlInput.select();
    return;
  }
  if (command === "openSettings") {
    setAppSettingsModalOpen(true);
    return;
  }
  if (command === "toggleAiAssistant") {
    const tab = getActiveTab();
    setAiPanelOpen(!tab?.aiPanelOpen, { focus: true });
    return;
  }
  if (command === "openHistory") {
    setHistoryModalOpen(true);
    return;
  }
  if (command === "clearHistory") {
    if (!confirm(t("appSettings.privacy.clearHistoryConfirm"))) return;
    clearHistory();
    return;
  }

  const webview = getActiveWebview();
  if (!webview) return;

  if (command === "print") {
    safeCall(
      () =>
        webview.print({ printBackground: true }, (success, failureReason) => {
          if (!success) window.aiBridge.showError(failureReason || t("error.printFailed"));
        }),
      null
    );
    return;
  }

  if (command === "goBack") {
    if (safeCall(() => webview.canGoBack(), false)) webview.goBack();
    return;
  }
  if (command === "goForward") {
    if (safeCall(() => webview.canGoForward(), false)) webview.goForward();
    return;
  }
  if (command === "reload") {
    webview.reload();
    return;
  }
	  if (command === "forceReload") {
	    safeCall(() => webview.reloadIgnoringCache(), null);
	    return;
	  }
	  if (command === "findInPage") {
	    openFindBar({ prefillSelection: true });
	    return;
	  }
	});

async function initAiAssistantOptions() {
  const saved = loadAiAssistantOptionsFromStorage() || {};

  isSyncingAiAssistantOptions = true;
  try {
    const provider = saved.provider;
    if (provider === "local" || provider === "gemini" || provider === "openai") {
      providerSelect.value = provider;
    }

    const mode = saved.mode;
    if (aiModeSelect && (mode === "chat" || mode === "browser")) {
      aiModeSelect.value = mode;
    }
    if (agentConfirmCheckbox && typeof saved.agentConfirm === "boolean") {
      agentConfirmCheckbox.checked = saved.agentConfirm;
    }
    if (agentMaxStepsInput) {
      if (Number.isFinite(Number(saved.agentMaxSteps))) {
        agentMaxStepsInput.value = String(clampAgentMaxSteps(saved.agentMaxSteps));
      } else {
        agentMaxStepsInput.value = String(clampAgentMaxSteps(agentMaxStepsInput.value));
      }
    }

    const contextMode = saved.contextMode;
    if (contextMode === "auto" || contextMode === "selection" || contextMode === "page") {
      contextModeSelect.value = contextMode;
    }

    if (typeof saved.pullModelInput === "string" && saved.pullModelInput.trim()) {
      pullModelInput.value = saved.pullModelInput.trim();
    }

    if (Number.isFinite(Number(saved.panelWidthPx))) {
      applyAiPanelWidth(Number(saved.panelWidthPx));
    }

	    if (Number.isFinite(Number(saved.fontSizeLevel))) {
	      applyAiFontSizeLevel(Number(saved.fontSizeLevel));
	    } else {
	      applyAiFontSizeLevel(aiFontSizeLevel);
	    }

	    const desiredVoiceModel = typeof saved.voiceModel === "string" ? saved.voiceModel.trim() : "";
	    const fallbackVoiceModel = DEFAULT_VOICE_MODEL;
	    if (voiceModelSelect) {
	      if (desiredVoiceModel && Array.from(voiceModelSelect.options).some((o) => o.value === desiredVoiceModel)) {
	        voiceModelSelect.value = desiredVoiceModel;
	      } else if (Array.from(voiceModelSelect.options).some((o) => o.value === fallbackVoiceModel)) {
	        voiceModelSelect.value = fallbackVoiceModel;
	      }
	    }

	    setProviderUI(providerSelect.value);

	    await loadPrompts(saved.promptId);
	    await refreshLocalModels();

    const desiredLocalModel = typeof saved.localModel === "string" ? saved.localModel.trim() : "";
    if (
      desiredLocalModel &&
      Array.from(localModelSelect.options).some((o) => o.value === desiredLocalModel)
    ) {
      localModelSelect.value = desiredLocalModel;
    }

    await loadAiSettings();

    const desiredGeminiModel = typeof saved.geminiModel === "string" ? saved.geminiModel.trim() : "";
    if (
      desiredGeminiModel &&
      Array.from(geminiModelSelect.options).some((o) => o.value === desiredGeminiModel) &&
      geminiModelSelect.value !== desiredGeminiModel
    ) {
      geminiModelSelect.value = desiredGeminiModel;
      const res = await window.aiBridge.setGeminiModel(desiredGeminiModel);
      if (!res.ok) {
        window.aiBridge.showError(res.error);
        await loadAiSettings();
      }
    }
  } finally {
    isSyncingAiAssistantOptions = false;
    persistAiAssistantOptions();
  }
}

async function initApp() {
  await loadAppSettings();
  const initial = String(launchInitialUrl || "").trim();
  const initialNav = initial ? getNavigationUrl(initial) : null;
  if (initialNav) {
    createTab(initialNav, { makeActive: true });
    try {
      history.replaceState(null, "", window.location.pathname);
    } catch {
    }
    launchInitialUrl = "";
  } else {
    openStartupTabs();
  }
  persistLastSessionTabs();
  syncClearButton();
  updateTabScrollButtons();
  updateNavButtons();
  updateLoadingUI();
  syncStatusBar();
  await initDownloads();

  await initAiAssistantOptions();
  const storedChat = loadAiChatStoreFromStorage();
  aiChatConversations = storedChat?.conversations || [];
  aiActiveConversationId = storedChat?.activeConversationId || null;
  syncAiConversationForActiveTab();
  persistAiChatStore();

  if (!hasShownChromeImportModal) {
    setChromeImportModalOpen(true);
  }
}

initApp();
