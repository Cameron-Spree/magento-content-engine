/**
 * Live Copy Editor Module for WordPress Studio
 * Allows direct in-place editing of all labels, headings, buttons, hints, and placeholders across the app.
 */

export function initLiveCopyEditor(platformName = "WordPress Content Engine") {
  let isEditing = false;
  const originalTexts = new Map();
  const edits = new Map();

  // Create floating bottom toolbar
  const toolbar = document.createElement("div");
  toolbar.id = "live-copy-editor-bar";
  toolbar.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(120px);
    z-index: 9999;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    color: #ffffff;
    border-radius: 9999px;
    padding: 10px 22px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.15);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    font-family: -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Inter', sans-serif;
    font-size: 13px;
  `;

  toolbar.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981;"></span>
      <strong>✏️ Copy Edit Mode ON</strong>
      <span style="color: #94a3b8; font-size: 12px;">(Click any label, heading, or button to edit)</span>
    </div>
    <div style="display: flex; align-items: center; gap: 10px;">
      <span id="copy-edit-counter" style="background: rgba(255,255,255,0.12); padding: 3px 10px; border-radius: 9999px; font-weight: 700; font-size: 12px; color: #38bdf8;">0 changes</span>
      <button type="button" id="btn-copy-collected-edits" style="background: #007aff; color: #ffffff; border: none; padding: 7px 15px; border-radius: 9999px; font-weight: 700; cursor: pointer; font-size: 12.5px; transition: background 0.15s ease;">
        📋 Copy Updates to Clipboard
      </button>
      <button type="button" id="btn-exit-copy-editor" style="background: rgba(255,255,255,0.15); color: #e2e8f0; border: none; padding: 7px 13px; border-radius: 9999px; font-weight: 600; cursor: pointer; font-size: 12px;">
        ✕ Exit
      </button>
    </div>
  `;
  document.body.appendChild(toolbar);

  // Toggle button in header
  const toggleBtn = document.getElementById("btn-toggle-copy-edit");
  if (toggleBtn) {
    toggleBtn.onclick = () => toggleMode();
  }

  document.getElementById("btn-exit-copy-editor").onclick = () => toggleMode(false);
  document.getElementById("btn-copy-collected-edits").onclick = () => copyEditsToClipboard();

  function toggleMode(forceState) {
    isEditing = typeof forceState === "boolean" ? forceState : !isEditing;

    if (isEditing) {
      toolbar.style.transform = "translateX(-50%) translateY(0)";
      if (toggleBtn) {
        toggleBtn.style.background = "#007aff";
        toggleBtn.style.color = "#ffffff";
        toggleBtn.innerHTML = "✓ Editing Copy...";
      }
      enableInlineEditing();
    } else {
      toolbar.style.transform = "translateX(-50%) translateY(120px)";
      if (toggleBtn) {
        toggleBtn.style.background = "transparent";
        toggleBtn.style.color = "#007aff";
        toggleBtn.innerHTML = "✏️ Edit App Copy";
      }
      disableInlineEditing();
    }
  }

  function getSelector(el) {
    if (el.id) return `#${el.id}`;
    const tag = el.tagName.toLowerCase();
    const parent = el.closest(".card, .tab-panel, header, nav, section");
    const parentDesc = parent && parent.id ? `#${parent.id} ` : (parent && parent.className ? `.${parent.className.split(' ')[0]} ` : "");
    return `${parentDesc}${tag}`;
  }

  function enableInlineEditing() {
    const targets = document.querySelectorAll(`
      h1, h2, h3, h4,
      label,
      p.panel-subtitle, p.card-desc,
      .stat-label,
      .tab-title,
      nav.nav-tabs .tab-btn span,
      .card-header-flex h3,
      .checkbox-label,
      .widget-toggles-title,
      .form-group > label
    `);

    targets.forEach(el => {
      if (el.closest("#live-copy-editor-bar") || el.closest(".modal-overlay")) return;
      if (!originalTexts.has(el)) {
        originalTexts.set(el, el.innerText.trim());
      }
      el.contentEditable = "true";
      el.spellcheck = false;
      el.style.outline = "1.5px dashed rgba(0, 122, 255, 0.4)";
      el.style.outlineOffset = "2px";
      el.style.borderRadius = "4px";
      el.style.cursor = "text";

      el.onblur = () => {
        const current = el.innerText.trim();
        const orig = originalTexts.get(el);
        if (current !== orig) {
          const labelContext = el.getAttribute("data-label-key") || el.id || el.closest(".form-group")?.querySelector("label")?.innerText || el.innerText.slice(0, 25);
          edits.set(el, {
            location: getSelector(el),
            context: labelContext,
            oldVal: orig,
            newVal: current
          });
        } else {
          edits.delete(el);
        }
        updateCounter();
      };
    });
  }

  function disableInlineEditing() {
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
      if (el.closest("#live-copy-editor-bar")) return;
      el.contentEditable = "false";
      el.style.outline = "none";
      el.style.cursor = "default";
    });
  }

  function updateCounter() {
    const counter = document.getElementById("copy-edit-counter");
    if (counter) {
      counter.innerText = `${edits.size} change${edits.size === 1 ? '' : 's'}`;
    }
  }

  function copyEditsToClipboard() {
    if (edits.size === 0) {
      alert("No changes detected yet! Click and edit any text, label, or heading on the page, then click this button.");
      return;
    }

    let summary = `Here are my live wording updates for ${platformName}:\n\n`;
    edits.forEach((info) => {
      summary += `- **${info.context}** (${info.location}):\n  - Old: "${info.oldVal}"\n  - New: "${info.newVal}"\n\n`;
    });

    navigator.clipboard.writeText(summary).then(() => {
      alert(`Success! Copied ${edits.size} wording updates to your clipboard.\nJust paste it right into our chat!`);
    }).catch(() => {
      prompt("Copy your updates below and paste into chat:", summary);
    });
  }
}
