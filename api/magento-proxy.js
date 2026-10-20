/**
 * Vercel Serverless Function Proxy for Magento 2 REST API (Amasty Blog Pro & Media Gallery)
 * Relays multi-store API calls and image previews server-to-server to eliminate CORS restrictions.
 */

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type, X-Magento-Domain, X-Magento-Store-Code, X-Magento-Action, X-Img-Url"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const action = req.headers["x-magento-action"] || req.query.action || "test_stores";
  const proxyImgUrl = req.query.imgUrl || req.headers["x-img-url"];

  // Image preview relay
  if (action === "image" || proxyImgUrl) {
    if (!proxyImgUrl) return res.status(400).send("Missing imgUrl");
    try {
      const imgRes = await fetch(proxyImgUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36"
        }
      });
      if (!imgRes.ok) return res.status(imgRes.status).send("Failed to fetch image");
      const contentType = imgRes.headers.get("content-type") || "image/jpeg";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      const buf = await imgRes.arrayBuffer();
      return res.status(200).send(Buffer.from(buf));
    } catch (err) {
      return res.status(500).send(`Image proxy error: ${err.message}`);
    }
  }

  const magentoDomain = (req.headers["x-magento-domain"] || "https://www.lawsons.co.uk").replace(/\/$/, "");
  const storeCode = req.headers["x-magento-store-code"] || "all";
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Missing Magento Bearer Authorization header" });
  }

  try {
    if (action === "test_stores") {
      const targetUrl = `${magentoDomain}/rest/V1/store/storeViews`;
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json"
        }
      });
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    if (action === "create_post") {
      const targetUrl = `${magentoDomain}/rest/${storeCode}/V1/amasty_blog/posts`;
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json"
        },
        body: typeof req.body === "string" ? req.body : JSON.stringify(req.body)
      });
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
