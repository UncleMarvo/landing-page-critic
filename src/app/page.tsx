"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useResults } from "@/context/ResultsContext";

export default function Home() {
  const [url, setUrl] = useState("");
  const { setResult } = useResults();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    setResult(data); // ✅ Save analysis globally
    router.push("/dashboard"); // ✅ Navigate to dashboard
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Landing Page Critic</h1>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter a landing page URL"
            className="border rounded p-2 flex-grow"
          />
          <button type="submit">Analyze</button>
        </div>
      </form>
    </main>
  );
}
