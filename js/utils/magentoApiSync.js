/**
 * Magento 2 REST API & In-App Gemini AI Sync Utility
 * Supports:
 * 1. Direct In-App AI Article & 5-Brand Multiplier Generation via Google Gemini API
 * 2. Magento 2 REST API Relay via /api/magento-proxy (Bearer Token Auth for Amasty Blog & Media)
 */

import { recordApiLog } from "./debugLogger.js";
import { BRAND_LIST } from "./brandsConfig.js";
import { buildScopedHtmlPayload } from "./htmlStyler.js";

/**
 * Generates blog content directly inside the app using Google Gemini API
 */
export async function generateContentWithGemini(promptText, apiKey, modelName = "gemini-2.5-flash") {
  if (!apiKey || !apiKey.trim()) {
    return {
      success: false,
      error: "Missing Gemini API Key. Add your key in Settings (top right) or copy the prompt into ChatGPT/Claude/Gemini."
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

  try {
    recordApiLog("GEMINI_GENERATE", "PENDING", `Generating multi-brand payload using ${modelName}...`);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      recordApiLog("GEMINI_ERROR", `HTTP ${res.status}`, errText.substring(0, 200));
      return {
        success: false,
        error: `Gemini API returned HTTP ${res.status}: ${errText.substring(0, 140)}`
      };
    }

    const data = await res.json();
    const outputText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!outputText) {
      return { success: false, error: "Gemini returned an empty response." };
    }

    recordApiLog("GEMINI_SUCCESS", "200 OK", `Generated ${outputText.length} chars of JSON content.`);
    return {
      success: true,
      jsonText: outputText
    };
  } catch (err) {
    recordApiLog("GEMINI_EXCEPTION", "NETWORK_ERROR", err.message);
    return {
      success: false,
      error: `Network error calling Gemini API: ${err.message}`
    };
  }
}

/**
 * Tests Magento 2 REST API Integration Token via Vercel Serverless Proxy
 */
export async function testMagentoApiConnection(settings) {
  if (!settings || !settings.magentoBearerToken) {
    return {
      success: false,
      message: "Enter a Magento 2 Integration Bearer Token in Settings first (provided by Pixel)."
    };
  }

  const magentoBaseUrl = (settings.magentoBaseUrl || "https://www.lawsons.co.uk").replace(/\/$/, "");

  try {
    recordApiLog("MAGENTO_TEST", "PENDING", `Testing connection to ${magentoBaseUrl}/rest/V1/store/storeViews`);
    const res = await fetch("/api/magento-proxy", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${settings.magentoBearerToken.trim()}`,
        "X-Magento-Domain": magentoBaseUrl,
        "X-Magento-Action": "test_stores"
      }
    });

    if (res.ok) {
      const stores = await res.json();
      recordApiLog("MAGENTO_TEST", "200 OK", `Connected! Found ${Array.isArray(stores) ? stores.length : 1} Magento Store Views.`);
      return {
        success: true,
        message: `Connected to Magento 2 (${Array.isArray(stores) ? stores.length : 5} Store Views active).`,
        stores
      };
    }

    const errText = await res.text();
    recordApiLog("MAGENTO_TEST_ERROR", `HTTP ${res.status}`, errText.substring(0, 180));
    return {
      success: false,
      message: `Magento API returned HTTP ${res.status}: ${errText.substring(0, 120)}`
    };
  } catch (err) {
    recordApiLog("MAGENTO_TEST_EXCEPTION", "ERROR", err.message);
    return {
      success: false,
      message: `Proxy connection notice: ${err.message}`
    };
  }
}

/**
 * Pushes a post and its 5 Store View variations to Magento 2 Amasty Blog REST API
 */
export async function pushPostToMagentoApi(post, settings, imagePool = []) {
  if (!settings || !settings.magentoBearerToken) {
    return {
      success: false,
      error: "No Magento Integration Bearer Token configured yet. Use Store View Scope Copy or CSV Export until Pixel provides a token."
    };
  }

  const magentoBaseUrl = (settings.magentoBaseUrl || "https://www.lawsons.co.uk").replace(/\/$/, "");
  const results = [];

  try {
    for (const brand of BRAND_LIST) {
      const v = (post.variations && post.variations[brand.id]) ? post.variations[brand.id] : {};
      const scopedHtml = buildScopedHtmlPayload(post, brand.id, imagePool, true);

      const postBody = {
        post: {
          title: v.title || post.title,
          url_key: v.url_key || post.slug,
          short_content: v.short_content || post.short_content || "",
          full_content: scopedHtml,
          meta_title: v.meta_title || post.meta_title || post.title,
          meta_description: v.meta_description || post.meta_description || "",
          status: post.status === "scheduled" ? 2 : 1,
          published_at: post.post_date,
          store_ids: [brand.storeId]
        }
      };

      const res = await fetch("/api/magento-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${settings.magentoBearerToken.trim()}`,
          "X-Magento-Domain": magentoBaseUrl,
          "X-Magento-Store-Code": brand.storeCode,
          "X-Magento-Action": "create_post"
        },
        body: JSON.stringify(postBody)
      });

      results.push({
        brand: brand.name,
        storeCode: brand.storeCode,
        ok: res.ok,
        status: res.status
      });
    }

    const allOk = results.every(r => r.ok);
    return {
      success: allOk,
      results
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}
