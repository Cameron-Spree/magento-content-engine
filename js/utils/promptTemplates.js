/**
 * AI System Prompt Studio for Magento Multi-Brand Content Engine
 * Supports:
 * 1. 5-Brand AI Multiplier Mode (1 Topic -> 5 Unique SEO Store View Variations)
 * 2. Single Article Detailed Mode
 * 3. Bulk Topical Cluster Mode
 */

import { BRANDS, BRAND_LIST, getBrandById } from "./brandsConfig.js";

export function generateAIPrompt(params) {
  const {
    mode = "multiplier", // "multiplier" | "single" | "bulk"
    activeBrandId = "lawsons",
    topic = "How to Choose Between Timber & Concrete Fence Posts for Long-Lasting Garden Boundaries",
    keywords = "concrete vs timber fence posts, garden fencing installation, pressure treated fence posts, gravel boards",
    wordCount = "900-1300 words",
    imageCount = "2",
    customBrandLinks = {},
    queuedBatchPosts = [],
    widgets = {
      wantToKnowMore: true,
      categorySpotlight: true,
      productCards: true,
      table: true,
      strictFormatting: true
    }
  } = params;

  const imgPlaceholderNum = parseInt(imageCount, 10) || 0;
  const imageInstruction = imgPlaceholderNum > 0
    ? `- IMAGE PLACEHOLDERS: Include EXACTLY ${imgPlaceholderNum} image placeholder(s) inside "content_html" formatted as {{IMAGE:concise noun keyword}} (e.g. {{IMAGE:concrete fence post}} or {{IMAGE:railway sleepers}}), and list those exact keywords in the "image_placeholders" array.`
    : `- NO BODY IMAGES: Do NOT include any {{IMAGE:...}} placeholders inside "content_html" and leave "image_placeholders": [].`;

  // Build widget instructions (PageBuilder-Safe Custom HTML)
  const widgetRules = [];
  if (widgets.categorySpotlight) {
    widgetRules.push(`- BRAND SPOTLIGHT CTA BOX: Include a self-contained HTML callout banner formatted as:
<div class='category-spotlight-box'>
  <h3>[Brand-Specific CTA Headline]</h3>
  <p>[Value proposition tailored to that brand's customers]</p>
  <div class='mce-btn-row'>
    <a href='[Primary Category URL from Brand Link Bank]' class='mce-btn-primary'>[Primary Button Text] &rarr;</a>
    <a href='[Secondary URL from Brand Link Bank]' class='mce-btn-secondary'>[Secondary Button Text]</a>
  </div>
</div>`);
  }

  if (widgets.productCards) {
    widgetRules.push(`- PAGEBUILDER-SAFE PRODUCT SHOWCASE GRID: Instead of broken Magento product widgets, include a clean HTML 2-card or 3-card showcase grid:
<div class='mce-product-grid'>
  <div class='mce-product-card'>
    <div>
      <h5>[Product / Range Name 1]</h5>
      <p>[Concise 1-sentence spec or trade benefit]</p>
    </div>
    <a href='[Exact URL from Brand Link Bank]' class='mce-btn-primary'>View Range &rarr;</a>
  </div>
  <div class='mce-product-card'>
    <div>
      <h5>[Product / Range Name 2]</h5>
      <p>[Concise 1-sentence spec or trade benefit]</p>
    </div>
    <a href='[Exact URL from Brand Link Bank]' class='mce-btn-secondary'>Explore Options</a>
  </div>
</div>`);
  }

  if (widgets.wantToKnowMore) {
    widgetRules.push(`- RECOMMENDED READING CALLOUT: Near the conclusion, include a callout box:
<div class='callout-box want-to-know-more'>
  <h4>💡 Want to Know More? Expert Guides & Supplies</h4>
  <ul>
    <li><a href='[Exact URL 1 from Brand Link Bank]'>[Anchor Text 1]</a></li>
    <li><a href='[Exact URL 2 from Brand Link Bank]'>[Anchor Text 2]</a></li>
  </ul>
</div>`);
  }

  if (widgets.table) {
    widgetRules.push(`- TECHNICAL COMPARISON TABLE: Include at least one structured HTML <table> with <thead>, <tr>, <th> headers, and <tbody> rows comparing dimensions, timber treatment grades (e.g. UC3 vs UC4), lifespans, or installation specs.`);
  }

  // MODE 1: 5-BRAND MULTIPLIER PROMPT
  if (mode === "multiplier") {
    const brandSections = BRAND_LIST.map(b => {
      const bank = (customBrandLinks[b.id] && customBrandLinks[b.id].length > 0)
        ? customBrandLinks[b.id]
        : b.linksBank;
      const linksFormatted = bank.map(l => `    * ${l.url} ("${l.label}")`).join("\n");
      return `### Store View ${b.storeId}: ${b.fullName} (\`${b.id}\` | \`${b.domain}\`)
  - **Brand Voice:** ${b.tone}
  - **Verified Internal Links for ${b.name}:**
${linksFormatted}`;
    }).join("\n\n");

    return `You are an elite eCommerce SEO Director & Technical Copywriter for the Lawsons Group Magento 2 Multi-Store ecosystem (Amasty Blog Pro).

Your task is to take ONE core blog topic and generate a **Multi-Brand Store View JSON Payload** containing **5 uniquely written, SEO-distinct variations** across our 5 Magento Store Views so that each brand ranks independently on Google with ZERO duplicate content penalties.

## Core Topic & Target SEO Brief
- **Master Topic / Generic Title:** ${topic} (Keep this title broad, generic, and brand-neutral for the All Store Views master scope)
- **Target Keywords:** ${keywords}
- **Target Depth per Variation:** ${wordCount}
- **Unified Simple URL Key Rule:** Choose a clean, concise, 2-to-4 word hyphenated slug (e.g., "concrete-vs-timber-fence-posts"). MANDATORY: Every variation inside "variations" MUST share the EXACT SAME "url_key" as the master "slug" so email marketing links are uniform across all 5 websites!

## The 5 Magento Store Views & Their Internal Link Banks
${brandSections}

## Mandatory HTML & Amasty PageBuilder-Safe Rules
1. Use clean semantic HTML tags (\`<h2>\`, \`<h3>\`, \`<p>\`, \`<ul>\`, \`<li>\`, \`<strong>\`, \`<table>\`).
2. **MANDATORY SINGLE QUOTES IN HTML ATTRIBUTES:** Inside JSON strings, always use single quotes for HTML attributes (e.g., \`<a href='https://...'>\`) so you never break JSON syntax.
3. **MANDATORY UNIFIED URL KEY:** The "slug" at root AND the "url_key" in EVERY variation (lawsons, avs, oxford, witham, landscape) MUST BE 100% IDENTICAL and as simple as possible (e.g., "concrete-vs-timber-fence-posts").
4. **UNIQUE COPY PER BRAND:** Each brand inside \`"variations"\` MUST have its own rewritten \`title\`, \`short_content\` (1-2 sentence Amasty summary), \`meta_title\`, \`meta_description\`, and \`content_html\` tailored to that brand's audience and linking ONLY to that brand's domain URLs!
${imageInstruction}
${widgetRules.join("\n")}

## Required JSON Output Schema
Respond ONLY with a valid \`\`\`json code block matching this exact structure:

\`\`\`json
{
  "title": "Clean Generic Master Title for All Store Views",
  "slug": "simple-keyword-slug",
  "categories": ["Fencing", "Landscaping Advice"],
  "tags": ["fencing", "timber", "installation-guide"],
  "short_content": "Concise 2-sentence executive summary for the Amasty blog listing grid.",
  "meta_title": "Clean Generic Master SEO Title | Lawsons Group",
  "meta_description": "150-160 character high-CTR meta description for search engines.",
  "image_placeholders": ${imgPlaceholderNum > 0 ? '["fence post", "gravel board"]' : '[]'},
  "content_html": "<p>Default fallback store view HTML content...</p>",
  "variations": {
    "lawsons": {
      "store_code": "lawsons_en",
      "title": "Unique Title Tailored for Lawsons Timber & Building Materials",
      "url_key": "simple-keyword-slug",
      "short_content": "Lawsons-specific 2-sentence summary for the blog index page.",
      "meta_title": "SEO Title | Lawsons",
      "meta_description": "Unique 155-char meta description for Lawsons.",
      "content_html": "<p>Full HTML article written in Lawsons tone with https://www.lawsons.co.uk/... internal links, tables, and CTA widgets...</p>"
    },
    "avs": {
      "store_code": "avs_en",
      "title": "Unique Title Tailored for AVS Fencing & Landscaping",
      "url_key": "simple-keyword-slug",
      "short_content": "AVS-specific 2-sentence summary.",
      "meta_title": "SEO Title | AVS Fencing",
      "meta_description": "Unique 155-char meta description for AVS Fencing.",
      "content_html": "<p>Full HTML article written in AVS tone with https://www.avsfencing.co.uk/... internal links...</p>"
    },
    "oxford": {
      "store_code": "oxford_en",
      "title": "Unique Title Tailored for Oxford Fencing Supplies",
      "url_key": "simple-keyword-slug",
      "short_content": "Oxford Fencing-specific 2-sentence summary.",
      "meta_title": "SEO Title | Oxford Fencing Supplies",
      "meta_description": "Unique 155-char meta description for Oxford Fencing.",
      "content_html": "<p>Full HTML article written in Oxford Fencing tone with https://www.oxfordfencing.co.uk/... internal links...</p>"
    },
    "witham": {
      "store_code": "witham_en",
      "title": "Unique Title Tailored for Witham Timber",
      "url_key": "simple-keyword-slug",
      "short_content": "Witham Timber-specific 2-sentence summary.",
      "meta_title": "SEO Title | Witham Timber",
      "meta_description": "Unique 155-char meta description for Witham Timber.",
      "content_html": "<p>Full HTML article written in Witham Timber tone with https://www.withamtimber.co.uk/... internal links...</p>"
    },
    "landscape": {
      "store_code": "landscape_en",
      "title": "Unique Title Tailored for The Landscape Centre",
      "url_key": "simple-keyword-slug",
      "short_content": "The Landscape Centre-specific 2-sentence summary.",
      "meta_title": "SEO Title | The Landscape Centre",
      "meta_description": "Unique 155-char meta description for The Landscape Centre.",
      "content_html": "<p>Full HTML article written in The Landscape Centre tone with https://the-landscape-centre.co.uk/... internal links...</p>"
    }
  }
}
\`\`\``;
  }

  // MODE 2: SINGLE BRAND / MASTER FOCUS
  const brand = getBrandById(activeBrandId);
  const bank = (customBrandLinks[brand.id] && customBrandLinks[brand.id].length > 0)
    ? customBrandLinks[brand.id]
    : brand.linksBank;
  const linksList = bank.map(l => `- ${l.url} (Anchor Text: "${l.label}")`).join("\n");

  return `You are an expert eCommerce SEO Content Strategist writing for **${brand.fullName}** (${brand.domain}) on Magento 2 (Amasty Blog Pro).

## Article Brief
- **Topic / Title:** ${topic}
- **Target Keywords:** ${keywords}
- **Brand Voice:** ${brand.tone}
- **Target Length:** ${wordCount}

## Verified Internal Links Bank (${brand.name})
Seamlessly weave 3 to 5 of these exact internal URLs into natural anchor phrases in your article. Use single quotes for HTML attributes (\`href='...'\`):
${linksList}

## PageBuilder-Safe HTML Formatting Rules
${imageInstruction}
${widgetRules.join("\n")}

## Required JSON Output
Return ONLY a valid \`\`\`json code block:
\`\`\`json
{
  "title": "${topic}",
  "slug": "seo-friendly-url-key",
  "categories": ["Fencing", "Timber Guides"],
  "tags": ["fencing", "timber", "landscaping"],
  "short_content": "2-sentence summary for the Amasty blog grid card.",
  "meta_title": "${topic} | ${brand.name}",
  "meta_description": "Compelling 155-character meta description.",
  "image_placeholders": ${imgPlaceholderNum > 0 ? '["timber fencing", "railway sleepers"]' : '[]'},
  "content_html": "<p>Full HTML article content...</p>"
}
\`\`\``;
}

export function generateBulkClusterPrompt(params) {
  const {
    queuedBatchPosts = [],
    wordCount = "900-1200 words",
    imageCount = "1"
  } = params;

  const postBriefs = queuedBatchPosts.map((p, i) => {
    return `${i + 1}. Title: "${p.title}" | URL Key: "${p.slug}" | Keywords: "${p.keywords || p.title}"`;
  }).join("\n");

  const lawsonsLinks = BRANDS.lawsons.linksBank.map(l => `- ${l.url} ("${l.label}")`).join("\n");

  return `You are an elite eCommerce SEO Content Architect for the Lawsons Group Magento 2 Multi-Store network.
Generate a JSON array of ${queuedBatchPosts.length} complete, interconnected blog posts. Each post will be automatically multiplied across our 5 brand store views (Lawsons, AVS Fencing, Oxford Fencing, Witham Timber, and The Landscape Centre).

### Planned Article Batch (${queuedBatchPosts.length} Posts):
${postBriefs}

### Master Internal Link Bank (Lawsons Primary Reference):
${lawsonsLinks}

### Requirements:
- Target Length: ${wordCount} per post.
- Include ${imageCount} \`{{IMAGE:noun keyword}}\` placeholder(s) per post.
- Include a \`<div class='category-spotlight-box'>\`, a \`<table>\`, and a \`<div class='callout-box want-to-know-more'>\` in each post.
- Use single quotes inside HTML attributes (\`href='...'\`).
- Return ONLY a valid \`\`\`json array of post objects.`;
}
