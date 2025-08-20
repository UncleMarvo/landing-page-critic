export async function fetchLighthouseResults(url: string) {
  try {
    const res = await fetch(
      `http://localhost:3001/lighthouse?url=${encodeURIComponent(url)}`
    );

    if (!res.ok) {
      // Attempt to parse error JSON if available
      let errorMsg = `Lighthouse service failed with status ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson.error) errorMsg += `: ${errJson.error}`;
      } catch (parseErr) {
        // Ignore JSON parse error, use default message
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("fetchLighthouseResults error:", err);
    throw new Error(
      `Unable to fetch Lighthouse results: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

// ----- Web Vitals extraction -----
export function extractWebVitals(lhr: any) {
  if (!lhr) return []; // ✅ handle empty db / no audits

  return [
    {
      id: "lcp",
      title: "Largest Contentful Paint",
      value: lhr.audits["largest-contentful-paint"].numericValue,
    },
    {
      id: "fid",
      title: "First Input Delay",
      value: lhr.audits["max-potential-fid"]?.numericValue,
    },
    {
      id: "cls",
      title: "Cumulative Layout Shift",
      value: lhr.audits["cumulative-layout-shift"]?.numericValue,
    },
    {
      id: "tti",
      title: "Time to Interactive",
      value: lhr.audits["interactive"]?.numericValue,
    },
    {
      id: "si",
      title: "Speed Index",
      value: lhr.audits["speed-index"]?.numericValue,
    },
  ];
}

// ----- Opportunities extraction -----
export function extractOpportunities(audits: any) {
  if (!audits) return []; // ✅ handle empty db / no audits

  return Object.values(audits)
    .filter(
      (a: any) =>
        a.details?.type === "opportunity" &&
        Math.round(a?.details?.overallSavingsMs || 0) > 0
    )
    .map((a: any) => ({
      id: a.id,
      title: a.title,
      savingsMs: a?.details?.overallSavingsMs || 0,
    }))
    .sort((a, b) => b.savingsMs - a.savingsMs)
    .slice(0, 5);
}

// ----- Recommendations extraction -----
export function extractRecommendations(audits: any) {
  if (!audits) return []; // ✅ handle empty db / no audits

  return Object.values(audits)
    .filter((a: any) => a.score !== 1 && a?.details?.type !== "opportunity")
    .map((a: any) => ({
      id: a.id,
      title: a.title,
      savingsMs: a?.details?.overallSavingsMs || 0,
    }))
    .slice(0, 10);
}

// ----- Accessibility extraction -----
export function extractAccessibility(lhr: any) {
  if (!lhr) return []; // ✅ handle empty db / no audits

  const audits = lhr.audits;
  const accRefs = lhr.categories.accessibility.auditRefs;

  return accRefs
    .map((ref: any) => audits[ref.id])
    .filter((a: any) => a && a?.score !== 1) // keep failing/not perfect
    .map((a: any) => ({
      id: a?.id,
      title: a?.title,
      description: a?.description,
      score: a?.score,
    }))
    .slice(0, 10);
}
