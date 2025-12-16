const { app, BrowserWindow, ipcMain, dialog, safeStorage, shell, Menu, nativeTheme, nativeImage } = require("electron");
const os = require("os");
const path = require("path");
const fs = require("fs/promises");
const { existsSync } = require("fs");
const { spawn, spawnSync } = require("child_process");
const { chromium } = require("playwright-core");

const APP_DISPLAY_NAME = "stingtaoAI";

try {
  app.setName(APP_DISPLAY_NAME);
} catch {
}
try {
  process.title = APP_DISPLAY_NAME;
} catch {
}

const DEFAULT_CDP_ADDRESS = "127.0.0.1";
const DEFAULT_CDP_PORT = 9222;
const CDP_ENABLED = String(process.env.STING_CDP_ENABLE || "1").trim() !== "0";
const CDP_ADDRESS = String(process.env.STING_CDP_ADDRESS || DEFAULT_CDP_ADDRESS).trim() || DEFAULT_CDP_ADDRESS;
const CDP_PORT = (() => {
  const raw = Number(process.env.STING_CDP_PORT || DEFAULT_CDP_PORT);
  if (!Number.isFinite(raw)) return DEFAULT_CDP_PORT;
  const port = Math.floor(raw);
  if (port < 1 || port > 65535) return DEFAULT_CDP_PORT;
  return port;
})();

if (CDP_ENABLED) {
  try {
    app.commandLine.appendSwitch("remote-debugging-address", CDP_ADDRESS);
  } catch {
  }
  try {
    app.commandLine.appendSwitch("remote-debugging-port", String(CDP_PORT));
  } catch {
  }
}

let mainWindow;
let currentUiLanguage = "en";

const SUPPORTED_UI_LANGUAGES = ["en", "es", "zh-TW"];
const DOWNLOADS_LIST_LIMIT = 80;
const downloadsById = new Map();
const downloadItemsById = new Map();
const reservedDownloadPaths = new Set();
const sessionsWithDownloadHandler = new WeakSet();

function getOsLocale() {
  try {
    return app.getLocale();
  } catch {
    return "";
  }
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

function createWindow({ initialUrl } = {}) {
  const win = new BrowserWindow({
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
  if (!mainWindow || mainWindow.isDestroyed()) mainWindow = win;

  try {
    const ses = win.webContents.session;
    if (ses && !sessionsWithDownloadHandler.has(ses) && typeof ses.on === "function") {
      sessionsWithDownloadHandler.add(ses);
      ses.on("will-download", (_event, item, webContents) => {
        try {
          const win = BrowserWindow.fromWebContents(webContents) || getActiveWindow() || mainWindow;
          const id = `dl_${Date.now()}_${Math.random().toString(16).slice(2)}`;
          const downloadsDir = app.getPath("downloads");
          const filename = String(item.getFilename() || "download");
          const savePath = pickUniqueDownloadPath(downloadsDir, filename);
          reservedDownloadPaths.add(savePath);
          try {
            item.setSavePath(savePath);
          } catch {
          }

          const record = {
            id,
            filename,
            url: String(item.getURL() || ""),
            mimeType: String(item.getMimeType?.() || ""),
            savePath,
            startTime: Date.now(),
            endTime: null,
            state: "progressing",
            paused: false,
            receivedBytes: Number(item.getReceivedBytes?.() || 0),
            totalBytes: Number(item.getTotalBytes?.() || 0)
          };
          downloadsById.set(id, record);
          downloadItemsById.set(id, item);
          trimDownloadsList();
          sendDownloadEvent(win, { type: "created", download: record });
          syncWindowDownloadProgress(win);

          item.on("updated", () => {
            const rec = downloadsById.get(id);
            if (!rec) return;
            rec.state = "progressing";
            rec.paused = Boolean(item.isPaused?.());
            rec.receivedBytes = Number(item.getReceivedBytes?.() || 0);
            rec.totalBytes = Number(item.getTotalBytes?.() || 0);
            sendDownloadEvent(win, { type: "updated", download: rec });
            syncWindowDownloadProgress(win);
          });

          item.once("done", (_evt, state) => {
            const rec = downloadsById.get(id);
            if (!rec) return;
            rec.state = String(state || "done");
            rec.paused = Boolean(item.isPaused?.());
            rec.receivedBytes = Number(item.getReceivedBytes?.() || 0);
            rec.totalBytes = Number(item.getTotalBytes?.() || 0);
            rec.endTime = Date.now();
            reservedDownloadPaths.delete(savePath);
            downloadItemsById.delete(id);
            sendDownloadEvent(win, { type: "done", download: rec });
            syncWindowDownloadProgress(win);
          });
        } catch (err) {
          log("will-download error", err?.message || err);
        }
      });
    }
    if (ses && typeof ses.setPermissionRequestHandler === "function") {
      ses.setPermissionRequestHandler((webContents, permission, callback, details) => {
        try {
          if (permission !== "media") return callback(false);
          const isMainUi = webContents === mainWindow.webContents;
          const mediaTypes = Array.isArray(details?.mediaTypes) ? details.mediaTypes : [];
          const wantsAudio = mediaTypes.includes("audio");
          callback(Boolean(isMainUi && wantsAudio));
        } catch {
          callback(false);
        }
      });
    }
    if (ses && typeof ses.setPermissionCheckHandler === "function") {
      ses.setPermissionCheckHandler((webContents, permission, _origin, details) => {
        try {
          if (permission !== "media") return false;
          const isMainUi = webContents?.getType?.() === "window";
          const mediaTypes = Array.isArray(details?.mediaTypes) ? details.mediaTypes : [];
          const wantsAudio = mediaTypes.includes("audio");
          return Boolean(isMainUi && wantsAudio);
        } catch {
          return false;
        }
      });
    }
  } catch {
  }

  const filePath = path.join(__dirname, "renderer", "index.html");
  const url = String(initialUrl || "").trim();
  if (url) {
    win.loadFile(filePath, { query: { initialUrl: url } });
  } else {
    win.loadFile(filePath);
  }
  return win;
}

const APP_ICON_SVG_PATH = path.join(__dirname, "assets", "app-icon.svg");

async function renderSvgIconToNativeImage(svgPath, { size = 512 } = {}) {
  try {
    const targetPath = String(svgPath || "").trim();
    if (!targetPath || !existsSync(targetPath)) return null;

    const requestedSize = Math.max(16, Math.min(2048, Math.floor(Number(size) || 512)));
    const svg = await fs.readFile(targetPath, "utf8");
    const html = `<!doctype html><html><head><meta charset="utf-8" /><style>
html,body{margin:0;padding:0;width:${requestedSize}px;height:${requestedSize}px;background:transparent;overflow:hidden;}
svg{width:${requestedSize}px;height:${requestedSize}px;display:block;}
</style></head><body>${svg}</body></html>`;

    const win = new BrowserWindow({
      width: requestedSize,
      height: requestedSize,
      show: false,
      frame: false,
      transparent: true,
      backgroundColor: "#00000000",
      paintWhenInitiallyHidden: true,
      webPreferences: {
        offscreen: true,
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    try {
      await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
      try {
        await win.webContents.executeJavaScript("new Promise(requestAnimationFrame)", true);
      } catch {
      }
      const img = await win.webContents.capturePage({ x: 0, y: 0, width: requestedSize, height: requestedSize });
      if (!img || img.isEmpty()) return null;
      return nativeImage.createFromBuffer(img.toPNG());
    } finally {
      try {
        win.destroy();
      } catch {
      }
    }
  } catch {
    return null;
  }
}

async function trySetAppDockIcon() {
  if (process.platform !== "darwin") return;
  const img = await renderSvgIconToNativeImage(APP_ICON_SVG_PATH, { size: 512 });
  if (!img || img.isEmpty()) return;
  try {
    app.dock.setIcon(img);
  } catch {
  }
}

function getActiveWindow() {
  const focused = BrowserWindow.getFocusedWindow();
  if (focused && !focused.isDestroyed()) return focused;
  if (mainWindow && mainWindow.isDestroyed()) mainWindow = null;
  const existing = BrowserWindow.getAllWindows().filter((w) => w && !w.isDestroyed());
  return mainWindow || existing[0] || null;
}

function trimDownloadsList() {
  if (downloadsById.size <= DOWNLOADS_LIST_LIMIT) return;
  const items = Array.from(downloadsById.values()).sort((a, b) => Number(b.startTime) - Number(a.startTime));
  const keep = new Set(items.slice(0, DOWNLOADS_LIST_LIMIT).map((x) => x.id));
  for (const id of Array.from(downloadsById.keys())) {
    if (!keep.has(id)) downloadsById.delete(id);
  }
}

function pickUniqueDownloadPath(dir, filename) {
  const cleanDir = String(dir || "").trim() || app.getPath("downloads");
  const name = String(filename || "download").trim() || "download";
  const parsed = path.parse(name);
  const base = parsed.name || "download";
  const ext = parsed.ext || "";

  const candidate0 = path.join(cleanDir, `${base}${ext}`);
  if (!existsSync(candidate0) && !reservedDownloadPaths.has(candidate0)) return candidate0;

  for (let i = 1; i <= 999; i++) {
    const candidate = path.join(cleanDir, `${base} (${i})${ext}`);
    if (!existsSync(candidate) && !reservedDownloadPaths.has(candidate)) return candidate;
  }
  return path.join(cleanDir, `${base}-${Date.now()}${ext}`);
}

function sendDownloadEvent(win, payload) {
  try {
    const target = win || getActiveWindow() || mainWindow;
    if (!target || target.isDestroyed()) return;
    target.webContents.send("downloads:event", payload);
  } catch {
  }
}

function syncWindowDownloadProgress(win) {
  const target = win || getActiveWindow() || mainWindow;
  if (!target || target.isDestroyed()) return;
  const active = Array.from(downloadsById.values()).filter(
    (d) => d && d.state === "progressing" && !d.paused && Number(d.totalBytes) > 0
  );
  if (!active.length) {
    target.setProgressBar(-1);
    return;
  }
  const received = active.reduce((sum, d) => sum + Number(d.receivedBytes || 0), 0);
  const total = active.reduce((sum, d) => sum + Number(d.totalBytes || 0), 0);
  const ratio = total > 0 ? Math.min(1, Math.max(0, received / total)) : 0;
  target.setProgressBar(ratio);
}

function dispatchMenuCommand(command, payload) {
  const win = getActiveWindow();
  if (!win) return;
  win.webContents.send("menu:command", { command, payload });
}

function dispatchMenuCommandToWindow(win, command, payload) {
  try {
    if (!win || win.isDestroyed()) return;
    win.webContents.send("menu:command", { command, payload });
  } catch {
  }
}

const MENU_I18N = {
  en: {
    file: "File",
    edit: "Edit",
    view: "View",
    history: "History",
    settings: "Settings",
    window: "Window",
    help: "Help",
    preferencesEllipsis: "Preferences…",
    settingsEllipsis: "Settings…",
    newTab: "New Tab",
    newWindow: "New Window",
    openLocationEllipsis: "Open Location…",
    printEllipsis: "Print…",
    closeTab: "Close Tab",
    closeWindow: "Close Window",
    undo: "Undo",
    redo: "Redo",
    cut: "Cut",
    copy: "Copy",
    paste: "Paste",
    pasteAndMatchStyle: "Paste and Match Style",
    delete: "Delete",
    selectAll: "Select All",
    findInPageEllipsis: "Find in Page…",
    back: "Back",
    forward: "Forward",
    reload: "Reload",
    forceReload: "Force Reload",
    actualSize: "Actual Size",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    toggleFullscreen: "Toggle Full Screen",
    toggleDevTools: "Toggle Developer Tools",
    toggleAiAssistant: "Toggle AI Assistant",
    showHistory: "Show History",
    clearBrowsingDataEllipsis: "Clear Browsing Data…",
    learnMore: "Learn More",
    openLinkInNewTab: "Open Link in New Tab",
    openInNewTab: "Open in New Tab",
    savePageAsEllipsis: "Save Page As…",
    viewPageSource: "View Page Source",
    inspect: "Inspect",
    openLinkInNewWindow: "Open Link in New Window",
    openInNewWindow: "Open in New Window"
  },
  "zh-TW": {
    file: "檔案",
    edit: "編輯",
    view: "檢視",
    history: "歷史紀錄",
    settings: "設定",
    window: "視窗",
    help: "說明",
    preferencesEllipsis: "偏好設定…",
    settingsEllipsis: "設定…",
    newTab: "新增分頁",
    newWindow: "新增視窗",
    openLocationEllipsis: "前往網址…",
    printEllipsis: "列印…",
    closeTab: "關閉分頁",
    closeWindow: "關閉視窗",
    undo: "復原",
    redo: "重做",
    cut: "剪下",
    copy: "複製",
    paste: "貼上",
    pasteAndMatchStyle: "貼上並符合樣式",
    delete: "刪除",
    selectAll: "全選",
    findInPageEllipsis: "在頁面中尋找…",
    back: "上一頁",
    forward: "下一頁",
    reload: "重新載入",
    forceReload: "強制重新載入",
    actualSize: "實際大小",
    zoomIn: "放大",
    zoomOut: "縮小",
    toggleFullscreen: "切換全螢幕",
    toggleDevTools: "切換開發者工具",
    toggleAiAssistant: "切換 AI Assistant",
    showHistory: "顯示歷史紀錄",
    clearBrowsingDataEllipsis: "清除瀏覽資料…",
    learnMore: "了解更多",
    openLinkInNewTab: "在新分頁開啟連結",
    openInNewTab: "在新分頁開啟",
    savePageAsEllipsis: "另存網頁…",
    viewPageSource: "檢視網頁原始碼",
    inspect: "檢查",
    openLinkInNewWindow: "在新視窗開啟連結",
    openInNewWindow: "在新視窗開啟"
  },
  es: {
    file: "Archivo",
    edit: "Editar",
    view: "Ver",
    history: "Historial",
    settings: "Configuración",
    window: "Ventana",
    help: "Ayuda",
    preferencesEllipsis: "Preferencias…",
    settingsEllipsis: "Configuración…",
    newTab: "Nueva pestaña",
    newWindow: "Nueva ventana",
    openLocationEllipsis: "Abrir ubicación…",
    printEllipsis: "Imprimir…",
    closeTab: "Cerrar pestaña",
    closeWindow: "Cerrar ventana",
    undo: "Deshacer",
    redo: "Rehacer",
    cut: "Cortar",
    copy: "Copiar",
    paste: "Pegar",
    pasteAndMatchStyle: "Pegar y adaptar estilo",
    delete: "Eliminar",
    selectAll: "Seleccionar todo",
    findInPageEllipsis: "Buscar en la página…",
    back: "Atrás",
    forward: "Adelante",
    reload: "Recargar",
    forceReload: "Forzar recarga",
    actualSize: "Tamaño real",
    zoomIn: "Acercar",
    zoomOut: "Alejar",
    toggleFullscreen: "Pantalla completa",
    toggleDevTools: "Herramientas de desarrollador",
    toggleAiAssistant: "Alternar asistente de IA",
    showHistory: "Mostrar historial",
    clearBrowsingDataEllipsis: "Borrar datos de navegación…",
    learnMore: "Más información",
    openLinkInNewTab: "Abrir enlace en una pestaña nueva",
    openInNewTab: "Abrir en una pestaña nueva",
    savePageAsEllipsis: "Guardar página como…",
    viewPageSource: "Ver código fuente de la página",
    inspect: "Inspeccionar",
    openLinkInNewWindow: "Abrir enlace en una ventana nueva",
    openInNewWindow: "Abrir en una ventana nueva"
  }
};

const APP_I18N = {
  en: {
    errorOccurred: "An error occurred",
    chromePrefsNotFound:
      "Could not find Chrome Preferences file (please make sure Chrome or Chromium is installed).",
    chromePrefsReadFailed: ({ reason } = {}) => `Could not read Chrome Preferences: ${String(reason || "")}`
  },
  "zh-TW": {
    errorOccurred: "發生錯誤",
    chromePrefsNotFound: "找不到 Chrome Preferences 檔案（請確認已安裝 Chrome 或 Chromium）。",
    chromePrefsReadFailed: ({ reason } = {}) => `無法讀取 Chrome Preferences：${String(reason || "")}`
  },
  es: {
    errorOccurred: "Se produjo un error",
    chromePrefsNotFound:
      "No se pudo encontrar el archivo de preferencias de Chrome (asegúrate de que Chrome o Chromium esté instalado).",
    chromePrefsReadFailed: ({ reason } = {}) => `No se pudieron leer las preferencias de Chrome: ${String(reason || "")}`
  }
};

function tMenu(key) {
  const lang = SUPPORTED_UI_LANGUAGES.includes(currentUiLanguage) ? currentUiLanguage : "en";
  return MENU_I18N[lang]?.[key] || MENU_I18N.en[key] || String(key);
}

function tApp(key, params) {
  const lang = SUPPORTED_UI_LANGUAGES.includes(currentUiLanguage) ? currentUiLanguage : "en";
  const dict = APP_I18N[lang] || APP_I18N.en;
  const fallback = APP_I18N.en;
  const value = dict?.[key] ?? fallback?.[key] ?? String(key);
  if (typeof value === "function") return value(params || {});
  return String(value);
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
                label: tMenu("preferencesEllipsis"),
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
      label: tMenu("file"),
      submenu: [
        {
          label: tMenu("newTab"),
          accelerator: "CmdOrCtrl+T",
          click: () => dispatchMenuCommand("newTab")
        },
        {
          label: tMenu("newWindow"),
          accelerator: "CmdOrCtrl+N",
          click: () => createWindow()
        },
        { type: "separator" },
        {
          label: tMenu("openLocationEllipsis"),
          accelerator: "CmdOrCtrl+L",
          click: () => dispatchMenuCommand("focusAddressBar")
        },
        {
          label: tMenu("printEllipsis"),
          accelerator: "CmdOrCtrl+P",
          click: () => dispatchMenuCommand("print")
        },
        { type: "separator" },
        {
          label: tMenu("closeTab"),
          accelerator: "CmdOrCtrl+W",
          click: () => dispatchMenuCommand("closeTab")
        },
        {
          label: tMenu("closeWindow"),
          accelerator: isMac ? "Shift+Command+W" : "Alt+F4",
          click: () => getActiveWindow()?.close()
        },
        ...(isMac ? [] : [{ type: "separator" }, { role: "quit" }])
      ]
    },
    {
      label: tMenu("edit"),
      submenu: [
        { label: tMenu("undo"), role: "undo" },
        { label: tMenu("redo"), role: "redo" },
        { type: "separator" },
        { label: tMenu("cut"), role: "cut" },
        { label: tMenu("copy"), role: "copy" },
        { label: tMenu("paste"), role: "paste" },
        ...(isMac ? [{ label: tMenu("pasteAndMatchStyle"), role: "pasteAndMatchStyle" }] : []),
        { label: tMenu("delete"), role: "delete" },
        { label: tMenu("selectAll"), role: "selectAll" },
        { type: "separator" },
        {
          label: tMenu("findInPageEllipsis"),
          accelerator: "CmdOrCtrl+F",
          click: () => dispatchMenuCommand("findInPage")
        }
      ]
    },
    {
      label: tMenu("view"),
      submenu: [
        {
          label: tMenu("back"),
          accelerator: isMac ? "Command+[" : "Alt+Left",
          click: () => dispatchMenuCommand("goBack")
        },
        {
          label: tMenu("forward"),
          accelerator: isMac ? "Command+]" : "Alt+Right",
          click: () => dispatchMenuCommand("goForward")
        },
        { type: "separator" },
        {
          label: tMenu("reload"),
          accelerator: "CmdOrCtrl+R",
          click: () => dispatchMenuCommand("reload")
        },
        {
          label: tMenu("forceReload"),
          accelerator: "Shift+CmdOrCtrl+R",
          click: () => dispatchMenuCommand("forceReload")
        },
        { type: "separator" },
        {
          label: tMenu("actualSize"),
          accelerator: "CmdOrCtrl+0",
          click: () => dispatchMenuCommand("zoomReset")
        },
        {
          label: tMenu("zoomIn"),
          accelerator: "CmdOrCtrl+=",
          click: () => dispatchMenuCommand("zoomIn")
        },
        {
          label: tMenu("zoomOut"),
          accelerator: "CmdOrCtrl+-",
          click: () => dispatchMenuCommand("zoomOut")
        },
        { type: "separator" },
        { label: tMenu("toggleFullscreen"), role: "togglefullscreen" },
        { label: tMenu("toggleDevTools"), role: "toggleDevTools" },
        { type: "separator" },
        {
          label: tMenu("toggleAiAssistant"),
          accelerator: "CmdOrCtrl+Shift+A",
          click: () => dispatchMenuCommand("toggleAiAssistant")
        }
      ]
    },
    {
      label: tMenu("history"),
      submenu: [
        {
          label: tMenu("showHistory"),
          accelerator: "CmdOrCtrl+Y",
          click: () => dispatchMenuCommand("openHistory")
        },
        {
          label: tMenu("clearBrowsingDataEllipsis"),
          accelerator: "Shift+CmdOrCtrl+Delete",
          click: () => dispatchMenuCommand("clearHistory")
        }
      ]
    },
    ...(isMac
      ? []
      : [
          {
            label: tMenu("settings"),
            submenu: [
              {
                label: tMenu("preferencesEllipsis"),
                accelerator: "CmdOrCtrl+,",
                click: () => dispatchMenuCommand("openSettings")
              }
            ]
          }
        ]),
    {
      label: tMenu("window"),
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        ...(isMac
          ? [{ type: "separator" }, { role: "front" }]
          : [
              { type: "separator" },
              {
                label: tMenu("closeWindow"),
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
          label: tMenu("learnMore"),
          click: () => shell.openExternal("https://www.electronjs.org")
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function sanitizeFilename(input) {
  const text = String(input || "").trim();
  if (!text) return "page";
  const cleaned = text.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, " ").trim();
  return cleaned.slice(0, 80) || "page";
}

function getHostWindowForContents(contents) {
  try {
    const host = contents?.hostWebContents || contents;
    return BrowserWindow.fromWebContents(host) || BrowserWindow.fromWebContents(contents) || getActiveWindow() || mainWindow;
  } catch {
    return getActiveWindow() || mainWindow;
  }
}

async function saveWebContentsPageAs(contents) {
  const win = getHostWindowForContents(contents);
  try {
    const pageUrl = String(contents?.getURL?.() || "").trim();
    const title = String(contents?.getTitle?.() || "").trim();
    let baseName = title;
    if (!baseName && pageUrl) {
      try {
        const u = new URL(pageUrl);
        baseName = u.hostname || "page";
      } catch {
        baseName = "page";
      }
    }
    const defaultName = `${sanitizeFilename(baseName)}.html`;
    const defaultPath = path.join(app.getPath("downloads"), defaultName);
    const saveOptions = {
      title: tMenu("savePageAsEllipsis"),
      defaultPath,
      filters: [{ name: "Webpage", extensions: ["html", "htm"] }]
    };
    const res = win ? await dialog.showSaveDialog(win, saveOptions) : await dialog.showSaveDialog(saveOptions);
    if (res.canceled || !res.filePath) return;
    const ext = path.extname(res.filePath);
    const filePath = ext ? res.filePath : `${res.filePath}.html`;

    if (contents.savePage.length >= 3) {
      await new Promise((resolve, reject) => {
        contents.savePage(filePath, "HTMLComplete", (err) => (err ? reject(err) : resolve()));
      });
    } else {
      await contents.savePage(filePath, "HTMLComplete");
    }
  } catch (err) {
    try {
      const opts = {
        type: "error",
        title: APP_DISPLAY_NAME,
        message: tApp("errorOccurred"),
        detail: String(err?.message || err)
      };
      if (win) await dialog.showMessageBox(win, opts);
      else await dialog.showMessageBox(opts);
    } catch {
    }
  }
}

function attachWebviewContextMenu(contents) {
  try {
    contents.on("context-menu", (event, params) => {
      if (typeof event?.preventDefault === "function") event.preventDefault();

      const win = getHostWindowForContents(contents);
      const linkUrl = String(params?.linkURL || "").trim();
      const pageUrl = String(params?.pageURL || contents.getURL?.() || "").trim();
      const canCopy = Boolean(params?.editFlags?.canCopy);

      const template = [];
      if (linkUrl) {
        template.push({
          label: tMenu("openLinkInNewTab"),
          click: () => dispatchMenuCommandToWindow(win, "openUrlInNewTab", { url: linkUrl })
        });
        template.push({
          label: tMenu("openLinkInNewWindow"),
          click: () => createWindow({ initialUrl: linkUrl })
        });
      } else {
        template.push({ label: tMenu("newTab"), click: () => dispatchMenuCommandToWindow(win, "newTab") });
        if (pageUrl) {
          template.push({
            label: tMenu("openInNewWindow"),
            click: () => createWindow({ initialUrl: pageUrl })
          });
        } else {
          template.push({ label: tMenu("openInNewWindow"), click: () => createWindow() });
        }
      }
      template.push({ type: "separator" });

      template.push({
        label: tMenu("savePageAsEllipsis"),
        click: () => saveWebContentsPageAs(contents)
      });
      template.push({
        label: tMenu("copy"),
        enabled: canCopy,
        click: () => {
          try {
            contents.copy();
          } catch {
          }
        }
      });
      template.push({
        label: tMenu("viewPageSource"),
        enabled: Boolean(pageUrl),
        click: () => {
          if (!pageUrl) return;
          dispatchMenuCommandToWindow(win, "openUrlInNewTab", { url: `view-source:${pageUrl}` });
        }
      });
      template.push({ type: "separator" });
      template.push({
        label: tMenu("inspect"),
        click: () => {
          try {
            contents.openDevTools({ mode: "detach" });
          } catch {
          }
          try {
            contents.inspectElement(Number(params?.x) || 0, Number(params?.y) || 0);
          } catch {
          }
        }
      });

      const menu = Menu.buildFromTemplate(template);
      if (win) menu.popup({ window: win });
      else menu.popup();
    });
  } catch {
  }
}

function attachWebviewWindowOpenToTabs(contents) {
  if (!contents || typeof contents.setWindowOpenHandler !== "function") return;
  try {
    contents.setWindowOpenHandler((details) => {
      try {
        const url = String(details?.url || "").trim();
        if (!url) return { action: "deny" };
        const win = getHostWindowForContents(contents);
        if (/^https?:\/\//i.test(url) || /^(about|file|chrome|view-source):/i.test(url)) {
          dispatchMenuCommandToWindow(win, "openUrlInNewTab", { url });
        } else {
          shell.openExternal(url).catch(() => {});
        }
      } catch {
      }
      return { action: "deny" };
    });
  } catch {
  }
}

app.on("web-contents-created", (_event, contents) => {
  try {
    if (contents?.getType?.() !== "webview") return;
    attachWebviewContextMenu(contents);
    attachWebviewWindowOpenToTabs(contents);
  } catch {
  }
});

app.whenReady().then(async () => {
  const settings = await loadSettings();
  currentUiLanguage = resolveUiLanguage(settings?.browser?.language || getOsLocale());
  await trySetAppDockIcon();
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
const DEFAULT_USER_AGENT_NAME = "stingtaoAI";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_GEMINI_VOICE_MODEL = "gemini-2.5-flash-lite";
const DEFAULT_GEMINI_LIVE_VOICE_MODEL = "gemini-2.5-flash-native-audio-preview-12-2025";
const DEFAULT_OPENAI_COMPAT_BASE_URL = "http://127.0.0.1:11434/v1";
const DEFAULT_OPENAI_COMPAT_MODEL = "";
const GEMINI_LIVE_VOICE_MODELS = [DEFAULT_GEMINI_LIVE_VOICE_MODEL];
const GEMINI_LIVE_AUDIO_MIME_TYPE = "audio/pcm;rate=16000";
const GEMINI_LIVE_WS_ENDPOINT =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";
const GEMINI_MODELS = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-preview-09-2025",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash-lite-preview-09-2025",
  "gemini-2.5-flash-native-audio-preview-12-2025",
  "gemini-2.5-flash-preview-tts"
];
const GEMINI_VOICE_MODELS = GEMINI_MODELS.filter((m) => m !== "gemini-2.5-flash-preview-tts");

const GEMINI_AUDIO_MIME_TYPES = new Set([
  "audio/wav",
  "audio/wave",
  "audio/mpeg",
  "audio/webm",
  "audio/ogg",
  "audio/mp4"
]);

function log(...args) {
  console.log("[sting-ai]", ...args);
}

let playwrightBrowser = null;
let playwrightBrowserPromise = null;

function getCdpEndpointUrl() {
  return `http://${CDP_ADDRESS}:${CDP_PORT}`;
}

async function getPlaywrightBrowser() {
  if (!CDP_ENABLED) throw new Error("CDP is disabled (set STING_CDP_ENABLE=1)");
  if (playwrightBrowser) return playwrightBrowser;
  if (!playwrightBrowserPromise) {
    playwrightBrowserPromise = (async () => {
      const endpoint = getCdpEndpointUrl();
      const browser = await chromium.connectOverCDP(endpoint);
      playwrightBrowser = browser;
      try {
        browser.on("disconnected", () => {
          playwrightBrowser = null;
        });
      } catch {
      }
      return browser;
    })().finally(() => {
      playwrightBrowserPromise = null;
    });
  }
  return playwrightBrowserPromise;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withBrowserCdpSession(handler) {
  const browser = await getPlaywrightBrowser();
  const cdp = await browser.newBrowserCDPSession();
  try {
    return await handler(cdp);
  } finally {
    try {
      await cdp.detach();
    } catch {
    }
  }
}

function removeListenerSafe(emitter, event, listener) {
  try {
    if (typeof emitter?.off === "function") emitter.off(event, listener);
    else if (typeof emitter?.removeListener === "function") emitter.removeListener(event, listener);
  } catch {
  }
}

function createCdpTargetMessenger(cdp) {
  let nextId = 1;
  const pending = new Map();

  const onMessage = (evt) => {
    const messageText = String(evt?.message || "");
    if (!messageText) return;
    let msg;
    try {
      msg = JSON.parse(messageText);
    } catch {
      return;
    }
    const id = msg?.id;
    if (typeof id !== "number") return;
    const entry = pending.get(id);
    if (!entry) return;
    pending.delete(id);
    clearTimeout(entry.timer);
    if (msg?.error) {
      const err = msg.error;
      entry.reject(new Error(String(err?.message || err?.data || JSON.stringify(err))));
      return;
    }
    entry.resolve(msg?.result);
  };

  cdp.on("Target.receivedMessageFromTarget", onMessage);

  const sendToTarget = async (sessionId, method, params, { timeoutMs = 12_000 } = {}) => {
    const sid = String(sessionId || "").trim();
    if (!sid) throw new Error("Missing CDP sessionId");
    const id = nextId++;
    const message = JSON.stringify({ id, method, params: params || {} });

    const resultPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`CDP target call timed out: ${method}`));
      }, timeoutMs);
      pending.set(id, { resolve, reject, timer });
    });

    await cdp.send("Target.sendMessageToTarget", { sessionId: sid, message });
    return resultPromise;
  };

  const dispose = () => {
    removeListenerSafe(cdp, "Target.receivedMessageFromTarget", onMessage);
    for (const entry of pending.values()) {
      clearTimeout(entry.timer);
      try {
        entry.reject(new Error("CDP session disposed"));
      } catch {
      }
    }
    pending.clear();
  };

  return { sendToTarget, dispose };
}

async function cdpEvalValue(sendToTarget, sessionId, expression, { timeoutMs = 12_000 } = {}) {
  const res = await sendToTarget(
    sessionId,
    "Runtime.evaluate",
    {
      expression: String(expression || ""),
      returnByValue: true,
      awaitPromise: true,
      userGesture: true
    },
    { timeoutMs }
  );
  if (res?.exceptionDetails) {
    const text = String(res.exceptionDetails?.text || res.exceptionDetails?.exception?.description || "Evaluation failed");
    throw new Error(text);
  }
  return res?.result?.value;
}

async function findWebviewTargetInfo({ cdp, sendToTarget }, { marker, url, title } = {}) {
  const { targetInfos } = await cdp.send("Target.getTargets");
  const webviews = (Array.isArray(targetInfos) ? targetInfos : [])
    .filter((t) => t && t.type === "webview" && typeof t.targetId === "string");

  if (!webviews.length) {
    throw new Error("No webview targets found via CDP (make sure a tab is open).");
  }

  const wantUrl = String(url || "").trim();
  const wantTitle = String(title || "").trim();
  const wantMarker = String(marker || "").trim();

  const byUrl = wantUrl ? webviews.filter((t) => String(t.url || "") === wantUrl) : [];
  if (byUrl.length === 1) return byUrl[0];

  if (wantTitle) {
    const matchTitle = (byUrl.length ? byUrl : webviews).find((t) => String(t.title || "") === wantTitle);
    if (matchTitle) return matchTitle;
  }

  if (wantMarker) {
    const toCheck = (byUrl.length ? byUrl : webviews).slice(0, 20);
    for (const t of toCheck) {
      let sessionId = "";
      try {
        const attached = await cdp.send("Target.attachToTarget", { targetId: t.targetId });
        sessionId = String(attached?.sessionId || "");
        if (!sessionId) continue;
        await sendToTarget(sessionId, "Runtime.enable", {}, { timeoutMs: 4_000 });
        const value = await cdpEvalValue(sendToTarget, sessionId, "(() => window.__stingAgentMarker || \"\")()", {
          timeoutMs: 4_000
        });
        if (String(value || "") === wantMarker) return t;
      } catch {
        // ignore and continue
      } finally {
        if (sessionId) {
          try {
            await cdp.send("Target.detachFromTarget", { sessionId });
          } catch {
          }
        }
      }
    }
  }

  if (byUrl.length > 1) return byUrl[0];
  if (webviews.length === 1) return webviews[0];

  const sample = webviews
    .slice(0, 6)
    .map((t) => `- ${String(t.title || "").trim() || "(untitled)"} :: ${String(t.url || "").trim()}`)
    .join("\n");
  throw new Error(`Target webview not found.\nAvailable webviews:\n${sample}`);
}

async function withWebviewTargetSession({ marker, url, title } = {}, handler) {
  return withBrowserCdpSession(async (cdp) => {
    const messenger = createCdpTargetMessenger(cdp);
    try {
      const targetInfo = await findWebviewTargetInfo(
        { cdp, sendToTarget: messenger.sendToTarget },
        { marker, url, title }
      );
      const attached = await cdp.send("Target.attachToTarget", { targetId: targetInfo.targetId });
      const sessionId = String(attached?.sessionId || "");
      if (!sessionId) throw new Error("Failed to attach to target");
      try {
        await messenger.sendToTarget(sessionId, "Runtime.enable", {}, { timeoutMs: 4_000 });
        await messenger.sendToTarget(sessionId, "Page.enable", {}, { timeoutMs: 4_000 });
        return await handler({ cdp, sessionId, targetInfo, sendToTarget: messenger.sendToTarget });
      } finally {
        try {
          await cdp.send("Target.detachFromTarget", { sessionId });
        } catch {
        }
      }
    } finally {
      messenger.dispose();
    }
  });
}

const CDP_SNAPSHOT_EXPRESSION = `(() => {
  const clean = (s) => String(s || "").replace(/\\s+/g, " ").trim();
  const toRect = (el) => {
    try {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    } catch {
      return null;
    }
  };
  const isVisible = (el) => {
    try {
      const style = window.getComputedStyle(el);
      if (!style) return false;
      if (style.visibility === "hidden" || style.display === "none") return false;
      const rect = el.getBoundingClientRect();
      if (!rect || rect.width < 4 || rect.height < 4) return false;
      if (rect.bottom < 0 || rect.right < 0) return false;
      if (rect.top > (window.innerHeight || 0) || rect.left > (window.innerWidth || 0)) return false;
      return true;
    } catch {
      return false;
    }
  };

  try {
    document.querySelectorAll("[data-sting-agent-id]").forEach((el) => el.removeAttribute("data-sting-agent-id"));
  } catch {
  }

  const candidates = Array.from(
    document.querySelectorAll(
      "a,button,input,textarea,select,[role=\\"button\\"],[role=\\"link\\"],[onclick],[contenteditable=\\"true\\"]"
    )
  );

  const elements = [];
  let nextId = 1;
  for (const el of candidates) {
    if (!isVisible(el)) continue;
    const id = String(nextId++);
    try {
      el.setAttribute("data-sting-agent-id", id);
    } catch {
      continue;
    }

    const tag = String(el.tagName || "").toLowerCase();
    const role = clean(el.getAttribute && el.getAttribute("role"));
    const text = clean(el.innerText || el.textContent);
    const ariaLabel = clean(el.getAttribute && el.getAttribute("aria-label"));
    const placeholder = clean(el.getAttribute && el.getAttribute("placeholder"));
    const name = clean(el.getAttribute && el.getAttribute("name"));
    const type = clean(el.getAttribute && el.getAttribute("type"));
    const href = tag === "a" ? clean(el.getAttribute && el.getAttribute("href")) : "";
    const value = tag === "input" || tag === "textarea" ? clean(el.value) : "";
    elements.push({
      id,
      tag,
      role,
      text: text.slice(0, 120),
      ariaLabel: ariaLabel.slice(0, 120),
      placeholder: placeholder.slice(0, 120),
      name: name.slice(0, 80),
      type: type.slice(0, 40),
      href: href.slice(0, 300),
      value: value.slice(0, 120),
      rect: toRect(el)
    });
    if (elements.length >= 120) break;
  }

  let visibleText = "";
  try {
    visibleText = clean(document.body && document.body.innerText ? document.body.innerText : "");
  } catch {
    visibleText = "";
  }

  return {
    url: String(location.href || ""),
    title: clean(document.title || ""),
    viewport: { w: Number(window.innerWidth) || 0, h: Number(window.innerHeight) || 0 },
    scroll: { x: Number(window.scrollX) || 0, y: Number(window.scrollY) || 0 },
    elements,
    visibleText: visibleText.slice(0, 4000)
  };
})()`;

async function agentSnapshot({ url, title, marker } = {}) {
  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    return cdpEvalValue(sendToTarget, sessionId, CDP_SNAPSHOT_EXPRESSION, { timeoutMs: 15_000 });
  });
}

async function agentClick({ url, title, marker, elementId } = {}) {
  const id = String(elementId || "").trim();
  if (!id) throw new Error("Missing elementId");
  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    const expr = `(() => {
      const id = ${JSON.stringify(id)};
      const sel = '[data-sting-agent-id=\"' + id + '\"]';
      const el = document.querySelector(sel);
      if (!el) return { ok: false, error: 'Element not found: ' + id };
      try { el.scrollIntoView({ block: 'center', inline: 'center' }); } catch {}
      try { el.focus && el.focus(); } catch {}
      try { el.click(); return { ok: true }; } catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
    })()`;
    const res = await cdpEvalValue(sendToTarget, sessionId, expr, { timeoutMs: 15_000 });
    if (!res || res.ok !== true) throw new Error(String(res?.error || "Click failed"));
    return { ok: true };
  });
}

async function agentType({ url, title, marker, elementId, text } = {}) {
  const id = String(elementId || "").trim();
  if (!id) throw new Error("Missing elementId");
  const value = String(text ?? "");
  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    const expr = `(() => {
      const id = ${JSON.stringify(id)};
      const text = ${JSON.stringify(value)};
      const sel = '[data-sting-agent-id=\"' + id + '\"]';
      const el = document.querySelector(sel);
      if (!el) return { ok: false, error: 'Element not found: ' + id };
      try { el.scrollIntoView({ block: 'center', inline: 'center' }); } catch {}
      try { el.focus && el.focus(); } catch {}

      const setValue = (node, v) => {
        try {
          const proto = Object.getPrototypeOf(node);
          const desc = proto ? Object.getOwnPropertyDescriptor(proto, 'value') : null;
          if (desc && typeof desc.set === 'function') { desc.set.call(node, v); return true; }
        } catch {}
        try { node.value = v; return true; } catch {}
        return false;
      };

      try {
        if (el.isContentEditable) {
          el.textContent = text;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          return { ok: true };
        }
        if ('value' in el) {
          if (!setValue(el, text)) return { ok: false, error: 'Failed to set value' };
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          return { ok: true };
        }
        return { ok: false, error: 'Element is not writable' };
      } catch (err) {
        return { ok: false, error: String(err && err.message ? err.message : err) };
      }
    })()`;
    const res = await cdpEvalValue(sendToTarget, sessionId, expr, { timeoutMs: 15_000 });
    if (!res || res.ok !== true) throw new Error(String(res?.error || "Type failed"));
    return { ok: true };
  });
}

function normalizePressKey(rawKey) {
  const key = String(rawKey || "").trim();
  if (!key) return null;

  if (key === " ") return { key: " ", code: "Space", vk: 32 };

  const normalized = key.replace(/[\s_-]+/g, "").toLowerCase();
  const map = {
    enter: { key: "Enter", code: "Enter", vk: 13 },
    tab: { key: "Tab", code: "Tab", vk: 9 },
    esc: { key: "Escape", code: "Escape", vk: 27 },
    escape: { key: "Escape", code: "Escape", vk: 27 },
    backspace: { key: "Backspace", code: "Backspace", vk: 8 },
    delete: { key: "Delete", code: "Delete", vk: 46 },
    del: { key: "Delete", code: "Delete", vk: 46 },
    pageup: { key: "PageUp", code: "PageUp", vk: 33 },
    pgup: { key: "PageUp", code: "PageUp", vk: 33 },
    pagedown: { key: "PageDown", code: "PageDown", vk: 34 },
    pgdown: { key: "PageDown", code: "PageDown", vk: 34 },
    pgdn: { key: "PageDown", code: "PageDown", vk: 34 },
    home: { key: "Home", code: "Home", vk: 36 },
    end: { key: "End", code: "End", vk: 35 },
    arrowdown: { key: "ArrowDown", code: "ArrowDown", vk: 40 },
    down: { key: "ArrowDown", code: "ArrowDown", vk: 40 },
    arrowup: { key: "ArrowUp", code: "ArrowUp", vk: 38 },
    up: { key: "ArrowUp", code: "ArrowUp", vk: 38 },
    arrowleft: { key: "ArrowLeft", code: "ArrowLeft", vk: 37 },
    left: { key: "ArrowLeft", code: "ArrowLeft", vk: 37 },
    arrowright: { key: "ArrowRight", code: "ArrowRight", vk: 39 },
    right: { key: "ArrowRight", code: "ArrowRight", vk: 39 },
    space: { key: " ", code: "Space", vk: 32 },
    spacebar: { key: " ", code: "Space", vk: 32 }
  };
  return map[normalized] || null;
}

async function agentPress({ url, title, marker, key } = {}) {
  const info = normalizePressKey(key);
  if (!info) {
    throw new Error(
      "Unsupported key (supported: Enter, Tab, Escape, Backspace, Delete, PageUp, PageDown, Home, End, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Space)."
    );
  }
  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    const scrollStateExpr = `(() => {
      const se = document.scrollingElement || document.documentElement || document.body;
      return {
        x: Number(se && se.scrollLeft ? se.scrollLeft : 0) || 0,
        y: Number(se && se.scrollTop ? se.scrollTop : 0) || 0,
        vh: Number(window.innerHeight) || 0,
        sh: Number(se && se.scrollHeight ? se.scrollHeight : 0) || 0
      };
    })()`;

    const base = {
      key: info.key,
      code: info.code,
      windowsVirtualKeyCode: info.vk,
      nativeVirtualKeyCode: info.vk
    };
    const isScrollKey = ["PageDown", "PageUp", "Home", "End", "Space"].includes(info.code);
    const beforeScroll = isScrollKey ? await cdpEvalValue(sendToTarget, sessionId, scrollStateExpr, { timeoutMs: 3_000 }) : null;

    try {
      await cdpEvalValue(
        sendToTarget,
        sessionId,
        "(() => { try { window.focus(); } catch {} try { document.body && document.body.focus && document.body.focus(); } catch {} return true; })()",
        { timeoutMs: 2_000 }
      );
    } catch {
    }

    try {
      await sendToTarget(sessionId, "Input.dispatchKeyEvent", { type: "rawKeyDown", ...base }, { timeoutMs: 8_000 });
      await sendToTarget(sessionId, "Input.dispatchKeyEvent", { type: "keyUp", ...base }, { timeoutMs: 8_000 });
    } catch {
      // Some CDP targets (e.g. webview) may ignore Input events; scroll fallback below.
    }

    if (isScrollKey) {
      await delay(80);
      const afterScroll = await cdpEvalValue(sendToTarget, sessionId, scrollStateExpr, { timeoutMs: 3_000 });
      if (beforeScroll && afterScroll && Number(beforeScroll.y) === Number(afterScroll.y)) {
        const code = info.code;
        const fallbackExpr = `(() => {
          const isScrollable = (el) => {
            if (!el) return false;
            const ch = Number(el.clientHeight) || 0;
            const sh = Number(el.scrollHeight) || 0;
            if (sh <= ch + 4) return false;
            try {
              const style = window.getComputedStyle(el);
              const oy = String(style && style.overflowY ? style.overflowY : "");
              if (oy === "auto" || oy === "scroll") return true;
            } catch {
            }
            return el === document.scrollingElement || el === document.documentElement || el === document.body;
          };
          const pickScrollable = () => {
            const root = document.scrollingElement || document.documentElement || document.body;
            if (isScrollable(root)) return root;
            const x = Math.floor((Number(window.innerWidth) || 0) / 2);
            const y = Math.floor((Number(window.innerHeight) || 0) / 2);
            let el = null;
            try { el = document.elementFromPoint(x, y); } catch { el = null; }
            while (el) {
              if (isScrollable(el)) return el;
              el = el.parentElement;
            }
            return root;
          };
          const se = pickScrollable();
          const beforeY = Number(se && se.scrollTop ? se.scrollTop : 0) || 0;
          const vh = Number(window.innerHeight) || 800;
          const sh = Number(se && se.scrollHeight ? se.scrollHeight : 0) || 0;
          const maxY = Math.max(0, sh - vh);
          const clamp = (v) => Math.min(Math.max(Number(v) || 0, 0), maxY);
          const code = ${JSON.stringify(code)};
          let nextY = beforeY;
          if (code === "Home") nextY = 0;
          else if (code === "End") nextY = maxY;
          else if (code === "PageDown") nextY = beforeY + Math.max(200, Math.round(vh * 0.85));
          else if (code === "PageUp") nextY = beforeY - Math.max(200, Math.round(vh * 0.85));
          else if (code === "Space") nextY = beforeY + Math.max(200, Math.round(vh * 0.75));
          try { se.scrollTop = clamp(nextY); } catch {}
          const afterY = Number(se && se.scrollTop ? se.scrollTop : 0) || 0;
          return { ok: true, beforeY, afterY };
        })()`;
        try {
          await cdpEvalValue(sendToTarget, sessionId, fallbackExpr, { timeoutMs: 6_000 });
        } catch {
        }
      }
    }
    return { ok: true };
  });
}

async function agentNavigate({ url, title, marker, toUrl } = {}) {
  const next = String(toUrl || "").trim();
  if (!next) throw new Error("Missing url");
  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    await sendToTarget(sessionId, "Page.navigate", { url: next }, { timeoutMs: 15_000 });
    return { ok: true };
  });
}

async function agentWaitForLoad({ url, title, marker, state } = {}) {
  const s = String(state || "networkidle").trim().toLowerCase();
  const desired = s === "domcontentloaded" ? "domcontentloaded" : s === "load" ? "load" : "networkidle";
  const timeoutMs = 20_000;

  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const readyState = await cdpEvalValue(sendToTarget, sessionId, "document.readyState", { timeoutMs: 3_000 });
      const rs = String(readyState || "").toLowerCase();
      if (desired === "domcontentloaded") {
        if (rs === "interactive" || rs === "complete") return { ok: true };
      } else if (rs === "complete") {
        if (desired === "networkidle") await delay(350);
        return { ok: true };
      }
      await delay(180);
    }
    throw new Error(`Timed out waiting for load (${desired})`);
  });
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
  const defaultLanguage = resolveUiLanguage(getOsLocale());
  const next = {
    version: 1,
    hasShownChromeImportModal: false,
    browser: {
      version: 1,
      homePage: DEFAULT_HOME_PAGE,
      searchEngineTemplate: DEFAULT_SEARCH_TEMPLATE,
      startupMode: "home",
      startupUrls: [],
      theme: "light",
      language: defaultLanguage,
      userAgentName: DEFAULT_USER_AGENT_NAME
    },
    geminiModel: DEFAULT_GEMINI_MODEL,
    geminiApiKeyData: null,
    geminiApiKeyFormat: null,
    openAiBaseUrl: DEFAULT_OPENAI_COMPAT_BASE_URL,
    openAiModel: DEFAULT_OPENAI_COMPAT_MODEL,
    openAiApiKeyData: null,
    openAiApiKeyFormat: null
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
    if (typeof browser.language === "string" && browser.language.trim()) {
      next.browser.language = resolveUiLanguage(browser.language);
    }
    if (typeof browser.userAgentName === "string") {
      next.browser.userAgentName = sanitizeUserAgentName(browser.userAgentName);
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

  if (typeof raw.openAiBaseUrl === "string") {
    next.openAiBaseUrl = sanitizeOpenAiBaseUrl(raw.openAiBaseUrl);
  }
  if (typeof raw.openAiModel === "string") {
    next.openAiModel = sanitizeOpenAiModel(raw.openAiModel);
  }
  if (typeof raw.openAiApiKeyData === "string" && raw.openAiApiKeyData.trim()) {
    next.openAiApiKeyData = raw.openAiApiKeyData.trim();
  }
  if (raw.openAiApiKeyFormat === "safeStorage" || raw.openAiApiKeyFormat === "plain") {
    next.openAiApiKeyFormat = raw.openAiApiKeyFormat;
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

function sanitizeUserAgentName(value) {
  const text = String(value || "").trim();
  if (!text) return DEFAULT_USER_AGENT_NAME;
  if (text.length > 80) return DEFAULT_USER_AGENT_NAME;
  const ok = /^[A-Za-z0-9][A-Za-z0-9._-]{0,39}(?:\/[A-Za-z0-9][A-Za-z0-9._-]{0,39})?$/.test(text);
  return ok ? text : DEFAULT_USER_AGENT_NAME;
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

function sanitizeOpenAiBaseUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return DEFAULT_OPENAI_COMPAT_BASE_URL;
  if (raw.length > 400) return DEFAULT_OPENAI_COMPAT_BASE_URL;

  let urlText = raw;
  if (!/^https?:\/\//i.test(urlText)) urlText = `http://${urlText}`;

  let url;
  try {
    url = new URL(urlText);
  } catch {
    return DEFAULT_OPENAI_COMPAT_BASE_URL;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return DEFAULT_OPENAI_COMPAT_BASE_URL;
  if (url.username || url.password) return DEFAULT_OPENAI_COMPAT_BASE_URL;

  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\/+$/, "");

  return url.toString().replace(/\/+$/, "");
}

function sanitizeOpenAiModel(value) {
  const text = String(value || "").trim();
  if (!text) return DEFAULT_OPENAI_COMPAT_MODEL;
  if (text.length > 120) return DEFAULT_OPENAI_COMPAT_MODEL;
  const ok = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,119}$/.test(text);
  return ok ? text : DEFAULT_OPENAI_COMPAT_MODEL;
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
  if (typeof input.language === "string") next.language = resolveUiLanguage(input.language);
  if (typeof input.userAgentName === "string") next.userAgentName = sanitizeUserAgentName(input.userAgentName);

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
    return { ok: false, error: tApp("chromePrefsNotFound") };
  }

  let prefs;
  try {
    prefs = await readJson(prefsPath);
  } catch (err) {
    return { ok: false, error: tApp("chromePrefsReadFailed", { reason: String(err?.message || err) }) };
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

function isValidOpenAiApiKey(apiKey) {
  const key = String(apiKey || "").trim();
  if (!key) return false;
  if (key.length < 8) return false;
  if (key.length > 400) return false;
  if (/\s/.test(key)) return false;
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

function encryptOpenAiApiKey(apiKey) {
  const key = String(apiKey || "").trim();
  if (!key) return { format: null, data: null };

  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(key);
    return { format: "safeStorage", data: encrypted.toString("base64") };
  }
  return { format: "plain", data: key };
}

function decryptOpenAiApiKey({ format, data }) {
  if (!data || typeof data !== "string") return null;
  if (format === "safeStorage") {
    if (!safeStorage.isEncryptionAvailable()) return null;
    try {
      return safeStorage.decryptString(Buffer.from(data, "base64"));
    } catch (err) {
      log("failed to decrypt openai api key:", err?.message || err);
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

async function getOpenAiApiKey() {
  const settings = await loadSettings();
  const stored = decryptOpenAiApiKey({
    format: settings.openAiApiKeyFormat,
    data: settings.openAiApiKeyData
  });
  if (stored) return stored;
  return process.env.OPENAI_API_KEY || null;
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

async function ollamaChat({ model, messages, format }) {
  const body = { model, messages, stream: false };
  const fmt = typeof format === "string" ? format.trim() : "";
  if (fmt) body.format = fmt;
  const res = await fetch("http://127.0.0.1:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
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

function buildOpenAiCompatibleChatCompletionsUrl(baseUrl) {
  const raw = String(baseUrl || "").trim();
  const sanitized = raw ? sanitizeOpenAiBaseUrl(raw) : DEFAULT_OPENAI_COMPAT_BASE_URL;
  const withScheme = /^https?:\/\//i.test(sanitized) ? sanitized : `http://${sanitized}`;
  const url = new URL(withScheme);
  const basePath = url.pathname.replace(/\/+$/, "");
  const needsV1 = !basePath.endsWith("/v1");
  url.pathname = `${needsV1 ? `${basePath}/v1` : basePath}/chat/completions`;
  url.hash = "";
  url.search = "";
  return url.toString();
}

async function openAiCompatibleChat({ baseUrl, apiKey, model, messages }) {
  const modelName = String(model || "").trim();
  if (!modelName) throw new Error("OpenAI-compatible model not set");

  const url = buildOpenAiCompatibleChatCompletionsUrl(baseUrl);
  const headers = { "Content-Type": "application/json" };
  const key = String(apiKey || "").trim();
  if (key) headers.Authorization = `Bearer ${key}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: modelName,
      messages: Array.isArray(messages) ? messages : [],
      stream: false
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `OpenAI-compatible error ${res.status}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  const text = data?.choices?.[0]?.text;
  if (typeof text === "string") return text;
  return "";
}

function isAllowedGeminiAudioMimeType(mimeType) {
  const key = String(mimeType || "").trim().toLowerCase();
  if (!key) return false;
  return GEMINI_AUDIO_MIME_TYPES.has(key);
}

async function geminiTranscribeAudio({ model, mimeType, dataBase64 }) {
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
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "Transcribe this audio to plain text. Return only the transcript (no Markdown, no extra commentary)."
            },
            { inline_data: { mime_type: mimeType, data: dataBase64 } }
          ]
        }
      ]
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Gemini error ${res.status}`);
  }
  const json = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p) => p.text).join("").trim();
}

function safeWsMessageToString(data) {
  try {
    if (typeof data === "string") return data;
    if (data instanceof ArrayBuffer) return Buffer.from(data).toString("utf8");
    if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString("utf8");
    if (data && typeof data.text === "function") return String(data.text());
    return Buffer.from(data).toString("utf8");
  } catch {
    try {
      return String(data);
    } catch {
      return "";
    }
  }
}

function normalizeGeminiLiveModel(raw) {
  const model = String(raw || "").trim();
  if (!model) return DEFAULT_GEMINI_LIVE_VOICE_MODEL;
  if (model.startsWith("models/")) return model.slice("models/".length);
  return model;
}

function toGeminiModelResourceName(model) {
  const key = String(model || "").trim();
  if (!key) return `models/${DEFAULT_GEMINI_LIVE_VOICE_MODEL}`;
  return key.startsWith("models/") ? key : `models/${key}`;
}

function isPcm16MimeType(mimeType) {
  const key = String(mimeType || "").trim().toLowerCase();
  return key === GEMINI_LIVE_AUDIO_MIME_TYPE;
}

const liveVoiceSessionsByWebContents = new Map();

class GeminiLiveVoiceSession {
  constructor({ webContents, apiKey, model }) {
    this.webContents = webContents;
    this.apiKey = apiKey;
    this.model = model;
    this.ws = null;
    this.ready = false;
    this.closed = false;
    this.setupPromise = null;
    this.setupPromiseResolve = null;
    this.setupPromiseReject = null;
    this.setupTimer = null;
  }

  async start() {
    if (this.setupPromise) return this.setupPromise;

    this.setupPromise = new Promise((resolve, reject) => {
      this.setupPromiseResolve = resolve;
      this.setupPromiseReject = reject;
    });

    const url = `${GEMINI_LIVE_WS_ENDPOINT}?key=${encodeURIComponent(this.apiKey)}`;
    const useDomWebSocket = typeof WebSocket !== "undefined";
    let ws;
    if (useDomWebSocket) {
      ws = new WebSocket(url);
    } else {
      let NodeWs;
      try {
        NodeWs = require("ws");
      } catch {
        throw new Error("WebSocket is not available in this runtime (missing dependency: ws).");
      }
      ws = new NodeWs(url);
    }
    this.ws = ws;
    this.closed = false;
    this.ready = false;

    const failSetup = (err) => {
      if (this.ready) return;
      const msg = String(err?.message || err || "Live session setup failed");
      try {
        this.setupPromiseReject?.(new Error(msg));
      } catch {
      }
      this._emit({ type: "error", error: msg });
      this.stop();
    };

    this.setupTimer = setTimeout(() => failSetup(new Error("Live session setup timed out")), 12_000);

	    const handleOpen = () => {
	      try {
	        const setupMsg = {
	          setup: {
	            model: toGeminiModelResourceName(this.model),
	            generationConfig: { responseModalities: ["AUDIO"] },
	            inputAudioTranscription: {}
	          }
	        };
	        ws.send(JSON.stringify(setupMsg));
	      } catch (err) {
        failSetup(err);
      }
    };

    const handleMessage = (data) => {
      const raw = safeWsMessageToString(data);
      if (!raw) return;
      let msg;
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }

      if (msg?.setupComplete) {
        clearTimeout(this.setupTimer);
        this.setupTimer = null;
        this.ready = true;
        try {
          this.setupPromiseResolve?.({ ok: true });
        } catch {
        }
        this._emit({ type: "ready" });
        return;
      }

      const inputText = msg?.serverContent?.inputTranscription?.text;
      if (typeof inputText === "string") {
        this._emit({ type: "inputTranscription", text: inputText });
      }

      if (msg?.serverContent?.turnComplete) {
        this._emit({ type: "turnComplete" });
      }

      if (msg?.goAway) {
        this._emit({ type: "goAway" });
      }
    };

    const handleError = (err) => {
      failSetup(err);
    };

    const handleClose = (evt) => {
      clearTimeout(this.setupTimer);
      this.setupTimer = null;

      const reason = String(evt?.reason || "");
      const code = Number(evt?.code);
      const clean = Boolean(evt?.wasClean);
      this._emit({ type: "closed", code, reason, clean });

      if (!this.ready) {
        try {
          this.setupPromiseReject?.(new Error(reason || "Live session closed before setup completed"));
        } catch {
        }
      }

      this.stop();
    };

    if (useDomWebSocket) {
      ws.onopen = handleOpen;
      ws.onmessage = (evt) => handleMessage(evt?.data);
      ws.onerror = (evt) => handleError(evt?.error || evt);
      ws.onclose = handleClose;
    } else if (typeof ws.on === "function") {
      ws.on("open", handleOpen);
      ws.on("message", (data) => handleMessage(data));
      ws.on("error", (err) => handleError(err));
      ws.on("close", (code, reason) => {
        handleClose({ code, reason: reason ? reason.toString() : "", wasClean: code === 1000 });
      });
    }

    return this.setupPromise;
  }

  sendAudioChunk({ dataBase64, mimeType }) {
    if (this.closed) return;
    if (!this.ws || this.ws.readyState !== 1) return;
    if (!this.ready) return;
    if (!isPcm16MimeType(mimeType)) return;
    const data = String(dataBase64 || "");
    if (!data) return;
    if (data.length > 250_000) return;
    try {
      this.ws.send(
        JSON.stringify({
          realtimeInput: {
            audio: { data, mimeType }
          }
        })
      );
    } catch {
    }
  }

  sendAudioStreamEnd() {
    if (this.closed) return;
    if (!this.ws || this.ws.readyState !== 1) return;
    if (!this.ready) return;
    try {
      this.ws.send(JSON.stringify({ realtimeInput: { audioStreamEnd: true } }));
    } catch {
    }
  }

  stop() {
    if (this.closed) return;
    this.closed = true;
    clearTimeout(this.setupTimer);
    this.setupTimer = null;

    try {
      this.ws?.close?.(1000, "client stop");
    } catch {
    }
    try {
      this.ws = null;
    } catch {
    }
    this.ready = false;

    const wcId = this.webContents?.id;
    if (typeof wcId === "number") {
      const existing = liveVoiceSessionsByWebContents.get(wcId);
      if (existing === this) liveVoiceSessionsByWebContents.delete(wcId);
    }
  }

  _emit(payload) {
    try {
      if (!this.webContents || this.webContents.isDestroyed()) return;
      this.webContents.send("ai:liveVoiceEvent", payload);
    } catch {
    }
  }
}

function stopLiveVoiceSessionForWebContents(webContents) {
  const wcId = webContents?.id;
  if (typeof wcId !== "number") return;
  const session = liveVoiceSessionsByWebContents.get(wcId);
  if (!session) return;
  session.stop();
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
      const format = typeof payload?.format === "string" ? payload.format : "";
      const text = await ollamaChat({ model, messages, format });
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
    if (provider === "openai") {
      const settings = await loadSettings();
      const baseUrl = typeof payload?.baseUrl === "string" ? payload.baseUrl : settings.openAiBaseUrl;
      const modelName = String(model || settings.openAiModel || "").trim();
      const apiKey = await getOpenAiApiKey();
      const text = await openAiCompatibleChat({ baseUrl, apiKey, model: modelName, messages });
      log("ai:generate done", Date.now() - start, "ms");
      return { ok: true, text };
    }
    return { ok: false, error: "Unknown provider" };
  } catch (err) {
    log("ai:generate error", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("ai:transcribeAudio", async (_e, payload) => {
  const start = Date.now();
  try {
    const modelRaw = String(payload?.model || "").trim();
    const model = GEMINI_VOICE_MODELS.includes(modelRaw) ? modelRaw : DEFAULT_GEMINI_VOICE_MODEL;
    const audio = payload?.audio && typeof payload.audio === "object" ? payload.audio : {};
    const mimeType = String(audio.mimeType || audio.mime_type || "").trim().toLowerCase();
    const dataBase64 = String(audio.data || "").trim();
    if (!mimeType || !isAllowedGeminiAudioMimeType(mimeType)) throw new Error("Unsupported audio mimeType");
    if (!dataBase64) throw new Error("Missing audio data");
    if (dataBase64.length > 8_000_000) throw new Error("Audio payload too large");
    log("ai:transcribeAudio start", { model, mimeType, bytes: dataBase64.length });
    const text = await geminiTranscribeAudio({ model, mimeType, dataBase64 });
    log("ai:transcribeAudio done", Date.now() - start, "ms");
    return { ok: true, text };
  } catch (err) {
    log("ai:transcribeAudio error", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("ai:liveVoiceStart", async (e, payload) => {
  const start = Date.now();
  try {
    const apiKey = await getGeminiApiKey();
    if (!apiKey) throw new Error("Gemini API Key not set. Please add it in Settings or set GEMINI_API_KEY.");

    const requestedModel = normalizeGeminiLiveModel(payload?.model);
    const model = GEMINI_LIVE_VOICE_MODELS.includes(requestedModel)
      ? requestedModel
      : DEFAULT_GEMINI_LIVE_VOICE_MODEL;
    stopLiveVoiceSessionForWebContents(e.sender);
    const session = new GeminiLiveVoiceSession({ webContents: e.sender, apiKey, model });
    liveVoiceSessionsByWebContents.set(e.sender.id, session);
    await session.start();
    log("ai:liveVoiceStart ok", Date.now() - start, "ms", { model });
    return { ok: true, model };
  } catch (err) {
    log("ai:liveVoiceStart error", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.on("ai:liveVoiceAudio", (e, payload) => {
  try {
    const wcId = e.sender?.id;
    const session = typeof wcId === "number" ? liveVoiceSessionsByWebContents.get(wcId) : null;
    if (!session) return;
    const audio = payload?.audio && typeof payload.audio === "object" ? payload.audio : {};
    let dataBase64 = "";
    if (typeof audio.data === "string" && audio.data.trim()) {
      dataBase64 = audio.data.trim();
    } else if (audio.bytes instanceof ArrayBuffer) {
      dataBase64 = Buffer.from(audio.bytes).toString("base64");
    } else if (ArrayBuffer.isView(audio.bytes)) {
      dataBase64 = Buffer.from(audio.bytes.buffer, audio.bytes.byteOffset, audio.bytes.byteLength).toString("base64");
    }
    const mimeType = String(audio.mimeType || audio.mime_type || "").trim();
    session.sendAudioChunk({ dataBase64, mimeType: mimeType || GEMINI_LIVE_AUDIO_MIME_TYPE });
  } catch {
  }
});

ipcMain.handle("ai:liveVoiceStop", async (e) => {
  try {
    const wcId = e.sender?.id;
    const session = typeof wcId === "number" ? liveVoiceSessionsByWebContents.get(wcId) : null;
    if (!session) return { ok: true };
    session.sendAudioStreamEnd();
    session.stop();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:status", async () => {
  try {
    if (!CDP_ENABLED) {
      return { ok: true, cdpEnabled: false, cdpEndpoint: getCdpEndpointUrl(), webviewsCount: 0, webviews: [] };
    }

    let webviews = [];
    await withBrowserCdpSession(async (cdp) => {
      const { targetInfos } = await cdp.send("Target.getTargets");
      webviews = (Array.isArray(targetInfos) ? targetInfos : [])
        .filter((t) => t && t.type === "webview")
        .slice(0, 6)
        .map((t) => ({ title: String(t.title || ""), url: String(t.url || ""), targetId: String(t.targetId || "") }));
    });
    return {
      ok: true,
      cdpEnabled: CDP_ENABLED,
      cdpEndpoint: getCdpEndpointUrl(),
      webviewsCount: webviews.length,
      webviews
    };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:snapshot", async (_e, payload) => {
  try {
    const snapshot = await agentSnapshot(payload || {});
    return { ok: true, snapshot };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:click", async (_e, payload) => {
  try {
    await agentClick(payload || {});
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:type", async (_e, payload) => {
  try {
    await agentType(payload || {});
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:press", async (_e, payload) => {
  try {
    await agentPress(payload || {});
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:navigate", async (_e, payload) => {
  try {
    await agentNavigate(payload || {});
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:waitForLoad", async (_e, payload) => {
  try {
    await agentWaitForLoad(payload || {});
    return { ok: true };
  } catch (err) {
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

    const openAiHasStoredKey = Boolean(settings.openAiApiKeyData);
    const openAiHasEnvKey = Boolean(process.env.OPENAI_API_KEY);
    const openAiApiKeySource = openAiHasStoredKey ? "stored" : openAiHasEnvKey ? "env" : "none";
    return {
      ok: true,
      settings: {
        geminiModel: settings.geminiModel,
        geminiApiKeySource,
        geminiApiKeyFormat: settings.geminiApiKeyFormat,
        openAiBaseUrl: settings.openAiBaseUrl,
        openAiModel: settings.openAiModel,
        openAiApiKeySource,
        openAiApiKeyFormat: settings.openAiApiKeyFormat,
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

ipcMain.handle("settings:setOpenAiBaseUrl", async (_e, baseUrl) => {
  try {
    const nextBaseUrl = sanitizeOpenAiBaseUrl(baseUrl);
    const settings = await loadSettings();
    settings.openAiBaseUrl = nextBaseUrl;
    await saveSettings(settings);
    return { ok: true, openAiBaseUrl: nextBaseUrl };
  } catch (err) {
    log("settings:setOpenAiBaseUrl error", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("settings:setOpenAiModel", async (_e, model) => {
  try {
    const nextModel = sanitizeOpenAiModel(model);
    const settings = await loadSettings();
    settings.openAiModel = nextModel;
    await saveSettings(settings);
    return { ok: true, openAiModel: nextModel };
  } catch (err) {
    log("settings:setOpenAiModel error", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("settings:setOpenAiApiKey", async (_e, apiKey) => {
  try {
    const key = String(apiKey || "").trim();
    if (!isValidOpenAiApiKey(key)) throw new Error("Invalid API key format");
    const settings = await loadSettings();
    const stored = encryptOpenAiApiKey(key);
    settings.openAiApiKeyFormat = stored.format;
    settings.openAiApiKeyData = stored.data;
    await saveSettings(settings);
    return { ok: true, encryptionAvailable: safeStorage.isEncryptionAvailable() };
  } catch (err) {
    log("settings:setOpenAiApiKey error", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("settings:clearOpenAiApiKey", async () => {
  try {
    const settings = await loadSettings();
    settings.openAiApiKeyFormat = null;
    settings.openAiApiKeyData = null;
    await saveSettings(settings);
    return { ok: true };
  } catch (err) {
    log("settings:clearOpenAiApiKey error", err?.message || err);
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
    const prevLang = resolveUiLanguage(settings?.browser?.language || getOsLocale());
    settings.browser = mergeBrowserSettings(settings.browser, browserPatch);
    await saveSettings(settings);
    const nextLang = resolveUiLanguage(settings?.browser?.language || getOsLocale());
    if (nextLang !== prevLang) {
      currentUiLanguage = nextLang;
      buildAppMenu();
    }
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
      title: APP_DISPLAY_NAME,
      message: tApp("errorOccurred"),
      detail: String(message || "")
    });
    return { ok: true };
  } catch (err) {
    log("app:showError error", err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.on("app:log", (_e, payload) => {
  try {
    const scope = String(payload?.scope || "renderer").trim().slice(0, 60) || "renderer";
    const message = String(payload?.message || "").trim().slice(0, 1600);
    let dataText = "";
    if (payload && Object.prototype.hasOwnProperty.call(payload, "data")) {
      const data = payload.data;
      try {
        dataText = typeof data === "string" ? data : JSON.stringify(data);
      } catch {
        dataText = String(data);
      }
    }
    if (dataText.length > 4000) dataText = `${dataText.slice(0, 4000)}… (truncated)`;
    if (message || dataText) {
      log(`ui:${scope}`, message, dataText);
    }
  } catch {
  }
});

ipcMain.handle("downloads:list", async () => {
  try {
    const downloads = Array.from(downloadsById.values()).sort((a, b) => Number(b.startTime) - Number(a.startTime));
    return { ok: true, downloads };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("downloads:openFolder", async () => {
  try {
    const downloadsDir = app.getPath("downloads");
    await shell.openPath(downloadsDir);
    return { ok: true, path: downloadsDir };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("downloads:openFile", async (_e, id) => {
  try {
    const key = String(id || "").trim();
    const rec = downloadsById.get(key);
    if (!rec?.savePath) throw new Error("Download not found");
    await shell.openPath(rec.savePath);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("downloads:showInFolder", async (_e, id) => {
  try {
    const key = String(id || "").trim();
    const rec = downloadsById.get(key);
    if (!rec?.savePath) throw new Error("Download not found");
    shell.showItemInFolder(rec.savePath);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("downloads:cancel", async (_e, id) => {
  try {
    const key = String(id || "").trim();
    const item = downloadItemsById.get(key);
    if (!item) return { ok: true };
    item.cancel();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});
