/**
 * Magento Content Engine - System Diagnostics & API Logger
 */

const logs = [];
const errors = [];
const apiLogs = [];
const imgErrorLogs = [];

export function recordApiLog(action, status, detail) {
  const logObj = {
    time: new Date().toLocaleTimeString(),
    action,
    status,
    detail
  };
  apiLogs.push(logObj);
  logs.push({
    type: `API_${action}`,
    time: logObj.time,
    message: `[${status}] ${detail}`
  });
}

export function recordImageError(imgId, src, errorMsg) {
  const errObj = {
    time: new Date().toLocaleTimeString(),
    imgId,
    src,
    errorMsg: errorMsg || "Failed to render <img> src"
  };
  imgErrorLogs.push(errObj);
  logs.push({
    type: "IMAGE_RENDER_ERROR",
    time: errObj.time,
    message: `[${imgId}] ${src}`
  });
}

window.addEventListener("error", (event) => {
  const errObj = {
    type: "ERROR",
    time: new Date().toLocaleTimeString(),
    message: event.message || "Script Error",
    filename: event.filename || "unknown",
    lineno: event.lineno
  };
  errors.push(errObj);
  logs.push(errObj);
});

window.addEventListener("unhandledrejection", (event) => {
  const errObj = {
    type: "UNHANDLED_REJECTION",
    time: new Date().toLocaleTimeString(),
    reason: String(event.reason || "Unknown Rejection")
  };
  errors.push(errObj);
  logs.push(errObj);
});

export function getDiagnosticReport(state) {
  let storageBytes = 0;
  try {
    for (let key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        storageBytes += ((localStorage[key] || "").length + key.length) * 2;
      }
    }
  } catch (e) {}

  return {
    timestamp: new Date().toISOString(),
    engineVersion: "Magento Multi-Brand Content Engine v1.0.0 (Liquid Glass Edition)",
    onlineStatus: navigator.onLine ? "Online" : "Offline",
    localStorageUsedMb: `${(storageBytes / (1024 * 1024)).toFixed(2)} MB / ~5.00 MB`,
    activeBrandScope: state ? state.activeBrandId : "lawsons",
    postsCount: state && state.posts ? state.posts.length : 0,
    mediaPoolCount: state && state.imagePool ? state.imagePool.length : 0,
    magentoApiConfigured: Boolean(state && state.settings && state.settings.magentoBearerToken),
    geminiApiConfigured: Boolean(state && state.settings && state.settings.geminiApiKey),
    apiActivityLogs: apiLogs,
    imageRenderErrors: imgErrorLogs,
    recordedErrors: errors,
    recentLogs: logs.slice(-25)
  };
}
