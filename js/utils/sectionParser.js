/**
 * Section & Element Parser for Magento 2 PageBuilder Workflow
 *
 * Breaks down a complete blog article into modular, bite-sized blocks:
 * - Individual Headings (H2, H3)
 * - Section Paragraphs (Plain Text for WYSIWYG, or Clean HTML)
 * - Self-Contained Custom HTML Elements (Tables, Callouts, Product Cards, CTAs)
 *
 * Allows Cameron to build out Magento articles block-by-block, making it easy
 * to inject native Magento product blocks or edit text directly in PageBuilder.
 */

export function parseArticleIntoSections(htmlContent, brandId = "lawsons") {
  if (!htmlContent || typeof htmlContent !== "string") return [];

  // Parse using DOMParser
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${htmlContent}</div>`, "text/html");
  const container = doc.body.firstElementChild || doc.body;

  const blocks = [];
  let currentSection = null;
  let sectionIndex = 1;

  function flushSection() {
    if (currentSection) {
      if (currentSection.elements.length > 0 || currentSection.heading) {
        // Collect HTML and Plain text for this section
        const sectionHtml = currentSection.elements.map(el => el.outerHTML).join("\n");
        const plainText = currentSection.elements
          .map(el => el.innerText.trim())
          .filter(Boolean)
          .join("\n\n");

        blocks.push({
          id: `sec_${blocks.length + 1}`,
          type: "section",
          heading: currentSection.heading || `Section ${sectionIndex}`,
          headingTag: currentSection.headingTag || "h2",
          headingHtml: currentSection.headingHtml || "",
          html: sectionHtml,
          plainText: plainText,
          elementCount: currentSection.elements.length
        });
        sectionIndex++;
      }
      currentSection = null;
    }
  }

  // Iterate over top-level child nodes
  const children = Array.from(container.children);

  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    const tagName = el.tagName.toLowerCase();

    // 1. Comparison / Specification Tables
    if (tagName === "table" || el.classList.contains("mce-table-wrap") || el.querySelector("table")) {
      flushSection();
      const tableEl = el.classList.contains("mce-table-wrap") ? el : (el.querySelector("table") || el);
      const wrapHtml = `<div class="mce-table-wrap">\n${tableEl.outerHTML}\n</div>`;
      blocks.push({
        id: `table_${blocks.length + 1}`,
        type: "table",
        title: "Technical Comparison Table",
        html: wrapHtml,
        plainText: tableEl.innerText.trim(),
        badge: "TABLE"
      });
      continue;
    }

    // 2. Product Grid / Showcase Cards
    if (el.classList.contains("mce-product-grid") || el.querySelector(".mce-product-card")) {
      flushSection();
      blocks.push({
        id: `prod_${blocks.length + 1}`,
        type: "product-grid",
        title: "PageBuilder Product Showcase Grid",
        html: el.outerHTML,
        plainText: el.innerText.trim(),
        badge: "PRODUCTS"
      });
      continue;
    }

    // 3. Category Spotlight Banner & Dual CTA
    if (el.classList.contains("category-spotlight-box") || el.querySelector(".spotlight-btn")) {
      flushSection();
      blocks.push({
        id: `cta_${blocks.length + 1}`,
        type: "spotlight",
        title: "Brand Spotlight & CTA Banner",
        html: el.outerHTML,
        plainText: el.innerText.trim(),
        badge: "CTA BANNER"
      });
      continue;
    }

    // 4. Pro-Tip / Want to Know More Callout Box
    if (el.classList.contains("callout-box") || el.classList.contains("lawsons-pro-tip") || el.classList.contains("lawsons-widget-container")) {
      flushSection();
      blocks.push({
        id: `callout_${blocks.length + 1}`,
        type: "callout",
        title: el.querySelector("h4, .heading, h3")?.innerText.trim() || "Expert Pro-Tip / Callout Box",
        html: el.outerHTML,
        plainText: el.innerText.trim(),
        badge: "CALLOUT"
      });
      continue;
    }

    // 5. Headings (H2 starts a new section)
    if (tagName === "h2") {
      flushSection();
      currentSection = {
        heading: el.innerText.trim(),
        headingTag: "h2",
        headingHtml: el.outerHTML,
        elements: []
      };
      continue;
    }

    // If we encounter an element before any H2, it's the Intro
    if (!currentSection) {
      currentSection = {
        heading: "Introduction & Lead Paragraph",
        headingTag: "intro",
        headingHtml: "",
        elements: [el]
      };
      continue;
    }

    // Regular paragraphs, subheadings (H3), lists inside current section
    currentSection.elements.push(el);
  }

  flushSection();

  return blocks;
}

/**
 * Strips HTML tags and unescapes basic entities for clean WYSIWYG pasting
 */
export function stripHtmlToText(html) {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.innerText.trim();
}
