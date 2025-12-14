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
  getAppSettings: () => ipcRenderer.invoke("appSettings:get"),
  setBrowserSettings: (browserPatch) => ipcRenderer.invoke("appSettings:setBrowser", browserPatch),
  markChromeImportModalShown: () => ipcRenderer.invoke("appSettings:markChromeImportModalShown"),
  importChromePreferences: () => ipcRenderer.invoke("chrome:importPreferences"),
  openExternal: (url) => ipcRenderer.invoke("app:openExternal", url),
  showError: (message) => ipcRenderer.invoke("app:showError", message),
  onMenuCommand: (handler) => {
    if (typeof handler !== "function") return () => {};
    const listener = (_event, payload) => handler(payload);
    ipcRenderer.on("menu:command", listener);
    return () => ipcRenderer.removeListener("menu:command", listener);
  }
});
