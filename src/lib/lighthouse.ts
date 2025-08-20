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
