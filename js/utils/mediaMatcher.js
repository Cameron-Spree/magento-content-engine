/**
 * Smart Media Matcher & Magento /pub/media/wysiwyg/ Path Builder
 * Replaces {{IMAGE:keyword}} placeholders with single-image <figure class="mce-media-figure">
 * blocks that prevent Magento PageBuilder's duplicate mobile/desktop image rendering bug.
 */

import { BRANDS } from "./brandsConfig.js";

const NON_NOUNS = new Set([
  "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
  "need", "needs", "needed", "know", "knows", "want", "wants", "get", "gets", "make", "makes",
  "take", "takes", "can", "could", "will", "would", "should", "choose", "choosing", "chose",
  "buy", "buying", "use", "using", "used", "work", "working", "fix", "fixing", "install", "installing",
  "ultimate", "best", "top", "great", "good", "easy", "hard", "simple", "complete", "full",
  "essential", "perfect", "ideal", "right", "new", "old", "first", "last", "cheap", "quick", "fast",
  "what", "why", "when", "where", "how", "who", "which", "with", "without", "from", "into", "about",
  "and", "but", "or", "for", "between", "through", "after", "before", "guide", "guides", "tutorial",
  "tip", "tips", "article", "post", "blog", "review", "comparison", "checklist", "lawsons", "avs", "oxford", "witham"
]);

export function extractSmartMediaKeywords(titleText) {
  if (!titleText) return [];
  const cleanText = titleText.toLowerCase().replace(/[^\w\s]/g, " ");
  const words = cleanText.split(/\s+/).filter(w => w.length > 2);
  const extractedNouns = words.filter(w => !NON_NOUNS.has(w));
  return Array.from(new Set(extractedNouns));
}

export function buildMagentoMediaUrl(filename, settings = {}, brandId = "lawsons") {
  const brand = BRANDS[brandId] || BRANDS.lawsons;
  const domain = (settings.domain || brand.domain || "https://www.lawsons.co.uk").replace(/\/$/, "");
  const mediaFolder = (settings.magentoMediaFolder || "/media/wysiwyg/blog/").replace(/\/$/, "");
  const cleanFilename = slugifyFilename(filename);
  return `${domain}${mediaFolder}/${cleanFilename}`;
}

export function slugifyFilename(name) {
  if (!name) return "image.jpg";
  const parts = name.split(".");
  const ext = parts.length > 1 ? parts.pop() : "jpg";
  const baseName = parts.join(".");
  const cleanBase = baseName
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
  return `${cleanBase || "image"}.${ext.toLowerCase()}`;
}

export function autoMatchPostMedia(post, imagePool, settings, manualBodyImgIds = []) {
  if (!imagePool || imagePool.length === 0) return post;

  const isAlreadyMapped = Boolean(post.is_media_locked || (post.mapped_images && Object.keys(post.mapped_images).length > 0));
  const hasManualBodyInput = Array.isArray(manualBodyImgIds) && manualBodyImgIds.length > 0;
  const usedImageIds = new Set();

  let featuredImage = post.featured_image || null;
  if (!featuredImage && post.featured_image_id) {
    featuredImage = imagePool.find(img => img.id === post.featured_image_id);
  }

  if (!featuredImage && post.title) {
    const titleNouns = extractSmartMediaKeywords(post.title);
    let bestScore = 0;
    let bestMatch = null;

    imagePool.forEach(img => {
      let score = 0;
      const imgText = `${img.title || ""} ${img.filename || ""} ${(img.tags || []).join(" ")}`.toLowerCase();
      titleNouns.forEach((noun, idx) => {
        if (imgText.includes(noun)) score += (idx === 0 ? 5 : 2);
      });
      if (score > bestScore) {
        bestScore = score;
        bestMatch = img;
      }
    });

    if (bestMatch && bestScore > 0) featuredImage = bestMatch;
  }

  if (!featuredImage) {
    const postTags = [...(post.categories || []), ...(post.tags || [])].map(t => t.toLowerCase());
    featuredImage = imagePool.find(img =>
      (img.tags || []).some(tag => postTags.includes(tag.toLowerCase()))
    ) || imagePool[0];
  }

  if (featuredImage && featuredImage.id) {
    usedImageIds.add(featuredImage.id);
  }

  if (isAlreadyMapped && !hasManualBodyInput) {
    return {
      ...post,
      featured_image_id: featuredImage ? featuredImage.id : null,
      featured_image: featuredImage,
      mapped_images: post.mapped_images,
      is_media_locked: true
    };
  }

  const mappedImages = {};
  const placeholders = post.image_placeholders || [];

  placeholders.forEach((keyword, idx) => {
    const kwLower = keyword.toLowerCase().trim();
    let matchedImage = null;

    if (manualBodyImgIds && manualBodyImgIds[idx]) {
      const explicitImg = imagePool.find(img => img.id === manualBodyImgIds[idx]);
      if (explicitImg && !usedImageIds.has(explicitImg.id)) matchedImage = explicitImg;
    }

    if (!matchedImage) {
      matchedImage = imagePool.find(img =>
        !usedImageIds.has(img.id) && (img.tags || []).some(tag => tag.toLowerCase().trim() === kwLower)
      );
    }

    if (!matchedImage) {
      matchedImage = imagePool.find(img =>
        !usedImageIds.has(img.id) && (
          (img.tags || []).some(tag => tag.toLowerCase().includes(kwLower) || kwLower.includes(tag.toLowerCase())) ||
          (img.title && img.title.toLowerCase().includes(kwLower))
        )
      );
    }

    if (!matchedImage) {
      const unusedPool = imagePool.filter(img => !usedImageIds.has(img.id));
      matchedImage = unusedPool.length > 0 ? unusedPool[idx % unusedPool.length] : imagePool[(idx + 1) % imagePool.length];
    }

    if (matchedImage) {
      if (matchedImage.id) usedImageIds.add(matchedImage.id);
      mappedImages[keyword] = matchedImage;
    }
  });

  return {
    ...post,
    featured_image_id: featuredImage ? featuredImage.id : null,
    featured_image: featuredImage,
    mapped_images: mappedImages,
    is_media_locked: true
  };
}

export function replaceImagePlaceholdersInHtml(contentHtml, mappedImages, imagePool, getSafeDisplayUrlFn = null, brand = null) {
  if (!contentHtml) return "";

  let html = contentHtml.replace(/\{\{IMAGE:([^}]+)\}\}/gi, (match, kw) => {
    const rawKw = kw.trim();
    const kwLower = rawKw.toLowerCase();

    let img = mappedImages ? (mappedImages[kwLower] || mappedImages[rawKw]) : null;

    if (!img && imagePool && imagePool.length > 0) {
      img = imagePool.find(i =>
        (i.tags && i.tags.some(t => t.toLowerCase() === kwLower)) ||
        (i.title && i.title.toLowerCase().includes(kwLower)) ||
        (i.filename && i.filename.toLowerCase().includes(kwLower))
      );

      if (!img) {
        const kwWords = kwLower.split(/\s+/).filter(w => w.length > 2);
        img = imagePool.find(i => {
          const imgText = `${i.title || ""} ${i.filename || ""} ${(i.tags || []).join(" ")}`.toLowerCase();
          return kwWords.some(w => imgText.includes(w));
        });
      }

      if (!img) img = imagePool[0];
    }

    if (img && (img.url || img.previewUrl)) {
      const displayUrl = getSafeDisplayUrlFn ? getSafeDisplayUrlFn(img) : (img.previewUrl || img.url);
      const captionText = img.title || rawKw;
      return `<figure class="mce-media-figure" style="margin:28px 0; text-align:center; display:block;"><img src="${escapeAttr(displayUrl)}" alt="${escapeAttr(captionText)}" loading="lazy" style="display:block; width:100%; max-width:100%; height:auto; max-height:480px; object-fit:cover; border-radius:10px; margin:0 auto; box-shadow:0 6px 20px rgba(0,0,0,0.08);" /><figcaption style="font-size:13px; color:#6b7280; margin-top:8px; font-style:italic;">${escapeHtml(captionText)}</figcaption></figure>`;
    }

    return `<div style="background:#f8fafc; border:1px dashed #cbd5e1; border-radius:10px; padding:24px; text-align:center; color:#64748b; margin:24px 0; font-size:14px;">📷 <strong>Image Slot:</strong> <code>{{IMAGE:${escapeHtml(rawKw)}}}</code> — Attach or upload an image in Media Studio</div>`;
  });

  return html;
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
