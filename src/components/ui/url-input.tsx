"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/context/DashboardContext";

interface UrlInputProps {
  className?: string;
}

export default function UrlInput({ className = "" }: UrlInputProps) {
  const [inputUrl, setInputUrl] = useState("");
  const { currentUrl, setCurrentUrl, isLoading } = useDashboard();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      setCurrentUrl(inputUrl.trim());
    }
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <h3 className="text-lg font-semibold">Analyze URL</h3>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="url"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Enter URL to analyze (e.g., https://example.com)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={!inputUrl.trim() || isLoading}
          className="px-4 py-2"
        >
          {isLoading ? "Analyzing..." : "Analyze"}
        </Button>
      </form>
      {currentUrl && (
        <p className="text-sm text-gray-600">
          Currently analyzing: <span className="font-mono">{currentUrl}</span>
        </p>
      )}
    </div>
  );
}
