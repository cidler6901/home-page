import fetch from "node-fetch";

const GITHUB_USER = "cidler6901";
const GITHUB_REPO = "proxy";
const FILE_PATH = "announcement.json";
const BRANCH = "main";
const TOKEN = process.env.GITHUB_TOKEN; // secret in Vercel

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
        { headers: { Authorization: `token ${TOKEN}` } }
      );
      const data = await response.json();
      const content = Buffer.from(data.content, "base64").toString();
      return res.status(200).json({ ...JSON.parse(content), sha: data.sha });
    }

    if (req.method === "POST") {
      const { announcement, enabled, sha } = req.body;
      const content = Buffer.from(JSON.stringify({ announcement, enabled })).toString("base64");
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
        {
          method: "PUT",
          headers: { Authorization: `token ${TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            message: enabled ? "Update announcement" : "Remove announcement",
            content,
            sha,
            branch: BRANCH
          })
        }
      );
      const result = await response.json();
      return res.status(200).json(result);
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
