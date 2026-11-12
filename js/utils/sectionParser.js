/**
 * Section & Element Parser for Magento 2 PageBuilder Workflow
 *
 * Breaks down a complete blog article into modular, bite-sized blocks:
 * - Brand Scoped CSS <style> Block (for top of PageBuilder)
 * - Individual Headings (H2, H3)
 * - Section Paragraphs (Plain Text for WYSIWYG, or Clean HTML)
 * - Self-Contained Custom HTML Elements (Tables, Callouts, Product Cards, CTAs)
 *
 * Allows Cameron to build out Magento articles block-by-block, making it easy
 * to inject native Magento product blocks or edit text directly in PageBuilder.
 */

import { generateBrandScopedCSS } from "./htmlStyler.js";
import { getBrandById } from "./brandsConfig.js";

/**
 * Safely extracts text content from both attached and detached DOM elements.
 * Critical: In detached DOM trees created via DOMParser, element.innerText
 * returns an empty string in Chromium/WebKit engines because there is no rendered
 * layout tree. element.textContent is standard and always reliably populated.
 */
function getNodeText(el) {
  if (!el) return "";
  return (el.textContent || el.innerText || "").trim();
}

export function parseArticleIntoSections(htmlContent, brandId = "lawsons", includeCss = true) {
  if (!htmlContent || typeof htmlContent !== "string") return [];

  const brand = getBrandById(brandId);
  const brandCss = generateBrandScopedCSS(brandId);

  const blocks = [];

  // Block #0: Brand-Scoped CSS <style> Block for top of PageBuilder
  if (includeCss && brandCss) {
    blocks.push({
      id: `css_${brandId}`,
      type: "css",
      title: `${brand.name} Scoped CSS <style> Block`,
      heading: `${brand.name} Scoped CSS <style> Block`,
      headingTag: "style",
      headingHtml: "",
      html: brandCss,
      rawCss: brandCss.replace(/<\/?style>/gi, "").trim(),
      plainText: brandCss,
      badge: "CSS STYLESHEET",
      hint: `Place this into a PageBuilder "HTML Code" block at the very top of your ${brand.name} article. It styles all tables, CTA boxes, product grids, and typography.`
    });
  }

  // Strip any existing <style>...</style> block from body HTML before parsing sections
  const cleanBodyHtml = htmlContent.replace(/<style[\s\S]*?<\/style>/gi, "").trim();

  // Parse using DOMParser
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${cleanBodyHtml}</div>`, "text/html");
  let container = doc.body.firstElementChild || doc.body;

  // Unwrap any single top-level wrapper div (e.g. .mce-blog-article-lawsons)
  while (
    container &&
    container.children &&
    container.children.length === 1 &&
    container.firstElementChild &&
    container.firstElementChild.tagName.toLowerCase() === "div" &&
    !container.firstElementChild.classList.contains("mce-product-grid") &&
    !container.firstElementChild.classList.contains("category-spotlight-box") &&
    !container.firstElementChild.classList.contains("callout-box") &&
    !container.firstElementChild.classList.contains("mce-table-wrap")
  ) {
    container = container.firstElementChild;
  }

  // Normalize top-level loose text nodes (e.g. {{IMAGE:keyword}} or unwrapped lines) into <p>
  if (container && container.childNodes) {
    Array.from(container.childNodes).forEach(node => {
      if (node.nodeType === 3) {
        const text = (node.textContent || "").trim();
        if (text) {
          const p = doc.createElement("p");
          p.textContent = text;
          container.replaceChild(p, node);
        }
      }
    });
  }

  let pendingHeading = null;
  let currentSection = null;
  let sectionIndex = 1;

  function flushCurrentSection() {
    if (currentSection) {
      const plainText = currentSection.elements
        .map(el => getNodeText(el))
        .filter(Boolean)
        .join("\n\n");

      const hasVisibleMedia = currentSection.elements.some(el =>
        el.querySelector && el.querySelector("img, svg, figure, a, iframe, table")
      );

      // Only push non-empty sections (with actual text or embedded media)
      if (currentSection.elements.length > 0 && (plainText.length > 0 || hasVisibleMedia)) {
        const elementsHtml = currentSection.elements.map(el => el.outerHTML).join("\n");
        const fullSectionHtml = currentSection.headingHtml
          ? `${currentSection.headingHtml}\n${elementsHtml}`
          : elementsHtml;
        const wrappedHtml = `<div class="mce-blog-article-${brand.id}">\n${fullSectionHtml}\n</div>`;

        blocks.push({
          id: `sec_${blocks.length + 1}`,
          type: "section",
          heading: currentSection.heading || `Section ${sectionIndex}`,
          headingTag: currentSection.headingTag || "h2",
          headingHtml: currentSection.headingHtml || "",
          html: wrappedHtml,
          elementsHtml: elementsHtml,
          plainText: plainText,
          elementCount: currentSection.elements.length
        });
        sectionIndex++;
      }
      currentSection = null;
    }
  }

  // Iterate over top-level child elements
  const children = container ? Array.from(container.children) : [];

  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    const tagName = el.tagName ? el.tagName.toLowerCase() : "";

    // Skip empty spacer elements (<p></p>, <p>&nbsp;</p>, whitespace)
    const rawText = getNodeText(el).replace(/[\s\u00a0]+/g, " ");
    const hasMedia = Boolean(el.querySelector && el.querySelector("img, svg, figure, iframe, video, table, a"));
    if (!rawText && !hasMedia && tagName !== "table" && !el.classList.contains("mce-table-wrap")) {
      continue;
    }

    // 1. Comparison / Specification Tables
    if (tagName === "table" || el.classList.contains("mce-table-wrap") || (el.querySelector && el.querySelector("table"))) {
      const headingText = pendingHeading ? pendingHeading.text : "";
      const headingHtml = pendingHeading ? pendingHeading.html : "";
      pendingHeading = null;
      flushCurrentSection();

      const cleanTable = (el.tagName && el.tagName.toLowerCase() === "table")
        ? el
        : ((el.querySelector && el.querySelector("table")) || el);
      const wrapHtml = `<div class="mce-table-wrap">\n${cleanTable.outerHTML}\n</div>`;
      const fullHtml = headingHtml ? `${headingHtml}\n${wrapHtml}` : wrapHtml;
      const wrappedHtml = `<div class="mce-blog-article-${brand.id}">\n${fullHtml}\n</div>`;

      blocks.push({
        id: `table_${blocks.length + 1}`,
        type: "table",
        heading: headingText,
        headingHtml: headingHtml,
        title: headingText || "Technical Comparison Table",
        html: wrappedHtml,
        tableHtml: wrapHtml,
        plainText: getNodeText(cleanTable),
        badge: "TABLE"
      });
      continue;
    }

    // 2. Product Grid / Showcase Cards
    if (el.classList.contains("mce-product-grid") || (el.querySelector && el.querySelector(".mce-product-card"))) {
      const headingText = pendingHeading ? pendingHeading.text : "";
      const headingHtml = pendingHeading ? pendingHeading.html : "";
      pendingHeading = null;
      flushCurrentSection();

      const fullHtml = headingHtml ? `${headingHtml}\n${el.outerHTML}` : el.outerHTML;
      const wrappedHtml = `<div class="mce-blog-article-${brand.id}">\n${fullHtml}\n</div>`;
      blocks.push({
        id: `prod_${blocks.length + 1}`,
        type: "product-grid",
        heading: headingText,
        headingHtml: headingHtml,
        title: headingText || "PageBuilder Product Showcase Grid",
        html: wrappedHtml,
        plainText: getNodeText(el),
        badge: "PRODUCTS"
      });
      continue;
    }

    // 3. Category Spotlight Banner & Dual CTA
    if (el.classList.contains("category-spotlight-box") || (el.querySelector && el.querySelector(".spotlight-btn"))) {
      const headingText = pendingHeading ? pendingHeading.text : "";
      const headingHtml = pendingHeading ? pendingHeading.html : "";
      pendingHeading = null;
      flushCurrentSection();

      const fullHtml = headingHtml ? `${headingHtml}\n${el.outerHTML}` : el.outerHTML;
      const wrappedHtml = `<div class="mce-blog-article-${brand.id}">\n${fullHtml}\n</div>`;
      blocks.push({
        id: `cta_${blocks.length + 1}`,
        type: "spotlight",
        heading: headingText,
        headingHtml: headingHtml,
        title: headingText || "Brand Spotlight & CTA Banner",
        html: wrappedHtml,
        plainText: getNodeText(el),
        badge: "CTA BANNER"
      });
      continue;
    }

    // 4. Pro-Tip / Want to Know More Callout Box
    if (el.classList.contains("callout-box") || el.classList.contains("lawsons-pro-tip") || el.classList.contains("lawsons-widget-container")) {
      const headingText = pendingHeading ? pendingHeading.text : "";
      const headingHtml = pendingHeading ? pendingHeading.html : "";
      pendingHeading = null;
      flushCurrentSection();

      const calloutTitle = getNodeText(el.querySelector && el.querySelector("h4, .heading, h3")) || "Expert Pro-Tip / Callout Box";
      const fullHtml = headingHtml ? `${headingHtml}\n${el.outerHTML}` : el.outerHTML;
      const wrappedHtml = `<div class="mce-blog-article-${brand.id}">\n${fullHtml}\n</div>`;
      blocks.push({
        id: `callout_${blocks.length + 1}`,
        type: "callout",
        heading: headingText,
        headingHtml: headingHtml,
        title: headingText || calloutTitle,
        html: wrappedHtml,
        plainText: getNodeText(el),
        badge: "CALLOUT"
      });
      continue;
    }

    // 5. Headings (H2 starts a new section or titles an upcoming element)
    if (tagName === "h2") {
      flushCurrentSection();
      pendingHeading = {
        text: getNodeText(el),
        tag: "h2",
        html: el.outerHTML
      };
      continue;
    }

    // If we have a pendingHeading, start a new section with it!
    if (pendingHeading) {
      flushCurrentSection();
      currentSection = {
        heading: pendingHeading.text,
        headingTag: pendingHeading.tag,
        headingHtml: pendingHeading.html,
        elements: [el]
      };
      pendingHeading = null;
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

  flushCurrentSection();

  // If there was an orphaned trailing heading with no content (edge case)
  if (pendingHeading && pendingHeading.text) {
    const wrappedHtml = `<div class="mce-blog-article-${brand.id}">\n${pendingHeading.html}\n</div>`;
    blocks.push({
      id: `sec_${blocks.length + 1}`,
      type: "section",
      heading: pendingHeading.text,
      headingTag: pendingHeading.tag,
      headingHtml: pendingHeading.html,
      html: wrappedHtml,
      elementsHtml: "",
      plainText: pendingHeading.text,
      elementCount: 0
    });
  }

  // Filter out any completely empty blocks (where html and plainText are both blank)
  return blocks.filter(b => b.type === "css" || (b.html && b.html.trim().length > 0) || (b.plainText && b.plainText.trim().length > 0));
}

/**
 * Strips HTML tags and unescapes basic entities for clean WYSIWYG pasting
 */
export function stripHtmlToText(html) {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").trim();
}
