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

  const query = String(findInput.value || "").trim();
  tab.findQuery = query;

  if (!query) {
    safeCall(() => webview.stopFindInPage("clearSelection"), null);
    resetFindInPageState(tab, { clearQuery: true });
    if (tab.id === activeTabId) updateFindMatchCountUi(tab);
    return;
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
	    if (tab.findRequestId && requestId !== tab.findRequestId) return;
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
  const disabled = isSendingChat || !prompts.length;
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

function isValidGeminiApiKey(apiKey) {
  const key = String(apiKey || "").trim();
  if (!key) return false;
  if (key.length < 20) return false;
  if (!/^[0-9A-Za-z\\-_]+$/.test(key)) return false;
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
  const key = geminiApiKeyInput.value.trim();
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
  const key = geminiApiKeyInput.value.trim();
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
  chatSendBtn.disabled = isSendingChat;
  chatInput.disabled = isSendingChat;
  syncPromptShortcutsDisabledState();
  chatSendBtn.textContent = isSendingChat ? t("ai.chat.sending") : t("ai.chat.send");
  syncChatMicButtonState();
  syncAiStopButtonState();
}

function setAgentRunning(running) {
  isAgentRunning = Boolean(running);
  syncAiStopButtonState();
}

function syncAiStopButtonState() {
  if (!aiAgentStopBtn) return;
  const visible = isSendingChat || isAgentRunning;
  aiAgentStopBtn.classList.toggle("hidden", !visible);
  aiAgentStopBtn.disabled = !visible;
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
  const disabled = isSendingChat && !isVoiceRecording && !isVoiceTranscribing;
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
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
  }

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced && fenced[1]) {
    try {
      const parsed = JSON.parse(fenced[1]);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
    }
  }

  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first >= 0 && last > first) {
    const slice = raw.slice(first, last + 1);
    try {
      const parsed = JSON.parse(slice);
      return parsed && typeof parsed === "object" ? parsed : null;
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
  if (["click", "tap"].includes(compact)) return "click";
  if (["type", "fill", "input", "setvalue"].includes(compact)) return "type";
  if (["press", "keypress", "key"].includes(compact)) return "press";
  if (["navigate", "goto", "open", "visit"].includes(compact)) return "navigate";
  if (["wait", "waitforload", "waitfornavigation", "waituntil"].includes(compact)) return "waitForLoad";
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

  if (hasAny(["url", "toUrl", "href"])) return "navigate";
  if (hasAny(["state", "waitUntil", "wait_until"])) return "waitForLoad";
  if (hasAny(["key", "keys"])) return "press";

  const hasId = hasAny(["id", "elementId", "element_id", "selectorId"]);
  const hasText = hasAny(["text", "value"]);
  if (hasId && hasText) return "type";

  const raw = String(rawText || "");
  if (hasId) {
    if (/(type|fill|input|enter|paste|輸入|填入)/i.test(raw)) return "type";
    if (/(click|tap|點擊|點選|按一下|選擇)/i.test(raw)) return "click";
    return "click";
  }

  if (keyCount === 0) return "snapshot";

  if (/(navigate|goto|go to|open|visit|前往|打開|開啟|進入)/i.test(raw)) return "navigate";
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

  if (tool === "click" || tool === "type") {
    if (out.id == null && out.elementId != null) out.id = out.elementId;
    if (out.id == null && out.element_id != null) out.id = out.element_id;
    if (out.id == null && out.selectorId != null) out.id = out.selectorId;
    out.id = String(out.id ?? "").trim();
  }

  if (tool === "type") {
    if (out.text == null && out.value != null) out.text = out.value;
    out.text = String(out.text ?? "");
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

  if (tool === "waitForLoad") {
    if (out.state == null && out.waitUntil != null) out.state = out.waitUntil;
    if (out.state == null && out.wait_until != null) out.state = out.wait_until;
    out.state = String(out.state ?? "").trim();
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
        `Expected one of: snapshot, click, type, press, navigate, waitForLoad.\n\n` +
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
  if (tool === "click" || tool === "type") {
    if (!normalizedArgs.id) {
      return { ok: false, error: `Missing element id for tool: ${tool}.` };
    }
  }
  if (tool === "press") {
    if (!normalizedArgs.key) {
      return { ok: false, error: "Missing key for tool: press." };
    }
  }
  if (tool === "navigate") {
    if (!normalizedArgs.url) {
      return { ok: false, error: "Missing url for tool: navigate." };
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
    `For the final answer, respond in ${lang}.`
  ].join("\n");
}

function buildBrowserAgentUserPrompt({ task, snapshot, steps, maxSteps }) {
  const safeTask = String(task || "").trim();
  const snap = snapshot && typeof snapshot === "object" ? snapshot : {};
  const elements = Array.isArray(snap.elements) ? snap.elements : [];
  const compactElements = elements.slice(0, 80).map((e) => ({
    id: String(e?.id || ""),
    tag: String(e?.tag || ""),
    role: String(e?.role || ""),
    text: String(e?.text || ""),
    ariaLabel: String(e?.ariaLabel || ""),
    placeholder: String(e?.placeholder || ""),
    name: String(e?.name || ""),
    type: String(e?.type || ""),
    href: String(e?.href || "")
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
        visibleText: String(snap.visibleText || ""),
        elements: compactElements
      },
      null,
      2
    ),
    "",
    "PREVIOUS_STEPS (JSON):",
    JSON.stringify(history, null, 2),
    "",
    "TOOLS:",
    '- snapshot: {}',
    '- click: {"id":"<elementId>"}',
    '- type: {"id":"<elementId>","text":"..."}',
    '- press: {"key":"Enter|Tab|Escape|Backspace|Delete|PageUp|PageDown|Home|End|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Space"}',
    '- navigate: {"url":"https://..."}',
    '- waitForLoad: {"state":"domcontentloaded|load|networkidle"}',
    "",
    "RESPONSE_SCHEMA (choose one):",
    '{"type":"tool","tool":"snapshot","args":{},"reason":"..."}',
    '{"type":"tool","tool":"click","args":{"id":"12"},"reason":"..."}',
    '{"type":"tool","tool":"type","args":{"id":"5","text":"hello"},"reason":"..."}',
    '{"type":"tool","tool":"press","args":{"key":"Enter"},"reason":"..."}',
    '{"type":"tool","tool":"navigate","args":{"url":"https://example.com"},"reason":"..."}',
    '{"type":"tool","tool":"waitForLoad","args":{"state":"networkidle"},"reason":"..."}',
    '{"type":"final","final":"..."}',
    "",
    `RULES:\n- Output valid JSON only (a single object).\n- For tool steps, always output {"type":"tool","tool":"...","args":{...},"reason":"..."} (do NOT output only args like {"id":"23"}).\n- tool must be one of: snapshot | click | type | press | navigate | waitForLoad.\n- Use at most ${maxSteps} tool steps.\n- Prefer snapshot before interacting.\n- Use elementId from snapshot.\n- Avoid destructive actions unless clearly required by TASK.`
  ].join("\n");
}

async function ensureWebviewHasAgentMarker(webview, marker) {
  const wv = webview || getActiveWebview();
  if (!wv) throw new Error(t("error.noActiveTab"));
  const m = String(marker || "").trim();
  if (!m) return;
  try {
    await wv.executeJavaScript(`window.__stingAgentMarker = ${JSON.stringify(m)}; true;`);
  } catch {
  }
}

async function runBrowserAgentRequest({ displayText, buildUserMessage }) {
  const shown = String(displayText ?? "").trim();
  if (!shown) return;
  if (isSendingChat) return;

  const seq = ++agentRunSeq;
  setAgentRunning(true);

  const tab = getActiveTab();
  const tabId = tab?.id || null;
  const webview = tab?.webview || null;

  const userMsg = createAiChatMessage({ role: "user", meta: t("ai.meta.user"), text: shown });
  const assistantMsg = createAiChatMessage({
    role: "assistant",
    meta: t("ai.meta.assistant"),
    text: t("ai.chat.sending")
  });
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

    const ctx = await buildAiPageContext(webview);
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

		    const marker = `agent_${Date.now()}_${Math.random().toString(16).slice(2)}`;
	    const steps = [];
	    const maxSteps = clampAgentMaxSteps(agentMaxStepsInput?.value);
	    let targetUrl = String(ctx.pageUrl || "").trim();
	    let targetTitle = String(ctx.pageTitle || "").trim();

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

		      await ensureWebviewHasAgentMarker(webview, marker);
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
      const snapshotElementIds = new Set(
        (Array.isArray(snapshot.elements) ? snapshot.elements : [])
          .map((e) => String(e?.id || "").trim())
          .filter(Boolean)
      );

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

      const rawActionText = String(aiRes.text ?? "");
	      const parsed = parseJsonObjectFromText(rawActionText);
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
	      const normalized = normalizeBrowserAgentAction(parsed, rawActionText);
	      if (!normalized.ok) {
	        const error = String(normalized.error || "Agent returned invalid action");
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
	      if (tool === "click") {
        const id = String(args.id || "").trim();
        if (id && snapshotElementIds.size && !snapshotElementIds.has(id)) {
          toolRes = { ok: false, error: `Invalid element id: ${id} (not in current snapshot).` };
        } else {
          toolRes = await window.aiBridge.agentClick({ url: targetUrl, title: targetTitle, marker, elementId: id });
        }
      } else if (tool === "type") {
        const id = String(args.id || "").trim();
        if (id && snapshotElementIds.size && !snapshotElementIds.has(id)) {
          toolRes = { ok: false, error: `Invalid element id: ${id} (not in current snapshot).` };
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
	      if (seq !== agentRunSeq || !isAgentRunning) {
	        markStopped();
        return;
      }

      try {
        await window.aiBridge.agentWaitForLoad({ url: targetUrl, title: targetTitle, marker, state: "networkidle" });
      } catch {
      }
      if (seq !== agentRunSeq || !isAgentRunning) {
        markStopped();
        return;
      }

		      createAiChatMessage({
		        role: "assistant",
		        meta,
		        markdown: `**${tool}**\n\n\`\`\`json\n${JSON.stringify(args || {}, null, 2)}\n\`\`\`\n\n${reason || ""}`.trim(),
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

chatSendBtn.addEventListener("click", sendChatFromInput);
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
