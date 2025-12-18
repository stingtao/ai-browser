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
  "gemini-3-flash-preview",
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

  if (wantMarker) {
    const ordered = [];
    const seen = new Set();
    for (const t of byUrl) {
      if (!t || !t.targetId || seen.has(t.targetId)) continue;
      seen.add(t.targetId);
      ordered.push(t);
    }
    for (const t of webviews) {
      if (!t || !t.targetId || seen.has(t.targetId)) continue;
      seen.add(t.targetId);
      ordered.push(t);
    }
    const toCheck = ordered.slice(0, 40);
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

  if (byUrl.length === 1) return byUrl[0];

  if (wantTitle) {
    const matchTitle = (byUrl.length ? byUrl : webviews).find((t) => String(t.title || "") === wantTitle);
    if (matchTitle) return matchTitle;
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
      if (!rect || rect.width < 2 || rect.height < 2) return false;
      if (rect.bottom < 0 || rect.right < 0) return false;
      if (rect.top > (window.innerHeight || 0) || rect.left > (window.innerWidth || 0)) return false;
      return true;
    } catch {
      return false;
    }
  };

  const vw = Number(window.innerWidth) || 0;
  const vh = Number(window.innerHeight) || 0;
  const cx0 = vw / 2;
  const cy0 = vh / 2;

  const candidateSet = new Set();
  const addEl = (el) => {
    try {
      if (el && el.nodeType === 1) candidateSet.add(el);
    } catch {
    }
  };
  const addAncestors = (el) => {
    let cur = el;
    let depth = 0;
    while (cur && depth < 22) {
      addEl(cur);
      try {
        cur = cur.parentElement;
      } catch {
        cur = null;
      }
      depth++;
    }
  };

  const addQuery = (sel, limit) => {
    try {
      const nodes = document.querySelectorAll(sel);
      let count = 0;
      for (const el of nodes) {
        addEl(el);
        count++;
        if (limit && count >= limit) break;
      }
    } catch {
    }
  };

  // Sample elements that are actually on top in the viewport (helps with canvas-heavy apps like Google Slides).
  try {
    const cols = 6;
    const rows = 6;
    for (let xi = 1; xi < cols; xi++) {
      for (let yi = 1; yi < rows; yi++) {
        const x = Math.floor((xi / cols) * vw);
        const y = Math.floor((yi / rows) * vh);
        let hit = null;
        try {
          hit = document.elementFromPoint(x, y);
        } catch {
          hit = null;
        }
        addAncestors(hit);
      }
    }
  } catch {
  }

  try {
    addAncestors(document.activeElement);
  } catch {
  }

  addQuery('input,textarea,select,button,a,canvas,iframe,[onclick],[contenteditable="true"],[role="button"],[role="link"],[role="textbox"],[role="menuitem"],[role="option"],[role="listitem"]', 1800);

  const candidates = Array.from(candidateSet);

  const scoreFor = (el, rect, tag, role, ariaLabel, placeholder, text, value) => {
    let score = 0;
    const area = Math.max(0, (Number(rect?.w) || 0) * (Number(rect?.h) || 0));
    const cx = (Number(rect?.x) || 0) + (Number(rect?.w) || 0) / 2;
    const cy = (Number(rect?.y) || 0) + (Number(rect?.h) || 0) / 2;
    const dx = vw ? Math.abs(cx - cx0) / vw : 1;
    const dy = vh ? Math.abs(cy - cy0) / vh : 1;
    const dist = dx + dy;
    score += Math.max(0, 1 - dist) * 35;
    score += Math.min(70, Math.log(area + 1) * 9);

    if (tag === "input" || tag === "textarea") score += 220;
    if (tag === "select") score += 90;
    if (tag === "canvas") score += 140;
    if (tag === "iframe") score += 80;
    if (tag === "button" || role === "button") score += 40;
    if (tag === "a" || role === "link") score += 18;

    try {
      if (el && el.isContentEditable) score += 260;
    } catch {
    }
    if (role === "textbox") score += 300;
    if (value) score += 120;

    const hint = clean(String(ariaLabel || "") + " " + String(placeholder || "") + " " + String(text || "")).toLowerCase();
    if (/(click to add|add title|add subtitle|add text|title|subtitle|textbox)/i.test(hint)) score += 140;
    if (/(標題|副標題|內文|內容|輸入|點一下|點擊|新增)/.test(hint)) score += 140;
    if (/(标题|副标题|内容|输入|点击|新增)/.test(hint)) score += 140;

    return score;
  };

  const scored = [];
  for (const el of candidates) {
    try {
      const ti = el && el.getAttribute ? el.getAttribute("tabindex") : null;
      if (ti != null && String(ti).trim() === "-1") continue;
    } catch {
    }
    if (!isVisible(el)) continue;

    const rect = toRect(el);
    if (!rect) continue;

    const tag = String(el.tagName || "").toLowerCase();
    const role = clean(el.getAttribute && el.getAttribute("role"));
    const text = clean(el.innerText || el.textContent);
    const ariaLabel = clean(el.getAttribute && el.getAttribute("aria-label"));
    const placeholder = clean(el.getAttribute && el.getAttribute("placeholder"));
    const name = clean(el.getAttribute && el.getAttribute("name"));
    const type = clean(el.getAttribute && el.getAttribute("type"));
    const href = tag === "a" ? clean(el.getAttribute && el.getAttribute("href")) : "";
    const value = tag === "input" || tag === "textarea" ? clean(el.value) : "";

    scored.push({
      el,
      tag,
      role,
      text,
      ariaLabel,
      placeholder,
      name,
      type,
      href,
      value,
      rect,
      score: scoreFor(el, rect, tag, role, ariaLabel, placeholder, text, value)
    });
  }

  scored.sort((a, b) => Number(b.score) - Number(a.score));

  const elements = [];
  let nextId = 1;
  try {
    const n = Number(window.__stingAgentNextId);
    if (Number.isFinite(n) && n > 0) nextId = Math.floor(n);
  } catch {
  }
  for (const item of scored.slice(0, 220)) {
    let id = "";
    try {
      id = String(item.el.getAttribute("data-sting-agent-id") || "").trim();
    } catch {
      id = "";
    }
    if (!id) {
      id = String(nextId++);
      try {
        item.el.setAttribute("data-sting-agent-id", id);
      } catch {
        continue;
      }
    }
    elements.push({
      id,
      tag: item.tag,
      role: item.role,
      text: String(item.text || "").slice(0, 120),
      ariaLabel: String(item.ariaLabel || "").slice(0, 120),
      placeholder: String(item.placeholder || "").slice(0, 120),
      name: String(item.name || "").slice(0, 80),
      type: String(item.type || "").slice(0, 40),
      href: String(item.href || "").slice(0, 300),
      value: String(item.value || "").slice(0, 120),
      rect: item.rect
    });
  }

  let active = null;
  try {
    const el = document.activeElement;
    if (el && el.nodeType === 1 && el !== document.body && el !== document.documentElement) {
      const tag = String(el.tagName || "").toLowerCase();
      let id = "";
      try {
        id = String(el.getAttribute && el.getAttribute("data-sting-agent-id") ? el.getAttribute("data-sting-agent-id") : "").trim();
      } catch {
        id = "";
      }
      if (!id) {
        id = String(nextId++);
        try { el.setAttribute("data-sting-agent-id", id); } catch { id = ""; }
      }
      const role = clean(el.getAttribute && el.getAttribute("role"));
      const ariaLabel = clean(el.getAttribute && el.getAttribute("aria-label"));
      const placeholder = clean(el.getAttribute && el.getAttribute("placeholder"));
      const name = clean(el.getAttribute && el.getAttribute("name"));
      const type = clean(el.getAttribute && el.getAttribute("type"));
      let value = "";
      try {
        const t = String(tag || "");
        value = t === "input" || t === "textarea" ? clean(el.value) : "";
      } catch {
        value = "";
      }
      const text = clean(el.innerText || el.textContent);
      const rect = toRect(el);
      const isContentEditable = (() => {
        try { return Boolean(el.isContentEditable); } catch { return false; }
      })();
      active = {
        id: String(id || ""),
        tag,
        role,
        ariaLabel: String(ariaLabel || "").slice(0, 120),
        placeholder: String(placeholder || "").slice(0, 120),
        name: String(name || "").slice(0, 80),
        type: String(type || "").slice(0, 40),
        value: String(value || "").slice(0, 120),
        text: String(text || "").slice(0, 120),
        isContentEditable: Boolean(isContentEditable),
        rect
      };
    }
  } catch {
    active = null;
  }

  try {
    window.__stingAgentNextId = nextId;
  } catch {
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
    active,
    elements,
    visibleText: visibleText.slice(0, 4000)
  };
})()`;

async function agentSnapshot({ url, title, marker } = {}) {
  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    const snapshot = await cdpEvalValue(sendToTarget, sessionId, CDP_SNAPSHOT_EXPRESSION, { timeoutMs: 15_000 });
    if (snapshot && typeof snapshot === "object") {
      try {
        const href = String(snapshot.url || "");
        const host = href && href.includes("://") ? new URL(href).hostname : "";
        if (host && host.endsWith("docs.google.com")) {
          snapshot.axText = await cdpAxTextSnippet(sendToTarget, sessionId, { timeoutMs: 10_000, maxNodes: 1400, maxLen: 2600 });
        }
      } catch {
      }
    }
    return snapshot;
  });
}

async function agentFindElements({ url, title, marker, text, query, selector, role, tag, limit } = {}) {
  const q = String(text ?? query ?? "").trim();
  const sel = String(selector || "").trim();
  const wantRole = String(role || "").trim();
  const wantTag = String(tag || "").trim().toLowerCase();
  const max = (() => {
    const n = Number(limit);
    if (!Number.isFinite(n)) return 12;
    return Math.max(1, Math.min(40, Math.floor(n)));
  })();

  if (!q && !sel && !wantRole && !wantTag) throw new Error("Missing query/selector/role/tag");

  const expr = `(() => {
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
        if (style.pointerEvents === "none") return false;
        const rect = el.getBoundingClientRect();
        if (!rect || rect.width < 2 || rect.height < 2) return false;
        if (rect.bottom < 0 || rect.right < 0) return false;
        if (rect.top > (window.innerHeight || 0) || rect.left > (window.innerWidth || 0)) return false;
        return true;
      } catch {
        return false;
      }
    };
    const queryRaw = ${JSON.stringify(q)};
    const query = clean(queryRaw).toLowerCase();
    const selector = clean(${JSON.stringify(sel)});
    const wantRole = clean(${JSON.stringify(wantRole)});
    const wantTag = clean(${JSON.stringify(wantTag)}).toLowerCase();
    const limit = Math.max(1, Math.min(40, Math.floor(Number(${JSON.stringify(max)}) || 12)));

    let nextId = 1;
    try {
      const n = Number(window.__stingAgentNextId);
      if (Number.isFinite(n) && n > 0) nextId = Math.floor(n);
    } catch {}

    const ensureId = (el) => {
      if (!el) return "";
      let id = "";
      try { id = String(el.getAttribute && el.getAttribute("data-sting-agent-id") ? el.getAttribute("data-sting-agent-id") : "").trim(); } catch { id = ""; }
      if (!id) {
        id = String(nextId++);
        try { el.setAttribute("data-sting-agent-id", id); } catch { return ""; }
      }
      return id;
    };

    const pickCandidates = () => {
      if (selector) {
        try { return Array.from(document.querySelectorAll(selector)); } catch { return []; }
      }
      try {
        return Array.from(document.querySelectorAll('input,textarea,select,button,a,canvas,iframe,[onclick],[contenteditable=\"true\"],[role=\"button\"],[role=\"link\"],[role=\"textbox\"],[role=\"menuitem\"],[role=\"option\"],[role=\"listitem\"]'));
      } catch {
        return [];
      }
    };

    const candidates = pickCandidates();
    const scored = [];
    for (const el of candidates) {
      if (!el || el.nodeType !== 1) continue;
      const t = String(el.tagName || "").toLowerCase();
      if (wantTag && t !== wantTag) continue;
      const r = clean(el.getAttribute && el.getAttribute("role"));
      if (wantRole && r !== wantRole) continue;
      if (!isVisible(el)) continue;

      const text = clean(el.innerText || el.textContent);
      const ariaLabel = clean(el.getAttribute && el.getAttribute("aria-label"));
      const placeholder = clean(el.getAttribute && el.getAttribute("placeholder"));
      const name = clean(el.getAttribute && el.getAttribute("name"));
      const type = clean(el.getAttribute && el.getAttribute("type"));
      const href = t === "a" ? clean(el.getAttribute && el.getAttribute("href")) : "";
      let value = "";
      try { value = t === "input" || t === "textarea" ? clean(el.value) : ""; } catch { value = ""; }

      if (query) {
        const hay = clean([ariaLabel, placeholder, text, value, name, type].filter(Boolean).join(" ")).toLowerCase();
        if (!hay.includes(query)) continue;
      }

      const rect = toRect(el);
      const area = Math.max(0, (Number(rect?.w) || 0) * (Number(rect?.h) || 0));
      let score = 0;
      if (query) {
        const q = query;
        const al = ariaLabel.toLowerCase();
        const tx = text.toLowerCase();
        const ph = placeholder.toLowerCase();
        const vl = value.toLowerCase();
        if (al.includes(q)) score += 90;
        if (tx.includes(q)) score += 70;
        if (ph.includes(q)) score += 55;
        if (vl.includes(q)) score += 35;
      }
      score += Math.min(70, Math.log(area + 1) * 9);
      if (t === "input" || t === "textarea") score += 110;
      if (t === "button" || r === "button") score += 35;
      if (t === "a" || r === "link") score += 18;

      scored.push({ el, tag: t, role: r, text, ariaLabel, placeholder, name, type, href, value, rect, score });
    }

    scored.sort((a, b) => Number(b.score) - Number(a.score));

    const out = [];
    for (const item of scored.slice(0, limit)) {
      const id = ensureId(item.el);
      if (!id) continue;
      out.push({
        id,
        tag: item.tag,
        role: item.role,
        text: String(item.text || "").slice(0, 120),
        ariaLabel: String(item.ariaLabel || "").slice(0, 120),
        placeholder: String(item.placeholder || "").slice(0, 120),
        name: String(item.name || "").slice(0, 80),
        type: String(item.type || "").slice(0, 40),
        href: String(item.href || "").slice(0, 300),
        value: String(item.value || "").slice(0, 120),
        rect: item.rect || null
      });
    }

    try { window.__stingAgentNextId = nextId; } catch {}
    return { ok: true, matches: out };
  })()`;

  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    const res = await cdpEvalValue(sendToTarget, sessionId, expr, { timeoutMs: 15_000 });
    if (!res || res.ok !== true) throw new Error(String(res?.error || "findElements failed"));
    const matches = Array.isArray(res.matches) ? res.matches : [];
    return { ok: true, matches };
  });
}

async function agentReadElement({ url, title, marker, elementId, fields } = {}) {
  const id = String(elementId || "").trim();
  if (!id) throw new Error("Missing elementId");

  const wantedFields = Array.isArray(fields)
    ? fields.map((f) => String(f || "").trim()).filter(Boolean).slice(0, 24)
    : null;

  const expr = `(() => {
    const clean = (s) => String(s || "").replace(/\\s+/g, " ").trim();
    const toRect = (el) => {
      try {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height };
      } catch {
        return null;
      }
    };
    const id = ${JSON.stringify(id)};
    const wanted = ${JSON.stringify(wantedFields)};
    const want = (k) => !wanted || (Array.isArray(wanted) && wanted.includes(k));
    const sel = '[data-sting-agent-id=\"' + id + '\"]';
    const el = document.querySelector(sel);
    if (!el) return { ok: false, error: 'Element not found: ' + id };

    const tag = String(el.tagName || '').toLowerCase();
    const role = clean(el.getAttribute && el.getAttribute('role'));
    const ariaLabel = clean(el.getAttribute && el.getAttribute('aria-label'));
    const placeholder = clean(el.getAttribute && el.getAttribute('placeholder'));
    const name = clean(el.getAttribute && el.getAttribute('name'));
    const type = clean(el.getAttribute && el.getAttribute('type'));
    const href = tag === 'a' ? clean(el.getAttribute && el.getAttribute('href')) : '';
    let value = '';
    try { value = tag === 'input' || tag === 'textarea' ? clean(el.value) : ''; } catch { value = ''; }
    const text = clean(el.innerText || el.textContent);
    const rect = toRect(el);

    const out = { id };
    if (want('tag')) out.tag = tag;
    if (want('role')) out.role = role;
    if (want('ariaLabel')) out.ariaLabel = ariaLabel;
    if (want('placeholder')) out.placeholder = placeholder;
    if (want('name')) out.name = name;
    if (want('type')) out.type = type;
    if (want('href')) out.href = href;
    if (want('value')) out.value = value;
    if (want('text')) out.text = text;
    if (want('rect')) out.rect = rect;
    if (want('disabled')) {
      let disabled = false;
      try { disabled = Boolean(el.disabled); } catch { disabled = false; }
      try {
        const aria = clean(el.getAttribute && el.getAttribute('aria-disabled')).toLowerCase();
        if (aria === 'true') disabled = true;
      } catch {}
      out.disabled = Boolean(disabled);
    }
    if (want('checked')) {
      let checked = false;
      try { checked = Boolean(el.checked); } catch { checked = false; }
      out.checked = Boolean(checked);
    }
    if (want('isContentEditable')) {
      let ce = false;
      try { ce = Boolean(el.isContentEditable); } catch { ce = false; }
      out.isContentEditable = Boolean(ce);
    }

    return { ok: true, element: out };
  })()`;

  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    const res = await cdpEvalValue(sendToTarget, sessionId, expr, { timeoutMs: 15_000 });
    if (!res || res.ok !== true) throw new Error(String(res?.error || "readElement failed"));
    return { ok: true, element: res.element || null };
  });
}

async function agentScrollIntoView({ url, title, marker, elementId } = {}) {
  const id = String(elementId || "").trim();
  if (!id) throw new Error("Missing elementId");

  const expr = `(() => {
    const toRect = (el) => {
      try {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height };
      } catch {
        return null;
      }
    };
    const id = ${JSON.stringify(id)};
    const sel = '[data-sting-agent-id=\"' + id + '\"]';
    const el = document.querySelector(sel);
    if (!el) return { ok: false, error: 'Element not found: ' + id };
    try { el.scrollIntoView({ block: 'center', inline: 'center' }); } catch {}
    let rect = null;
    try { rect = toRect(el); } catch { rect = null; }
    return { ok: true, rect };
  })()`;

  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    const res = await cdpEvalValue(sendToTarget, sessionId, expr, { timeoutMs: 12_000 });
    if (!res || res.ok !== true) throw new Error(String(res?.error || "scrollIntoView failed"));
    return { ok: true, rect: res.rect || null };
  });
}

async function agentScreenshot({ url, title, marker, elementId, fullPage, format } = {}) {
  const id = String(elementId || "").trim();
  const full = Boolean(fullPage);
  const fmtRaw = String(format || "png").trim().toLowerCase();
  const fmt = fmtRaw === "jpeg" || fmtRaw === "jpg" ? "jpeg" : "png";
  const mimeType = fmt === "jpeg" ? "image/jpeg" : "image/png";

  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    try {
      await sendToTarget(sessionId, "Page.bringToFront", {}, { timeoutMs: 4_000 });
    } catch {
    }

    let clip = null;
    if (id) {
      const locateExpr = `(() => {
        const id = ${JSON.stringify(id)};
        const sel = '[data-sting-agent-id=\"' + id + '\"]';
        const el = document.querySelector(sel);
        if (!el) return { ok: false, error: 'Element not found: ' + id };
        try { el.scrollIntoView({ block: 'center', inline: 'center' }); } catch {}
        let rect = null;
        try { rect = el.getBoundingClientRect(); } catch { rect = null; }
        if (!rect) return { ok: false, error: 'Element has no bounding rect: ' + id };
        const vw = Number(window.innerWidth) || 0;
        const vh = Number(window.innerHeight) || 0;
        const x = Math.max(0, Math.min(vw, Number(rect.left) || 0));
        const y = Math.max(0, Math.min(vh, Number(rect.top) || 0));
        const w = Math.max(1, Math.min(vw - x, Number(rect.width) || 0));
        const h = Math.max(1, Math.min(vh - y, Number(rect.height) || 0));
        return { ok: true, x, y, w, h };
      })()`;
      const loc = await cdpEvalValue(sendToTarget, sessionId, locateExpr, { timeoutMs: 15_000 });
      if (!loc || loc.ok !== true) throw new Error(String(loc?.error || "Screenshot failed"));
      clip = { x: Number(loc.x), y: Number(loc.y), width: Number(loc.w), height: Number(loc.h), scale: 1 };
    } else if (full) {
      try {
        const metrics = await sendToTarget(sessionId, "Page.getLayoutMetrics", {}, { timeoutMs: 8_000 });
        const size = metrics?.contentSize || metrics?.cssContentSize || null;
        const w = Math.max(1, Math.floor(Number(size?.width) || 0));
        const h = Math.max(1, Math.floor(Number(size?.height) || 0));
        if (w && h) {
          clip = { x: 0, y: 0, width: w, height: h, scale: 1 };
        }
      } catch {
        clip = null;
      }
    }

    const params = {
      format: fmt,
      fromSurface: true,
      captureBeyondViewport: true
    };
    if (clip && Number.isFinite(clip.width) && Number.isFinite(clip.height)) {
      params.clip = clip;
    }

    const res = await sendToTarget(sessionId, "Page.captureScreenshot", params, { timeoutMs: 20_000 });
    const data = String(res?.data || "");
    if (!data) throw new Error("Screenshot failed (empty data)");

    const dir = path.join(app.getPath("userData"), "agent_screenshots");
    await fs.mkdir(dir, { recursive: true });
    const fileName = `shot_${Date.now()}_${Math.random().toString(16).slice(2)}.${fmt === "jpeg" ? "jpg" : "png"}`;
    const filePath = path.join(dir, fileName);
    await fs.writeFile(filePath, Buffer.from(data, "base64"));

    return { ok: true, path: filePath, mimeType };
  });
}

async function agentUploadFile({ url, title, marker, elementId, paths, path: singlePath, filePath } = {}) {
  const id = String(elementId || "").trim();
  if (!id) throw new Error("Missing elementId");

  const list = Array.isArray(paths)
    ? paths
    : singlePath != null
      ? [singlePath]
      : filePath != null
        ? [filePath]
        : [];
  const filePaths = list.map((p) => String(p || "").trim()).filter(Boolean).slice(0, 10);
  if (!filePaths.length) throw new Error("Missing file path(s)");

  for (const p of filePaths) {
    if (!existsSync(p)) throw new Error(`File not found: ${p}`);
  }

  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    try {
      await sendToTarget(sessionId, "Page.bringToFront", {}, { timeoutMs: 4_000 });
    } catch {
    }
    try {
      await sendToTarget(sessionId, "DOM.enable", {}, { timeoutMs: 4_000 });
    } catch {
    }

    const selector = `[data-sting-agent-id=\"${id}\"]`;
    const doc = await sendToTarget(sessionId, "DOM.getDocument", { depth: 1, pierce: true }, { timeoutMs: 8_000 });
    const rootId = Number(doc?.root?.nodeId);
    if (!Number.isFinite(rootId) || rootId <= 0) throw new Error("Failed to resolve DOM root");

    const q = await sendToTarget(sessionId, "DOM.querySelector", { nodeId: rootId, selector }, { timeoutMs: 8_000 });
    const nodeId = Number(q?.nodeId);
    if (!Number.isFinite(nodeId) || nodeId <= 0) throw new Error(`Element not found: ${id}`);

    await sendToTarget(sessionId, "DOM.setFileInputFiles", { nodeId, files: filePaths }, { timeoutMs: 15_000 });

    const verifyExpr = `(() => {
      const sel = ${JSON.stringify(selector)};
      const el = document.querySelector(sel);
      const count = Number(el && el.files ? el.files.length : 0) || 0;
      try { el && el.dispatchEvent && el.dispatchEvent(new Event('input', { bubbles: true })); } catch {}
      try { el && el.dispatchEvent && el.dispatchEvent(new Event('change', { bubbles: true })); } catch {}
      return { ok: true, filesCount: count };
    })()`;
    let filesCount = 0;
    try {
      const v = await cdpEvalValue(sendToTarget, sessionId, verifyExpr, { timeoutMs: 8_000 });
      filesCount = Number(v?.filesCount) || 0;
    } catch {
      filesCount = 0;
    }
    return { ok: true, filesCount };
  });
}

async function agentClick({ url, title, marker, elementId, x, y, clickCount } = {}) {
  const id = String(elementId || "").trim();
  const countRaw = Number(clickCount);
  const count = Number.isFinite(countRaw) ? Math.max(1, Math.min(3, Math.floor(countRaw))) : 1;
  const hasCoords = Number.isFinite(Number(x)) && Number.isFinite(Number(y));
  if (!id && !hasCoords) throw new Error("Missing elementId (or x/y)");
  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    try {
      await sendToTarget(sessionId, "Page.bringToFront", {}, { timeoutMs: 4_000 });
    } catch {
    }

    const clickLogInitExpr = `(() => {
      try {
        if (!window.__stingAgentClickLog || typeof window.__stingAgentClickLog !== 'object') {
          window.__stingAgentClickLog = { ts: 0, isTrusted: false, x: 0, y: 0, target: '', type: '' };
        }
        if (!window.__stingAgentClickListenerInstalled) {
          window.__stingAgentClickListenerInstalled = true;
          const record = (type, e) => {
            try {
              window.__stingAgentClickLog = {
                ts: Date.now(),
                isTrusted: Boolean(e && e.isTrusted),
                x: Number(e && e.clientX) || 0,
                y: Number(e && e.clientY) || 0,
                target: String(e && e.target && e.target.tagName ? e.target.tagName : ''),
                type: String(type || '')
              };
            } catch {}
          };
          document.addEventListener('mousedown', (e) => record('mousedown', e), true);
          document.addEventListener('click', (e) => record('click', e), true);
        }
      } catch {}
      try { return Number(window.__stingAgentClickLog && window.__stingAgentClickLog.ts ? window.__stingAgentClickLog.ts : 0) || 0; } catch { return 0; }
    })()`;
    let beforeClickTs = 0;
    try {
      beforeClickTs = Number(await cdpEvalValue(sendToTarget, sessionId, clickLogInitExpr, { timeoutMs: 4_000 })) || 0;
    } catch {
      beforeClickTs = 0;
    }

    let clickX = null;
    let clickY = null;
    if (id) {
      const locateExpr = `(() => {
        const id = ${JSON.stringify(id)};
        const sel = '[data-sting-agent-id=\"' + id + '\"]';
        const rootEl = document.querySelector(sel);
        if (!rootEl) return { ok: false, error: 'Element not found: ' + id };

        const clean = (s) => String(s || '').trim().toLowerCase();
        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

        const isDisabled = (el) => {
          if (!el) return true;
          try { if (el.disabled) return true; } catch {}
          try {
            const aria = clean(el.getAttribute && el.getAttribute('aria-disabled'));
            if (aria === 'true') return true;
          } catch {}
          return false;
        };

        const isVisible = (el) => {
          if (!el) return false;
          try {
            const style = window.getComputedStyle(el);
            if (!style) return false;
            if (style.visibility === 'hidden' || style.display === 'none') return false;
            if (style.pointerEvents === 'none') return false;
            const r = el.getBoundingClientRect();
            if (!r || r.width < 2 || r.height < 2) return false;
            return true;
          } catch {
            return false;
          }
        };

        const clickability = (el) => {
          if (!el) return 0;
          if (!isVisible(el) || isDisabled(el)) return 0;
          let score = 0;
          const tag = clean(el.tagName);
          const role = clean(el.getAttribute && el.getAttribute('role'));
          const type = clean(el.getAttribute && el.getAttribute('type'));
          const href = clean(tag === 'a' ? (el.getAttribute && el.getAttribute('href')) : '');
          if (tag === 'button') score += 6;
          if (tag === 'a' && href) score += 5;
          if (tag === 'input' && (type === 'button' || type === 'submit' || type === 'image')) score += 6;
          if (tag === 'input' || tag === 'textarea' || tag === 'select') score += 4;
          if (tag === 'canvas') score += 5;
          if (tag === 'iframe') score += 3;
          if (role === 'button' || role === 'link' || role === 'textbox') score += 5;
          try { if (el.isContentEditable) score += 6; } catch {}
          try { if (el.hasAttribute && el.hasAttribute('onclick')) score += 3; } catch {}
          try {
            if (typeof el.onclick === 'function') score += 3;
          } catch {}
          try {
            const cur = clean(window.getComputedStyle(el).cursor);
            if (cur === 'pointer') score += 2;
          } catch {}
          return score;
        };

        const getRect = (el) => {
          try { return el.getBoundingClientRect(); } catch { return null; }
        };

        const collectCandidates = (el) => {
          const out = [];
          const seen = new Set();
          const add = (node) => {
            try {
              if (!node || node.nodeType !== 1) return;
              if (seen.has(node)) return;
              seen.add(node);
              out.push(node);
            } catch {}
          };

          // self + ancestors
          let cur = el;
          for (let i = 0; i < 8 && cur; i++) {
            add(cur);
            try { cur = cur.parentElement; } catch { cur = null; }
          }

          // clickable descendants
          try {
            const nodes = el.querySelectorAll('button,a[href],input,textarea,select,canvas,iframe,[role=\"button\"],[role=\"link\"],[role=\"textbox\"],[onclick],[contenteditable=\"true\"]');
            let count = 0;
            for (const n of nodes) {
              add(n);
              count++;
              if (count >= 120) break;
            }
          } catch {}

          return out;
        };

        const candidates = collectCandidates(rootEl);
        const rootRect = getRect(rootEl);
        const rootCx = (Number(rootRect?.left) || 0) + (Number(rootRect?.width) || 0) / 2;
        const rootCy = (Number(rootRect?.top) || 0) + (Number(rootRect?.height) || 0) / 2;

        let bestEl = rootEl;
        let bestScore = clickability(rootEl);
        let bestDist = Number.POSITIVE_INFINITY;
        let bestArea = 0;

        for (const cand of candidates) {
          const c = clickability(cand);
          if (c <= 0) continue;
          const r = getRect(cand);
          const area = Math.max(0, (Number(r?.width) || 0) * (Number(r?.height) || 0));
          const cx = (Number(r?.left) || 0) + (Number(r?.width) || 0) / 2;
          const cy = (Number(r?.top) || 0) + (Number(r?.height) || 0) / 2;
          const dist = Math.abs(cx - rootCx) + Math.abs(cy - rootCy);
          if (c > bestScore || (c === bestScore && dist < bestDist) || (c === bestScore && dist === bestDist && area > bestArea)) {
            bestEl = cand;
            bestScore = c;
            bestDist = dist;
            bestArea = area;
          }
        }

        try { bestEl.scrollIntoView({ block: 'center', inline: 'center' }); } catch {}
        try { bestEl.focus && bestEl.focus(); } catch {}
        let rect = null;
        try { rect = bestEl.getBoundingClientRect(); } catch { rect = null; }
        if (!rect) return { ok: false, error: 'Element has no bounding rect: ' + id };
        const vw = Number(window.innerWidth) || 0;
        const vh = Number(window.innerHeight) || 0;
        const left = Math.max(0, Number(rect.left) || 0);
        const right = Math.min(vw, Number(rect.right) || 0);
        const top = Math.max(0, Number(rect.top) || 0);
        const bottom = Math.min(vh, Number(rect.bottom) || 0);
        if (right - left < 2 || bottom - top < 2) {
          return { ok: false, error: 'Element not interactable in viewport: ' + id, vw, vh };
        }
        const cx = clamp(Math.floor((left + right) / 2), 0, Math.max(0, vw - 1));
        const cy = clamp(Math.floor((top + bottom) / 2), 0, Math.max(0, vh - 1));

        const xs = [
          cx,
          clamp(Math.floor(left + 2), 0, Math.max(0, vw - 1)),
          clamp(Math.floor(right - 3), 0, Math.max(0, vw - 1))
        ].filter((v, i, a) => a.indexOf(v) === i);

        const ys = [
          cy,
          clamp(Math.floor(top + 2), 0, Math.max(0, vh - 1)),
          clamp(Math.floor(bottom - 3), 0, Math.max(0, vh - 1))
        ].filter((v, i, a) => a.indexOf(v) === i);

        for (const x of xs) {
          for (const y of ys) {
            let hit = null;
            try { hit = document.elementFromPoint(x, y); } catch { hit = null; }
            if (hit && (bestEl === hit || (bestEl.contains && bestEl.contains(hit)))) {
              return { ok: true, x, y };
            }
          }
        }

        return { ok: true, x: cx, y: cy };
      })()`;

      const loc = await cdpEvalValue(sendToTarget, sessionId, locateExpr, { timeoutMs: 15_000 });
      if (!loc || loc.ok !== true) throw new Error(String(loc?.error || "Click failed"));
      clickX = Number(loc.x);
      clickY = Number(loc.y);
    } else {
      clickX = Number(x);
      clickY = Number(y);
    }
    if (!Number.isFinite(clickX) || !Number.isFinite(clickY)) throw new Error("Click failed (invalid coordinates)");

    const readClickLogExpr = "(() => (window.__stingAgentClickLog && typeof window.__stingAgentClickLog === 'object' ? window.__stingAgentClickLog : null))()";
    const getHostExpr = "(() => String(location && location.hostname ? location.hostname : ''))()";

    const clickProducedEvent = async () => {
      try {
        const log = await cdpEvalValue(sendToTarget, sessionId, readClickLogExpr, { timeoutMs: 4_000 });
        const ts = Number(log?.ts) || 0;
        return { ts, isTrusted: Boolean(log?.isTrusted), type: String(log?.type || "") };
      } catch {
        return { ts: 0, isTrusted: false, type: "" };
      }
    };

    const isGoogleDocsHost = async () => {
      try {
        const host = String(await cdpEvalValue(sendToTarget, sessionId, getHostExpr, { timeoutMs: 3_000 }) || "");
        return host.endsWith("docs.google.com");
      } catch {
        return false;
      }
    };

    let usedTrustedInput = true;
    try {
      await sendToTarget(
        sessionId,
        "Input.dispatchMouseEvent",
        { type: "mouseMoved", x: clickX, y: clickY, button: "none", buttons: 0, clickCount: count, pointerType: "mouse" },
        { timeoutMs: 8_000 }
      );
      for (let i = 1; i <= count; i++) {
        await sendToTarget(
          sessionId,
          "Input.dispatchMouseEvent",
          { type: "mousePressed", x: clickX, y: clickY, button: "left", buttons: 1, clickCount: i, pointerType: "mouse" },
          { timeoutMs: 8_000 }
        );
        await sendToTarget(
          sessionId,
          "Input.dispatchMouseEvent",
          { type: "mouseReleased", x: clickX, y: clickY, button: "left", buttons: 0, clickCount: i, pointerType: "mouse" },
          { timeoutMs: 8_000 }
        );
        if (i < count) await delay(55);
      }
      await delay(80);
      const after = await clickProducedEvent();
      if (after.ts <= beforeClickTs) throw new Error("Click event did not fire");
      if (!after.isTrusted) usedTrustedInput = false;
    } catch (err) {
      usedTrustedInput = false;
      if (id) {
        const fallbackExpr = `(() => {
          const id = ${JSON.stringify(id)};
          const sel = '[data-sting-agent-id=\"' + id + '\"]';
          const el = document.querySelector(sel);
          if (!el) return { ok: false, error: 'Element not found: ' + id };
          try { el.scrollIntoView({ block: 'center', inline: 'center' }); } catch {}
          try { el.focus && el.focus(); } catch {}
          try { el.click(); return { ok: true }; } catch (e) { return { ok: false, error: String(e && e.message ? e.message : e) }; }
        })()`;
        const res = await cdpEvalValue(sendToTarget, sessionId, fallbackExpr, { timeoutMs: 15_000 });
        if (!res || res.ok !== true) throw new Error(String(res?.error || err?.message || err || "Click failed"));
        await delay(60);
        const after = await clickProducedEvent();
        if (after.ts <= beforeClickTs) throw new Error("Click failed (no click event observed)");
      } else {
        throw err;
      }
    }

    if (!usedTrustedInput && (await isGoogleDocsHost())) {
      throw new Error("Untrusted click event; Google Docs/Slides often ignores programmatic clicks (CDP input may be blocked).");
    }
    return { ok: true, x: clickX, y: clickY, clickCount: count, usedTrustedInput };
  });
}

async function agentHover({ url, title, marker, elementId, x, y } = {}) {
  const id = String(elementId || "").trim();
  const hasCoords = Number.isFinite(Number(x)) && Number.isFinite(Number(y));
  if (!id && !hasCoords) throw new Error("Missing elementId (or x/y)");
  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    try {
      await sendToTarget(sessionId, "Page.bringToFront", {}, { timeoutMs: 4_000 });
    } catch {
    }

    let hoverX = null;
    let hoverY = null;
    if (id) {
      const locateExpr = `(() => {
        const id = ${JSON.stringify(id)};
        const sel = '[data-sting-agent-id=\"' + id + '\"]';
        const el = document.querySelector(sel);
        if (!el) return { ok: false, error: 'Element not found: ' + id };
        try { el.scrollIntoView({ block: 'center', inline: 'center' }); } catch {}
        try { el.focus && el.focus(); } catch {}
        let rect = null;
        try { rect = el.getBoundingClientRect(); } catch { rect = null; }
        if (!rect) return { ok: false, error: 'Element has no bounding rect: ' + id };
        const vw = Number(window.innerWidth) || 0;
        const vh = Number(window.innerHeight) || 0;
        const left = Math.max(0, Number(rect.left) || 0);
        const right = Math.min(vw, Number(rect.right) || 0);
        const top = Math.max(0, Number(rect.top) || 0);
        const bottom = Math.min(vh, Number(rect.bottom) || 0);
        if (right - left < 2 || bottom - top < 2) {
          return { ok: false, error: 'Element not interactable in viewport: ' + id, vw, vh };
        }
        const x = Math.floor((left + right) / 2);
        const y = Math.floor((top + bottom) / 2);
        return { ok: true, x, y };
      })()`;

      const loc = await cdpEvalValue(sendToTarget, sessionId, locateExpr, { timeoutMs: 15_000 });
      if (!loc || loc.ok !== true) throw new Error(String(loc?.error || "Hover failed"));
      hoverX = Number(loc.x);
      hoverY = Number(loc.y);
    } else {
      hoverX = Number(x);
      hoverY = Number(y);
    }
    if (!Number.isFinite(hoverX) || !Number.isFinite(hoverY)) throw new Error("Hover failed (invalid coordinates)");

    await sendToTarget(
      sessionId,
      "Input.dispatchMouseEvent",
      { type: "mouseMoved", x: hoverX, y: hoverY, button: "none", buttons: 0, pointerType: "mouse" },
      { timeoutMs: 8_000 }
    );
    return { ok: true, x: hoverX, y: hoverY };
  });
}

async function agentScroll({ url, title, marker, deltaX, deltaY, x, y } = {}) {
  const dx = Number(deltaX);
  const dy = Number(deltaY);
  const hasDx = Number.isFinite(dx) && dx !== 0;
  const hasDy = Number.isFinite(dy) && dy !== 0;
  if (!hasDx && !hasDy) throw new Error("Missing deltaX/deltaY");
  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    try {
      await sendToTarget(sessionId, "Page.bringToFront", {}, { timeoutMs: 4_000 });
    } catch {
    }

    const scrollStateExpr = `(() => {
      const se = document.scrollingElement || document.documentElement || document.body;
      return {
        x: Number(se && se.scrollLeft ? se.scrollLeft : 0) || 0,
        y: Number(se && se.scrollTop ? se.scrollTop : 0) || 0,
        vw: Number(window.innerWidth) || 0,
        vh: Number(window.innerHeight) || 0
      };
    })()`;

    let before = null;
    try {
      before = await cdpEvalValue(sendToTarget, sessionId, scrollStateExpr, { timeoutMs: 3_000 });
    } catch {
      before = null;
    }

    const vw = Math.max(0, Math.floor(Number(before?.vw) || 0));
    const vh = Math.max(0, Math.floor(Number(before?.vh) || 0));
    const pointX = Number.isFinite(Number(x)) ? Number(x) : Math.floor((vw || 1) / 2);
    const pointY = Number.isFinite(Number(y)) ? Number(y) : Math.floor((vh || 1) / 2);

    try {
      await sendToTarget(
        sessionId,
        "Input.dispatchMouseEvent",
        {
          type: "mouseWheel",
          x: pointX,
          y: pointY,
          deltaX: hasDx ? dx : 0,
          deltaY: hasDy ? dy : 0,
          pointerType: "mouse"
        },
        { timeoutMs: 8_000 }
      );
    } catch {
      // fallthrough to JS fallback
    }

    await delay(60);
    let after = null;
    try {
      after = await cdpEvalValue(sendToTarget, sessionId, scrollStateExpr, { timeoutMs: 3_000 });
    } catch {
      after = null;
    }

    const changed =
      before && after && (Number(before.x) !== Number(after.x) || Number(before.y) !== Number(after.y));

    if (!changed) {
      const fallbackExpr = `(() => {
        const dx = Number(${JSON.stringify(hasDx ? dx : 0)}) || 0;
        const dy = Number(${JSON.stringify(hasDy ? dy : 0)}) || 0;
        const px = Number(${JSON.stringify(pointX)}) || 0;
        const py = Number(${JSON.stringify(pointY)}) || 0;

        const isScrollable = (el) => {
          if (!el) return false;
          const ch = Number(el.clientHeight) || 0;
          const sh = Number(el.scrollHeight) || 0;
          const cw = Number(el.clientWidth) || 0;
          const sw = Number(el.scrollWidth) || 0;
          const canY = sh > ch + 4;
          const canX = sw > cw + 4;
          if (!canX && !canY) return false;
          try {
            const style = window.getComputedStyle(el);
            const oy = String(style && style.overflowY ? style.overflowY : "");
            const ox = String(style && style.overflowX ? style.overflowX : "");
            if (canY && (oy === "auto" || oy === "scroll")) return true;
            if (canX && (ox === "auto" || ox === "scroll")) return true;
          } catch {
          }
          return el === document.scrollingElement || el === document.documentElement || el === document.body;
        };

        const pickScrollable = () => {
          const root = document.scrollingElement || document.documentElement || document.body;
          let el = null;
          try { el = document.elementFromPoint(px, py); } catch { el = null; }
          while (el) {
            if (isScrollable(el)) return el;
            el = el.parentElement;
          }
          return root;
        };

        const se = pickScrollable();
        const beforeX = Number(se && se.scrollLeft ? se.scrollLeft : 0) || 0;
        const beforeY = Number(se && se.scrollTop ? se.scrollTop : 0) || 0;
        try { if (dx) se.scrollLeft = beforeX + dx; } catch {}
        try { if (dy) se.scrollTop = beforeY + dy; } catch {}
        const afterX = Number(se && se.scrollLeft ? se.scrollLeft : 0) || 0;
        const afterY = Number(se && se.scrollTop ? se.scrollTop : 0) || 0;
        return { ok: true, beforeX, beforeY, afterX, afterY };
      })()`;
      try {
        await cdpEvalValue(sendToTarget, sessionId, fallbackExpr, { timeoutMs: 6_000 });
      } catch {
      }
    }

    return { ok: true, before: before || null, after: after || null, changed: Boolean(changed) };
  });
}

const CDP_KEY_MODIFIER_ALT = 1;
const CDP_KEY_MODIFIER_CTRL = 2;
const CDP_KEY_MODIFIER_META = 4;
const CDP_KEY_MODIFIER_SHIFT = 8;

const CDP_SHIFTED_DIGIT_KEYS = {
  ")": "0",
  "!": "1",
  "@": "2",
  "#": "3",
  "$": "4",
  "%": "5",
  "^": "6",
  "&": "7",
  "*": "8",
  "(": "9"
};

const CDP_PUNCTUATION_KEYS = {
  "-": { code: "Minus", vk: 189, shift: false, unmodified: "-" },
  "_": { code: "Minus", vk: 189, shift: true, unmodified: "-" },
  "=": { code: "Equal", vk: 187, shift: false, unmodified: "=" },
  "+": { code: "Equal", vk: 187, shift: true, unmodified: "=" },
  "[": { code: "BracketLeft", vk: 219, shift: false, unmodified: "[" },
  "{": { code: "BracketLeft", vk: 219, shift: true, unmodified: "[" },
  "]": { code: "BracketRight", vk: 221, shift: false, unmodified: "]" },
  "}": { code: "BracketRight", vk: 221, shift: true, unmodified: "]" },
  "\\": { code: "Backslash", vk: 220, shift: false, unmodified: "\\" },
  "|": { code: "Backslash", vk: 220, shift: true, unmodified: "\\" },
  ";": { code: "Semicolon", vk: 186, shift: false, unmodified: ";" },
  ":": { code: "Semicolon", vk: 186, shift: true, unmodified: ";" },
  "'": { code: "Quote", vk: 222, shift: false, unmodified: "'" },
  "\"": { code: "Quote", vk: 222, shift: true, unmodified: "'" },
  ",": { code: "Comma", vk: 188, shift: false, unmodified: "," },
  "<": { code: "Comma", vk: 188, shift: true, unmodified: "," },
  ".": { code: "Period", vk: 190, shift: false, unmodified: "." },
  ">": { code: "Period", vk: 190, shift: true, unmodified: "." },
  "/": { code: "Slash", vk: 191, shift: false, unmodified: "/" },
  "?": { code: "Slash", vk: 191, shift: true, unmodified: "/" },
  "`": { code: "Backquote", vk: 192, shift: false, unmodified: "`" },
  "~": { code: "Backquote", vk: 192, shift: true, unmodified: "`" }
};

function getCdpKeyDefForChar(ch) {
  const char = String(ch || "");
  if (!char || char.length !== 1) return null;
  if (char === " ") return { key: " ", code: "Space", vk: 32, modifiers: 0, text: " ", unmodifiedText: " " };

  const cc = char.charCodeAt(0);
  if (cc >= 97 && cc <= 122) {
    const upper = String.fromCharCode(cc - 32);
    return { key: char, code: `Key${upper}`, vk: upper.charCodeAt(0), modifiers: 0, text: char, unmodifiedText: char };
  }
  if (cc >= 65 && cc <= 90) {
    const lower = String.fromCharCode(cc + 32);
    return {
      key: char,
      code: `Key${char}`,
      vk: char.charCodeAt(0),
      modifiers: CDP_KEY_MODIFIER_SHIFT,
      text: char,
      unmodifiedText: lower
    };
  }
  if (cc >= 48 && cc <= 57) {
    return { key: char, code: `Digit${char}`, vk: cc, modifiers: 0, text: char, unmodifiedText: char };
  }

  const shiftedDigit = CDP_SHIFTED_DIGIT_KEYS[char];
  if (shiftedDigit) {
    const vk = shiftedDigit.charCodeAt(0);
    return {
      key: char,
      code: `Digit${shiftedDigit}`,
      vk,
      modifiers: CDP_KEY_MODIFIER_SHIFT,
      text: char,
      unmodifiedText: shiftedDigit
    };
  }

  const punct = CDP_PUNCTUATION_KEYS[char];
  if (punct) {
    return {
      key: char,
      code: punct.code,
      vk: punct.vk,
      modifiers: punct.shift ? CDP_KEY_MODIFIER_SHIFT : 0,
      text: char,
      unmodifiedText: punct.unmodified
    };
  }

  return null;
}

async function cdpTypeText(sendToTarget, sessionId, text, { delayMs = 0, timeoutMs = 8_000 } = {}) {
  const value = String(text ?? "");
  const chars = Array.from(value);
  let usedKeyEvents = false;
  let usedInsertText = false;

  const dispatchKey = (payload) => sendToTarget(sessionId, "Input.dispatchKeyEvent", payload, { timeoutMs });

  for (const ch of chars) {
    if (ch === "\r") continue;
    if (ch === "\n") {
      usedKeyEvents = true;
      const base = { key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, modifiers: 0 };
      await dispatchKey({ type: "rawKeyDown", ...base });
      await dispatchKey({ type: "keyUp", ...base });
    } else if (ch === "\t") {
      usedKeyEvents = true;
      const base = { key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9, modifiers: 0 };
      await dispatchKey({ type: "rawKeyDown", ...base });
      await dispatchKey({ type: "keyUp", ...base });
    } else {
      const def = getCdpKeyDefForChar(ch);
      if (def) {
        usedKeyEvents = true;
        const base = {
          key: def.key,
          code: def.code,
          windowsVirtualKeyCode: def.vk,
          nativeVirtualKeyCode: def.vk,
          modifiers: def.modifiers || 0
        };
        await dispatchKey({ type: "rawKeyDown", ...base });
        await dispatchKey({ type: "char", ...base, text: def.text, unmodifiedText: def.unmodifiedText });
        await dispatchKey({ type: "keyUp", ...base });
      } else {
        usedInsertText = true;
        await sendToTarget(sessionId, "Input.insertText", { text: ch }, { timeoutMs: Math.max(2_000, timeoutMs) });
      }
    }
    if (delayMs > 0) await delay(delayMs);
  }

  return { usedKeyEvents, usedInsertText };
}

function pickAgentTypeVerificationNeedle(text) {
  const raw = String(text ?? "");
  const trimmed = raw.replace(/\s+/g, " ").trim();
  if (!trimmed) return "";

  const longToken = trimmed.match(/[\p{L}\p{N}]{5,}/u);
  if (longToken && longToken[0]) return longToken[0].slice(0, 80);

  const token = trimmed.match(/[\p{L}\p{N}]{3,}/u);
  if (token && token[0]) return token[0].slice(0, 80);

  return trimmed.slice(0, 80);
}

function buildAgentTypeVerifyExpression({ needle, elementId } = {}) {
  const query = String(needle || "").trim();
  const id = String(elementId || "").trim();
  return `(() => {
    const needleRaw = ${JSON.stringify(query)};
    const id = ${JSON.stringify(id)};

    const normalize = (s) => {
      try {
        return String(s || "")
          .replace(/[\\u200B\\u200C\\u200D\\uFEFF]/g, "")
          .replace(/\\s+/g, " ")
          .trim()
          .toLowerCase();
      } catch {
        return "";
      }
    };
    const needle = normalize(needleRaw);
    if (!needle) return true;
    const needleCompact = needle.replace(/\\s+/g, "");
    const contains = (s) => {
      const norm = normalize(s);
      if (!norm) return false;
      if (norm.includes(needle)) return true;
      if (!needleCompact) return false;
      const compact = norm.replace(/\\s+/g, "");
      return compact.includes(needleCompact);
    };

    const checkNode = (el) => {
      if (!el) return false;
      try {
        if (contains(el.innerText)) return true;
      } catch {}
      try {
        if (contains(el.textContent)) return true;
      } catch {}
      try {
        if ("value" in el && contains(el.value)) return true;
      } catch {}
      try {
        const aria = el.getAttribute && el.getAttribute("aria-label");
        if (contains(aria)) return true;
      } catch {}
      try {
        const title = el.getAttribute && el.getAttribute("title");
        if (contains(title)) return true;
      } catch {}
      return false;
    };

    if (id) {
      try {
        const el = document.querySelector('[data-sting-agent-id=\"' + id + '\"]');
        if (checkNode(el)) return true;
      } catch {}
    }

    try {
      if (checkNode(document.activeElement)) return true;
    } catch {}

    try {
      const iframe = document.querySelector('iframe.docs-texteventtarget-iframe');
      if (iframe && iframe.contentDocument) {
        const doc = iframe.contentDocument;
        try {
          if (contains(doc.body && doc.body.innerText ? doc.body.innerText : "")) return true;
        } catch {}
        try {
          if (contains(doc.body && doc.body.textContent ? doc.body.textContent : "")) return true;
        } catch {}
        try {
          if (checkNode(doc.activeElement)) return true;
        } catch {}
        try {
          const t = doc.querySelector && doc.querySelector("textarea, input, [contenteditable=\"true\"]");
          if (checkNode(t)) return true;
        } catch {}
      }
    } catch {}

    try {
      if (contains(document.body && document.body.innerText ? document.body.innerText : "")) return true;
    } catch {}
    try {
      if (contains(document.body && document.body.textContent ? document.body.textContent : "")) return true;
    } catch {}

    try {
      const nodes = document.querySelectorAll("[aria-label], [title]");
      const limit = Math.min(nodes.length, 500);
      for (let i = 0; i < limit; i++) {
        const el = nodes[i];
        try {
          const aria = el.getAttribute("aria-label");
          const title = el.getAttribute("title");
          if (contains(aria) || contains(title)) return true;
        } catch {}
      }
    } catch {}

    return false;
  })()`;
}

function normalizeAgentSearchText(value) {
  try {
    return String(value || "")
      .replace(/[\u200B\u200C\u200D\uFEFF]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  } catch {
    return "";
  }
}

function cdpAxValueToString(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value !== "object") return "";
  if (typeof value.value === "string") return value.value;
  if (typeof value.value === "number" || typeof value.value === "boolean") return String(value.value);
  return "";
}

function cdpAxNodeCandidateTexts(node) {
  const out = [];
  if (!node || typeof node !== "object") return out;
  try {
    const name = cdpAxValueToString(node.name);
    if (name) out.push(name);
  } catch {
  }
  try {
    const value = cdpAxValueToString(node.value);
    if (value) out.push(value);
  } catch {
  }
  try {
    const desc = cdpAxValueToString(node.description);
    if (desc) out.push(desc);
  } catch {
  }
  try {
    const props = Array.isArray(node.properties) ? node.properties : [];
    for (const prop of props) {
      const v = cdpAxValueToString(prop?.value);
      if (v) out.push(v);
    }
  } catch {
  }
  return out;
}

async function cdpAxContainsText(sendToTarget, sessionId, needle, { timeoutMs = 8_000, maxNodes = 2500 } = {}) {
  const query = normalizeAgentSearchText(needle);
  if (!query) return true;
  const queryCompact = query.replace(/\s+/g, "");
  try {
    await sendToTarget(sessionId, "Accessibility.enable", {}, { timeoutMs: 4_000 });
  } catch {
  }

  let res = null;
  try {
    res = await sendToTarget(sessionId, "Accessibility.getFullAXTree", {}, { timeoutMs });
  } catch {
    res = null;
  }
  const nodes = Array.isArray(res?.nodes) ? res.nodes : [];
  const limit = Math.max(0, Math.min(Number(maxNodes) || 0, 50_000));
  let checked = 0;

  for (const node of nodes) {
    checked++;
    if (limit && checked > limit) break;
    const texts = cdpAxNodeCandidateTexts(node);
    for (const text of texts) {
      if (!text) continue;
      const norm = normalizeAgentSearchText(text);
      if (norm.includes(query)) return true;
      if (queryCompact && norm.replace(/\s+/g, "").includes(queryCompact)) return true;
    }
  }
  return false;
}

async function cdpAxTextSnippet(sendToTarget, sessionId, { timeoutMs = 8_000, maxNodes = 1600, maxLen = 2800 } = {}) {
  try {
    await sendToTarget(sessionId, "Accessibility.enable", {}, { timeoutMs: 4_000 });
  } catch {
  }

  let res = null;
  try {
    res = await sendToTarget(sessionId, "Accessibility.getFullAXTree", {}, { timeoutMs });
  } catch {
    res = null;
  }
  const nodes = Array.isArray(res?.nodes) ? res.nodes : [];
  const limit = Math.max(0, Math.min(Number(maxNodes) || 0, 50_000));
  const seen = new Set();
  let out = "";
  let checked = 0;

  for (const node of nodes) {
    checked++;
    if (limit && checked > limit) break;
    const texts = cdpAxNodeCandidateTexts(node);
    for (const text of texts) {
      const clean = String(text || "").replace(/\s+/g, " ").trim();
      if (!clean) continue;
      const key = normalizeAgentSearchText(clean);
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      out += (out ? "\n" : "") + clean;
      if (out.length >= maxLen) return out.slice(0, maxLen);
    }
  }
  return out;
}

async function waitForAgentTypeVerification(sendToTarget, sessionId, { needle, elementId, timeoutMs = 2_500 } = {}) {
  const query = String(needle || "").trim();
  if (!query) return true;
  const expr = buildAgentTypeVerifyExpression({ needle: query, elementId });
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const ok = await cdpEvalValue(sendToTarget, sessionId, expr, { timeoutMs: 4_000 });
      if (ok === true) return true;
    } catch {
    }
    await delay(220);
  }
  return false;
}

async function cdpPressEnter(sendToTarget, sessionId, { timeoutMs = 8_000 } = {}) {
  const base = { key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, modifiers: 0 };
  await sendToTarget(sessionId, "Input.dispatchKeyEvent", { type: "rawKeyDown", ...base }, { timeoutMs });
  await sendToTarget(sessionId, "Input.dispatchKeyEvent", { type: "keyUp", ...base }, { timeoutMs });
}

async function agentType({ url, title, marker, elementId, text } = {}) {
  const id = String(elementId || "").trim();
  const value = String(text ?? "");
  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    try {
      await sendToTarget(sessionId, "Page.bringToFront", {}, { timeoutMs: 4_000 });
    } catch {
    }

    const getHostExpr = "(() => String(location && location.hostname ? location.hostname : ''))()";
    let isGoogleDocs = false;
    try {
      const host = String(await cdpEvalValue(sendToTarget, sessionId, getHostExpr, { timeoutMs: 3_000 }) || "");
      isGoogleDocs = host.endsWith("docs.google.com");
    } catch {
      isGoogleDocs = false;
    }

    const verifyNeedle = isGoogleDocs ? pickAgentTypeVerificationNeedle(value) : "";
    let verifyWasAlreadyPresent = false;
    if (isGoogleDocs && verifyNeedle) {
      try {
        const before = await cdpEvalValue(
          sendToTarget,
          sessionId,
          buildAgentTypeVerifyExpression({ needle: verifyNeedle, elementId: id }),
          { timeoutMs: 4_000 }
        );
        verifyWasAlreadyPresent = before === true;
      } catch {
        verifyWasAlreadyPresent = false;
      }
      if (!verifyWasAlreadyPresent) {
        try {
          verifyWasAlreadyPresent = await cdpAxContainsText(sendToTarget, sessionId, verifyNeedle, { timeoutMs: 8_000, maxNodes: 2200 });
        } catch {
          verifyWasAlreadyPresent = false;
        }
      }
    }

    let needsInsertText = true;
    if (id) {
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
            return { ok: true, usedDom: true };
          }
          if ('value' in el) {
            if (!setValue(el, text)) return { ok: false, error: 'Failed to set value' };
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            return { ok: true, usedDom: true };
          }
          return { ok: true, usedDom: false };
        } catch (err) {
          return { ok: false, error: String(err && err.message ? err.message : err) };
        }
      })()`;
      const res = await cdpEvalValue(sendToTarget, sessionId, expr, { timeoutMs: 15_000 });
      if (!res || res.ok !== true) throw new Error(String(res?.error || "Type failed"));
      needsInsertText = res.usedDom !== true;
    }

    if (needsInsertText) {
      const activeInfoExpr = `(() => {
        try {
          const el = document.activeElement;
          if (!el) return { has: false };
          const tag = String(el.tagName || "").toLowerCase();
          const isBody = el === document.body;
          const editable = Boolean(el.isContentEditable) || tag === "input" || tag === "textarea";
          return { has: true, tag, isBody, editable };
        } catch {
          return { has: false };
        }
      })()`;

      let shouldFocusBody = true;
      try {
        const info = await cdpEvalValue(sendToTarget, sessionId, activeInfoExpr, { timeoutMs: 2_000 });
        if (info && info.has && info.isBody !== true) shouldFocusBody = false;
      } catch {
        shouldFocusBody = true;
      }

      try {
        await cdpEvalValue(
          sendToTarget,
          sessionId,
          isGoogleDocs
            ? "(() => { try { window.focus(); } catch {} return true; })()"
            : shouldFocusBody
              ? "(() => { try { window.focus(); } catch {} try { document.body && document.body.focus && document.body.focus(); } catch {} return true; })()"
              : "(() => { try { window.focus(); } catch {} return true; })()",
          { timeoutMs: 2_000 }
        );
      } catch {
      }

      if (isGoogleDocs) {
        const focusIframeExpr = `(() => {
          try {
            const iframe = document.querySelector('iframe.docs-texteventtarget-iframe');
            if (!iframe) return { ok: false, error: 'Missing docs-texteventtarget-iframe' };
            try { iframe.focus && iframe.focus(); } catch {}
            try { iframe.contentWindow && iframe.contentWindow.focus && iframe.contentWindow.focus(); } catch {}
            try {
              const doc = iframe.contentDocument;
              if (doc) {
                let ae = null;
                try { ae = doc.activeElement; } catch { ae = null; }
                if (!ae || ae === doc.body) {
                  let t = null;
                  try { t = doc.querySelector('textarea, input, [contenteditable="true"]'); } catch { t = null; }
                  if (t) { try { t.focus && t.focus(); } catch {} }
                }
              }
            } catch {}
            return { ok: true };
          } catch (e) {
            return { ok: false, error: String(e && e.message ? e.message : e) };
          }
        })()`;
        try {
          await cdpEvalValue(sendToTarget, sessionId, focusIframeExpr, { timeoutMs: 3_000 });
        } catch {
        }
      }

      try {
        if (isGoogleDocs) {
          const keyLogInitExpr = `(() => {
            const getTop = () => { try { return window.top || window; } catch { return window; } };
            const topWin = getTop();
            try {
              if (!topWin.__stingAgentKeyLog || typeof topWin.__stingAgentKeyLog !== 'object') {
                topWin.__stingAgentKeyLog = { ts: 0, isTrusted: false, key: '', code: '' };
              }
            } catch {}

            const install = (w) => {
              try {
                const doc = w && w.document ? w.document : null;
                if (!doc) return;
                if (doc.__stingAgentKeyListenerInstalled) return;
                doc.__stingAgentKeyListenerInstalled = true;
                doc.addEventListener('keydown', (e) => {
                  try {
                    topWin.__stingAgentKeyLog = {
                      ts: Date.now(),
                      isTrusted: Boolean(e && e.isTrusted),
                      key: String(e && e.key ? e.key : ''),
                      code: String(e && e.code ? e.code : '')
                    };
                  } catch {}
                }, true);
              } catch {}
            };

            try {
              const seen = new Set();
              const queue = [window];
              while (queue.length && seen.size < 32) {
                const w = queue.shift();
                if (!w || seen.has(w)) continue;
                seen.add(w);
                install(w);
                let frames = null;
                try { frames = w.frames; } catch { frames = null; }
                if (!frames) continue;
                let len = 0;
                try { len = Math.min(frames.length, 32); } catch { len = 0; }
                for (let i = 0; i < len; i++) {
                  try { queue.push(frames[i]); } catch {}
                }
              }
            } catch {}

            try { return Number(topWin.__stingAgentKeyLog && topWin.__stingAgentKeyLog.ts ? topWin.__stingAgentKeyLog.ts : 0) || 0; } catch { return 0; }
          })()`;
          const readKeyLogExpr = `(() => {
            try {
              const topWin = window.top || window;
              const log = topWin && topWin.__stingAgentKeyLog;
              return log && typeof log === 'object' ? log : null;
            } catch {
              const log = window.__stingAgentKeyLog;
              return log && typeof log === 'object' ? log : null;
            }
          })()`;

          let beforeKeyTs = 0;
          try {
            beforeKeyTs = Number(await cdpEvalValue(sendToTarget, sessionId, keyLogInitExpr, { timeoutMs: 4_000 })) || 0;
          } catch {
            beforeKeyTs = 0;
          }

          const typed = await cdpTypeText(sendToTarget, sessionId, value, { delayMs: 0, timeoutMs: 8_000 });
          if (typed.usedKeyEvents) {
            await delay(60);
            const after = await cdpEvalValue(sendToTarget, sessionId, readKeyLogExpr, { timeoutMs: 4_000 });
            const afterTs = Number(after?.ts) || 0;
            const trusted = Boolean(after?.isTrusted);
            if (afterTs <= beforeKeyTs || !trusted) {
              throw new Error(
                "Typing did not produce trusted key events. On Google Docs/Slides, click the exact editable canvas area first, then try again."
              );
            }
          }
        } else {
          await sendToTarget(sessionId, "Input.insertText", { text: value }, { timeoutMs: 15_000 });
        }
      } catch (err) {
        const fallbackExpr = `(() => {
          const text = ${JSON.stringify(value)};
          const el = document.activeElement;
          if (!el) return { ok: false, error: 'No active element to type into' };
          try {
            if (el.isContentEditable) {
              el.textContent = String(el.textContent || '') + text;
              el.dispatchEvent(new Event('input', { bubbles: true }));
              return { ok: true };
            }
            if ('value' in el) {
              el.value = String(el.value || '') + text;
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
              return { ok: true };
            }
          } catch {}
          return { ok: false, error: 'Active element is not writable' };
        })()`;
        const res = await cdpEvalValue(sendToTarget, sessionId, fallbackExpr, { timeoutMs: 15_000 });
        if (!res || res.ok !== true) throw new Error(String(res?.error || err?.message || err || "Type failed"));
      }

      if (isGoogleDocs && verifyNeedle && !verifyWasAlreadyPresent) {
        await delay(120);
        let ok = await waitForAgentTypeVerification(sendToTarget, sessionId, { needle: verifyNeedle, elementId: id, timeoutMs: 2_500 });
        if (!ok) {
          try {
            ok = await cdpAxContainsText(sendToTarget, sessionId, verifyNeedle, { timeoutMs: 8_000, maxNodes: 2400 });
          } catch {
            ok = false;
          }
        }
        if (!ok) {
          try {
            await cdpPressEnter(sendToTarget, sessionId, { timeoutMs: 8_000 });
          } catch {
          }
          await delay(140);
          try {
            await cdpTypeText(sendToTarget, sessionId, value, { delayMs: 0, timeoutMs: 8_000 });
          } catch {
          }
          await delay(140);
          let retryOk = await waitForAgentTypeVerification(sendToTarget, sessionId, { needle: verifyNeedle, elementId: id, timeoutMs: 2_500 });
          if (!retryOk) {
            try {
              retryOk = await cdpAxContainsText(sendToTarget, sessionId, verifyNeedle, { timeoutMs: 8_000, maxNodes: 2600 });
            } catch {
              retryOk = false;
            }
          }
          if (!retryOk) {
            throw new Error(
              "Text was not detected after typing. On Google Docs/Slides, you may need to click the exact editable canvas/text box (sometimes double-click or press Enter) before typing."
            );
          }
        }
      }
    }

    return { ok: true, isGoogleDocs };
  });
}

async function agentVerifyTextPresent({ url, title, marker, needle, elementId, isGoogleDocs } = {}) {
  const query = String(needle || "").trim();
  if (!query) return true;
  const id = String(elementId || "").trim();
  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    try {
      const ok = await cdpEvalValue(
        sendToTarget,
        sessionId,
        buildAgentTypeVerifyExpression({ needle: query, elementId: id }),
        { timeoutMs: 5_000 }
      );
      if (ok === true) return true;
    } catch {
    }

    if (isGoogleDocs) {
      try {
        return await cdpAxContainsText(sendToTarget, sessionId, query, { timeoutMs: 12_000, maxNodes: 12_000 });
      } catch {
        return false;
      }
    }

    return false;
  });
}

function clampAgentNumber(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function buildFillTextPointSequence({ primary, secondary, maxAttempts }) {
  const points = [];
  if (!primary && !secondary) return points;
  const a = primary || secondary;
  const b = secondary || primary || a;
  for (let i = 0; i < maxAttempts; i++) {
    const pick = Math.floor(i / 2) % 2 === 0 ? a : b;
    points.push({ x: pick.x, y: pick.y });
  }
  return points;
}

function buildFillTextJitterSequence({ x, y, maxAttempts, vw, vh }) {
  const baseX = Number(x);
  const baseY = Number(y);
  const maxX = Number.isFinite(Number(vw)) && Number(vw) > 0 ? Math.max(0, Number(vw) - 1) : Number.POSITIVE_INFINITY;
  const maxY = Number.isFinite(Number(vh)) && Number(vh) > 0 ? Math.max(0, Number(vh) - 1) : Number.POSITIVE_INFINITY;
  const offsets = [
    [0, 0],
    [3, 0],
    [-3, 0],
    [0, 3],
    [0, -3],
    [3, 3],
    [-3, 3],
    [3, -3],
    [-3, -3]
  ];
  const points = [];
  for (let i = 0; i < maxAttempts; i++) {
    const [dx, dy] = offsets[i % offsets.length];
    const px = clampAgentNumber(baseX + dx, 0, maxX);
    const py = clampAgentNumber(baseY + dy, 0, maxY);
    points.push({ x: px, y: py });
  }
  return points;
}

async function agentResolveGoogleDocsFillSurface({ url, title, marker, elementId } = {}) {
  const id = String(elementId || "").trim();
  if (!id) return null;
  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    try {
      await sendToTarget(sessionId, "Page.bringToFront", {}, { timeoutMs: 4_000 });
    } catch {
    }

    const expr = `(() => {
      const id = ${JSON.stringify(id)};
      const clean = (s) => String(s || '').replace(/\\s+/g, ' ').trim();
      const vw = Number(window.innerWidth) || 0;
      const vh = Number(window.innerHeight) || 0;

      const isVisible = (el) => {
        try {
          if (!el) return false;
          const style = window.getComputedStyle(el);
          if (!style) return false;
          if (style.visibility === 'hidden' || style.display === 'none') return false;
          const rect = el.getBoundingClientRect();
          if (!rect || rect.width < 8 || rect.height < 8) return false;
          if (rect.bottom < 0 || rect.right < 0) return false;
          if (rect.top > vh || rect.left > vw) return false;
          return true;
        } catch {
          return false;
        }
      };

      const clampRect = (rect) => {
        try {
          if (!rect) return null;
          const left = Math.max(0, Number(rect.left) || 0);
          const right = Math.min(vw, Number(rect.right) || 0);
          const top = Math.max(0, Number(rect.top) || 0);
          const bottom = Math.min(vh, Number(rect.bottom) || 0);
          const w = right - left;
          const h = bottom - top;
          if (w < 8 || h < 8) return null;
          return { left, right, top, bottom, w, h, area: w * h };
        } catch {
          return null;
        }
      };

      const describe = (el) => {
        try {
          const tag = String(el && el.tagName ? el.tagName : '').toLowerCase();
          const role = clean(el && el.getAttribute ? el.getAttribute('role') : '');
          const ariaLabel = clean(el && el.getAttribute ? el.getAttribute('aria-label') : '');
          const text = clean(el && (el.innerText || el.textContent) ? (el.innerText || el.textContent) : '');
          const isContentEditable = Boolean(el && el.isContentEditable);
          const isTextLike = role === 'textbox' || isContentEditable || tag === 'input' || tag === 'textarea';
          return { tag, role, ariaLabel, text, isContentEditable, isTextLike };
        } catch {
          return { tag: '', role: '', ariaLabel: '', text: '', isContentEditable: false, isTextLike: false };
        }
      };

      let targetEl = null;
      try { targetEl = document.querySelector('[data-sting-agent-id=\"' + id + '\"]'); } catch { targetEl = null; }
      let targetMeta = targetEl ? describe(targetEl) : null;
      let targetRect = null;
      if (targetEl) {
        try { targetEl.scrollIntoView({ block: 'center', inline: 'center' }); } catch {}
        try { targetEl.focus && targetEl.focus(); } catch {}
        try { targetRect = clampRect(targetEl.getBoundingClientRect()); } catch { targetRect = null; }
      }

      let bestCanvasRect = null;
      let bestCanvasArea = 0;
      try {
        const canvases = document.querySelectorAll('canvas');
        for (const c of canvases) {
          if (!isVisible(c)) continue;
          const r = clampRect(c.getBoundingClientRect());
          if (!r) continue;
          if (r.area > bestCanvasArea) {
            bestCanvasArea = r.area;
            bestCanvasRect = r;
          }
        }
      } catch {
        bestCanvasRect = null;
      }

      const isSidebarRect = (r) => {
        if (!r) return false;
        return r.w < vw * 0.22 && r.h > vh * 0.35;
      };

      const useTarget =
        Boolean(targetRect) &&
        Boolean(targetMeta) &&
        (targetMeta.isTextLike || targetMeta.tag === 'canvas' || (!isSidebarRect(targetRect) && targetRect.w > vw * 0.28 && targetRect.h > vh * 0.28));

      const useCanvas = Boolean(bestCanvasRect) && bestCanvasRect.w > vw * 0.28 && bestCanvasRect.h > vh * 0.28;

      let chosen = null;
      if (useTarget) {
        chosen = { ...targetRect, ...targetMeta, source: 'target' };
      } else if (useCanvas) {
        chosen = { ...bestCanvasRect, tag: 'canvas', role: '', ariaLabel: '', text: '', isContentEditable: false, isTextLike: false, source: 'canvas' };
      } else if (targetRect && targetMeta) {
        chosen = { ...targetRect, ...targetMeta, source: 'target-weak' };
      } else if (bestCanvasRect) {
        chosen = { ...bestCanvasRect, tag: 'canvas', role: '', ariaLabel: '', text: '', isContentEditable: false, isTextLike: false, source: 'canvas-weak' };
      }

      return { vw, vh, chosen };
    })()`;

    try {
      const res = await cdpEvalValue(sendToTarget, sessionId, expr, { timeoutMs: 12_000 });
      if (!res || typeof res !== "object" || !res.chosen) return null;
      return res;
    } catch {
      return null;
    }
  });
}

async function agentFillText({ url, title, marker, elementId, x, y, clickCount, text, enter, retries } = {}) {
  const id = String(elementId || "").trim();
  const value = String(text ?? "");
  const hasCoords = Number.isFinite(Number(x)) && Number.isFinite(Number(y));
  if (!id && !hasCoords) throw new Error("Missing elementId (or x/y)");
  if (!value) throw new Error("Missing text");

  let isGoogleDocs = false;
  try {
    const href = String(url || "");
    const host = href && href.includes("://") ? new URL(href).hostname : "";
    isGoogleDocs = host.endsWith("docs.google.com");
  } catch {
    isGoogleDocs = false;
  }

  const countRaw = Number(clickCount);
  const preferredCount = Number.isFinite(countRaw) ? Math.max(1, Math.min(3, Math.floor(countRaw))) : isGoogleDocs ? 2 : 1;
  const altCount = preferredCount === 1 ? 2 : 1;
  const countOptions = [preferredCount, altCount].filter((v, i, a) => a.indexOf(v) === i);

  const enterPref = enter == null ? null : Boolean(enter);
  const enterOptions = enterPref == null ? (isGoogleDocs ? [false, true] : [false]) : [enterPref, false].filter((v, i, a) => a.indexOf(v) === i);
  const strategies = [];
  for (const c of countOptions) {
    for (const e of enterOptions) strategies.push({ clickCount: c, enter: e });
  }

  const retriesRaw = Number(retries);
  const extraAttempts = Number.isFinite(retriesRaw) ? Math.max(0, Math.min(5, Math.floor(retriesRaw))) : isGoogleDocs ? 3 : 1;
  const maxAttempts = Math.max(1, 1 + extraAttempts);

  const verifyNeedle = isGoogleDocs ? pickAgentTypeVerificationNeedle(value) : "";
  const typedElementId = isGoogleDocs ? "" : id;

  let docsSurface = null;
  if (isGoogleDocs && !hasCoords && id) {
    try {
      docsSurface = await agentResolveGoogleDocsFillSurface({ url, title, marker, elementId: id });
    } catch {
      docsSurface = null;
    }
  }

  const clickPoints = (() => {
    if (!isGoogleDocs) return [];
    const max = maxAttempts;
    if (hasCoords) {
      const viewport = docsSurface && typeof docsSurface === "object" ? docsSurface : null;
      const vw = Number(viewport?.vw) || 0;
      const vh = Number(viewport?.vh) || 0;
      return buildFillTextJitterSequence({ x: Number(x), y: Number(y), maxAttempts: max, vw, vh });
    }
    const chosen = docsSurface && typeof docsSurface === "object" ? docsSurface.chosen : null;
    if (!chosen || typeof chosen !== "object") return [];

    const vw = Number(docsSurface.vw) || 0;
    const vh = Number(docsSurface.vh) || 0;
    const left = Number(chosen.left) || 0;
    const top = Number(chosen.top) || 0;
    const w = Math.max(0, Number(chosen.w) || 0);
    const h = Math.max(0, Number(chosen.h) || 0);
    if (!w || !h || !vw || !vh) return [];

    const cx = clampAgentNumber(Math.floor(left + w / 2), 0, Math.max(0, vw - 1));
    const cy = clampAgentNumber(Math.floor(top + h / 2), 0, Math.max(0, vh - 1));
    const preferTop = chosen.tag === "canvas" || (h > vh * 0.45 && w > vw * 0.35 && chosen.isTextLike !== true);
    const topYRaw = preferTop ? top + h * 0.22 : top + h * 0.35;
    const topY = clampAgentNumber(Math.floor(topYRaw), 0, Math.max(0, vh - 1));
    const primary = preferTop ? { x: cx, y: topY } : { x: cx, y: cy };
    const secondary = { x: cx, y: cy };
    return buildFillTextPointSequence({ primary, secondary, maxAttempts: max });
  })();

  let lastError = null;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const strat = strategies[Math.min(attempt, strategies.length - 1)];
    try {
      const point = clickPoints.length ? clickPoints[Math.min(attempt, clickPoints.length - 1)] : null;
      await agentClick(
        point
          ? { url, title, marker, x: Number(point.x), y: Number(point.y), clickCount: strat.clickCount }
          : {
              url,
              title,
              marker,
              elementId: id,
              x: hasCoords ? Number(x) : undefined,
              y: hasCoords ? Number(y) : undefined,
              clickCount: strat.clickCount
            }
      );
      if (isGoogleDocs) await delay(120);

      if (strat.enter) {
        try {
          await agentPress({ url, title, marker, key: "Enter" });
        } catch {
        }
        if (isGoogleDocs) await delay(120);
      }

      await agentType({ url, title, marker, elementId: typedElementId, text: value });
      return { ok: true };
    } catch (err) {
      lastError = err;
      if (isGoogleDocs && verifyNeedle) {
        try {
          const present = await agentVerifyTextPresent({
            url,
            title,
            marker,
            needle: verifyNeedle,
            elementId: id,
            isGoogleDocs: true
          });
          if (present) return { ok: true };
        } catch {
        }
      }
      await delay(180);
    }
  }

  const msg = String(lastError?.message || lastError || "fillText failed");
  throw new Error(`fillText failed after ${maxAttempts} attempt(s): ${msg}`);
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

function normalizeHotkeyCombo(raw) {
  const text = String(raw || "").trim();
  if (!text) return null;
  const tokens = text
    .split(/[+\s]+/g)
    .map((t) => String(t || "").trim())
    .filter(Boolean)
    .slice(0, 8);
  if (!tokens.length) return null;

  let modifiers = 0;
  let main = "";

  for (const token of tokens) {
    const t = token.replace(/\s+/g, "").toLowerCase();
    if (!t) continue;
    if (["cmd", "command", "meta", "win", "windows"].includes(t)) modifiers |= CDP_KEY_MODIFIER_META;
    else if (["ctrl", "control"].includes(t)) modifiers |= CDP_KEY_MODIFIER_CTRL;
    else if (["alt", "option"].includes(t)) modifiers |= CDP_KEY_MODIFIER_ALT;
    else if (t === "shift") modifiers |= CDP_KEY_MODIFIER_SHIFT;
    else main = token;
  }

  if (!main) return null;

  const named = normalizePressKey(main);
  if (named) return { modifiers, ...named };

  const single = String(main || "").trim();
  if (/^[a-z]$/i.test(single)) {
    const upper = single.toUpperCase();
    return { modifiers, key: upper, code: `Key${upper}`, vk: upper.charCodeAt(0) };
  }
  if (/^[0-9]$/.test(single)) {
    return { modifiers, key: single, code: `Digit${single}`, vk: single.charCodeAt(0) };
  }
  if (single === " ") return { modifiers, key: " ", code: "Space", vk: 32 };

  return null;
}

async function agentHotkey({ url, title, marker, keys } = {}) {
  const combo = normalizeHotkeyCombo(keys);
  if (!combo) {
    throw new Error("Unsupported hotkey (example: Ctrl+L, Cmd+Shift+P, Enter).");
  }
  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    try {
      await sendToTarget(sessionId, "Page.bringToFront", {}, { timeoutMs: 4_000 });
    } catch {
    }

    const base = {
      key: combo.key,
      code: combo.code,
      windowsVirtualKeyCode: combo.vk,
      nativeVirtualKeyCode: combo.vk,
      modifiers: combo.modifiers
    };
    await sendToTarget(sessionId, "Input.dispatchKeyEvent", { type: "rawKeyDown", ...base }, { timeoutMs: 8_000 });
    await sendToTarget(sessionId, "Input.dispatchKeyEvent", { type: "keyUp", ...base }, { timeoutMs: 8_000 });
    return { ok: true, keys: String(keys || "").trim(), key: combo.key, code: combo.code, modifiers: combo.modifiers };
  });
}

async function agentPress({ url, title, marker, key } = {}) {
  const info = normalizePressKey(key);
  if (!info) {
    throw new Error(
      "Unsupported key (supported: Enter, Tab, Escape, Backspace, Delete, PageUp, PageDown, Home, End, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Space)."
    );
  }
  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    try {
      await sendToTarget(sessionId, "Page.bringToFront", {}, { timeoutMs: 4_000 });
    } catch {
    }

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

    const keyLogInitExpr = `(() => {
      const getTop = () => { try { return window.top || window; } catch { return window; } };
      const topWin = getTop();
      try {
        if (!topWin.__stingAgentKeyLog || typeof topWin.__stingAgentKeyLog !== 'object') {
          topWin.__stingAgentKeyLog = { ts: 0, isTrusted: false, key: '', code: '' };
        }
      } catch {}

      const install = (w) => {
        try {
          const doc = w && w.document ? w.document : null;
          if (!doc) return;
          if (doc.__stingAgentKeyListenerInstalled) return;
          doc.__stingAgentKeyListenerInstalled = true;
          doc.addEventListener('keydown', (e) => {
            try {
              topWin.__stingAgentKeyLog = {
                ts: Date.now(),
                isTrusted: Boolean(e && e.isTrusted),
                key: String(e && e.key ? e.key : ''),
                code: String(e && e.code ? e.code : '')
              };
            } catch {}
          }, true);
        } catch {}
      };

      try {
        const seen = new Set();
        const queue = [window];
        while (queue.length && seen.size < 32) {
          const w = queue.shift();
          if (!w || seen.has(w)) continue;
          seen.add(w);
          install(w);
          let frames = null;
          try { frames = w.frames; } catch { frames = null; }
          if (!frames) continue;
          let len = 0;
          try { len = Math.min(frames.length, 32); } catch { len = 0; }
          for (let i = 0; i < len; i++) {
            try { queue.push(frames[i]); } catch {}
          }
        }
      } catch {}

      try { return Number(topWin.__stingAgentKeyLog && topWin.__stingAgentKeyLog.ts ? topWin.__stingAgentKeyLog.ts : 0) || 0; } catch { return 0; }
    })()`;
    const readKeyLogExpr = `(() => {
      try {
        const topWin = window.top || window;
        const log = topWin && topWin.__stingAgentKeyLog;
        return log && typeof log === 'object' ? log : null;
      } catch {
        const log = window.__stingAgentKeyLog;
        return log && typeof log === 'object' ? log : null;
      }
    })()`;
    const getHostExpr = "(() => String(location && location.hostname ? location.hostname : ''))()";

    const keyProducedEvent = async () => {
      try {
        const log = await cdpEvalValue(sendToTarget, sessionId, readKeyLogExpr, { timeoutMs: 4_000 });
        const ts = Number(log?.ts) || 0;
        return { ts, isTrusted: Boolean(log?.isTrusted), key: String(log?.key || ""), code: String(log?.code || "") };
      } catch {
        return { ts: 0, isTrusted: false, key: "", code: "" };
      }
    };

    const isGoogleDocsHost = async () => {
      try {
        const host = String(await cdpEvalValue(sendToTarget, sessionId, getHostExpr, { timeoutMs: 3_000 }) || "");
        return host.endsWith("docs.google.com");
      } catch {
        return false;
      }
    };

    let beforeKeyTs = 0;
    try {
      beforeKeyTs = Number(await cdpEvalValue(sendToTarget, sessionId, keyLogInitExpr, { timeoutMs: 4_000 })) || 0;
    } catch {
      beforeKeyTs = 0;
    }

    const isDocs = await isGoogleDocsHost();

    try {
      await cdpEvalValue(
        sendToTarget,
        sessionId,
        isDocs
          ? "(() => { try { window.focus(); } catch {} return true; })()"
          : "(() => { try { window.focus(); } catch {} try { document.body && document.body.focus && document.body.focus(); } catch {} return true; })()",
        { timeoutMs: 2_000 }
      );
    } catch {
    }

    if (isDocs) {
      try {
        await cdpEvalValue(
          sendToTarget,
          sessionId,
          "(() => { try { const f = document.querySelector('iframe.docs-texteventtarget-iframe'); if (f) { try { f.focus && f.focus(); } catch {} try { f.contentWindow && f.contentWindow.focus && f.contentWindow.focus(); } catch {} } } catch {} return true; })()",
          { timeoutMs: 2_000 }
        );
      } catch {
      }
    }

    let usedTrustedInput = true;
    try {
      await sendToTarget(sessionId, "Input.dispatchKeyEvent", { type: "rawKeyDown", ...base }, { timeoutMs: 8_000 });
      await sendToTarget(sessionId, "Input.dispatchKeyEvent", { type: "keyUp", ...base }, { timeoutMs: 8_000 });
    } catch (err) {
      usedTrustedInput = false;
      const fallbackExpr = `(() => {
        const key = ${JSON.stringify(info.key)};
        const code = ${JSON.stringify(info.code)};
        try {
          const target = document.activeElement || document;
          target.dispatchEvent(new KeyboardEvent('keydown', { key, code, bubbles: true, cancelable: true }));
          target.dispatchEvent(new KeyboardEvent('keyup', { key, code, bubbles: true, cancelable: true }));
          return { ok: true };
        } catch (e) {
          return { ok: false, error: String(e && e.message ? e.message : e) };
        }
      })()`;
      try {
        const res = await cdpEvalValue(sendToTarget, sessionId, fallbackExpr, { timeoutMs: 8_000 });
        if (!res || res.ok !== true) throw new Error(String(res?.error || "Key event failed"));
      } catch {
      }
      await delay(60);
      const after = await keyProducedEvent();
      if (after.ts <= beforeKeyTs && !isScrollKey) throw new Error(String(err?.message || err || "Key press failed"));
    }

    if (isDocs && !isScrollKey) {
      await delay(60);
      const after = await keyProducedEvent();
      const observed = after.ts > beforeKeyTs;
      const matchesKey = String(after.key || "") === info.key && String(after.code || "") === info.code;
      const isTrusted = Boolean(after.isTrusted);

      if (!observed || !matchesKey) {
        try {
          const focusIframeExpr = `(() => {
            try {
              const iframe = document.querySelector('iframe.docs-texteventtarget-iframe');
              if (iframe) {
                try { iframe.focus && iframe.focus(); } catch {}
                try { iframe.contentWindow && iframe.contentWindow.focus && iframe.contentWindow.focus(); } catch {}
              }
            } catch {}
            return true;
          })()`;
          await cdpEvalValue(sendToTarget, sessionId, focusIframeExpr, { timeoutMs: 2_000 });
        } catch {
        }

        const retryBeforeTs = Math.max(beforeKeyTs, Number(after.ts) || 0);
        try {
          await sendToTarget(sessionId, "Input.dispatchKeyEvent", { type: "rawKeyDown", ...base }, { timeoutMs: 8_000 });
          await sendToTarget(sessionId, "Input.dispatchKeyEvent", { type: "keyUp", ...base }, { timeoutMs: 8_000 });
        } catch (err) {
          usedTrustedInput = false;
          if (!isScrollKey) throw err;
        }

        await delay(80);
        const afterRetry = await keyProducedEvent();
        const observedRetry = afterRetry.ts > retryBeforeTs;
        const matchesRetry = String(afterRetry.key || "") === info.key && String(afterRetry.code || "") === info.code;
        const trustedRetry = Boolean(afterRetry.isTrusted);

        if (observedRetry && matchesRetry && trustedRetry) {
          // ok
        } else if (!usedTrustedInput) {
          throw new Error("Untrusted key event; Google Docs/Slides often ignores synthetic keypresses (CDP input may be blocked).");
        } else if (observedRetry && matchesRetry && !trustedRetry) {
          throw new Error("Untrusted key event; Google Docs/Slides often ignores synthetic keypresses (CDP input may be blocked).");
        }
      } else if (!usedTrustedInput || !isTrusted) {
        throw new Error("Untrusted key event; Google Docs/Slides often ignores synthetic keypresses (CDP input may be blocked).");
      }
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
    return { ok: true, key: info.key, code: info.code };
  });
}

async function agentNavigate({ url, title, marker, toUrl } = {}) {
  const next = String(toUrl || "").trim();
  if (!next) throw new Error("Missing url");
  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    await sendToTarget(sessionId, "Page.navigate", { url: next }, { timeoutMs: 15_000 });
    return { ok: true, url: next };
  });
}

async function agentWaitForLoad({ url, title, marker, state } = {}) {
  const s = String(state || "networkidle").trim().toLowerCase();
  const desired = s === "domcontentloaded" ? "domcontentloaded" : s === "load" ? "load" : "networkidle";
  const timeoutMs = 20_000;
  const quietMs = 650;

  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    const start = Date.now();
    let lastResourceCount = null;
    let lastResourceChangeAt = Date.now();
    const getPerfCountsExpr = `(() => {
      try {
        const perf = (typeof performance !== "undefined" && performance) ? performance : null;
        if (!perf || typeof perf.getEntriesByType !== "function") return { ok: false };
        const resources = perf.getEntriesByType("resource");
        const n = Array.isArray(resources) ? resources.length : Number(resources && resources.length ? resources.length : 0) || 0;
        return { ok: true, resources: Number(n) || 0 };
      } catch {
        return { ok: false };
      }
    })()`;
    while (Date.now() - start < timeoutMs) {
      const readyState = await cdpEvalValue(sendToTarget, sessionId, "document.readyState", { timeoutMs: 3_000 });
      const rs = String(readyState || "").toLowerCase();
      if (desired === "domcontentloaded") {
        if (rs === "interactive" || rs === "complete") return { ok: true };
      } else if (rs === "complete") {
        if (desired !== "networkidle") return { ok: true };

        let perf = null;
        try {
          perf = await cdpEvalValue(sendToTarget, sessionId, getPerfCountsExpr, { timeoutMs: 3_000 });
        } catch {
          perf = null;
        }

        if (!perf || perf.ok !== true) {
          await delay(350);
          return { ok: true };
        }

        const count = Number(perf.resources);
        const now = Date.now();
        if (!Number.isFinite(count)) {
          await delay(350);
          return { ok: true };
        }
        if (lastResourceCount == null) {
          lastResourceCount = count;
          lastResourceChangeAt = now;
        } else if (count !== lastResourceCount) {
          lastResourceCount = count;
          lastResourceChangeAt = now;
        }

        if (now - lastResourceChangeAt >= quietMs) {
          return { ok: true, waitedMs: now - start, quietMs };
        }
      }
      await delay(180);
    }
    throw new Error(`Timed out waiting for load (${desired})`);
  });
}

async function agentWaitFor({ url, title, marker, selector, text, urlIncludes, timeoutMs } = {}) {
  const sel = String(selector || "").trim();
  const query = String(text || "").trim();
  const urlNeedle = String(urlIncludes || "").trim();
  const timeout = (() => {
    const n = Number(timeoutMs);
    if (!Number.isFinite(n)) return 15_000;
    return Math.max(1_000, Math.min(60_000, Math.floor(n)));
  })();

  if (!sel && !query && !urlNeedle) {
    throw new Error("waitFor requires selector/text/urlIncludes");
  }

  const expr = `(() => {
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
        if (style.pointerEvents === "none") return false;
        const rect = el.getBoundingClientRect();
        if (!rect || rect.width < 2 || rect.height < 2) return false;
        return true;
      } catch {
        return false;
      }
    };

    const selector = clean(${JSON.stringify(sel)});
    const text = clean(${JSON.stringify(query)});
    const urlNeedle = clean(${JSON.stringify(urlNeedle)});
    const href = String(location && location.href ? location.href : '');
    if (urlNeedle && !href.includes(urlNeedle)) return { ok: false, url: href, reason: 'url' };

    if (text) {
      let bodyText = '';
      try { bodyText = clean(document.body && document.body.innerText ? document.body.innerText : ''); } catch { bodyText = ''; }
      const hay = bodyText.toLowerCase();
      const needle = text.toLowerCase();
      if (!hay.includes(needle)) return { ok: false, url: href, reason: 'text' };
    }

    let element = null;
    if (selector) {
      let el = null;
      try { el = document.querySelector(selector); } catch { el = null; }
      if (!el) return { ok: false, url: href, reason: 'selector' };
      if (!isVisible(el)) return { ok: false, url: href, reason: 'selector_not_visible' };

      let nextId = 1;
      try {
        const n = Number(window.__stingAgentNextId);
        if (Number.isFinite(n) && n > 0) nextId = Math.floor(n);
      } catch {}

      let id = '';
      try { id = String(el.getAttribute && el.getAttribute('data-sting-agent-id') ? el.getAttribute('data-sting-agent-id') : '').trim(); } catch { id = ''; }
      if (!id) {
        id = String(nextId++);
        try { el.setAttribute('data-sting-agent-id', id); } catch { id = ''; }
      }
      try { window.__stingAgentNextId = nextId; } catch {}

      const tag = String(el.tagName || '').toLowerCase();
      const role = clean(el.getAttribute && el.getAttribute('role'));
      const ariaLabel = clean(el.getAttribute && el.getAttribute('aria-label'));
      const text = clean(el.innerText || el.textContent);
      const rect = toRect(el);
      element = { id: String(id || ''), tag, role, ariaLabel: String(ariaLabel || '').slice(0, 120), text: String(text || '').slice(0, 120), rect };
    }

    return { ok: true, url: href, element };
  })()`;

  return withWebviewTargetSession({ url, title, marker }, async ({ sendToTarget, sessionId }) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const res = await cdpEvalValue(sendToTarget, sessionId, expr, { timeoutMs: 4_000 });
      if (res && res.ok === true) {
        return { ok: true, url: String(res.url || ""), element: res.element || null, waitedMs: Date.now() - start };
      }
      await delay(220);
    }
    throw new Error("Timed out waiting for condition");
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

async function agentDownloadsWait({ id, since, state, timeoutMs } = {}) {
  const wantId = String(id || "").trim();
  const sinceMs = (() => {
    const n = Number(since);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.floor(n));
  })();
  const wantState = String(state || "completed").trim().toLowerCase();
  const timeout = (() => {
    const n = Number(timeoutMs);
    if (!Number.isFinite(n)) return 30_000;
    return Math.max(1_000, Math.min(120_000, Math.floor(n)));
  })();

  const start = Date.now();
  while (Date.now() - start < timeout) {
    let rec = null;
    if (wantId) {
      rec = downloadsById.get(wantId) || null;
      if (rec && sinceMs && Number(rec.startTime) < sinceMs) rec = null;
    } else {
      const items = Array.from(downloadsById.values()).sort((a, b) => Number(b.startTime) - Number(a.startTime));
      rec =
        items.find((d) => {
          if (!d) return false;
          if (sinceMs && Number(d.startTime) < sinceMs) return false;
          if (!wantState) return true;
          return String(d.state || "").trim().toLowerCase() === wantState;
        }) || null;
    }

    if (rec) {
      const s = String(rec.state || "").trim().toLowerCase();
      if (!wantState || s === wantState) {
        return { ok: true, download: rec };
      }
    }

    await delay(250);
  }

  throw new Error("Timed out waiting for download");
}

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

ipcMain.handle("agent:findElements", async (_e, payload) => {
  try {
    const result = await agentFindElements(payload || {});
    return { ok: true, matches: Array.isArray(result?.matches) ? result.matches : [] };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:readElement", async (_e, payload) => {
  try {
    const result = await agentReadElement(payload || {});
    return { ok: true, element: result?.element || null };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:scrollIntoView", async (_e, payload) => {
  try {
    const result = await agentScrollIntoView(payload || {});
    return { ok: true, rect: result?.rect || null };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:screenshot", async (_e, payload) => {
  try {
    const result = await agentScreenshot(payload || {});
    return { ok: true, screenshot: { path: String(result?.path || ""), mimeType: String(result?.mimeType || "") } };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:uploadFile", async (_e, payload) => {
  try {
    const result = await agentUploadFile(payload || {});
    return { ok: true, filesCount: Number(result?.filesCount) || 0 };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:click", async (_e, payload) => {
  try {
    const result = await agentClick(payload || {});
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:hover", async (_e, payload) => {
  try {
    const result = await agentHover(payload || {});
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:scroll", async (_e, payload) => {
  try {
    const result = await agentScroll(payload || {});
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:type", async (_e, payload) => {
  try {
    const result = await agentType(payload || {});
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:fillText", async (_e, payload) => {
  try {
    const result = await agentFillText(payload || {});
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:hotkey", async (_e, payload) => {
  try {
    const result = await agentHotkey(payload || {});
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:press", async (_e, payload) => {
  try {
    const result = await agentPress(payload || {});
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:navigate", async (_e, payload) => {
  try {
    const result = await agentNavigate(payload || {});
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:waitForLoad", async (_e, payload) => {
  try {
    const result = await agentWaitForLoad(payload || {});
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:waitFor", async (_e, payload) => {
  try {
    const result = await agentWaitFor(payload || {});
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
});

ipcMain.handle("agent:downloadsWait", async (_e, payload) => {
  try {
    const result = await agentDownloadsWait(payload || {});
    return { ok: true, download: result?.download || null };
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
