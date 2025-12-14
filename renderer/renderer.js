const DEFAULT_HOME_URL = "https://www.google.com";
const DEFAULT_SEARCH_TEMPLATE = "https://www.google.com/search?q={query}";
const DEFAULT_FAVICON = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <rect width="16" height="16" rx="4" fill="#e8eaed"/>
    <path d="M8 3.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Zm0 1.2c.75 0 1.46.21 2.06.58-.44.25-.9.44-1.38.56A5.4 5.4 0 0 0 8 4.4Zm-2.9.84c.57-.51 1.28-.84 2.06-.94-.33.32-.62.7-.85 1.12-.43.07-.84.22-1.21.42Zm-.64 1.32c.43-.28.91-.46 1.42-.54-.1.3-.18.62-.23.95H4.32c.02-.14.07-.27.14-.41Zm0 2.84a4.04 4.04 0 0 1-.14-.41h1.33c.05.33.13.65.23.95-.51-.08-.99-.26-1.42-.54Zm.64 1.32c.37.2.78.35 1.21.42.23.42.52.8.85 1.12-.78-.1-1.49-.43-2.06-.94Zm5.8-.84c-.57.51-1.28.84-2.06.94.33-.32.62-.7.85-1.12.43-.07.84-.22 1.21-.42Zm.64-1.32c-.43.28-.91.46-1.42.54.1-.3.18-.62.23-.95h1.33c-.02.14-.07.27-.14.41Zm0-2.84c.07.14.12.27.14.41h-1.33c-.05-.33-.13-.65-.23-.95.51.08.99.26 1.42.54Zm-.64-1.32c-.37-.2-.78-.35-1.21-.42-.23-.42-.52-.8-.85-1.12.78.1 1.49.43 2.06.94Z" fill="#9aa0a6"/>
  </svg>`
)}`;

const tabStrip = document.getElementById("tabStrip");
const newTabBtn = document.getElementById("newTabBtn");
const tabsScrollLeftBtn = document.getElementById("tabsScrollLeftBtn");
const tabsScrollRightBtn = document.getElementById("tabsScrollRightBtn");
const webviewArea = document.getElementById("webviewArea");

const urlInput = document.getElementById("urlInput");
const clearUrlBtn = document.getElementById("clearUrlBtn");
const suggestionsEl = document.getElementById("suggestions");
const addressStatusIcon = document.getElementById("addressStatusIcon");
const backBtn = document.getElementById("backBtn");
const forwardBtn = document.getElementById("forwardBtn");
const reloadBtn = document.getElementById("reloadBtn");
const homeBtn = document.getElementById("homeBtn");
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
const chatSendBtn = document.getElementById("chatSendBtn");
const aiSettingsModal = document.getElementById("aiSettingsModal");
const aiSettingsCloseBtn = document.getElementById("aiSettingsCloseBtn");
const appSettingsModal = document.getElementById("appSettingsModal");
const appSettingsCloseBtn = document.getElementById("appSettingsCloseBtn");
const themeSelect = document.getElementById("themeSelect");
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

const contextModeSelect = document.getElementById("contextModeSelect");
contextModeSelect.addEventListener("change", () => persistAiAssistantOptions());
const providerSelect = document.getElementById("providerSelect");
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

const aiFontSizeSelect = document.getElementById("aiFontSizeSelect");

const promptSelect = document.getElementById("promptSelect");
const promptNameInput = document.getElementById("promptNameInput");
const promptIdInput = document.getElementById("promptIdInput");
const addPromptBtn = document.getElementById("addPromptBtn");
const savePromptBtn = document.getElementById("savePromptBtn");
const deletePromptBtn = document.getElementById("deletePromptBtn");
const resetPromptsBtn = document.getElementById("resetPromptsBtn");
const customPromptInput = document.getElementById("customPromptInput");

const DEFAULT_LOCAL_MODEL = "MaziyarPanahi/calme-3.2-instruct-78b";
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
let isSyncingAiAssistantOptions = false;

let homeUrl = DEFAULT_HOME_URL;
let searchEngineTemplate = DEFAULT_SEARCH_TEMPLATE;
let startupMode = "home";
let startupUrls = [];
let themeMode = "light";
let hasShownChromeImportModal = false;
let pageZoomFactor = loadPageZoomFactor();

let tabs = [];
let activeTabId = null;

const DEFAULT_PROMPTS = [
  {
    id: "summary",
    name: "摘要本頁文件",
    template: "請用繁體中文摘要以下網頁內容，抓出重點、關鍵數據與結論：\n\n{{content}}"
  },
  {
    id: "painpoints_ideas",
    name: "抓出痛點/需求與商業 idea",
    template:
      "請分析以下網頁內容，列出使用者痛點與需求，並提出 3-5 個可發展成商業 idea 的建議（含目標客群/價值主張/可行性）：\n\n{{content}}"
  }
];

const HISTORY_KEY = "sting.history.v1";
const HISTORY_LIMIT = 500;
let historyItems = loadHistory();

let currentSuggestions = [];
let activeSuggestionIndex = -1;

let prompts = [];

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
    window.aiBridge.showError(err?.message || "Failed to save AI conversation history");
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

function ensureActiveAiConversation() {
  let active = getActiveAiConversationRecord();
  if (!active) {
    active = createAiConversationRecord();
    aiChatConversations.unshift(active);
    aiActiveConversationId = active.id;
  }
  aiConversation = active.messages;
  pruneAiChatConversations();
}

function renderAiConversationMessages(messages) {
  aiChatMessages.innerHTML = "";
  for (const msg of Array.isArray(messages) ? messages : []) {
    if (!msg || typeof msg !== "object") continue;
    if (msg.role === "assistant") {
      createAiChatMessage({ role: "assistant", meta: msg.meta || "AI", markdown: msg.content });
      continue;
    }
    if (msg.role === "user") {
      createAiChatMessage({ role: "user", meta: msg.meta || "你", text: msg.content });
    }
  }
  scrollAiChatToBottom({ behavior: "auto" });
}

function setActiveAiConversation(id) {
  const conv = getAiConversationRecord(id);
  if (!conv) return;
  aiActiveConversationId = conv.id;
  aiConversation = conv.messages;
  persistAiChatStore();
  renderAiConversationMessages(aiConversation);
  if (isAiHistoryOpen) renderAiConversationHistoryList();
}

function startNewAiConversation() {
  const conv = createAiConversationRecord();
  aiChatConversations.unshift(conv);
  aiActiveConversationId = conv.id;
  aiConversation = conv.messages;
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
  return "New conversation";
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
    empty.textContent = "尚無對話紀錄。";
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
    countEl.textContent = `${conv.messages.length} 則`;

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
    provider: providerSelect.value === "gemini" ? "gemini" : "local",
    localModel: String(localModelSelect.value || ""),
    geminiModel: String(geminiModelSelect.value || ""),
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

function createAiChatMessage({ role, meta, text, markdown }) {
  const root = document.createElement("div");
  root.className = `aiMsg ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "aiMsgBubble";

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

  bubble.appendChild(metaEl);
  bubble.appendChild(contentEl);
  root.appendChild(bubble);
  aiChatMessages.appendChild(root);
  scrollAiChatToBottom();

  return { root, bubble, metaEl, contentEl };
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
    empty.textContent = q ? "找不到符合的歷史紀錄。" : "尚無瀏覽歷史紀錄。";
    historyList.appendChild(empty);
    return;
  }

  for (const item of items) {
    const el = document.createElement("div");
    el.className = "historyItem";
    el.dataset.url = item.url;

    const titleEl = document.createElement("div");
    titleEl.className = "historyItemTitle";
    titleEl.textContent = item.title || item.url;

    const urlEl = document.createElement("div");
    urlEl.className = "historyItemUrl";
    urlEl.textContent = item.url;

    const timeEl = document.createElement("div");
    timeEl.className = "historyItemTime";
    timeEl.textContent = formatHistoryTime(item.lastVisited);

    el.appendChild(titleEl);
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
  if (active.isLoading) parts.push("Loading…");
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
    reloadBtn.title = "Stop";
    reloadBtn.setAttribute("aria-label", "Stop");
  } else {
    reloadBtn.textContent = "⟳";
    reloadBtn.title = "Reload";
    reloadBtn.setAttribute("aria-label", "Reload");
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

function syncAiContext() {
  const active = getActiveTab();
  if (!active) {
    aiContextTitle.textContent = "";
    aiContextUrl.textContent = "";
    return;
  }
  aiContextTitle.textContent = active.title || "Untitled";
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
  titleEl.textContent = tab.title || "New Tab";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "tabClose";
  closeBtn.title = "Close tab";
  closeBtn.setAttribute("aria-label", "Close tab");
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

  tab.titleEl.textContent = tab.title || "New Tab";
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
    updateTabElement(tab.id);
    if (tab.id === activeTabId) {
      updateLoadingUI();
      syncStatusBar();
      updateNavButtons();
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

  webview.addEventListener("update-target-url", (e) => {
    tab.hoverUrl = e.url || "";
    if (tab.id === activeTabId) syncStatusBar();
  });

  webview.addEventListener("new-window", (e) => {
    if (!e?.url) return;
    createTab(e.url, { makeActive: true });
  });

  webview.addEventListener("did-fail-load", (_e) => {
    if (tab.id !== activeTabId) return;
    syncStatusBar();
  });
}

function createTab(initialUrl = homeUrl || DEFAULT_HOME_URL, { makeActive = true } = {}) {
  const id = `tab_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const webview = document.createElement("webview");
  webview.className = "tabWebview hiddenWebview";
  webview.setAttribute("allowpopups", "");
  webview.src = initialUrl;
  webviewArea.appendChild(webview);

  const tab = {
    id,
    url: initialUrl,
    title: "New Tab",
    favicon: null,
    isLoading: false,
    hoverUrl: "",
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

  for (const t of tabs) {
    t.webview.classList.toggle("hiddenWebview", t.id !== tabId);
    updateTabElement(t.id);
  }

  tab.webview.classList.remove("hiddenWebview");

  if (document.activeElement !== urlInput) {
    urlInput.value = tab.url || safeCall(() => tab.webview.getURL(), "") || "";
    syncClearButton();
  }

  updateNavButtons();
  updateLoadingUI();
  syncStatusBar();
  syncAiContext();

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
  if (/^(about|file|chrome):/i.test(text)) return text;
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
  return prompts.find((p) => p.id === promptSelect.value);
}

function syncPromptFields() {
  const p = getSelectedPrompt();
  if (!p) {
    promptNameInput.value = "";
    promptIdInput.value = "";
    customPromptInput.value = "";
    return;
  }
  promptNameInput.value = p.name ?? "";
  promptIdInput.value = p.id ?? "";
  customPromptInput.value = p.template ?? "";
}

function renderPromptShortcuts() {
  if (!promptShortcuts) return;
  promptShortcuts.innerHTML = "";

  for (const p of prompts) {
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

function getDefaultPrompts() {
  return DEFAULT_PROMPTS.map((p) => ({ ...p }));
}

function sanitizePromptItem(prompt) {
  if (!prompt || typeof prompt !== "object") return null;
  const id = String(prompt.id || "").trim();
  if (!id) return null;
  const name = typeof prompt.name === "string" && prompt.name.trim() ? prompt.name.trim() : id;
  const template = typeof prompt.template === "string" ? prompt.template : "";
  return { id, name, template };
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
    const list = Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object" ? parsed.prompts : null;
    if (!Array.isArray(list)) return null;
    return sanitizePromptsList(list);
  }, null);
}

function persistPromptsToStorage(list) {
  const clean = sanitizePromptsList(list);
  try {
    localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify({ version: 1, prompts: clean }));
    return true;
  } catch (err) {
    window.aiBridge.showError(err?.message || "Failed to save prompts");
    return false;
  }
}

async function persistPrompts() {
  persistPromptsToStorage(prompts);
}

async function loadPrompts(preferredId) {
  const stored = loadPromptsFromStorage();
  if (stored) {
    prompts = stored;
  } else {
    let seeded = null;
    try {
      const res = await window.aiBridge.listPrompts();
      if (res?.ok && Array.isArray(res.prompts)) seeded = res.prompts;
    } catch {
    }
    prompts = sanitizePromptsList(seeded && seeded.length ? seeded : getDefaultPrompts());
    persistPromptsToStorage(prompts);
  }

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

addPromptBtn.addEventListener("click", async () => {
  const name = window.prompt("新 Prompt 名稱", "新 Prompt");
  if (!name) return;
  const id = `custom_${Date.now()}`;
  const templateSeed =
    customPromptInput.value.trim() || "請輸入你的 prompt 模板：\n\n{{content}}";
  prompts.push({ id, name: name.trim(), template: templateSeed });
  await persistPrompts();
  renderPromptSelect(id);
  persistAiAssistantOptions();
});

savePromptBtn.addEventListener("click", async () => {
  const id = promptSelect.value;
  const idx = prompts.findIndex((p) => p.id === id);
  if (idx === -1) return;
  prompts[idx] = {
    ...prompts[idx],
    name: promptNameInput.value.trim() || prompts[idx].name,
    template: customPromptInput.value.trim()
  };
  await persistPrompts();
  renderPromptSelect(id);
  persistAiAssistantOptions();
});

deletePromptBtn.addEventListener("click", async () => {
  const p = getSelectedPrompt();
  if (!p) return;
  if (!confirm(`確定刪除 Prompt「${p.name}」？`)) return;
  prompts = prompts.filter((x) => x.id !== p.id);
  await persistPrompts();
  renderPromptSelect(prompts[0]?.id);
  persistAiAssistantOptions();
});

resetPromptsBtn.addEventListener("click", async () => {
  if (!confirm("重置後將回到預設 prompts，確定？")) return;
  prompts = getDefaultPrompts();
  await persistPrompts();
  renderPromptSelect(prompts.find((p) => p.id === "summary") ? "summary" : prompts[0]?.id);
  persistAiAssistantOptions();
});

urlInput.addEventListener("keydown", (e) => {
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

function setAiPanelOpen(open) {
  const isOpen = Boolean(open);
  if (!isOpen) setAiHistoryOpen(false);
  aiPanel.classList.toggle("hidden", !isOpen);
  aiPanel.setAttribute("aria-hidden", isOpen ? "false" : "true");
  aiToggleBtn.classList.toggle("active", isOpen);
  aiToggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  if (isOpen) {
    applyAiPanelWidth(aiPanelWidthPx);
    syncAiContext();
    chatInput.focus();
  }
}

aiToggleBtn.addEventListener("click", () => {
  setAiPanelOpen(aiPanel.classList.contains("hidden"));
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
  if (e.key === "Enter") {
    e.preventDefault();
    saveSearchTemplateBtn.click();
  }
});

clearHistoryBtn.addEventListener("click", () => {
  if (!confirm("確定清除所有瀏覽紀錄？")) return;
  clearHistory();
});

historySearchInput.addEventListener("input", () => renderHistoryList());

historyClearBtn.addEventListener("click", () => {
  if (!confirm("確定清除所有瀏覽紀錄？")) return;
  clearHistory();
  renderHistoryList();
});

async function runChromeImport({ showHintEl = null } = {}) {
  const hintEl = showHintEl || importChromeStatus;
  hintEl.textContent = "匯入中...";
  try {
    const res = await window.aiBridge.importChromePreferences();
    if (!res.ok) {
      hintEl.textContent = "";
      window.aiBridge.showError(res.error);
      return false;
    }
    hasShownChromeImportModal = true;
    await loadAppSettings();
    hintEl.textContent = res.sourcePath ? `已匯入：${res.sourcePath}` : "已匯入";
    return true;
  } finally {
    // keep status text
  }
}

importChromeBtn.addEventListener("click", async () => {
  if (!confirm("確定從 Chrome 匯入設定？")) return;
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
  if (provider === "local") {
    localModelRow.classList.remove("hidden");
    pullModelRow.classList.remove("hidden");
    geminiRow.classList.add("hidden");
  } else {
    localModelRow.classList.add("hidden");
    pullModelRow.classList.add("hidden");
    geminiRow.classList.remove("hidden");
  }
}

providerSelect.addEventListener("change", () => {
  setProviderUI(providerSelect.value);
  persistAiAssistantOptions();
});

aiFontSizeSelect?.addEventListener("change", () => {
  applyAiFontSizeLevel(aiFontSizeSelect.value);
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

function setGeminiKeyError(message) {
  const text = String(message || "").trim();
  geminiKeyError.textContent = text;
  geminiKeyErrorRow.classList.toggle("hidden", !text);
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
  setGeminiKeyError(ok ? "" : "API Key 格式不正確，請貼上完整 key（通常以 AIza... 開頭）。");
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

  if (source === "stored") {
    const storageText =
      format === "safeStorage" ? "已儲存（加密）" : format === "plain" ? "已儲存（明文）" : "已儲存";
    geminiKeyStatus.textContent = storageText;
    clearGeminiKeyBtn.disabled = false;
  } else if (source === "env") {
    geminiKeyStatus.textContent = "已設定（環境變數 GEMINI_API_KEY）";
    clearGeminiKeyBtn.disabled = true;
  } else {
    geminiKeyStatus.textContent = encryptionAvailable
      ? "尚未設定（可於此處加密儲存）"
      : "尚未設定（此裝置無法加密，將以明文儲存）";
    clearGeminiKeyBtn.disabled = true;
  }

  syncGeminiKeySaveState();
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
  saveGeminiKeyBtn.textContent = "儲存中...";
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
  if (!confirm("確定清除已儲存的 Gemini API Key？")) return;
  clearGeminiKeyBtn.disabled = true;
  const res = await window.aiBridge.clearGeminiApiKey();
  if (!res.ok) {
    window.aiBridge.showError(res.error);
    return;
  }
  await loadAiSettings();
});

async function refreshLocalModels() {
  localModelSelect.innerHTML = "";
  const res = await window.aiBridge.listLocalModels();
  if (!res.ok) {
    const opt = document.createElement("option");
    opt.value = DEFAULT_LOCAL_MODEL;
    opt.textContent = `${DEFAULT_LOCAL_MODEL} (未下載/或未安裝 Ollama)`;
    localModelSelect.appendChild(opt);
    persistAiAssistantOptions();
    return;
  }
  const models = res.models;
  if (!models.length) models.push(DEFAULT_LOCAL_MODEL);
  for (const m of models) {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    localModelSelect.appendChild(opt);
  }
  if (models.includes(DEFAULT_LOCAL_MODEL)) localModelSelect.value = DEFAULT_LOCAL_MODEL;
  persistAiAssistantOptions();
}

refreshModelsBtn.addEventListener("click", refreshLocalModels);

pullModelBtn.addEventListener("click", async () => {
  const name = pullModelInput.value.trim();
  if (!name) return;
  pullModelBtn.disabled = true;
  pullModelBtn.textContent = "下載中...";
  const res = await window.aiBridge.pullLocalModel(name);
  pullModelBtn.disabled = false;
  pullModelBtn.textContent = "下載模型";
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
  chatSendBtn.textContent = isSendingChat ? "生成中..." : "送出";
}

async function buildAiPageContext() {
  const webview = getActiveWebview();
  if (!webview) throw new Error("No active tab");

  const pageTitle = await webview.executeJavaScript("document.title");
  const pageUrl = safeCall(() => webview.getURL(), "");

  const contextMode = contextModeSelect.value;
  let contextLabel = "目前網頁內容";
  let content = "";

  if (contextMode === "selection" || contextMode === "auto") {
    const selection = await webview.executeJavaScript(
      "window.getSelection ? window.getSelection().toString() : ''"
    );
    const selectedText = String(selection || "").trim();
    if (selectedText) {
      contextLabel = "選取文字";
      content = selectedText;
    } else if (contextMode === "selection") {
      throw new Error("尚未選取文字：請先在頁面上選取一段文字，或改用「整頁文字」模式。");
    }
  }

  if (!content) {
    contextLabel = "目前網頁內容";
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
  return "你是使用者的瀏覽器 AI 助手。請根據使用者提供的網頁上下文回答問題。";
}

function buildAiContextBlock({ pageTitle, pageUrl, contextLabel, pageContent }) {
  const title = String(pageTitle || "").trim();
  const url = String(pageUrl || "").trim();
  const label = String(contextLabel || "").trim() || "目前網頁內容";
  const content = String(pageContent || "").trim();

  const chunks = [];
  if (title) chunks.push(`【頁面標題】${title}`);
  if (url) chunks.push(`【網址】${url}`);
  if (content) chunks.push(`【${label}】\n${content}`);
  return chunks.join("\n\n").trim();
}

function buildPromptInstructionFromTemplate(template, { pageTitle, pageUrl, contextLabel }) {
  let text = String(template || "").trim();
  if (!text) return "";
  const title = String(pageTitle || "");
  const url = String(pageUrl || "");
  const note = `（${String(contextLabel || "目前網頁內容")} 已附在上下文）`;
  text = text.replaceAll("{{title}}", title).replaceAll("{{url}}", url);
  if (text.includes("{{content}}")) {
    text = text.replaceAll("{{content}}", note);
  } else {
    text = `${text}\n\n${note}`;
  }
  return text.trim();
}

function buildPromptMessageFromTemplate(template, ctx) {
  let text = String(template || "").trim();
  if (!text) return "";

  const title = String(ctx?.pageTitle || "");
  const url = String(ctx?.pageUrl || "");
  text = text.replaceAll("{{title}}", title).replaceAll("{{url}}", url);

  const ctxBlock = buildAiContextBlock(ctx || {});
  if (!ctxBlock) return text.trim();

  if (text.includes("{{content}}")) {
    text = text.replaceAll("{{content}}", ctxBlock);
  } else {
    text = `${text}\n\n${ctxBlock}`;
  }
  return text.trim();
}

async function sendAiChatMessage({ displayText, buildUserMessage }) {
  const shown = String(displayText ?? "").trim();
  if (!shown) return;
  if (isSendingChat) return;

  const userMsg = createAiChatMessage({ role: "user", meta: "你", text: shown });
  const assistantMsg = createAiChatMessage({ role: "assistant", meta: "AI", text: "生成中..." });
  setChatSending(true);

  let didAppendUser = false;
  let userContentForHistory = "";

  try {
    ensureActiveAiConversation();
    const ctx = await buildAiPageContext();
    if (ctx.pageTitle) aiContextTitle.textContent = ctx.pageTitle;
    if (ctx.pageUrl) aiContextUrl.textContent = ctx.pageUrl;

    const provider = providerSelect.value === "gemini" ? "gemini" : "local";
    const model =
      provider === "local"
        ? localModelSelect.value || DEFAULT_LOCAL_MODEL
        : geminiModelSelect.value || "gemini-2.5-flash";

    const built = typeof buildUserMessage === "function" ? buildUserMessage(ctx) : "";
    const historyText =
      typeof built === "string" ? built : built && typeof built === "object" ? built.history : "";
    const aiText = typeof built === "string" ? built : built && typeof built === "object" ? built.ai : "";
    const userMessage = String(historyText || "").trim();
    const aiMessage = String(aiText || "").trim();
    if (!aiMessage) throw new Error("Empty prompt");

    if (userMessage && userMessage !== shown) {
      userMsg.contentEl.textContent = userMessage;
    }

    const systemPrompt = buildAiSystemPrompt(ctx);

    const historyForAi = (Array.isArray(aiConversation) ? aiConversation : [])
      .filter((m) => m && !m.skipContext && (m.role === "user" || m.role === "assistant"))
      .map((m) => ({ role: m.role, content: m.content }));

    const now = Date.now();
    userContentForHistory = userMessage || shown;
    aiConversation.push({ role: "user", meta: "你", content: userContentForHistory, ts: now, skipContext: false });
    didAppendUser = true;

    const conv = getActiveAiConversationRecord();
    if (conv) conv.updatedAt = now;
    persistAiChatStore();

    const messages = [
      { role: "system", content: systemPrompt },
      ...historyForAi,
      { role: "user", content: aiMessage }
    ];

    const res = await window.aiBridge.generate({ provider, model, messages, prompt: aiMessage });
    if (!res.ok) throw new Error(res.error || "AI error");

    const assistantMeta = `AI · ${provider === "local" ? "Local" : "Gemini"} · ${model}`;
    assistantMsg.metaEl.textContent = assistantMeta;
    assistantMsg.contentEl.className = "aiMarkdown";
    assistantMsg.contentEl.innerHTML = renderAiMarkdownToSanitizedHtml(res.text);

    const doneAt = Date.now();
    aiConversation.push({
      role: "assistant",
      meta: assistantMeta,
      content: String(res.text ?? "").trim(),
      ts: doneAt,
      skipContext: false
    });
    if (conv) conv.updatedAt = doneAt;
    persistAiChatStore();
  } catch (err) {
    const message = String(err?.message || err);
    assistantMsg.metaEl.textContent = "AI · Error";
    assistantMsg.contentEl.className = "aiMsgText";
    assistantMsg.contentEl.textContent = message;
    if (didAppendUser) {
      const conv = getActiveAiConversationRecord();
      const ts = Date.now();
      aiConversation.push({ role: "assistant", meta: "AI · Error", content: message, ts, skipContext: true });
      if (conv) conv.updatedAt = ts;
      persistAiChatStore();
    }
    window.aiBridge.showError(message);
  } finally {
    setChatSending(false);
    scrollAiChatToBottom({ behavior: "smooth" });
  }
}

function sendChatFromInput() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";
  sendAiChatMessage({
    displayText: text,
    buildUserMessage: (ctx) => {
      const context = buildAiContextBlock(ctx);
      const ai = context ? `${text}\n\n${context}` : text;
      return { history: text, ai };
    }
  });
}

chatSendBtn.addEventListener("click", sendChatFromInput);

chatInput.addEventListener("keydown", (e) => {
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
  const template = p.template || "";
  sendAiChatMessage({
    displayText: name,
    buildUserMessage: (ctx) => ({
      history: buildPromptInstructionFromTemplate(template, ctx),
      ai: buildPromptMessageFromTemplate(template, ctx)
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
    setAiPanelOpen(aiPanel.classList.contains("hidden"));
    return;
  }
  if (command === "openHistory") {
    setHistoryModalOpen(true);
    return;
  }
  if (command === "clearHistory") {
    if (!confirm("確定清除所有瀏覽紀錄？")) return;
    clearHistory();
    return;
  }

  const webview = getActiveWebview();
  if (!webview) return;

  if (command === "print") {
    safeCall(
      () =>
        webview.print({ printBackground: true }, (success, failureReason) => {
          if (!success) window.aiBridge.showError(failureReason || "Print failed");
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
    const q = prompt("在頁面中搜尋", "");
    const query = String(q || "").trim();
    if (!query) return;
    safeCall(() => webview.stopFindInPage("clearSelection"), null);
    safeCall(() => webview.findInPage(query), null);
  }
});

async function initAiAssistantOptions() {
  const saved = loadAiAssistantOptionsFromStorage() || {};

  isSyncingAiAssistantOptions = true;
  try {
    const provider = saved.provider;
    if (provider === "local" || provider === "gemini") {
      providerSelect.value = provider;
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
  openStartupTabs();
  persistLastSessionTabs();
  syncClearButton();
  updateTabScrollButtons();
  updateNavButtons();
  updateLoadingUI();
  syncStatusBar();

  await initAiAssistantOptions();
  const storedChat = loadAiChatStoreFromStorage();
  aiChatConversations = storedChat?.conversations || [];
  aiActiveConversationId = storedChat?.activeConversationId || null;
  ensureActiveAiConversation();
  persistAiChatStore();
  renderAiConversationMessages(aiConversation);

  if (!hasShownChromeImportModal) {
    setChromeImportModalOpen(true);
  }
}

initApp();
