const { app, BrowserWindow, ipcMain, dialog, safeStorage, shell, Menu, nativeTheme } = require("electron");
const os = require("os");
const path = require("path");
const fs = require("fs/promises");
const { existsSync } = require("fs");
const { spawn, spawnSync } = require("child_process");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webviewTag: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));
}

function getActiveWindow() {
  return BrowserWindow.getFocusedWindow() || mainWindow || BrowserWindow.getAllWindows()[0] || null;
}

function dispatchMenuCommand(command, payload) {
  const win = getActiveWindow();
  if (!win) return;
  win.webContents.send("menu:command", { command, payload });
}

function buildAppMenu() {
  const isMac = process.platform === "darwin";

  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" },
              { type: "separator" },
              {
                label: "Settings…",
                accelerator: "Command+,",
                click: () => dispatchMenuCommand("openSettings")
              },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" }
            ]
          }
        ]
      : []),
    {
      label: "File",
      submenu: [
        {
          label: "New Tab",
          accelerator: "CmdOrCtrl+T",
          click: () => dispatchMenuCommand("newTab")
        },
        {
          label: "New Window",
          accelerator: "CmdOrCtrl+N",
          click: () => createWindow()
        },
        { type: "separator" },
        {
          label: "Open Location…",
          accelerator: "CmdOrCtrl+L",
          click: () => dispatchMenuCommand("focusAddressBar")
        },
        {
          label: "Print…",
          accelerator: "CmdOrCtrl+P",
          click: () => dispatchMenuCommand("print")
        },
        { type: "separator" },
        {
          label: "Close Tab",
          accelerator: "CmdOrCtrl+W",
          click: () => dispatchMenuCommand("closeTab")
        },
        {
          label: "Close Window",
          accelerator: isMac ? "Shift+Command+W" : "Alt+F4",
          click: () => getActiveWindow()?.close()
        },
        ...(isMac ? [] : [{ type: "separator" }, { role: "quit" }])
      ]
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        ...(isMac ? [{ role: "pasteAndMatchStyle" }] : []),
        { role: "delete" },
        { role: "selectAll" },
        { type: "separator" },
        {
          label: "Find in Page…",
          accelerator: "CmdOrCtrl+F",
          click: () => dispatchMenuCommand("findInPage")
        }
      ]
    },
    {
      label: "View",
      submenu: [
        {
          label: "Back",
          accelerator: isMac ? "Command+[" : "Alt+Left",
          click: () => dispatchMenuCommand("goBack")
        },
        {
          label: "Forward",
          accelerator: isMac ? "Command+]" : "Alt+Right",
          click: () => dispatchMenuCommand("goForward")
        },
        { type: "separator" },
        {
          label: "Reload",
          accelerator: "CmdOrCtrl+R",
          click: () => dispatchMenuCommand("reload")
        },
        {
          label: "Force Reload",
          accelerator: "Shift+CmdOrCtrl+R",
          click: () => dispatchMenuCommand("forceReload")
        },
        { type: "separator" },
        {
          label: "Actual Size",
          accelerator: "CmdOrCtrl+0",
          click: () => dispatchMenuCommand("zoomReset")
        },
        {
          label: "Zoom In",
          accelerator: "CmdOrCtrl+=",
          click: () => dispatchMenuCommand("zoomIn")
        },
        {
          label: "Zoom Out",
          accelerator: "CmdOrCtrl+-",
          click: () => dispatchMenuCommand("zoomOut")
        },
        { type: "separator" },
        { role: "togglefullscreen" },
        { role: "toggleDevTools" },
        { type: "separator" },
        {
          label: "Toggle AI Assistant",
          accelerator: "CmdOrCtrl+Shift+A",
          click: () => dispatchMenuCommand("toggleAiAssistant")
        }
      ]
    },
    {
      label: "History",
      submenu: [
        {
          label: "Show History",
          accelerator: "CmdOrCtrl+Y",
          click: () => dispatchMenuCommand("openHistory")
        },
        {
          label: "Clear Browsing Data…",
          accelerator: "Shift+CmdOrCtrl+Delete",
          click: () => dispatchMenuCommand("clearHistory")
        }
      ]
    },
    ...(isMac
      ? []
      : [
          {
            label: "Settings",
            submenu: [
              {
                label: "Preferences…",
                accelerator: "CmdOrCtrl+,",
                click: () => dispatchMenuCommand("openSettings")
              }
            ]
          }
        ]),
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        ...(isMac
          ? [{ type: "separator" }, { role: "front" }]
          : [
              { type: "separator" },
              {
                label: "Close Window",
                accelerator: "Alt+F4",
                click: () => getActiveWindow()?.close()
              }
            ])
      ]
    },
    {
      role: "help",
      submenu: [
        {
          label: "Learn More",
          click: () => shell.openExternal("https://www.electronjs.org")
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  buildAppMenu();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

const DEFAULT_PROMPTS_PATH = path.join(__dirname, "prompts.json");
const DEFAULT_HOME_PAGE = "https://www.google.com";
const DEFAULT_SEARCH_TEMPLATE = "https://www.google.com/search?q={query}";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_MODELS = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-preview-09-2025",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash-lite-preview-09-2025",
  "gemini-2.5-flash-native-audio-preview-12-2025",
  "gemini-2.5-flash-preview-tts"
];

function log(...args) {
  console.log("[sting-ai]", ...args);
}

function getPromptStorePath() {
  return path.join(app.getPath("userData"), "prompts.json");
}

function getSettingsStorePath() {
  return path.join(app.getPath("userData"), "settings.json");
}

async function readJson(filePath) {
  const text = await fs.readFile(filePath, "utf8");
  return JSON.parse(text);
}

function sanitizeSettings(raw) {
  const next = {
    version: 1,
    hasShownChromeImportModal: false,
    browser: {
      version: 1,
      homePage: DEFAULT_HOME_PAGE,
      searchEngineTemplate: DEFAULT_SEARCH_TEMPLATE,
      startupMode: "home",
      startupUrls: [],
      theme: "light"
    },
    geminiModel: DEFAULT_GEMINI_MODEL,
    geminiApiKeyData: null,
    geminiApiKeyFormat: null
  };

  if (!raw || typeof raw !== "object") return next;

  if (typeof raw.hasShownChromeImportModal === "boolean") {
    next.hasShownChromeImportModal = raw.hasShownChromeImportModal;
  }

  const browser = raw.browser;
  if (browser && typeof browser === "object") {
    if (typeof browser.homePage === "string" && browser.homePage.trim()) {
      next.browser.homePage = sanitizeHomePage(browser.homePage);
    }
    if (typeof browser.searchEngineTemplate === "string" && browser.searchEngineTemplate.trim()) {
      next.browser.searchEngineTemplate = sanitizeSearchEngineTemplate(browser.searchEngineTemplate);
    }
    if (browser.startupMode === "home" || browser.startupMode === "continue" || browser.startupMode === "urls") {
      next.browser.startupMode = browser.startupMode;
    }
    if (Array.isArray(browser.startupUrls)) {
      next.browser.startupUrls = sanitizeStartupUrls(browser.startupUrls);
    }
    if (browser.theme === "dark" || browser.theme === "light") {
      next.browser.theme = browser.theme;
    } else if (browser.theme === "system") {
      next.browser.theme = nativeTheme.shouldUseDarkColors ? "dark" : "light";
    }
  }

  if (typeof raw.geminiModel === "string" && GEMINI_MODELS.includes(raw.geminiModel)) {
    next.geminiModel = raw.geminiModel;
  }
  if (typeof raw.geminiApiKeyData === "string" && raw.geminiApiKeyData.trim()) {
    next.geminiApiKeyData = raw.geminiApiKeyData.trim();
  }
  if (raw.geminiApiKeyFormat === "safeStorage" || raw.geminiApiKeyFormat === "plain") {
    next.geminiApiKeyFormat = raw.geminiApiKeyFormat;
  }
  return next;
}

function sanitizeHomePage(value) {
  const text = String(value || "").trim();
  if (!text) return DEFAULT_HOME_PAGE;
  if (/^(about|file|chrome):/i.test(text)) return text;
  if (/^https?:\/\//i.test(text)) return text;
  const hasSpaces = /\s/.test(text);
  const looksLikeHost =
    !hasSpaces && (text.includes(".") || text.startsWith("localhost") || /^[^/]+:\d+/.test(text));
  if (looksLikeHost) return `https://${text}`;
  return DEFAULT_HOME_PAGE;
}

function sanitizeSearchEngineTemplate(value) {
  const text = String(value || "").trim();
  if (!text) return DEFAULT_SEARCH_TEMPLATE;
  if (!text.includes("{query}")) return DEFAULT_SEARCH_TEMPLATE;
  if (!/^https?:\/\//i.test(text)) return DEFAULT_SEARCH_TEMPLATE;
  return text;
}

function sanitizeStartupUrls(urls) {
  if (!Array.isArray(urls)) return [];
  const out = [];
  for (const raw of urls) {
    const text = String(raw || "").trim();
    if (!text) continue;
    if (/^https?:\/\//i.test(text)) out.push(text);
    if (out.length >= 12) break;
  }
  return out;
}

async function loadSettings() {
  const storePath = getSettingsStorePath();
  try {
    if (existsSync(storePath)) {
      const stored = await readJson(storePath);
      return sanitizeSettings(stored);
    }
  } catch (err) {
    log("failed to read settings:", err?.message || err);
  }
  return sanitizeSettings(null);
}

async function saveSettings(nextSettings) {
  const storePath = getSettingsStorePath();
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(nextSettings, null, 2), "utf8");
  return storePath;
}

function mergeBrowserSettings(currentBrowser, patch) {
  const next = { ...currentBrowser };
  const input = patch && typeof patch === "object" ? patch : {};

  if (typeof input.homePage === "string") next.homePage = sanitizeHomePage(input.homePage);
  if (typeof input.searchEngineTemplate === "string") {
    next.searchEngineTemplate = sanitizeSearchEngineTemplate(input.searchEngineTemplate);
  }
  if (input.startupMode === "home" || input.startupMode === "continue" || input.startupMode === "urls") {
    next.startupMode = input.startupMode;
  }
  if (Array.isArray(input.startupUrls)) next.startupUrls = sanitizeStartupUrls(input.startupUrls);
  if (input.theme === "dark" || input.theme === "light") next.theme = input.theme;
  else if (input.theme === "system") next.theme = nativeTheme.shouldUseDarkColors ? "dark" : "light";

  return sanitizeSettings({ browser: next }).browser;
}

function getChromeUserDataDirs() {
  const home = os.homedir();

  if (process.platform === "darwin") {
    return [
      path.join(home, "Library", "Application Support", "Google", "Chrome"),
      path.join(home, "Library", "Application Support", "Google", "Chrome Beta"),
      path.join(home, "Library", "Application Support", "Chromium")
    ];
  }

  if (process.platform === "win32") {
    const localAppData = process.env.LOCALAPPDATA || path.join(home, "AppData", "Local");
    return [
      path.join(localAppData, "Google", "Chrome", "User Data"),
      path.join(localAppData, "Chromium", "User Data")
    ];
  }

  return [
    path.join(home, ".config", "google-chrome"),
    path.join(home, ".config", "chromium")
  ];
}

async function findExistingChromePreferencesPath() {
  const userDataDirs = getChromeUserDataDirs();
  for (const dir of userDataDirs) {
    if (!existsSync(dir)) continue;
    const direct = path.join(dir, "Default", "Preferences");
    if (existsSync(direct)) return direct;
  }

  for (const dir of userDataDirs) {
    if (!existsSync(dir)) continue;
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const profileDirs = entries
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .filter((name) => name === "Default" || /^Profile\s+\d+$/.test(name))
        .sort((a, b) => {
          if (a === "Default") return -1;
          if (b === "Default") return 1;
          const na = Number(a.replace(/\D+/g, ""));
          const nb = Number(b.replace(/\D+/g, ""));
          return na - nb;
        });

      for (const profile of profileDirs) {
        const prefsPath = path.join(dir, profile, "Preferences");
        if (existsSync(prefsPath)) return prefsPath;
      }
    } catch {
    }
  }
  return null;
}

function inferSearchTemplateFromChromePrefs(prefs) {
  const candidates = [
    prefs?.default_search_provider_data?.template_url,
    prefs?.default_search_provider?.template_url,
    prefs?.default_search_provider_data?.search_url,
    prefs?.default_search_provider?.search_url,
    prefs?.default_search_provider_data?.url,
    prefs?.default_search_provider?.url
  ];

  for (const raw of candidates) {
    const text = typeof raw === "string" ? raw.trim() : "";
    if (!text) continue;
    if (/duckduckgo\.com/i.test(text)) return "https://duckduckgo.com/?q={query}";
    if (/bing\.com/i.test(text)) return "https://www.bing.com/search?q={query}";
    if (/google\./i.test(text)) return DEFAULT_SEARCH_TEMPLATE;

    if (/^https?:\/\//i.test(text) && text.includes("{searchTerms}")) {
      const withQuery = text.replaceAll("{searchTerms}", "{query}");
      const tokened = withQuery.replaceAll("{query}", "__QUERY__");
      const stripped = tokened.replaceAll(/\{[^}]+\}/g, "");
      const restored = stripped.replaceAll("__QUERY__", "{query}");
      return sanitizeSearchEngineTemplate(restored);
    }
  }

  const keyword = String(
    prefs?.default_search_provider_data?.keyword || prefs?.default_search_provider?.keyword || ""
  ).toLowerCase();
  const name = String(
    prefs?.default_search_provider_data?.name || prefs?.default_search_provider?.name || ""
  ).toLowerCase();

  const hay = `${keyword} ${name}`;
  if (hay.includes("duck")) return "https://duckduckgo.com/?q={query}";
  if (hay.includes("bing")) return "https://www.bing.com/search?q={query}";
  if (hay.includes("google")) return DEFAULT_SEARCH_TEMPLATE;
  return DEFAULT_SEARCH_TEMPLATE;
}

async function importChromePreferences() {
  const prefsPath = await findExistingChromePreferencesPath();
  if (!prefsPath) {
    return { ok: false, error: "找不到 Chrome Preferences 檔案（請確認已安裝 Chrome 或 Chromium）。" };
  }

  let prefs;
  try {
    prefs = await readJson(prefsPath);
  } catch (err) {
    return { ok: false, error: `無法讀取 Chrome Preferences：${String(err?.message || err)}` };
  }

  const homepageIsNewTab = Boolean(prefs?.homepage_is_newtabpage);
  const rawHomepage = typeof prefs?.homepage === "string" ? prefs.homepage : "";
  const homePage = homepageIsNewTab ? DEFAULT_HOME_PAGE : sanitizeHomePage(rawHomepage);

  const restore = Number(prefs?.session?.restore_on_startup);
  const rawStartupUrls = Array.isArray(prefs?.session?.startup_urls)
    ? prefs.session.startup_urls
    : Array.isArray(prefs?.session?.urls_to_restore_on_startup)
      ? prefs.session.urls_to_restore_on_startup
      : [];
  const startupUrls = sanitizeStartupUrls(rawStartupUrls);
  const startupMode = restore === 4 && startupUrls.length ? "urls" : restore === 5 ? "continue" : "home";

  const searchEngineTemplate = inferSearchTemplateFromChromePrefs(prefs);

  const settings = await loadSettings();
  settings.browser = mergeBrowserSettings(settings.browser, {
    homePage,
    searchEngineTemplate,
    startupMode,
    startupUrls
  });
  settings.hasShownChromeImportModal = true;
  await saveSettings(settings);

  return {
    ok: true,
    sourcePath: prefsPath,
    imported: {
      homePage: settings.browser.homePage,
      searchEngineTemplate: settings.browser.searchEngineTemplate,
      startupMode: settings.browser.startupMode,
      startupUrls: settings.browser.startupUrls
    }
  };
}

function isValidGeminiApiKey(apiKey) {
  const key = String(apiKey || "").trim();
  if (!key) return false;
  if (key.length < 20) return false;
  if (!/^[0-9A-Za-z\-_]+$/.test(key)) return false;
  if (key.startsWith("AIza") && key.length < 32) return false;
  return true;
}

function encryptGeminiApiKey(apiKey) {
  const key = String(apiKey || "").trim();
  if (!key) return { format: null, data: null };

  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(key);
    return { format: "safeStorage", data: encrypted.toString("base64") };
  }
  return { format: "plain", data: key };
}

function decryptGeminiApiKey({ format, data }) {
  if (!data || typeof data !== "string") return null;
  if (format === "safeStorage") {
    if (!safeStorage.isEncryptionAvailable()) return null;
    try {
      return safeStorage.decryptString(Buffer.from(data, "base64"));
    } catch (err) {
      log("failed to decrypt gemini api key:", err?.message || err);
      return null;
    }
  }
  if (format === "plain") return data;
  return null;
}

async function getGeminiApiKey() {
  const settings = await loadSettings();
  const stored = decryptGeminiApiKey({
    format: settings.geminiApiKeyFormat,
    data: settings.geminiApiKeyData
  });
  if (stored) return stored;
  return process.env.GEMINI_API_KEY || null;
}

async function loadPrompts() {
  const storePath = getPromptStorePath();
  try {
    if (existsSync(storePath)) {
      const stored = await readJson(storePath);
      if (Array.isArray(stored)) return stored;
    }
  } catch (err) {
    log("failed to read stored prompts:", err?.message || err);
  }
  try {
    const defaults = await readJson(DEFAULT_PROMPTS_PATH);
    return Array.isArray(defaults) ? defaults : [];
  } catch (err) {
    log("failed to read default prompts:", err?.message || err);
    return [];
  }
}

async function savePrompts(prompts) {
  const storePath = getPromptStorePath();
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(prompts, null, 2), "utf8");
  return storePath;
}

async function resetPrompts() {
  const storePath = getPromptStorePath();
  await fs.rm(storePath, { force: true });
  return storePath;
}

function hasOllamaCli() {
  const res = spawnSync("ollama", ["--version"], { encoding: "utf8" });
  return res.status === 0;
}

async function ollamaListModels() {
  return new Promise((resolve, reject) => {
    if (!hasOllamaCli()) return resolve({ ok: false, error: "ollama CLI not found" });
    const p = spawn("ollama", ["list"]);
    let out = "";
    let err = "";
    p.stdout.on("data", (d) => (out += d.toString()));
    p.stderr.on("data", (d) => (err += d.toString()));
    p.on("close", (code) => {
      if (code !== 0) return resolve({ ok: false, error: err || out });
      const lines = out.trim().split("\n").slice(1); // skip header
      const models = lines
        .map((l) => l.trim().split(/\s+/)[0])
        .filter(Boolean);
      resolve({ ok: true, models });
    });
  });
}

async function ollamaPullModel(modelName) {
  return new Promise((resolve) => {
    if (!hasOllamaCli()) return resolve({ ok: false, error: "ollama CLI not found" });
    const p = spawn("ollama", ["pull", modelName]);
    let out = "";
    let err = "";
    p.stdout.on("data", (d) => (out += d.toString()));
    p.stderr.on("data", (d) => (err += d.toString()));
    p.on("close", (code) => {
      if (code !== 0) return resolve({ ok: false, error: err || out });
      resolve({ ok: true, output: out.trim() });
    });
  });
}

async function ollamaChat({ model, messages }) {
  const res = await fetch("http://127.0.0.1:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, stream: false })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Ollama error ${res.status}`);
  }
  const data = await res.json();
  return data?.message?.content ?? "";
}

async function geminiGenerate({ model, prompt }) {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API Key not set. Please add it in Settings or set GEMINI_API_KEY.");
  }
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Gemini error ${res.status}`);
  }
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p) => p.text).join("");
}

async function geminiChat({ model, messages }) {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API Key not set. Please add it in Settings or set GEMINI_API_KEY.");
  }

  const systemParts = [];
  const contents = [];

  for (const msg of Array.isArray(messages) ? messages : []) {
    const role = String(msg?.role || "").trim().toLowerCase();
    const text = String(msg?.content ?? "").trim();
    if (!role || !text) continue;

    if (role === "system") {
      systemParts.push(text);
      continue;
    }
    if (role === "assistant" || role === "model") {
      contents.push({ role: "model", parts: [{ text }] });
      continue;
    }
    if (role === "user") {
      contents.push({ role: "user", parts: [{ text }] });
    }
  }

  const systemText = systemParts.join("\n\n").trim();
  if (systemText) {
    if (contents.length && contents[0].role === "user") {
      const prev = String(contents[0].parts?.[0]?.text || "");
      contents[0] = { ...contents[0], parts: [{ text: `${systemText}\n\n${prev}`.trim() }] };
    } else {
      contents.unshift({ role: "user", parts: [{ text: systemText }] });
    }
  }

  if (!contents.length) throw new Error("Missing chat messages");

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Gemini error ${res.status}`);
  }
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p) => p.text).join("");
}

ipcMain.handle("local:listModels", async () => {
  return ollamaListModels();
});

ipcMain.handle("local:pullModel", async (_e, modelName) => {
  log("local:pullModel", modelName);
  return ollamaPullModel(modelName);
});

ipcMain.handle("ai:generate", async (_e, payload) => {
  const { provider, model, messages, prompt } = payload || {};
  const start = Date.now();
  log("ai:generate start", { provider, model });
  try {
    if (provider === "local") {
      const text = await ollamaChat({ model, messages });
      log("ai:generate done", Date.now() - start, "ms");
      return { ok: true, text };
    }
    if (provider === "gemini") {
      const useChat = Array.isArray(messages) && messages.length > 0;
      const text = useChat
        ? await geminiChat({ model, messages })
        : await geminiGenerate({ model, prompt });
      log("ai:generate done", Date.now() - start, "ms");
      return { ok: true, text };
    }
    return { ok: false, error: "Unknown provider" };
  } catch (err) {
    log("ai:generate error", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("prompts:list", async () => {
  try {
    const prompts = await loadPrompts();
    return { ok: true, prompts };
  } catch (err) {
    log("prompts:list error", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("prompts:save", async (_e, prompts) => {
  try {
    if (!Array.isArray(prompts)) throw new Error("prompts must be an array");
    await savePrompts(prompts);
    log("prompts:save ok", prompts.length);
    return { ok: true };
  } catch (err) {
    log("prompts:save error", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("prompts:reset", async () => {
  try {
    await resetPrompts();
    log("prompts:reset ok");
    return { ok: true };
  } catch (err) {
    log("prompts:reset error", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("settings:get", async () => {
  try {
    const settings = await loadSettings();
    const hasStoredKey = Boolean(settings.geminiApiKeyData);
    const hasEnvKey = Boolean(process.env.GEMINI_API_KEY);
    const geminiApiKeySource = hasStoredKey ? "stored" : hasEnvKey ? "env" : "none";
    return {
      ok: true,
      settings: {
        geminiModel: settings.geminiModel,
        geminiApiKeySource,
        geminiApiKeyFormat: settings.geminiApiKeyFormat,
        encryptionAvailable: safeStorage.isEncryptionAvailable()
      }
    };
  } catch (err) {
    log("settings:get error", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("settings:setGeminiModel", async (_e, model) => {
  try {
    const nextModel = String(model || "").trim();
    if (!GEMINI_MODELS.includes(nextModel)) throw new Error("Invalid Gemini model");
    const settings = await loadSettings();
    settings.geminiModel = nextModel;
    await saveSettings(settings);
    return { ok: true };
  } catch (err) {
    log("settings:setGeminiModel error", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("settings:setGeminiApiKey", async (_e, apiKey) => {
  try {
    const key = String(apiKey || "").trim();
    if (!isValidGeminiApiKey(key)) throw new Error("Invalid API key format");
    const settings = await loadSettings();
    const stored = encryptGeminiApiKey(key);
    settings.geminiApiKeyFormat = stored.format;
    settings.geminiApiKeyData = stored.data;
    await saveSettings(settings);
    return { ok: true, encryptionAvailable: safeStorage.isEncryptionAvailable() };
  } catch (err) {
    log("settings:setGeminiApiKey error", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("settings:clearGeminiApiKey", async () => {
  try {
    const settings = await loadSettings();
    settings.geminiApiKeyFormat = null;
    settings.geminiApiKeyData = null;
    await saveSettings(settings);
    return { ok: true };
  } catch (err) {
    log("settings:clearGeminiApiKey error", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("appSettings:get", async () => {
  try {
    const settings = await loadSettings();
    return {
      ok: true,
      settings: {
        hasShownChromeImportModal: Boolean(settings.hasShownChromeImportModal),
        browser: settings.browser
      }
    };
  } catch (err) {
    log("appSettings:get error", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("appSettings:setBrowser", async (_e, browserPatch) => {
  try {
    const settings = await loadSettings();
    settings.browser = mergeBrowserSettings(settings.browser, browserPatch);
    await saveSettings(settings);
    return { ok: true, browser: settings.browser };
  } catch (err) {
    log("appSettings:setBrowser error", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("appSettings:markChromeImportModalShown", async () => {
  try {
    const settings = await loadSettings();
    settings.hasShownChromeImportModal = true;
    await saveSettings(settings);
    return { ok: true };
  } catch (err) {
    log("appSettings:markChromeImportModalShown error", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("chrome:importPreferences", async () => {
  try {
    const res = await importChromePreferences();
    return res;
  } catch (err) {
    log("chrome:importPreferences error", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
});

if (typeof ipcMain.removeHandler === "function") {
  try {
    ipcMain.removeHandler("app:openExternal");
  } catch {
  }
}
ipcMain.handle("app:openExternal", async (_e, url) => {
  try {
    const target = String(url || "").trim();
    if (!target) return { ok: false, error: "Missing url" };
    await shell.openExternal(target);
    return { ok: true };
  } catch (err) {
    log("app:openExternal error", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
});

if (typeof ipcMain.removeHandler === "function") {
  try {
    ipcMain.removeHandler("app:showError");
  } catch {
  }
}
ipcMain.handle("app:showError", async (_e, message) => {
  try {
    await dialog.showMessageBox(mainWindow, {
      type: "error",
      title: "Sting AI Browser",
      message: "發生錯誤",
      detail: String(message || "")
    });
    return { ok: true };
  } catch (err) {
    log("app:showError error", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
});
