import * as cheerio from "cheerio";

export async function scrapeLandingPage(url: string) {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "LandingPageCriticBot/1.0" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract useful bits
    const title = $("title").text();
    const description = $('meta[name="description"]').attr("content") || "";
    const headings = {
      h1: $("h1").map((_, el) => $(el).text()).get(),
      h2: $("h2").map((_, el) => $(el).text()).get(),
      h3: $("h3").map((_, el) => $(el).text()).get(),
    };

    return {
      url,
      title,
      description,
      headings,
      rawLength: html.length,
    };
  } catch (err: any) {
    return { error: err.message };
  }
}
