const { contextBridge, ipcRenderer, clipboard } = require("electron");

contextBridge.exposeInMainWorld("aiBridge", {
  listLocalModels: () => ipcRenderer.invoke("local:listModels"),
  pullLocalModel: (modelName) => ipcRenderer.invoke("local:pullModel", modelName),
  listPrompts: () => ipcRenderer.invoke("prompts:list"),
  savePrompts: (prompts) => ipcRenderer.invoke("prompts:save", prompts),
  resetPrompts: () => ipcRenderer.invoke("prompts:reset"),
  getSettings: () => ipcRenderer.invoke("settings:get"),
  setGeminiModel: (model) => ipcRenderer.invoke("settings:setGeminiModel", model),
  setGeminiApiKey: (apiKey) => ipcRenderer.invoke("settings:setGeminiApiKey", apiKey),
  clearGeminiApiKey: () => ipcRenderer.invoke("settings:clearGeminiApiKey"),
  setOpenAiBaseUrl: (baseUrl) => ipcRenderer.invoke("settings:setOpenAiBaseUrl", baseUrl),
  setOpenAiModel: (model) => ipcRenderer.invoke("settings:setOpenAiModel", model),
  setOpenAiApiKey: (apiKey) => ipcRenderer.invoke("settings:setOpenAiApiKey", apiKey),
  clearOpenAiApiKey: () => ipcRenderer.invoke("settings:clearOpenAiApiKey"),
  generate: (payload) => ipcRenderer.invoke("ai:generate", payload),
  getAgentStatus: () => ipcRenderer.invoke("agent:status"),
  agentSnapshot: (payload) => ipcRenderer.invoke("agent:snapshot", payload),
  agentClick: (payload) => ipcRenderer.invoke("agent:click", payload),
  agentType: (payload) => ipcRenderer.invoke("agent:type", payload),
  agentPress: (payload) => ipcRenderer.invoke("agent:press", payload),
  agentNavigate: (payload) => ipcRenderer.invoke("agent:navigate", payload),
  agentWaitForLoad: (payload) => ipcRenderer.invoke("agent:waitForLoad", payload),
  transcribeAudio: (payload) => ipcRenderer.invoke("ai:transcribeAudio", payload),
  liveVoiceStart: (payload) => ipcRenderer.invoke("ai:liveVoiceStart", payload),
  liveVoiceStop: () => ipcRenderer.invoke("ai:liveVoiceStop"),
  liveVoiceSendAudio: (payload) => ipcRenderer.send("ai:liveVoiceAudio", payload),
  onLiveVoiceEvent: (handler) => {
    if (typeof handler !== "function") return () => {};
    const listener = (_event, payload) => handler(payload);
    ipcRenderer.on("ai:liveVoiceEvent", listener);
    return () => ipcRenderer.removeListener("ai:liveVoiceEvent", listener);
  },
  getAppSettings: () => ipcRenderer.invoke("appSettings:get"),
  setBrowserSettings: (browserPatch) => ipcRenderer.invoke("appSettings:setBrowser", browserPatch),
  markChromeImportModalShown: () => ipcRenderer.invoke("appSettings:markChromeImportModalShown"),
  importChromePreferences: () => ipcRenderer.invoke("chrome:importPreferences"),
  openExternal: (url) => ipcRenderer.invoke("app:openExternal", url),
  showError: (message) => ipcRenderer.invoke("app:showError", message),
  logToMain: (payload) => {
    try {
      ipcRenderer.send("app:log", payload);
    } catch {
    }
  },
  listDownloads: () => ipcRenderer.invoke("downloads:list"),
  openDownloadsFolder: () => ipcRenderer.invoke("downloads:openFolder"),
  openDownloadedFile: (id) => ipcRenderer.invoke("downloads:openFile", id),
  showDownloadInFolder: (id) => ipcRenderer.invoke("downloads:showInFolder", id),
  cancelDownload: (id) => ipcRenderer.invoke("downloads:cancel", id),
  onDownloadEvent: (handler) => {
    if (typeof handler !== "function") return () => {};
    const listener = (_event, payload) => handler(payload);
    ipcRenderer.on("downloads:event", listener);
    return () => ipcRenderer.removeListener("downloads:event", listener);
  },
  onMenuCommand: (handler) => {
    if (typeof handler !== "function") return () => {};
    const listener = (_event, payload) => handler(payload);
    ipcRenderer.on("menu:command", listener);
    return () => ipcRenderer.removeListener("menu:command", listener);
  },
  copyText: (text) => {
    try {
      clipboard.writeText(String(text ?? ""));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String(err?.message || err) };
    }
  }
});
