const { contextBridge, ipcRenderer } = require("electron");

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
  generate: (payload) => ipcRenderer.invoke("ai:generate", payload),
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
  }
});
