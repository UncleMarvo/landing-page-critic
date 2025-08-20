import express from "express";
import cors from "cors";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const app = express();

// Allow requests from your Next.js UI
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Helper to run Lighthouse
async function runLighthouseOnUrl(url) {
  try {
    const options = {
      logLevel: "info",
      output: "json",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      port: 9222,
    };

    const runnerResult = await lighthouse(url, options);

    return JSON.parse(runnerResult.report); // Return JSON report
  } catch (err) {
    console.error("Lighthouse runtime error:", err);
    throw err;
  }
}

// Lighthouse endpoint
app.get("/lighthouse", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing 'url' query parameter" });

  try {
    const report = await runLighthouseOnUrl(url);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log("🚀 Lighthouse service running on http://localhost:3001"));
