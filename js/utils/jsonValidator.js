/**
 * JSON Syntax, Repair, Schema Validator & Smart 5-Brand Multiplier
 * Parses raw AI JSON (single post, 5-brand multiplier post, or bulk array)
 * and guarantees complete Store View variations for Lawsons, AVS, Oxford, Witham, and Landscape Centre.
 */

import { BRANDS, BRAND_LIST } from "./brandsConfig.js";

export function parseAndValidateJSON(rawInput) {
  if (!rawInput || !rawInput.trim()) {
    return { valid: false, error: "Input is empty. Paste the JSON block from your AI assistant." };
  }

  const cleaned = preCleanAIJsonString(rawInput);
  let parsedData = null;
  let parseError = null;

  try {
    parsedData = JSON.parse(cleaned);
  } catch (err) {
    parseError = err.message;
  }

  if (!parsedData) {
    try {
      const repaired = repairAIJsonString(cleaned);
      parsedData = JSON.parse(repaired);
      parseError = null;
    } catch (err2) {
      const extracted = fallbackRegexExtractPost(cleaned);
      if (extracted) {
        parsedData = extracted;
        parseError = null;
      } else {
        return {
          valid: false,
          error: `JSON Syntax Error: ${parseError || err2.message}. Tip: Copy the full \`\`\`json code block.`,
          rawError: parseError || err2.message
        };
      }
    }
  }

  const posts = Array.isArray(parsedData) ? parsedData : [parsedData];
  const validatedPosts = [];

  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    const postIndexLabel = posts.length > 1 ? `Post #${i + 1}: ` : "";

    if (typeof p !== "object" || p === null) {
      return { valid: false, error: `${postIndexLabel}Invalid JSON item format. Must be an object.` };
    }

    if (!p.title || typeof p.title !== "string") {
      return { valid: false, error: `${postIndexLabel}Missing or invalid 'title' string.` };
    }

    // Support content_html either at root or inside variations.lawsons
    const baseHtmlRaw = p.content_html || (p.variations && p.variations.lawsons && p.variations.lawsons.content_html) || "";
    if (!baseHtmlRaw || typeof baseHtmlRaw !== "string") {
      return { valid: false, error: `${postIndexLabel}Missing or invalid 'content_html' string.` };
    }

    let cleanContentHtml = cleanHtmlFragment(baseHtmlRaw);
    const genericMasterTitle = cleanMasterGenericTitle(p.title);
    const unifiedSlug = generateSimpleSlug(p.slug || p.url_key || p.title);
    const categories = Array.isArray(p.categories) ? p.categories : (p.categories ? [p.categories] : ["Fencing & Timber"]);
    const tags = Array.isArray(p.tags) ? p.tags : (p.tags ? [p.tags] : ["landscaping", "timber"]);
    const shortContent = p.short_content || stripHtml(cleanContentHtml).substring(0, 180) + "...";
    const metaTitle = p.meta_title || p.yoast_meta_title || `${genericMasterTitle.substring(0, 52)} | Lawsons`;
    const metaDesc = p.meta_description || p.yoast_meta_desc || stripHtml(cleanContentHtml).substring(0, 155);

    const extractedPlaceholders = extractPlaceholdersFromHtml(cleanContentHtml);
    const image_placeholders = Array.isArray(p.image_placeholders)
      ? [...new Set([...p.image_placeholders.map(k => String(k).trim().toLowerCase()), ...extractedPlaceholders])]
      : extractedPlaceholders;

    // Build or enrich the 5 Magento Store View variations with UNIFIED simple URL key
    const variations = buildFiveBrandVariations(p, cleanContentHtml, unifiedSlug, shortContent, metaTitle, metaDesc);

    validatedPosts.push({
      id: "mce_post_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      title: genericMasterTitle,
      slug: unifiedSlug,
      categories: categories.map(c => String(c).trim()),
      tags: tags.map(t => String(t).trim()),
      short_content: shortContent.trim(),
      meta_title: metaTitle.trim(),
      meta_description: metaDesc.trim(),
      content_html: cleanContentHtml,
      variations,
      image_placeholders,
      status: "enabled", // Amasty statuses: "enabled", "scheduled", "disabled"
      post_date: formatDateTime(new Date()),
      featured_image_id: null,
      featured_image: null,
      mapped_images: {}
    });
  }

  return {
    valid: true,
    posts: validatedPosts,
    count: validatedPosts.length
  };
}

/**
 * Ensures all 5 Store Views (Lawsons, AVS, Oxford, Witham, Landscape Centre) have complete,
 * brand-adapted HTML, internal links, titles, and SEO metadata.
 */
export function buildFiveBrandVariations(rawPost, baseHtml, slug, baseShortContent, baseMetaTitle, baseMetaDesc) {
  const inputVars = (rawPost && typeof rawPost.variations === "object" && rawPost.variations) ? rawPost.variations : {};
  const result = {};

  BRAND_LIST.forEach((brand) => {
    const existing = inputVars[brand.id] || {};
    const rawTitle = existing.title || adaptTitleToBrand(rawPost.title, brand);
    const rawShort = existing.short_content || adaptTextToBrand(baseShortContent, brand);
    const rawMetaTitle = existing.meta_title || `${rawPost.title.substring(0, 48)} | ${brand.name}`;
    const rawMetaDesc = existing.meta_description || adaptTextToBrand(baseMetaDesc, brand);
    const rawHtml = existing.content_html
      ? cleanHtmlFragment(existing.content_html)
      : synthesizeBrandHtmlVariation(baseHtml, brand, rawPost.title);

    result[brand.id] = {
      brand_id: brand.id,
      store_code: brand.storeCode,
      store_id: brand.storeId,
      title: rawTitle.trim(),
      url_key: slug.trim(), // ALL VARIATIONS SHARE THE EXACT SAME UNIFIED URL KEY FOR MARKETING EMAILS
      short_content: rawShort.trim(),
      meta_title: rawMetaTitle.trim(),
      meta_description: rawMetaDesc.trim(),
      content_html: rawHtml,
      is_ai_unique: Boolean(existing.content_html)
    };
  });

  return result;
}

/**
 * When a single master post is provided, intelligently adapts internal links, brand names,
 * intro context, and CTA spotlight banners to create distinct store view variations.
 */
export function synthesizeBrandHtmlVariation(baseHtml, brand, baseTitle = "") {
  if (!baseHtml) return "";
  let html = baseHtml;

  // 1. Replace any other Lawsons Group domain URLs with the active brand's closest matching category URL
  const allOtherDomains = [
    "https://www.lawsons.co.uk",
    "https://www.avsfencing.co.uk",
    "https://www.oxfordfencing.co.uk",
    "https://www.withamtimber.co.uk",
    "https://the-landscape-centre.co.uk",
    "https://briantsofrisborough.co.uk"
  ];

  allOtherDomains.forEach(domain => {
    const regex = new RegExp(domain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(\\/[^'\"\\s>]*)?", "gi");
    html = html.replace(regex, (fullUrl, pathPart) => {
      return matchClosestBrandUrl(pathPart || "", brand);
    });
  });

  // 2. Replace generic or other brand mentions in headings/callouts with current brand name
  const otherNames = ["Lawsons", "AVS Fencing", "Oxford Fencing Supplies", "Oxford Fencing", "Witham Timber", "The Landscape Centre", "Briants of Risborough"];
  otherNames.forEach(other => {
    if (other.toLowerCase() !== brand.name.toLowerCase()) {
      const nameRegex = new RegExp(`\\b${other}\\b`, "gi");
      html = html.replace(nameRegex, brand.name);
    }
  });

  // 3. If there is no .category-spotlight-box yet, append the brand's signature dual-button CTA box
  if (!html.includes("category-spotlight-box")) {
    const cta = brand.ctaDefaults;
    html += `\n<div class="category-spotlight-box">
  <h3>${cta.heading}</h3>
  <p>${cta.subtext}</p>
  <div class="mce-btn-row">
    <a href="${cta.primaryBtnUrl}" class="mce-btn-primary">${cta.primaryBtnText} &rarr;</a>
    <a href="${cta.secondaryBtnUrl}" class="mce-btn-secondary">${cta.secondaryBtnText}</a>
  </div>
</div>`;
  }

  return html;
}

function matchClosestBrandUrl(pathPart, brand) {
  const pathLower = (pathPart || "").toLowerCase();
  const bank = brand.linksBank || [];
  if (bank.length === 0) return brand.domain;

  const keywords = pathLower.split(/[\/\-_]+/).filter(w => w.length > 2);
  let bestUrl = bank[0].url;
  let bestScore = 0;

  bank.forEach(item => {
    const targetText = `${item.url} ${item.label}`.toLowerCase();
    let score = 0;
    keywords.forEach(kw => {
      if (targetText.includes(kw)) score += 3;
    });
    if (score > bestScore) {
      bestScore = score;
      bestUrl = item.url;
    }
  });

  return bestUrl;
}

function adaptTitleToBrand(title, brand) {
  if (!title) return brand.name;
  const clean = title.replace(/\s*\|\s*.*$/, "").trim();
  if (clean.toLowerCase().includes(brand.name.toLowerCase())) return clean;
  return `${clean}: ${brand.name} Expert Guide`;
}

function adaptTextToBrand(text, brand) {
  if (!text) return "";
  let out = text;
  const otherNames = ["Lawsons", "AVS Fencing", "Oxford Fencing", "Witham Timber", "The Landscape Centre"];
  otherNames.forEach(n => {
    const rx = new RegExp(`\\b${n}\\b`, "gi");
    out = out.replace(rx, brand.name);
  });
  return out;
}

function cleanHtmlFragment(html) {
  if (!html) return "";
  let clean = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, (m, text, url) => `<a href="${url}">${text}</a>`);
  clean = autoFixUnclosedAnchorTags(clean);
  clean = autoWrapParagraphs(clean);
  return clean;
}

function preCleanAIJsonString(raw) {
  let str = raw.trim();
  if (str.includes("```json")) {
    str = str.replace(/[\s\S]*?```json\s*/i, "").replace(/\s*```[\s\S]*/, "");
  } else if (str.includes("```")) {
    str = str.replace(/[\s\S]*?```\s*/, "").replace(/\s*```[\s\S]*/, "");
  }

  const firstBrace = str.indexOf("{");
  let firstBracket = -1;
  const bracketMatch = str.match(/\[\s*(?=[{\"\d\]]|-\d|true|false|null)/);
  if (bracketMatch) firstBracket = bracketMatch.index;

  let startIdx = -1;
  let endIdx = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = str.lastIndexOf("}");
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = str.lastIndexOf("]");
  }

  if (startIdx !== -1 && endIdx > startIdx) {
    str = str.substring(startIdx, endIdx + 1);
  }
  return str;
}

function repairAIJsonString(jsonStr) {
  return jsonStr
    .replace(/[\u0000-\u001F]+/g, (match) => {
      if (match === "\n") return "\\n";
      if (match === "\r") return "\\r";
      if (match === "\t") return "\\t";
      return "";
    })
    .replace(/,\s*([\}\]])/g, "$1");
}

function fallbackRegexExtractPost(rawStr) {
  const titleMatch = rawStr.match(/"title"\s*:\s*"([^"]+)"/);
  const contentMatch = rawStr.match(/"content_html"\s*:\s*"([\s\S]+?)"\s*,\s*"/);
  if (titleMatch && contentMatch) {
    return {
      title: titleMatch[1],
      content_html: contentMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"')
    };
  }
  return null;
}

function autoFixUnclosedAnchorTags(html) {
  if (!html) return "";
  const openCount = (html.match(/<a\s/gi) || []).length;
  const closeCount = (html.match(/<\/a>/gi) || []).length;
  if (openCount > closeCount) {
    return html.replace(/(<a\s+href=['"][^'"]+['"][^>]*>[^<]+)(?!\s*<\/a>)(?=\s*<|\s*$)/gi, "$1</a>");
  }
  return html;
}

function autoWrapParagraphs(html) {
  if (!html) return "";
  if (html.includes("<p>") || html.includes("<h2>") || html.includes("<div>")) return html;
  return html
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${p}</p>`)
    .join("\n");
}

export function cleanMasterGenericTitle(title) {
  if (!title) return "Garden & Fencing Guide";
  return String(title)
    .replace(/\s*\|\s*.*$/i, "")
    .replace(/:\s*(Lawsons|AVS|Oxford|Witham|Landscape Centre|The Landscape Centre).*$/i, "")
    .replace(/\b(at|from|with|by)\s+(Lawsons|AVS|Oxford|Witham|Landscape Centre)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function generateSimpleSlug(titleOrSlug) {
  if (!titleOrSlug) return "garden-fencing-guide";
  let str = String(titleOrSlug)
    .toLowerCase()
    .replace(/\s*\|\s*.*$/i, "")
    .replace(/[^\w\s-]/g, " ")
    .trim();

  // Strip common stop/filler words to keep the URL as concise and clean as possible
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "of", "in", "to", "for", "with", "by", "at", "from",
    "is", "are", "which", "how", "what", "complete", "ultimate", "best", "buying", "guide"
  ]);

  const words = str.split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w));
  const shortSlug = words.slice(0, 5).join("-");
  return shortSlug || "garden-fencing-guide";
}

export function generateSlug(title) {
  return generateSimpleSlug(title);
}

function stripHtml(html) {
  return String(html || "").replace(/<[^>]*>?/gm, "").trim();
}

function extractPlaceholdersFromHtml(html) {
  const regex = /\{\{IMAGE:([^}]+)\}\}/gi;
  const matches = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    matches.push(match[1].trim().toLowerCase());
  }
  return [...new Set(matches)];
}

function formatDateTime(d) {
  const pad = num => String(num).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
