import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const target = req.query.url;
    if (!target) return res.status(400).send("Missing 'url' query parameter");

    // Fetch the target site
    const response = await fetch(target);
    let html = await response.text();

    // Rewrite all absolute links/scripts/images to pass through proxy
    html = html.replace(
      /(["'])https?:\/\/(.*?)["']/g,
      (match, p1, p2) => `${p1}${req.headers.host}/api/proxy?url=https://${p2}${p1}`
    );

    // Optional: remove X-Frame-Options and CSP headers
    res.setHeader("X-Frame-Options", "ALLOWALL");
    res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval'");

    res.status(200).send(html);
  } catch (err) {
    res.status(500).send("Error fetching target site: " + err.message);
  }
}
