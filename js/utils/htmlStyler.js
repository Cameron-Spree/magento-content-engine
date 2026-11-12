/**
 * PageBuilder-Safe Custom HTML & Scoped CSS Styler for Amasty Blog Pro (Magento 2)
 *
 * Solves two major Magento / Amasty pain points:
 * 1. Prevents PageBuilder's duplicate mobile/desktop image rendering bug by using clean,
 *    self-contained <figure class="mce-media-figure"> blocks with responsive CSS.
 * 2. Replaces broken Magento product widgets with responsive, brand-authentic HTML Product
 *    Spotlight & Category Cards styled to match Lawsons, AVS, Oxford, Witham, and Landscape Centre.
 */

import { getBrandById } from "./brandsConfig.js";
import { replaceImagePlaceholdersInHtml } from "./mediaMatcher.js";

/**
 * Generates the self-contained <style> block that Cameron places at the top of the
 * Custom HTML block in Amasty Blog so every element renders consistently on the live storefront.
 */
export function generateBrandScopedCSS(brandId = "lawsons") {
  const brand = getBrandById(brandId);
  const p = brand.palette;

  return `<style>
/* === ${brand.name.toUpperCase()} BLOG STYLES (MATCHES LIVE MAGENTO & AMASTY THEME) === */
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap');

.mce-blog-article-${brand.id},
.amblog-post-content,
.am-blog-post {
  font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: ${p.textMain};
  line-height: 1.68;
  font-size: 16px;
  max-width: 100%;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}
.mce-blog-article-${brand.id} *,
.mce-blog-article-${brand.id} *::before,
.mce-blog-article-${brand.id} *::after {
  box-sizing: border-box;
}
.mce-blog-article-${brand.id} h2,
.amblog-post-content h2,
.am-blog-post h2 {
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: ${p.primary};
  font-size: 26px;
  font-weight: 700;
  margin: 36px 0 16px 0;
  padding-bottom: 10px;
  border-bottom: 3px solid ${p.primaryDark || p.borderTint};
  line-height: 1.28;
  letter-spacing: -0.01em;
}
.mce-blog-article-${brand.id} h3,
.amblog-post-content h3,
.am-blog-post h3 {
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: ${p.primaryDark || p.primary};
  font-size: 20px;
  font-weight: 700;
  margin: 28px 0 12px 0;
  line-height: 1.35;
}
.mce-blog-article-${brand.id} h4,
.amblog-post-content h4,
.am-blog-post h4 {
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: ${p.textMain};
  font-size: 17px;
  font-weight: 700;
  margin: 20px 0 8px 0;
}
.mce-blog-article-${brand.id} p,
.amblog-post-content p,
.am-blog-post p {
  margin: 0 0 18px 0;
  color: ${p.textMain};
  font-size: 16px;
  line-height: 1.68;
}
.mce-blog-article-${brand.id} a:not(.mce-btn-primary):not(.mce-btn-secondary):not(.lawsons-widget-button),
.amblog-post-content a:not(.mce-btn-primary):not(.mce-btn-secondary):not(.lawsons-widget-button) {
  color: ${p.primary};
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: opacity 0.2s ease;
}
.mce-blog-article-${brand.id} a:not(.mce-btn-primary):not(.mce-btn-secondary):not(.lawsons-widget-button):hover,
.amblog-post-content a:not(.mce-btn-primary):not(.mce-btn-secondary):not(.lawsons-widget-button):hover {
  opacity: 0.8;
}
.mce-blog-article-${brand.id} ul,
.mce-blog-article-${brand.id} ol,
.amblog-post-content ul,
.amblog-post-content ol {
  margin: 0 0 22px 0;
  padding-left: 24px;
  color: ${p.textMain};
}
.mce-blog-article-${brand.id} li,
.amblog-post-content li {
  margin-bottom: 8px;
  line-height: 1.65;
}
/* Single-Image Anti-Duplication Rule (Bypasses Magento PageBuilder Mobile/Desktop Double Image Bug) */
.mce-blog-article-${brand.id} figure.mce-media-figure,
figure.mce-media-figure {
  margin: 28px 0 !important;
  text-align: center;
  display: block !important;
  width: 100%;
}
.mce-blog-article-${brand.id} figure.mce-media-figure img,
figure.mce-media-figure img,
.mce-blog-article-${brand.id} > img,
.mce-blog-article-${brand.id} p > img {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  height: auto !important;
  max-height: 480px !important;
  object-fit: cover;
  border-radius: 8px;
  margin: 0 auto !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
.mce-blog-article-${brand.id} figure.mce-media-figure img.pagebuilder-mobile-only,
figure.mce-media-figure img.pagebuilder-mobile-only,
.mce-blog-article-${brand.id} img[data-element="mobile_image"] {
  display: none !important;
}
.mce-blog-article-${brand.id} figcaption,
figure.mce-media-figure figcaption {
  font-size: 13px;
  color: #6b7280;
  margin-top: 8px;
  font-style: italic;
}
/* Responsive Data & Comparison Tables */
.mce-blog-article-${brand.id} .mce-table-wrap,
.mce-table-wrap {
  width: 100%;
  overflow-x: auto;
  margin: 28px 0;
  border-radius: 8px;
  border: 1px solid ${p.borderTint};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}
.mce-blog-article-${brand.id} table,
.mce-table-wrap table,
.amblog-post-content table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14.5px;
  background: #ffffff;
}
.mce-blog-article-${brand.id} th,
.mce-table-wrap th,
.amblog-post-content th {
  background: ${p.primary};
  color: #ffffff;
  font-weight: 700;
  text-align: left;
  padding: 13px 16px;
  border-bottom: 2px solid ${p.primaryDark || p.primary};
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}
.mce-blog-article-${brand.id} td,
.mce-table-wrap td,
.amblog-post-content td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  color: ${p.textMain};
}
.mce-blog-article-${brand.id} tr:nth-child(even) td,
.mce-table-wrap tr:nth-child(even) td,
.amblog-post-content tr:nth-child(even) td {
  background: ${p.surfaceTint};
}
/* Brand Spotlight Banner & Dual CTA Buttons */
.mce-blog-article-${brand.id} .category-spotlight-box,
.category-spotlight-box {
  background: ${p.surfaceTint};
  border: 2px solid ${p.primary};
  border-radius: 10px;
  padding: 28px 24px;
  margin: 34px 0;
  text-align: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
}
.mce-blog-article-${brand.id} .category-spotlight-box h3,
.category-spotlight-box h3 {
  color: ${p.primary};
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 10px 0;
}
.mce-blog-article-${brand.id} .category-spotlight-box p,
.category-spotlight-box p {
  color: ${p.textMain};
  font-size: 15px;
  max-width: 640px;
  margin: 0 auto 20px auto;
}
.mce-blog-article-${brand.id} .mce-btn-row,
.category-spotlight-box .mce-btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  align-items: center;
}
.mce-blog-article-${brand.id} .mce-btn-primary,
.mce-btn-primary,
.spotlight-btn {
  display: inline-block;
  background: ${p.primary};
  color: #ffffff !important;
  font-weight: 700;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none !important;
  font-size: 14.5px;
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.mce-blog-article-${brand.id} .mce-btn-secondary,
.mce-btn-secondary {
  display: inline-block;
  background: ${p.secondary};
  color: ${p.secondaryText} !important;
  font-weight: 700;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none !important;
  font-size: 14.5px;
  transition: transform 0.15s ease, opacity 0.15s ease;
}
/* Authentic Lawsons & Brand Callout Box */
.mce-blog-article-${brand.id} .callout-box,
.callout-box,
.mce-blog-article-${brand.id} .lawsons-pro-tip,
.lawsons-pro-tip {
  background: ${p.surfaceTint};
  border-left: 5px solid ${p.primary};
  border-radius: 6px;
  padding: 20px 24px;
  margin: 28px 0;
}
.mce-blog-article-${brand.id} .callout-box h4,
.callout-box h4,
.mce-blog-article-${brand.id} .lawsons-pro-tip .heading,
.lawsons-pro-tip .heading {
  color: ${p.primary};
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 10px 0;
}
/* Authentic Lawsons CTA Card (Want to know more?) */
.mce-blog-article-${brand.id} .lawsons-widget-container,
.lawsons-widget-container {
  width: 100%;
  margin: 28px 0;
  background: #ffffff !important;
  border-left: 4px solid ${p.primary} !important;
  padding: 24px;
  border-radius: 0 8px 8px 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  color: ${p.textMain} !important;
}
.mce-blog-article-${brand.id} .lawsons-widget-button,
.lawsons-widget-button {
  display: inline-block;
  text-decoration: none !important;
  background: #ffffff !important;
  color: ${p.primary} !important;
  border: 1px solid ${p.primary} !important;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.2s ease;
}
.mce-blog-article-${brand.id} .lawsons-widget-button:hover,
.lawsons-widget-button:hover {
  background: ${p.primary} !important;
  color: #ffffff !important;
}
/* PageBuilder-Safe Product Cards Grid */
.mce-blog-article-${brand.id} .mce-product-grid,
.mce-product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
  margin: 30px 0;
}
.mce-blog-article-${brand.id} .mce-product-card,
.mce-product-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-bottom: 3px solid ${p.primary};
  border-radius: 8px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.mce-blog-article-${brand.id} .mce-product-card h5,
.mce-product-card h5 {
  font-size: 15px;
  font-weight: 700;
  color: ${p.textMain};
  margin: 0 0 8px 0;
  line-height: 1.4;
}
.mce-blog-article-${brand.id} .mce-product-card p,
.mce-product-card p {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 14px 0;
}
</style>`;
}
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
  margin: 30px 0;
}
.mce-blog-article-${brand.id} .mce-product-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-bottom: 3px solid ${p.primary};
  border-radius: 8px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.mce-blog-article-${brand.id} .mce-product-card h5 {
  font-size: 15px;
  font-weight: 700;
  color: ${p.textMain};
  margin: 0 0 8px 0;
  line-height: 1.4;
}
.mce-blog-article-${brand.id} .mce-product-card p {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 14px 0;
}
</style>`;
}

/**
 * Builds the complete, ready-to-paste Custom HTML payload for a specific brand Store View
 */
export function buildScopedHtmlPayload(post, brandId = "lawsons", imagePool = [], includeTopCss = true, getSafeDisplayUrlFn = null) {
  const brand = getBrandById(brandId);
  const variation = (post.variations && post.variations[brandId]) ? post.variations[brandId] : null;
  let rawHtml = (variation && variation.content_html) ? variation.content_html : (post.content_html || "");

  // Replace {{IMAGE:keyword}} placeholders with single-image <figure class="mce-media-figure">
  let processedHtml = replaceImagePlaceholdersInHtml(rawHtml, post.mapped_images, imagePool, getSafeDisplayUrlFn, brand);

  // Adapt generic spotlight/callout widgets to active brand colors & links
  processedHtml = adaptHtmlWidgetsToBrand(processedHtml, brand);

  // Wrap tables in .mce-table-wrap if not already wrapped
  processedHtml = processedHtml.replace(/<table([\s\S]*?)<\/table>/gi, (match) => {
    if (match.includes("mce-table-wrap")) return match;
    return `<div class="mce-table-wrap">${match}</div>`;
  });

  const cssBlock = includeTopCss ? `${generateBrandScopedCSS(brandId)}\n` : "";

  return `${cssBlock}<div class="mce-blog-article-${brand.id}">\n${processedHtml}\n</div>`;
}

/**
 * Dynamically adapts any generic or other-brand CTA boxes/links to match the selected brand
 */
export function adaptHtmlWidgetsToBrand(html, brand) {
  if (!html) return "";
  const p = brand.palette;
  let out = html;

  // Ensure category-spotlight-box uses brand palette inline fallback + buttons
  out = out.replace(/<div\s+class=['"]category-spotlight-box['"][^>]*>/gi, () => {
    return `<div class="category-spotlight-box" style="background: ${p.surfaceTint}; border: 2px solid ${p.primary}; border-radius: 12px; padding: 28px 24px; margin: 34px 0; text-align: center;">`;
  });

  out = out.replace(/<div\s+class=['"]callout-box[^'"]*['"][^>]*>/gi, () => {
    return `<div class="callout-box want-to-know-more" style="background: ${p.surfaceTint}; border-left: 5px solid ${p.primary}; border-radius: 8px; padding: 20px 24px; margin: 30px 0;">`;
  });

  out = out.replace(/<a\s+href=['"]([^'"]+)['"]\s+class=['"]spotlight-btn['"][^>]*>/gi, (m, url) => {
    return `<a href="${url}" class="mce-btn-primary spotlight-btn" style="display: inline-block; background: ${p.primary}; color: #ffffff; font-weight: 700; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14.5px; margin: 4px;">`;
  });

  return out;
}
