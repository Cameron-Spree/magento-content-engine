/**
 * Amasty Blog Pro (Magento 2) Multi-Store Exporter
 * Generates:
 * 1. Amasty Blog Pro Compatible CSV (with Store View Scope rows & PageBuilder-safe Custom HTML)
 * 2. Magento 2 REST API JSON Payload Bundle (/rest/{store_code}/V1/amasty_blog/posts)
 * 3. Self-Contained HTML + Scoped CSS Package
 */

import { BRANDS, BRAND_LIST, getBrandById } from "./brandsConfig.js";
import { buildScopedHtmlPayload } from "./htmlStyler.js";

/**
 * Generates an RFC-4180 compliant CSV formatted for Amasty Blog Pro (Magento 2)
 */
export function generateAmastyCSV(posts, imagePool = [], options = {}) {
  const {
    exportScope = "all_brands", // "all_brands" or a specific brandId ("lawsons", "avs", etc.)
    includeScopedCss = true
  } = options;

  const headers = [
    "store_view_code",
    "store_id",
    "brand_name",
    "title",
    "url_key",
    "status",
    "published_at",
    "categories",
    "tags",
    "short_content",
    "full_content",
    "meta_title",
    "meta_description",
    "post_thumbnail",
    "list_thumbnail",
    "post_thumbnail_alt"
  ];

  const rows = [headers.map(escapeCsvCell).join(",")];

  const targetBrands = exportScope === "all_brands"
    ? BRAND_LIST
    : [getBrandById(exportScope)];

  posts.forEach(post => {
    const thumbPath = post.featured_image
      ? (post.featured_image.magentoPath || post.featured_image.url || "")
      : "";
    const thumbAlt = post.featured_image ? (post.featured_image.title || post.title) : post.title;
    const amastyStatus = post.status === "scheduled" || post.status === "future" ? "2" : "1"; // Amasty: 1=Enabled, 2=Scheduled, 0=Disabled

    targetBrands.forEach(brand => {
      const v = (post.variations && post.variations[brand.id]) ? post.variations[brand.id] : {};
      const title = v.title || post.title;
      const urlKey = v.url_key || post.slug;
      const shortContent = v.short_content || post.short_content || "";
      const metaTitle = v.meta_title || post.meta_title || title;
      const metaDesc = v.meta_description || post.meta_description || "";

      const fullContentHtml = buildScopedHtmlPayload(post, brand.id, imagePool, includeScopedCss);

      const row = [
        brand.storeCode,
        String(brand.storeId),
        brand.name,
        title,
        urlKey,
        amastyStatus,
        post.post_date || "",
        (post.categories || []).join(","),
        (post.tags || []).join(","),
        shortContent,
        fullContentHtml,
        metaTitle,
        metaDesc,
        thumbPath,
        thumbPath,
        thumbAlt
      ];

      rows.push(row.map(escapeCsvCell).join(","));
    });
  });

  return rows.join("\r\n");
}

/**
 * Generates the Magento 2 REST API JSON payload structure for Pixel / Automated Webhook or API Relay
 */
export function generateMagentoApiPayload(posts, imagePool = [], includeScopedCss = true) {
  const payload = posts.map(post => {
    const storeScopes = {};
    BRAND_LIST.forEach(brand => {
      const v = (post.variations && post.variations[brand.id]) ? post.variations[brand.id] : {};
      storeScopes[brand.storeCode] = {
        store_id: brand.storeId,
        brand_name: brand.fullName,
        domain: brand.domain,
        title: v.title || post.title,
        url_key: v.url_key || post.slug,
        short_content: v.short_content || post.short_content || "",
        full_content: buildScopedHtmlPayload(post, brand.id, imagePool, includeScopedCss),
        meta_title: v.meta_title || post.meta_title || post.title,
        meta_description: v.meta_description || post.meta_description || ""
      };
    });

    return {
      master_id: post.id,
      master_title: post.title,
      url_key: post.slug,
      status: post.status === "scheduled" || post.status === "future" ? 2 : 1,
      published_at: post.post_date,
      categories: post.categories || [],
      tags: post.tags || [],
      post_thumbnail: post.featured_image ? (post.featured_image.magentoPath || post.featured_image.url) : null,
      store_view_variations: storeScopes
    };
  });

  return JSON.stringify(payload, null, 2);
}

function escapeCsvCell(val) {
  const str = String(val === null || val === undefined ? "" : val);
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
