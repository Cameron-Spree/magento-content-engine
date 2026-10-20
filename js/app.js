/**
 * Magento Content Engine — Main Application Controller
 * Lawsons Group 5-Brand Amasty Blog Studio (Liquid Glass Edition)
 * Includes Interactive In-Place Preview Editing, Click-to-Replace Image Picker,
 * and All Store Views (Global Scope) Manual Upload Workflow.
 */

import { BRANDS, BRAND_LIST, ALL_STORE_SCOPE, ALL_SCOPES_LIST, getBrandById } from "./utils/brandsConfig.js";
import { generateAIPrompt } from "./utils/promptTemplates.js";
import { parseAndValidateJSON } from "./utils/jsonValidator.js";
import { autoMatchPostMedia, slugifyFilename } from "./utils/mediaMatcher.js";
import { buildScopedHtmlPayload } from "./utils/htmlStyler.js";
import { generateAmastyCSV, generateMagentoApiPayload } from "./utils/amastyExporter.js";
import { calculateBatchSchedule } from "./utils/scheduler.js";
import { compressImageIfNeeded } from "./utils/imageCompressor.js";
import { getDiagnosticReport } from "./utils/debugLogger.js";
import { generateContentWithGemini, testMagentoApiConnection, pushPostToMagentoApi } from "./utils/magentoApiSync.js";
import { DEFAULT_SITE_SETTINGS, SAMPLE_IMAGE_POOL, SAMPLE_POST_PAYLOADS } from "./utils/sampleData.js";

const STORAGE_KEY = "mce_lawsons_state_v1";

const state = {
  activeBrandId: "all", // "all" (Global Scope) or "lawsons" | "avs" | "oxford" | "witham" | "landscape"
  promptMode: "multiplier", // "multiplier" | "single"
  posts: [],
  imagePool: [],
  settings: JSON.parse(JSON.stringify(DEFAULT_SITE_SETTINGS)),
  previewModalPostId: null,
  liveEditMode: true,
  imagePickerTarget: null // { type: "hero" | "body", el: HTMLElement, oldSrc: string }
};

// ============================================================================
// INITIALIZATION & STATE PERSISTENCE
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  loadStateFromStorage();

  const schedDateInput = document.getElementById("sched-start-date");
  if (schedDateInput && !schedDateInput.value) {
    schedDateInput.value = new Date().toISOString().split("T")[0];
  }

  applyBrandTheme(state.activeBrandId);
  bindAllEvents();
  refreshPromptOutput();
  renderMediaPool();
  renderPostQueue();
  refreshExportPreview();
  updateHeaderStats();

  if (window.lucide) {
    window.lucide.createIcons();
  }
});

function loadStateFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      loadSampleData(true);
      return;
    }
    const parsed = JSON.parse(raw);
    if (parsed.activeBrandId && (parsed.activeBrandId === "all" || BRANDS[parsed.activeBrandId])) {
      state.activeBrandId = parsed.activeBrandId;
    }
    if (Array.isArray(parsed.posts)) {
      state.posts = parsed.posts.map(p => ({
        ...p,
        author: p.author || "Lawsons Editorial Team",
        uploadProgress: p.uploadProgress || { all: false, lawsons: false, avs: false, oxford: false, witham: false, landscape: false }
      }));
    }
    if (Array.isArray(parsed.imagePool)) state.imagePool = parsed.imagePool;
    if (parsed.settings) {
      state.settings = {
        ...JSON.parse(JSON.stringify(DEFAULT_SITE_SETTINGS)),
        ...parsed.settings,
        brandLinksBank: {
          ...JSON.parse(JSON.stringify(DEFAULT_SITE_SETTINGS.brandLinksBank)),
          ...(parsed.settings.brandLinksBank || {})
        }
      };
    }
  } catch (e) {
    console.warn("Failed to load saved state:", e);
  }
}

function saveStateToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      activeBrandId: state.activeBrandId,
      posts: state.posts,
      imagePool: state.imagePool,
      settings: state.settings
    }));
  } catch (e) {
    console.warn("Storage quota warning:", e);
  }
  updateHeaderStats();
}

function updateHeaderStats() {
  const totalPosts = state.posts.length;
  const totalVars = totalPosts * 5;
  const totalMedia = state.imagePool.length;
  const activeBrand = getBrandById(state.activeBrandId);

  setText("count-total", totalPosts);
  setText("count-variations", totalVars);
  setText("count-media", totalMedia);
  setText("active-scope-stat", activeBrand.name);
  setText("badge-ingest-count", totalPosts);
  setText("badge-media-count", totalMedia);
  setText("badge-queue-count", totalPosts);

  const indicatorText = state.activeBrandId === "all"
    ? "All Store Views (Global Setup Scope)"
    : `${activeBrand.domain} (${activeBrand.storeCode})`;
  setText("active-brand-domain-indicator", indicatorText);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(val);
}

// ============================================================================
// DYNAMIC 5-BRAND + ALL STORE VIEWS THEME ENGINE
// ============================================================================
function applyBrandTheme(brandId) {
  const brand = getBrandById(brandId);
  state.activeBrandId = brand.id;

  const root = document.documentElement;
  root.style.setProperty("--brand-primary", brand.palette.primary);
  root.style.setProperty("--brand-primary-dark", brand.palette.primaryDark);
  root.style.setProperty("--brand-secondary", brand.palette.secondary);
  root.style.setProperty("--brand-secondary-text", brand.palette.secondaryText);
  root.style.setProperty("--brand-tint", hexToRgba(brand.palette.primary, 0.09));
  root.style.setProperty("--brand-glow", hexToRgba(brand.palette.primary, 0.24));

  document.querySelectorAll("#global-brand-switcher .brand-scope-pill").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.brand === brand.id);
  });

  updateHeaderStats();
  refreshPromptOutput();
  renderPostQueue();
  refreshExportPreview();

  if (state.previewModalPostId) {
    renderStorefrontModalContent(state.previewModalPostId, brand.id);
  }
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================================================
// EVENT BINDINGS
// ============================================================================
function bindAllEvents() {
  // Global Store View Scope Switcher Pills
  document.querySelectorAll("#global-brand-switcher .brand-scope-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      const brandId = btn.dataset.brand;
      applyBrandTheme(brandId);
      saveStateToStorage();
      showToast(`Switched active scope to ${getBrandById(brandId).fullName}`);
    });
  });

  // Main Navigation Tabs
  document.querySelectorAll(".nav-tabs .tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Top Header Actions
  onClick("btn-load-sample", () => loadSampleData(false));
  onClick("btn-quick-export-csv", () => downloadAmastyCSVFile());
  onClick("btn-open-settings", openSettingsModal);
  onClick("btn-close-settings", () => closeModal("modal-settings"));
  onClick("btn-open-debug", openDebugModal);
  onClick("btn-close-debug", () => closeModal("modal-debug"));
  onClick("btn-close-preview-modal", () => {
    state.previewModalPostId = null;
    closeModal("modal-preview");
  });

  // Tab 1: Prompt Studio
  onClick("btn-mode-multiplier", () => {
    state.promptMode = "multiplier";
    document.getElementById("btn-mode-multiplier").className = "btn btn-primary btn-sm";
    document.getElementById("btn-mode-single").className = "btn btn-outline btn-sm";
    setText("prompt-mode-hint", "Instructs the AI to write 5 distinct store view versions in one JSON payload so Google never flags duplicate content across your 5 domains.");
    refreshPromptOutput();
  });

  onClick("btn-mode-single", () => {
    state.promptMode = "single";
    document.getElementById("btn-mode-single").className = "btn btn-primary btn-sm";
    document.getElementById("btn-mode-multiplier").className = "btn btn-outline btn-sm";
    const brandName = state.activeBrandId === "all" ? "Lawsons" : getBrandById(state.activeBrandId).name;
    setText("prompt-mode-hint", `Generates an article focused on ${brandName}. Our ingestion engine will still automatically adapt it for the other 4 brands.`);
    refreshPromptOutput();
  });

  ["prompt-topic", "prompt-author", "prompt-categories", "prompt-keywords",
   "prompt-word-count", "prompt-image-count", "widget-spotlight", "widget-product-cards",
   "widget-table", "widget-callout"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", refreshPromptOutput);
      el.addEventListener("change", refreshPromptOutput);
    }
  });

  onClick("btn-reset-prompt", () => {
    document.getElementById("prompt-topic").value = "Concrete vs Timber Fence Posts: Which Is Best for Long-Lasting Garden Boundaries?";
    document.getElementById("prompt-author").value = "Lawsons Editorial Team";
    document.getElementById("prompt-categories").value = "Fencing Guides, Garden Advice";
    document.getElementById("prompt-keywords").value = "concrete vs timber fence posts, slotted concrete posts, UC4 treated fence posts, gravel boards";
    refreshPromptOutput();
    showToast("Prompt inputs reset to default.");
  });

  onClick("btn-copy-prompt", () => {
    const text = document.getElementById("generated-prompt-output").value;
    copyToClipboard(text, "5-Brand System Prompt copied! Paste into ChatGPT, Claude, or Gemini.");
  });

  onClick("btn-generate-gemini-direct", handleDirectGeminiGeneration);

  // Tab 2: JSON Ingestion
  onClick("btn-clear-json", () => {
    document.getElementById("raw-json-input").value = "";
    document.getElementById("json-validation-feedback").innerHTML = "";
  });
  onClick("btn-parse-json", handleJsonIngestion);

  // Tab 3: Media Pool
  onClick("btn-add-media-item", handleAddMediaItem);
  onClick("btn-rematch-all-media", () => {
    rematchAllPostsMedia();
    showToast("Re-matched media across all queued posts!");
  });

  // Tab 4: Post Queue & Scheduler
  onClick("btn-apply-schedule", handleApplySchedule);

  const toggleCssEl = document.getElementById("toggle-include-scoped-css");
  if (toggleCssEl) {
    toggleCssEl.checked = state.settings.includeScopedCssInCopy !== false;
    toggleCssEl.addEventListener("change", () => {
      state.settings.includeScopedCssInCopy = toggleCssEl.checked;
      saveStateToStorage();
      refreshExportPreview();
    });
  }

  // Tab 5: Exports & Pixel Briefing
  onClick("btn-download-amasty-csv", downloadAmastyCSVFile);
  onClick("btn-download-api-json", downloadMagentoJsonFile);
  onClick("btn-push-all-magento-api", handlePushAllToMagentoApi);
  onClick("btn-refresh-export-preview", refreshExportPreview);
  onClick("btn-copy-pixel-brief", () => {
    const brief = document.getElementById("pixel-briefing-text").value;
    copyToClipboard(brief, "Pixel Technical Briefing copied to clipboard!");
  });

  const exportScopeSelect = document.getElementById("export-scope-select");
  if (exportScopeSelect) {
    exportScopeSelect.addEventListener("change", refreshExportPreview);
  }

  // Settings Modal
  const brandSelectEl = document.getElementById("setting-brand-links-select");
  if (brandSelectEl) {
    brandSelectEl.addEventListener("change", () => {
      loadBrandLinksIntoTextarea(brandSelectEl.value);
    });
  }
  onClick("btn-save-settings", handleSaveSettings);
  onClick("btn-test-magento-api", handleTestMagentoApi);

  // Debug Modal
  onClick("btn-copy-debug", () => {
    const txt = document.getElementById("debug-report-output").value;
    copyToClipboard(txt, "Diagnostic report copied!");
  });

  // Live Preview Modal In-Place Edit Controls
  onClick("btn-toggle-live-edit", toggleInPlaceLiveEditMode);
  onClick("btn-save-live-edits", saveCurrentModalInPlaceEdits);
  onClick("btn-close-img-drawer", closeImagePickerDrawer);

  const drawerUploadInput = document.getElementById("drawer-instant-upload");
  if (drawerUploadInput) {
    drawerUploadInput.addEventListener("change", handleDrawerInstantUpload);
  }
}

function onClick(id, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", handler);
}

function switchTab(tabId) {
  document.querySelectorAll(".nav-tabs .tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });
  document.querySelectorAll(".tab-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === tabId);
  });
}

// ============================================================================
// TAB 1: PROMPT GENERATOR
// ============================================================================
function refreshPromptOutput() {
  const topic = document.getElementById("prompt-topic")?.value || "";
  const keywords = document.getElementById("prompt-keywords")?.value || "";
  const wordCount = document.getElementById("prompt-word-count")?.value || "900-1300 words";
  const imageCount = document.getElementById("prompt-image-count")?.value || "2";

  const widgets = {
    categorySpotlight: document.getElementById("widget-spotlight")?.checked ?? true,
    productCards: document.getElementById("widget-product-cards")?.checked ?? true,
    table: document.getElementById("widget-table")?.checked ?? true,
    wantToKnowMore: document.getElementById("widget-callout")?.checked ?? true
  };

  const targetBrandId = state.activeBrandId === "all" ? "lawsons" : state.activeBrandId;

  const promptText = generateAIPrompt({
    mode: state.promptMode,
    activeBrandId: targetBrandId,
    topic,
    keywords,
    wordCount,
    imageCount,
    customBrandLinks: state.settings.brandLinksBank || {},
    widgets
  });

  const outEl = document.getElementById("generated-prompt-output");
  if (outEl) {
    outEl.value = promptText;
  }
  setText("prompt-char-counter", `${promptText.length.toLocaleString()} chars • 5 Store Views`);
}

async function handleDirectGeminiGeneration() {
  const apiKey = state.settings.geminiApiKey;
  if (!apiKey) {
    openSettingsModal();
    showToast("Enter your Google Gemini API Key in Settings to enable 1-Click Generation.");
    return;
  }

  const btn = document.getElementById("btn-generate-gemini-direct");
  const origHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span>Generating 5 Brand Variations...</span>`;

  const promptText = document.getElementById("generated-prompt-output").value;
  const result = await generateContentWithGemini(promptText, apiKey);

  btn.disabled = false;
  btn.innerHTML = origHtml;
  if (window.lucide) window.lucide.createIcons();

  if (!result.success) {
    showToast(result.error);
    return;
  }

  document.getElementById("raw-json-input").value = result.jsonText;
  handleJsonIngestion();
}

// ============================================================================
// TAB 2: JSON INGESTION
// ============================================================================
function handleJsonIngestion() {
  const rawInput = document.getElementById("raw-json-input").value;
  const feedbackEl = document.getElementById("json-validation-feedback");

  const validation = parseAndValidateJSON(rawInput);
  if (!validation.valid) {
    feedbackEl.innerHTML = `<div style="padding:12px; border-radius:10px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); color:#b91c1c; font-weight:600;">❌ ${validation.error}</div>`;
    showToast("JSON Validation Error — check feedback box.");
    return;
  }

  const authorVal = document.getElementById("prompt-author")?.value || "Lawsons Editorial Team";
  const matchedPosts = validation.posts.map(p => {
    const postWithMeta = {
      ...p,
      author: p.author || authorVal,
      uploadProgress: { all: false, lawsons: false, avs: false, oxford: false, witham: false, landscape: false }
    };
    return autoMatchPostMedia(postWithMeta, state.imagePool, state.settings);
  });

  state.posts.unshift(...matchedPosts);
  saveStateToStorage();
  renderPostQueue();
  refreshExportPreview();

  feedbackEl.innerHTML = `<div style="padding:12px; border-radius:10px; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.3); color:#047857; font-weight:600;">✅ Ingested ${matchedPosts.length} Master Post(s) & generated ${matchedPosts.length * 5} Store View Variations!</div>`;
  showToast(`Ingested ${matchedPosts.length} post(s) across all 5 Store Views!`);
  switchTab("tab-queue");
}

function loadSampleData(silent = false) {
  state.imagePool = JSON.parse(JSON.stringify(SAMPLE_IMAGE_POOL));
  const rawSamples = JSON.stringify(SAMPLE_POST_PAYLOADS, null, 2);
  const validation = parseAndValidateJSON(rawSamples);
  if (validation.valid) {
    state.posts = validation.posts.map(p => {
      const postWithMeta = {
        ...p,
        author: "Lawsons Editorial Team",
        uploadProgress: { all: true, lawsons: false, avs: false, oxford: false, witham: false, landscape: false }
      };
      return autoMatchPostMedia(postWithMeta, state.imagePool, state.settings);
    });
  }
  saveStateToStorage();
  renderMediaPool();
  renderPostQueue();
  refreshExportPreview();
  if (!silent) {
    showToast("Loaded 5-Brand Sample Post & Media Assets!");
    switchTab("tab-queue");
  }
}

// ============================================================================
// TAB 3: /pub/media/ STUDIO
// ============================================================================
async function handleAddMediaItem() {
  const titleInput = document.getElementById("media-title-input");
  const tagsInput = document.getElementById("media-tags-input");
  const urlInput = document.getElementById("media-url-input");
  const fileInput = document.getElementById("media-file-input");
  const folderPrefix = (document.getElementById("magento-media-folder-input")?.value || "/media/wysiwyg/blog/").replace(/\/$/, "");

  const files = fileInput.files;
  const manualUrl = urlInput.value.trim();
  const manualTitle = titleInput.value.trim();
  const manualTags = tagsInput.value
    .split(",")
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);

  if ((!files || files.length === 0) && !manualUrl) {
    showToast("Select an image file or enter a Magento /media/ path first.");
    return;
  }

  if (files && files.length > 0) {
    for (const rawFile of Array.from(files)) {
      const compressed = await compressImageIfNeeded(rawFile, 3.5);
      const dataUrl = await fileToDataUrl(compressed);
      const cleanName = slugifyFilename(rawFile.name);
      const derivedTitle = manualTitle || rawFile.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      const derivedTags = manualTags.length > 0 ? manualTags : derivedTitle.toLowerCase().split(/\s+/).filter(w => w.length > 2);

      state.imagePool.unshift({
        id: "img_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
        title: derivedTitle,
        filename: cleanName,
        url: `${folderPrefix}/${cleanName}`,
        previewUrl: dataUrl,
        magentoPath: `${folderPrefix}/${cleanName}`,
        tags: derivedTags
      });
    }
  } else if (manualUrl) {
    const cleanName = slugifyFilename(manualUrl.split("/").pop() || "blog-image.jpg");
    const derivedTitle = manualTitle || cleanName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
    const isFullHttp = manualUrl.startsWith("http://") || manualUrl.startsWith("https://");
    const magentoPath = isFullHttp ? manualUrl : (manualUrl.startsWith("/") ? manualUrl : `${folderPrefix}/${manualUrl}`);

    state.imagePool.unshift({
      id: "img_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      title: derivedTitle,
      filename: cleanName,
      url: magentoPath,
      previewUrl: isFullHttp ? manualUrl : "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      magentoPath,
      tags: manualTags.length > 0 ? manualTags : derivedTitle.toLowerCase().split(/\s+/)
    });
  }

  titleInput.value = "";
  tagsInput.value = "";
  urlInput.value = "";
  fileInput.value = "";

  rematchAllPostsMedia();
  saveStateToStorage();
  renderMediaPool();
  showToast("Added image to Media Pool & matched with posts!");
}

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function rematchAllPostsMedia() {
  state.posts = state.posts.map(p => {
    const unlocked = { ...p, is_media_locked: false };
    return autoMatchPostMedia(unlocked, state.imagePool, state.settings);
  });
  saveStateToStorage();
  renderPostQueue();
  refreshExportPreview();
}

function renderMediaPool() {
  const grid = document.getElementById("media-pool-grid");
  if (!grid) return;

  if (state.imagePool.length === 0) {
    grid.innerHTML = `<div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">No media assets in pool yet. Upload photos above or click "Load 5-Brand Sample".</div>`;
    return;
  }

  grid.innerHTML = state.imagePool.map(img => {
    const tagsHtml = (img.tags || []).map(t => `<span class="brand-store-code-tag">${escapeHtml(t)}</span>`).join(" ");
    return `
      <div class="media-card">
        <img class="media-card-thumb" src="${escapeHtml(img.previewUrl || img.url)}" alt="${escapeHtml(img.title)}" loading="lazy">
        <div class="media-card-body">
          <strong style="font-size: 13.5px; color: var(--text-primary);">${escapeHtml(img.title)}</strong>
          <code style="font-size: 11px; color: var(--text-muted); word-break: break-all;">${escapeHtml(img.magentoPath || img.url)}</code>
          <div style="display: flex; gap: 4px; flex-wrap: wrap; margin: 4px 0;">${tagsHtml}</div>
          <div style="display: flex; gap: 6px; margin-top: auto; padding-top: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" style="flex: 1;" data-copy-single-img="${img.id}">
              Copy Single-Image HTML
            </button>
            <button type="button" class="btn btn-outline btn-sm" data-delete-img="${img.id}" title="Remove">
              ✕
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  grid.querySelectorAll("[data-copy-single-img]").forEach(btn => {
    btn.addEventListener("click", () => {
      const img = state.imagePool.find(i => i.id === btn.dataset.copySingleImg);
      if (!img) return;
      const snippet = `<figure class="mce-media-figure" style="margin:28px 0; text-align:center; display:block;"><img src="${img.magentoPath || img.url}" alt="${img.title}" style="display:block; width:100%; max-width:100%; height:auto; max-height:480px; object-fit:cover; border-radius:10px; margin:0 auto; box-shadow:0 6px 20px rgba(0,0,0,0.08);" /><figcaption style="font-size:13px; color:#6b7280; margin-top:8px; font-style:italic;">${img.title}</figcaption></figure>`;
      copyToClipboard(snippet, "PageBuilder-Safe Single-Image HTML copied!");
    });
  });

  grid.querySelectorAll("[data-delete-img]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.imagePool = state.imagePool.filter(i => i.id !== btn.dataset.deleteImg);
      saveStateToStorage();
      renderMediaPool();
      renderPostQueue();
    });
  });
}

// ============================================================================
// TAB 4: POST QUEUE & ALL STORE VIEWS WORKFLOW
// ============================================================================
function handleApplySchedule() {
  const startDateStr = document.getElementById("sched-start-date").value;
  const startTimeStr = document.getElementById("sched-start-time").value;
  const intervalNum = Number(document.getElementById("sched-interval-num").value || 3);
  const intervalUnit = document.getElementById("sched-interval-unit").value;

  state.posts = calculateBatchSchedule(state.posts, {
    startDateStr,
    startTimeStr,
    intervalNum,
    intervalUnit
  });

  saveStateToStorage();
  renderPostQueue();
  refreshExportPreview();
  showToast(`Scheduled ${state.posts.length} post(s) across all 5 Store Views!`);
}

function renderPostQueue() {
  const container = document.getElementById("post-queue-container");
  if (!container) return;

  if (state.posts.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 48px 24px;">
        <h3 style="font-size: 17px; margin-bottom: 8px;">Your Multi-Store Post Queue is Empty</h3>
        <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 18px;">
          Generate a 5-Brand post in Tab 1, paste JSON in Tab 2, or load our 5-Brand Sample Data.
        </p>
        <button type="button" class="btn btn-primary" id="btn-empty-load-sample">
          Load 5-Brand Sample Post
        </button>
      </div>
    `;
    onClick("btn-empty-load-sample", () => loadSampleData(false));
    return;
  }

  const isGlobalScope = state.activeBrandId === "all";
  const activeBrand = getBrandById(state.activeBrandId);

  container.innerHTML = state.posts.map((post) => {
    const thumbUrl = post.featured_image ? (post.featured_image.previewUrl || post.featured_image.url) : "";
    const progress = post.uploadProgress || { all: false, lawsons: false, avs: false, oxford: false, witham: false, landscape: false };
    const completedCount = Object.values(progress).filter(Boolean).length;

    // Scope pills on card
    const scopePills = ALL_SCOPES_LIST.map(scope => {
      const isAct = scope.id === state.activeBrandId;
      const isDone = progress[scope.id];
      return `
        <button type="button" class="brand-scope-pill ${isAct ? "active" : ""}" style="padding: 5px 11px; font-size: 12px;" data-card-scope="${scope.id}">
          <span class="brand-dot" style="background: ${scope.palette.primary}; border: 2px solid ${scope.palette.secondary};"></span>
          <span>${scope.id === "all" ? "🌐 All Store Views" : scope.name}</span>
          ${isDone ? `<span style="color:#10b981; font-weight:800; font-size:11px;">✓</span>` : ""}
        </button>
      `;
    }).join("");

    // Step tracker pills
    const trackerPills = [
      { id: "all", label: "0. All Store Views" },
      { id: "lawsons", label: "1. Lawsons" },
      { id: "avs", label: "2. AVS" },
      { id: "oxford", label: "3. Oxford" },
      { id: "witham", label: "4. Witham" },
      { id: "landscape", label: "5. Landscape" }
    ].map(step => {
      const isChecked = progress[step.id];
      return `
        <button type="button" class="step-pill ${isChecked ? "completed" : ""}" data-toggle-step="${step.id}" data-post="${post.id}" title="Click to toggle uploaded status">
          <span>${isChecked ? "✓" : "○"}</span>
          <span>${step.label}</span>
        </button>
      `;
    }).join("");

    // CONTENT FOR "ALL STORE VIEWS" GLOBAL SCOPE
    if (isGlobalScope) {
      const catStr = (post.categories || []).join(", ");
      const tagStr = (post.tags || []).join(", ");
      const authorStr = post.author || "Lawsons Editorial Team";

      return `
        <article class="queue-card" data-post-id="${post.id}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 18px; flex-wrap: wrap;">
            <div style="display: flex; gap: 16px; flex: 1; min-width: 280px;">
              ${thumbUrl ? `<img src="${escapeHtml(thumbUrl)}" alt="${escapeHtml(post.title)}" style="width: 120px; height: 90px; object-fit: cover; border-radius: 12px; flex-shrink: 0; border: 1px solid rgba(15,23,42,0.1);">` : ""}
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px;">
                  <span class="brand-store-code-tag" style="background: rgba(15, 23, 42, 0.08); color: #0f172a; font-weight: 800;">
                    🌐 Master Scope: All Store Views (Default)
                  </span>
                  <span class="brand-store-code-tag">📅 ${escapeHtml(post.post_date)}</span>
                  <span class="brand-store-code-tag">Author: ${escapeHtml(authorStr)}</span>
                </div>
                <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); line-height: 1.3; margin-bottom: 6px;">
                  ${escapeHtml(post.title)}
                </h3>
                <div style="font-size: 13px; color: var(--text-secondary); display: flex; gap: 16px; flex-wrap: wrap; margin-top: 4px;">
                  <span><strong>Categories:</strong> ${escapeHtml(catStr || "Fencing")}</span>
                  <span><strong>Tags:</strong> ${escapeHtml(tagStr || "timber, fencing")}</span>
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <button type="button" class="btn btn-primary btn-sm" data-open-preview="${post.id}">
                <i data-lucide="monitor"></i> Live Storefront Preview & Edit
              </button>
              <button type="button" class="btn btn-outline btn-sm" data-toggle-global-edit="${post.id}">
                <i data-lucide="edit-3"></i> Edit Global Meta
              </button>
              <button type="button" class="btn btn-outline btn-sm" data-delete-post="${post.id}" title="Remove Post">
                ✕
              </button>
            </div>
          </div>

          <!-- Step Progress Tracker Strip -->
          <div class="upload-tracker-strip">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Manual Upload Progress:</span>
              <span class="brand-store-code-tag" style="background:#f0fdf4; color:#15803d; font-weight:700;">${completedCount}/6 Scopes Uploaded</span>
            </div>
            <div class="step-checklist">${trackerPills}</div>
          </div>

          <!-- Scope Switcher Strip & 1-Click Global Copy Buttons -->
          <div class="scope-copy-strip">
            <div style="display: flex; align-items: center; gap: 6px; margin-right: 8px; flex-wrap: wrap;">
              <span style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Scope:</span>
              ${scopePills}
            </div>

            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-left: auto;">
              <button type="button" class="btn btn-secondary btn-sm" data-copy-global="title" data-post="${post.id}">
                Copy Master Title
              </button>
              <button type="button" class="btn btn-secondary btn-sm" data-copy-global="author" data-post="${post.id}">
                Copy Author
              </button>
              <button type="button" class="btn btn-secondary btn-sm" data-copy-global="categories" data-post="${post.id}">
                Copy Categories
              </button>
              <button type="button" class="btn btn-secondary btn-sm" data-copy-global="tags" data-post="${post.id}">
                Copy Tags
              </button>
              <button type="button" class="btn btn-secondary btn-sm" data-copy-global="date" data-post="${post.id}">
                Copy Date
              </button>
              <button type="button" class="btn btn-primary btn-sm" data-copy-global="all_combined" data-post="${post.id}">
                Copy All Global Setup (Combined)
              </button>
            </div>
          </div>

          <!-- Collapsible Global Edit Drawer -->
          <div id="edit-global-drawer-${post.id}" style="display: none; margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(15,23,42,0.08);">
            <div class="form-row">
              <div class="form-group">
                <label>Master Generic Title (All Store Views)</label>
                <input type="text" id="edit-gtitle-${post.id}" value="${escapeHtml(post.title)}">
              </div>
              <div class="form-group">
                <label>Author</label>
                <input type="text" id="edit-gauthor-${post.id}" value="${escapeHtml(authorStr)}">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Categories (Comma separated)</label>
                <input type="text" id="edit-gcats-${post.id}" value="${escapeHtml(catStr)}">
              </div>
              <div class="form-group">
                <label>Tags (Comma separated)</label>
                <input type="text" id="edit-gtags-${post.id}" value="${escapeHtml(tagStr)}">
              </div>
            </div>
            <button type="button" class="btn btn-primary btn-sm" data-save-global-edit="${post.id}">
              Save All Store Views Setup
            </button>
          </div>
        </article>
      `;
    }

    // CONTENT FOR SPECIFIC BRAND SCOPE (Lawsons, AVS, Oxford, Witham, Landscape)
    const variation = (post.variations && post.variations[activeBrand.id]) ? post.variations[activeBrand.id] : {};
    const displayTitle = variation.title || post.title;
    const displayUrlKey = variation.url_key || post.slug;
    const displayShort = variation.short_content || post.short_content || "";
    const displayMetaTitle = variation.meta_title || post.meta_title || displayTitle;
    const displayMetaDesc = variation.meta_description || post.meta_description || "";

    return `
      <article class="queue-card" data-post-id="${post.id}">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 18px; flex-wrap: wrap;">
          <div style="display: flex; gap: 16px; flex: 1; min-width: 280px;">
            ${thumbUrl ? `<img src="${escapeHtml(thumbUrl)}" alt="${escapeHtml(displayTitle)}" style="width: 120px; height: 90px; object-fit: cover; border-radius: 12px; flex-shrink: 0; border: 1px solid rgba(15,23,42,0.1);">` : ""}
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px;">
                <span class="brand-store-code-tag" style="background: var(--brand-tint); color: var(--brand-primary); font-weight: 800;">
                  Store View: ${activeBrand.name} (${activeBrand.storeCode})
                </span>
                <span class="brand-store-code-tag">📅 ${escapeHtml(post.post_date)}</span>
                <span class="brand-store-code-tag">/${escapeHtml(displayUrlKey)}</span>
              </div>
              <h3 style="font-size: 17.5px; font-weight: 800; color: var(--text-primary); line-height: 1.3; margin-bottom: 6px;">
                ${escapeHtml(displayTitle)}
              </h3>
              <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
                ${escapeHtml(displayShort)}
              </p>
            </div>
          </div>

          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <button type="button" class="btn btn-primary btn-sm" data-open-preview="${post.id}">
              <i data-lucide="monitor"></i> Live ${activeBrand.name} Preview & Edit
            </button>
            <button type="button" class="btn btn-outline btn-sm" data-toggle-edit="${post.id}">
              <i data-lucide="edit-3"></i> Edit Scope
            </button>
            <button type="button" class="btn btn-outline btn-sm" data-delete-post="${post.id}" title="Remove Post">
              ✕
            </button>
          </div>
        </div>

        <!-- Step Progress Tracker Strip -->
        <div class="upload-tracker-strip">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Manual Upload Progress:</span>
            <span class="brand-store-code-tag" style="background:#f0fdf4; color:#15803d; font-weight:700;">${completedCount}/6 Scopes Uploaded</span>
          </div>
          <div class="step-checklist">${trackerPills}</div>
        </div>

        <!-- Store View Quick Switcher & 1-Click Clipboard Bar -->
        <div class="scope-copy-strip">
          <div style="display: flex; align-items: center; gap: 6px; margin-right: 8px; flex-wrap: wrap;">
            <span style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Scope:</span>
            ${scopePills}
          </div>

          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-left: auto;">
            <button type="button" class="btn btn-secondary btn-sm" data-copy-field="title" data-post="${post.id}">
              Copy Title
            </button>
            <button type="button" class="btn btn-secondary btn-sm" data-copy-field="url_key" data-post="${post.id}">
              Copy URL Key
            </button>
            <button type="button" class="btn btn-secondary btn-sm" data-copy-field="short_content" data-post="${post.id}">
              Copy Short Summary
            </button>
            <button type="button" class="btn btn-secondary btn-sm" data-copy-field="meta_title" data-post="${post.id}">
              Copy Meta Title
            </button>
            <button type="button" class="btn btn-secondary btn-sm" data-copy-field="meta_desc" data-post="${post.id}">
              Copy Meta Desc
            </button>
            <button type="button" class="btn btn-primary btn-sm" data-copy-field="scoped_html" data-post="${post.id}">
              Copy ${activeBrand.name} Custom HTML + CSS
            </button>
          </div>
        </div>

        <!-- Collapsible Inline Editor for Active Brand Scope -->
        <div id="edit-drawer-${post.id}" style="display: none; margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(15,23,42,0.08);">
          <div class="form-row">
            <div class="form-group">
              <label>${activeBrand.name} Store View Title</label>
              <input type="text" id="edit-title-${post.id}" value="${escapeHtml(displayTitle)}">
            </div>
            <div class="form-group">
              <label>URL Key (Slug)</label>
              <input type="text" id="edit-slug-${post.id}" value="${escapeHtml(displayUrlKey)}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Meta Title</label>
              <input type="text" id="edit-mtitle-${post.id}" value="${escapeHtml(displayMetaTitle)}">
            </div>
            <div class="form-group">
              <label>Meta Description</label>
              <input type="text" id="edit-mdesc-${post.id}" value="${escapeHtml(displayMetaDesc)}">
            </div>
          </div>
          <div class="form-group">
            <label>${activeBrand.name} HTML Body Content</label>
            <textarea id="edit-html-${post.id}" class="code-textarea" rows="7">${escapeHtml(variation.content_html || post.content_html)}</textarea>
          </div>
          <button type="button" class="btn btn-primary btn-sm" data-save-edit="${post.id}">
            Save ${activeBrand.name} Scope Changes
          </button>
        </div>
      </article>
    `;
  }).join("");

  if (window.lucide) window.lucide.createIcons();

  // Bind card scope switcher buttons
  container.querySelectorAll("[data-card-scope]").forEach(btn => {
    btn.addEventListener("click", () => {
      applyBrandTheme(btn.dataset.cardScope);
      saveStateToStorage();
    });
  });

  // Bind manual upload step check toggle
  container.querySelectorAll("[data-toggle-step]").forEach(btn => {
    btn.addEventListener("click", () => {
      const pId = btn.dataset.post;
      const stepId = btn.dataset.toggleStep;
      const post = state.posts.find(p => p.id === pId);
      if (!post) return;
      if (!post.uploadProgress) post.uploadProgress = {};
      post.uploadProgress[stepId] = !post.uploadProgress[stepId];
      saveStateToStorage();
      renderPostQueue();
    });
  });

  // Bind 1-click Global Copy buttons (All Store Views)
  container.querySelectorAll("[data-copy-global]").forEach(btn => {
    btn.addEventListener("click", () => {
      const postId = btn.dataset.post;
      const field = btn.dataset.copyGlobal;
      const post = state.posts.find(p => p.id === postId);
      if (!post) return;

      if (!post.uploadProgress) post.uploadProgress = {};
      post.uploadProgress.all = true;
      saveStateToStorage();

      if (field === "title") {
        copyToClipboard(post.title, "Copied Master Title!");
      } else if (field === "author") {
        copyToClipboard(post.author || "Lawsons Editorial Team", "Copied Author!");
      } else if (field === "categories") {
        copyToClipboard((post.categories || []).join(", "), "Copied Categories!");
      } else if (field === "tags") {
        copyToClipboard((post.tags || []).join(", "), "Copied Tags!");
      } else if (field === "date") {
        copyToClipboard(post.post_date || "", "Copied Publish Date!");
      } else if (field === "all_combined") {
        const bundle = `Title: ${post.title}\nAuthor: ${post.author || "Lawsons Editorial Team"}\nCategories: ${(post.categories || []).join(", ")}\nTags: ${(post.tags || []).join(", ")}\nDate: ${post.post_date}`;
        copyToClipboard(bundle, "Copied All Global Setup Metadata!");
      }
      renderPostQueue();
    });
  });

  // Bind 1-click brand field copy buttons
  container.querySelectorAll("[data-copy-field]").forEach(btn => {
    btn.addEventListener("click", () => {
      const postId = btn.dataset.post;
      const field = btn.dataset.copyField;
      const post = state.posts.find(p => p.id === postId);
      if (!post) return;

      const bId = state.activeBrandId === "all" ? "lawsons" : state.activeBrandId;
      const brand = getBrandById(bId);
      const v = (post.variations && post.variations[bId]) ? post.variations[bId] : {};

      if (field === "title") {
        copyToClipboard(v.title || post.title, `Copied ${brand.name} Title!`);
      } else if (field === "url_key") {
        copyToClipboard(v.url_key || post.slug, `Copied ${brand.name} URL Key!`);
      } else if (field === "short_content") {
        copyToClipboard(v.short_content || post.short_content || "", `Copied ${brand.name} Short Content!`);
      } else if (field === "meta_title") {
        copyToClipboard(v.meta_title || post.meta_title || post.title, `Copied ${brand.name} Meta Title!`);
      } else if (field === "meta_desc") {
        copyToClipboard(v.meta_description || post.meta_description || "", `Copied ${brand.name} Meta Description!`);
      } else if (field === "scoped_html") {
        const includeCss = state.settings.includeScopedCssInCopy !== false;
        const htmlPayload = buildScopedHtmlPayload(post, bId, state.imagePool, includeCss);
        copyToClipboard(htmlPayload, `Copied ${brand.name} Self-Contained Custom HTML + CSS!`);

        // Mark this brand step as uploaded
        if (!post.uploadProgress) post.uploadProgress = {};
        post.uploadProgress[bId] = true;
        saveStateToStorage();
        renderPostQueue();
      }
    });
  });

  // Bind Live Website Preview Modal
  container.querySelectorAll("[data-open-preview]").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetBrand = state.activeBrandId === "all" ? "lawsons" : state.activeBrandId;
      openStorefrontPreviewModal(btn.dataset.openPreview, targetBrand);
    });
  });

  // Bind Global Edit Drawer
  container.querySelectorAll("[data-toggle-global-edit]").forEach(btn => {
    btn.addEventListener("click", () => {
      const drawer = document.getElementById(`edit-global-drawer-${btn.dataset.toggleGlobalEdit}`);
      if (drawer) drawer.style.display = drawer.style.display === "none" ? "block" : "none";
    });
  });

  container.querySelectorAll("[data-save-global-edit]").forEach(btn => {
    btn.addEventListener("click", () => {
      const postId = btn.dataset.saveGlobalEdit;
      const post = state.posts.find(p => p.id === postId);
      if (!post) return;

      post.title = document.getElementById(`edit-gtitle-${postId}`).value.trim();
      post.author = document.getElementById(`edit-gauthor-${postId}`).value.trim();
      post.categories = document.getElementById(`edit-gcats-${postId}`).value.split(",").map(s => s.trim()).filter(Boolean);
      post.tags = document.getElementById(`edit-gtags-${postId}`).value.split(",").map(s => s.trim()).filter(Boolean);

      saveStateToStorage();
      renderPostQueue();
      refreshExportPreview();
      showToast("Saved All Store Views Global Setup!");
    });
  });

  // Bind Brand Edit Drawer
  container.querySelectorAll("[data-toggle-edit]").forEach(btn => {
    btn.addEventListener("click", () => {
      const drawer = document.getElementById(`edit-drawer-${btn.dataset.toggleEdit}`);
      if (drawer) drawer.style.display = drawer.style.display === "none" ? "block" : "none";
    });
  });

  container.querySelectorAll("[data-save-edit]").forEach(btn => {
    btn.addEventListener("click", () => {
      const postId = btn.dataset.saveEdit;
      const post = state.posts.find(p => p.id === postId);
      if (!post) return;
      const bId = state.activeBrandId === "all" ? "lawsons" : state.activeBrandId;
      if (!post.variations) post.variations = {};
      if (!post.variations[bId]) post.variations[bId] = {};

      post.variations[bId].title = document.getElementById(`edit-title-${postId}`).value;
      post.variations[bId].url_key = document.getElementById(`edit-slug-${postId}`).value;
      post.variations[bId].meta_title = document.getElementById(`edit-mtitle-${postId}`).value;
      post.variations[bId].meta_description = document.getElementById(`edit-mdesc-${postId}`).value;
      post.variations[bId].content_html = document.getElementById(`edit-html-${postId}`).value;

      saveStateToStorage();
      renderPostQueue();
      refreshExportPreview();
      showToast(`Saved ${getBrandById(bId).name} Store View updates!`);
    });
  });

  // Bind Delete Post
  container.querySelectorAll("[data-delete-post]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.posts = state.posts.filter(p => p.id !== btn.dataset.deletePost);
      saveStateToStorage();
      renderPostQueue();
      refreshExportPreview();
      showToast("Removed post from queue.");
    });
  });
}

// ============================================================================
// AUTHENTIC STOREFRONT PREVIEW & INTERACTIVE IN-PLACE LIVE EDITING
// ============================================================================
function openStorefrontPreviewModal(postId, brandId) {
  state.previewModalPostId = postId;
  renderStorefrontModalContent(postId, brandId);
  document.getElementById("modal-preview").classList.add("active");
}

function renderStorefrontModalContent(postId, brandId) {
  const post = state.posts.find(p => p.id === postId);
  if (!post) return;

  const actualBrandId = brandId === "all" ? "lawsons" : brandId;
  const brand = getBrandById(actualBrandId);
  const v = (post.variations && post.variations[brand.id]) ? post.variations[brand.id] : {};
  const title = v.title || post.title;
  const urlKey = v.url_key || post.slug;

  // Render modal brand switcher pills
  const pillsContainer = document.getElementById("modal-brand-pills");
  if (pillsContainer) {
    pillsContainer.innerHTML = BRAND_LIST.map(b => `
      <button type="button" class="brand-scope-pill ${b.id === brand.id ? "active" : ""}" style="padding: 5px 12px; font-size: 12px;" data-modal-brand="${b.id}">
        <span class="brand-dot" style="background: ${b.palette.primary}; border: 2px solid ${b.palette.secondary};"></span>
        <span>${b.name}</span>
      </button>
    `).join("");

    pillsContainer.querySelectorAll("[data-modal-brand]").forEach(bBtn => {
      bBtn.addEventListener("click", () => {
        saveCurrentModalInPlaceEdits(false);
        renderStorefrontModalContent(postId, bBtn.dataset.modalBrand);
      });
    });
  }

  // Copy HTML button inside modal
  const copyBtn = document.getElementById("btn-modal-copy-html");
  if (copyBtn) {
    copyBtn.textContent = `Copy ${brand.name} Custom HTML + CSS`;
    copyBtn.onclick = () => {
      saveCurrentModalInPlaceEdits(false);
      const htmlPayload = buildScopedHtmlPayload(post, brand.id, state.imagePool, true);
      copyToClipboard(htmlPayload, `Copied ${brand.name} Custom HTML + CSS!`);
    };
  }

  // Browser URL bar
  setText("preview-browser-url", `${brand.domain}/blog/${urlKey}`);
  setText("preview-store-code-badge", `store_view: ${brand.storeCode}`);

  // Header chrome
  document.getElementById("preview-storefront-header").innerHTML = buildAuthenticBrandHeaderHTML(brand);

  // Article meta
  document.getElementById("preview-article-meta-bar").innerHTML = `
    <div style="display:flex; align-items:center; gap:10px; font-size:12.5px; color:#64748b; font-weight:600;">
      <span style="background:${brand.palette.surfaceTint}; color:${brand.palette.primary}; padding:4px 10px; border-radius:6px; border:1px solid ${brand.palette.borderTint};">
        ${escapeHtml((post.categories && post.categories[0]) || "Expert Advice")}
      </span>
      <span>•</span>
      <span>Published on ${escapeHtml(post.post_date.split(" ")[0])}</span>
      <span>•</span>
      <span>By ${escapeHtml(post.author || "Lawsons Editorial Team")}</span>
    </div>
  `;

  // Editable Title
  const titleEl = document.getElementById("preview-article-title");
  titleEl.textContent = title;
  titleEl.contentEditable = state.liveEditMode ? "true" : "false";

  // Hero Cover Image (Click to Replace)
  const heroEl = document.getElementById("preview-article-hero-img");
  const heroThumb = post.featured_image ? (post.featured_image.previewUrl || post.featured_image.url) : "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80";
  heroEl.innerHTML = `
    <img src="${escapeHtml(heroThumb)}" alt="${escapeHtml(title)}" style="width:100%; height:360px; object-fit:cover; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.08);">
  `;
  heroEl.onclick = () => openImagePickerDrawer("hero", null, heroThumb);

  // Editable Body Content
  const bodyEl = document.getElementById("preview-article-body");
  const scopedHtml = buildScopedHtmlPayload(post, brand.id, state.imagePool, false);
  bodyEl.innerHTML = scopedHtml;
  bodyEl.contentEditable = state.liveEditMode ? "true" : "false";

  // Attach click-to-replace listeners to all <img> tags in the body
  bodyEl.querySelectorAll("img").forEach(img => {
    img.style.cursor = "pointer";
    img.title = "Click to Replace Image";
    img.addEventListener("click", (e) => {
      e.stopPropagation();
      openImagePickerDrawer("body", img, img.src);
    });
  });

  // Footer chrome
  document.getElementById("preview-storefront-footer").innerHTML = buildAuthenticBrandFooterHTML(brand);

  updateLiveEditVisualClasses();
}

function toggleInPlaceLiveEditMode() {
  state.liveEditMode = !state.liveEditMode;
  const label = document.getElementById("live-edit-btn-label");
  const banner = document.getElementById("live-edit-indicator-bar");

  if (label) label.textContent = state.liveEditMode ? "In-Place Edit: ON" : "In-Place Edit: OFF";
  if (banner) banner.style.display = state.liveEditMode ? "flex" : "none";

  const titleEl = document.getElementById("preview-article-title");
  const bodyEl = document.getElementById("preview-article-body");
  if (titleEl) titleEl.contentEditable = state.liveEditMode ? "true" : "false";
  if (bodyEl) bodyEl.contentEditable = state.liveEditMode ? "true" : "false";

  updateLiveEditVisualClasses();
  showToast(state.liveEditMode ? "Interactive In-Place Editing enabled!" : "In-Place Editing disabled.");
}

function updateLiveEditVisualClasses() {
  const modal = document.getElementById("modal-preview");
  if (!modal) return;
  modal.classList.toggle("live-edit-mode-active", state.liveEditMode);
}

function saveCurrentModalInPlaceEdits(showUserToast = true) {
  if (!state.previewModalPostId) return;
  const post = state.posts.find(p => p.id === state.previewModalPostId);
  if (!post) return;

  const activeBId = state.activeBrandId === "all" ? "lawsons" : state.activeBrandId;
  const editedTitle = document.getElementById("preview-article-title")?.innerText.trim() || post.title;
  const editedHtml = document.getElementById("preview-article-body")?.innerHTML.trim() || post.content_html;

  if (!post.variations) post.variations = {};
  if (!post.variations[activeBId]) post.variations[activeBId] = {};

  post.variations[activeBId].title = editedTitle;
  post.variations[activeBId].content_html = editedHtml;

  saveStateToStorage();
  renderPostQueue();
  refreshExportPreview();

  if (showUserToast) {
    showToast(`Saved live edits for ${getBrandById(activeBId).name}!`);
  }
}

// ============================================================================
// CLICK-TO-REPLACE IMAGE PICKER DRAWER
// ============================================================================
function openImagePickerDrawer(targetType, imgElement = null, oldSrc = "") {
  state.imagePickerTarget = { type: targetType, el: imgElement, oldSrc };
  const drawer = document.getElementById("image-picker-drawer");
  const list = document.getElementById("drawer-image-list");
  if (!drawer || !list) return;

  if (state.imagePool.length === 0) {
    list.innerHTML = `<div style="padding:16px; font-size:13px; color:#64748b;">No images in media pool. Use "Upload & Replace" above to select a file from your computer.</div>`;
  } else {
    list.innerHTML = state.imagePool.map(img => `
      <div class="image-picker-card" data-pick-img-id="${img.id}">
        <img src="${escapeHtml(img.previewUrl || img.url)}" alt="${escapeHtml(img.title)}">
        <div style="padding:6px 8px; font-size:11px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          ${escapeHtml(img.title)}
        </div>
      </div>
    `).join("");

    list.querySelectorAll("[data-pick-img-id]").forEach(card => {
      card.addEventListener("click", () => {
        const selected = state.imagePool.find(i => i.id === card.dataset.pickImgId);
        if (selected) applyImageReplacement(selected);
      });
    });
  }

  drawer.classList.add("active");
}

function closeImagePickerDrawer() {
  document.getElementById("image-picker-drawer")?.classList.remove("active");
  state.imagePickerTarget = null;
}

function applyImageReplacement(selectedImage) {
  if (!state.previewModalPostId || !state.imagePickerTarget) return;
  const post = state.posts.find(p => p.id === state.previewModalPostId);
  if (!post) return;

  const newSrc = selectedImage.previewUrl || selectedImage.url;
  const activeBId = state.activeBrandId === "all" ? "lawsons" : state.activeBrandId;

  if (state.imagePickerTarget.type === "hero") {
    post.featured_image = selectedImage;
    post.featured_image_id = selectedImage.id;
    const heroImgEl = document.querySelector("#preview-article-hero-img img");
    if (heroImgEl) heroImgEl.src = newSrc;
    showToast(`Replaced Cover Hero Image with "${selectedImage.title}"!`);
  } else if (state.imagePickerTarget.type === "body" && state.imagePickerTarget.el) {
    const oldUrl = state.imagePickerTarget.el.src;
    state.imagePickerTarget.el.src = newSrc;
    saveCurrentModalInPlaceEdits(false);
    showToast(`Replaced body image with "${selectedImage.title}"!`);
  }

  saveStateToStorage();
  renderPostQueue();
  refreshExportPreview();
  closeImagePickerDrawer();
}

async function handleDrawerInstantUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const compressed = await compressImageIfNeeded(file, 3.5);
  const dataUrl = await fileToDataUrl(compressed);
  const cleanName = slugifyFilename(file.name);
  const derivedTitle = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");

  const newImg = {
    id: "img_" + Date.now(),
    title: derivedTitle,
    filename: cleanName,
    url: `/media/wysiwyg/blog/${cleanName}`,
    previewUrl: dataUrl,
    magentoPath: `/media/wysiwyg/blog/${cleanName}`,
    tags: derivedTitle.toLowerCase().split(/\s+/)
  };

  state.imagePool.unshift(newImg);
  renderMediaPool();
  applyImageReplacement(newImg);
  event.target.value = "";
}

// ============================================================================
// AUTHENTIC BRAND STOREFRONT CHROME GENERATORS
// ============================================================================
function buildAuthenticBrandHeaderHTML(brand) {
  if (brand.id === "lawsons") {
    return `
      <div style="background:#ffdd00; color:#111827; font-size:11.5px; font-weight:700; padding:6px 28px; display:flex; justify-content:space-between;">
        <span>Nationwide & Regional Delivery Across London & South East</span>
        <span>Include VAT ✓ | Branch Finder | Trade Accounts</span>
      </div>
      <div style="background:#008a2e; color:#ffffff; padding:16px 28px; display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap;">
        <div style="font-size:24px; font-weight:900; letter-spacing:0.04em; color:#ffdd00; line-height:1;">
          LAWSONS
          <span style="display:block; font-size:9px; color:#ffffff; font-weight:600; letter-spacing:0.02em; margin-top:2px;">TIMBER, BUILDING & FENCING SUPPLIES</span>
        </div>
        <div style="background:#ffffff; color:#64748b; padding:8px 16px; border-radius:4px; font-size:12.5px; width:300px;">Search products...</div>
        <div style="font-size:12px; font-weight:600; display:flex; gap:16px;">
          <span>Store Locator</span><span>My Account</span><span>Basket</span>
        </div>
      </div>
      <div style="background:#006822; color:#ffffff; padding:10px 28px; font-size:12px; font-weight:600; display:flex; gap:20px; flex-wrap:wrap;">
        <span>Fencing Supplies</span><span>Landscaping</span><span>Garden Buildings</span><span>Timber & Sheet</span>
        <span style="color:#ffdd00; font-weight:800;">Special Offers</span>
      </div>
    `;
  }
  if (brand.id === "avs") {
    return `
      <div style="background:#3e5b82; color:#ffffff; font-size:11px; font-weight:600; padding:5px 28px; display:flex; justify-content:space-between;">
        <span>AVS Fencing & Landscaping Supplies — Delivery or Click & Collect</span>
        <span>Include VAT ✓ | Nearest AVS Branch</span>
      </div>
      <div style="background:#333333; color:#ffffff; padding:16px 28px; display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="border:2px solid #ffffff; padding:4px 8px; font-weight:900; font-size:18px;">AVS</div>
          <span style="font-size:11px; color:#d1d5db; font-weight:600; text-transform:uppercase;">Fencing & Landscaping</span>
        </div>
        <div style="background:#ffffff; color:#64748b; padding:8px 16px; border-radius:4px; font-size:12.5px; width:300px;">Search fencing, sleepers...</div>
        <div style="font-size:12px; display:flex; gap:14px;">
          <span>Branches</span><span>Account</span><span>Basket</span>
        </div>
      </div>
      <div style="background:#262626; color:#ffffff; padding:10px 28px; font-size:12px; font-weight:600; display:flex; gap:24px; border-bottom:3px solid #7a6248;">
        <span>Fencing</span><span>Landscaping</span><span>Railway Sleepers</span><span>Decking</span><span style="background:#111; padding:2px 10px; border-radius:3px;">Offers</span>
      </div>
    `;
  }
  if (brand.id === "oxford") {
    return `
      <div style="background:#0085ca; color:#ffffff; font-size:11px; padding:5px 28px; display:flex; justify-content:space-between;">
        <span>Established in 1986 — Oxfordshire's Leading Fencing Specialists</span>
        <span>Call: 01865 820999</span>
      </div>
      <div style="background:#ffffff; color:#0f3b68; padding:16px 28px; display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; border-bottom:1px solid #e2e8f0;">
        <div>
          <div style="font-size:22px; font-weight:900; color:#0f3b68;">OXFORD</div>
          <div style="font-size:10px; font-weight:700; color:#0085ca; letter-spacing:0.16em;">FENCING SUPPLIES</div>
        </div>
        <div style="background:#f8fafc; border:1px solid #cbd5e1; color:#64748b; padding:8px 16px; border-radius:4px; font-size:12.5px; width:300px;">Search products...</div>
        <div style="font-size:12px; font-weight:700; color:#0f3b68; display:flex; gap:14px;">
          <span>Account</span><span>Basket</span>
        </div>
      </div>
      <div style="background:#0085ca; color:#ffffff; padding:10px 28px; font-size:12px; font-weight:600; display:flex; gap:20px;">
        <span>Fence Panels</span><span>Closeboard</span><span>Posts</span><span>Gates</span><span>Sleepers</span>
        <span style="background:#d32f2f; padding:2px 10px; border-radius:3px; font-weight:700;">Offers</span>
      </div>
    `;
  }
  if (brand.id === "witham") {
    return `
      <div style="background:#19325c; color:#ffffff; font-size:11px; padding:5px 28px; display:flex; justify-content:space-between;">
        <span>Manufactured On Site — Built Here. Built To Last.</span>
        <span>Include VAT ✓</span>
      </div>
      <div style="background:#ffffff; color:#19325c; padding:16px 28px; display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; border-bottom:1px solid #e2e8f0;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="font-size:21px; font-weight:900; color:#19325c;">Witham Timber</div>
        </div>
        <div style="background:#f8fafc; border:1px solid #cbd5e1; color:#64748b; padding:8px 16px; border-radius:4px; font-size:12.5px; width:300px;">Search code...</div>
        <div style="font-size:12px; font-weight:700; color:#19325c; display:flex; gap:14px;">
          <span>Account</span><span>Basket</span>
        </div>
      </div>
      <div style="background:#0076a8; color:#ffffff; padding:10px 28px; font-size:12px; font-weight:600; display:flex; gap:20px;">
        <span>Timber Fencing</span><span>Panels</span><span>Gates</span><span>Concrete Fencing</span><span>Sleepers</span>
        <span style="background:#c92a2a; padding:2px 10px; border-radius:3px; font-weight:700;">Offers</span>
      </div>
    `;
  }
  return `
    <div style="background:#1b4332; color:#ffffff; padding:16px 28px; display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; border-bottom:3px solid #b5835a;">
      <div>
        <div style="font-size:20px; font-weight:900; color:#ffffff;">THE LANDSCAPE CENTRE</div>
        <div style="font-size:10.5px; color:#b7e4c7;">AGGREGATES • TOPSOIL • PAVING • SLEEPERS • TURF</div>
      </div>
      <div style="font-size:12px; font-weight:600; display:flex; gap:18px;">
        <span>Aggregates</span><span>Topsoil</span><span>Paving</span><span>Sleepers</span><span>Turf</span>
      </div>
    </div>
  `;
}

function buildAuthenticBrandFooterHTML(brand) {
  return `
    <div style="background:${brand.palette.footerBg}; color:#ffffff; padding:28px 36px; text-align:center;">
      <div style="font-size:18px; font-weight:800; margin-bottom:6px;">${escapeHtml(brand.fullName)}</div>
      <p style="font-size:13px; opacity:0.88; max-width:620px; margin:0 auto;">${escapeHtml(brand.tagline)}</p>
    </div>
  `;
}

// ============================================================================
// TAB 5: AMASTY CSV & MAGENTO REST API EXPORTS
// ============================================================================
function refreshExportPreview() {
  const scope = document.getElementById("export-scope-select")?.value || "all_brands";
  const includeCss = state.settings.includeScopedCssInCopy !== false;
  const csvPreview = generateAmastyCSV(state.posts, state.imagePool, {
    exportScope: scope,
    includeScopedCss: includeCss
  });
  const el = document.getElementById("export-live-preview");
  if (el) el.value = csvPreview.substring(0, 6000) + (csvPreview.length > 6000 ? "\n\n... [Preview Truncated — Download Full CSV Above]" : "");
}

function downloadAmastyCSVFile() {
  if (state.posts.length === 0) {
    showToast("No posts in queue to export.");
    return;
  }
  const scope = document.getElementById("export-scope-select")?.value || "all_brands";
  const includeCss = state.settings.includeScopedCssInCopy !== false;
  const csvContent = generateAmastyCSV(state.posts, state.imagePool, {
    exportScope: scope,
    includeScopedCss: includeCss
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `amasty-blog-${scope}-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Downloaded Amasty Blog CSV (${scope})!`);
}

function downloadMagentoJsonFile() {
  if (state.posts.length === 0) {
    showToast("No posts in queue to export.");
    return;
  }
  const includeCss = state.settings.includeScopedCssInCopy !== false;
  const jsonContent = generateMagentoApiPayload(state.posts, state.imagePool, includeCss);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `magento-multistore-payload-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Downloaded Magento 2 Multi-Store JSON Payload!");
}

async function handlePushAllToMagentoApi() {
  if (!state.settings.magentoBearerToken) {
    openSettingsModal();
    showToast("Add a Magento Integration Bearer Token in Settings (from Pixel) to push directly via REST API.");
    return;
  }
  if (state.posts.length === 0) {
    showToast("Queue is empty.");
    return;
  }
  showToast("Pushing posts across all 5 Store Views via Magento REST API...");
  const firstResult = await pushPostToMagentoApi(state.posts[0], state.settings, state.imagePool);
  if (firstResult.success) {
    showToast("Successfully pushed Store View posts to Magento 2!");
  } else {
    showToast(firstResult.error || "API push completed with notices — check Diagnostics.");
  }
}

// ============================================================================
// SETTINGS & DIAGNOSTICS MODALS
// ============================================================================
function openSettingsModal() {
  document.getElementById("setting-gemini-key").value = state.settings.geminiApiKey || "";
  document.getElementById("setting-magento-token").value = state.settings.magentoBearerToken || "";
  document.getElementById("setting-magento-url").value = state.settings.magentoBaseUrl || "https://www.lawsons.co.uk";

  const brandSelect = document.getElementById("setting-brand-links-select");
  const editTarget = state.activeBrandId === "all" ? "lawsons" : state.activeBrandId;
  brandSelect.value = editTarget;
  loadBrandLinksIntoTextarea(editTarget);

  document.getElementById("modal-settings").classList.add("active");
}

function loadBrandLinksIntoTextarea(brandId) {
  const bank = (state.settings.brandLinksBank && state.settings.brandLinksBank[brandId])
    ? state.settings.brandLinksBank[brandId]
    : getBrandById(brandId).linksBank;
  const lines = bank.map(item => `${item.url} | ${item.label}`).join("\n");
  document.getElementById("setting-brand-links-textarea").value = lines;
}

function handleSaveSettings() {
  state.settings.geminiApiKey = document.getElementById("setting-gemini-key").value.trim();
  state.settings.magentoBearerToken = document.getElementById("setting-magento-token").value.trim();
  state.settings.magentoBaseUrl = document.getElementById("setting-magento-url").value.trim();

  const editedBrandId = document.getElementById("setting-brand-links-select").value;
  const rawLines = document.getElementById("setting-brand-links-textarea").value.split("\n");
  const parsedLinks = rawLines
    .map(l => l.trim())
    .filter(Boolean)
    .map(line => {
      const [urlPart, labelPart] = line.split("|").map(s => (s || "").trim());
      return { url: urlPart, label: labelPart || urlPart };
    });

  if (!state.settings.brandLinksBank) state.settings.brandLinksBank = {};
  state.settings.brandLinksBank[editedBrandId] = parsedLinks;

  saveStateToStorage();
  refreshPromptOutput();
  closeModal("modal-settings");
  showToast("Saved Multi-Store Links & API Settings!");
}

async function handleTestMagentoApi() {
  state.settings.magentoBearerToken = document.getElementById("setting-magento-token").value.trim();
  state.settings.magentoBaseUrl = document.getElementById("setting-magento-url").value.trim();
  const res = await testMagentoApiConnection(state.settings);
  showToast(res.message);
}

function openDebugModal() {
  const report = getDiagnosticReport(state);
  document.getElementById("debug-report-output").value = JSON.stringify(report, null, 2);
  document.getElementById("modal-debug").classList.add("active");
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove("active");
}

// ============================================================================
// CLIPBOARD & TOAST HELPERS
// ============================================================================
async function copyToClipboard(text, message = "Copied to clipboard!") {
  try {
    await navigator.clipboard.writeText(text);
    showToast(message);
  } catch (e) {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast(message);
  }
}

function showToast(msg) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>✨</span><span>${escapeHtml(msg)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
