import * as cheerio from "cheerio";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import fetch from "node-fetch";

export type CriticReport = {
  url: string;
  title: string | null;
  metaDescription: string | null;
  headings: string[];
  wordCount: number;
  lighthouseScores: {
    performance: number | null;
    accessibility: number | null;
    bestPractices: number | null;
    seo: number | null;
  };
};

export async function analyzeLandingPage(url: string): Promise<CriticReport> {
  // 1. Fetch HTML
  const response = await fetch(url);
  const html = await response.text();

  // 2. Parse DOM with Cheerio
  const $ = cheerio.load(html);
  const title = $("title").text() || null;
  const metaDescription =
    $('meta[name="description"]').attr("content") || null;
  const headings = $("h1, h2")
    .map((_, el) => $(el).text().trim())
    .get();
  const wordCount = $("body").text().split(/\s+/).length;

  // 3. Run Lighthouse
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  const options = { logLevel: "info" as const, output: "json" as const, port: chrome.port };
  const runnerResult = await lighthouse(url, options);

  const categories = runnerResult?.lhr?.categories ?? {};
  const lighthouseScores = {
    performance: categories.performance?.score ?? null,
    accessibility: categories.accessibility?.score ?? null,
    bestPractices: categories["best-practices"]?.score ?? null,
    seo: categories.seo?.score ?? null,
  };

  await chrome.kill();

  // 4. Return structured report
  return {
    url,
    title,
    metaDescription,
    headings,
    wordCount,
    lighthouseScores,
  };
}
