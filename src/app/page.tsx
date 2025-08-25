"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useResults } from "@/context/ResultsContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  BarChart3, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Globe,
  Shield,
  TrendingUp
} from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { setResult } = useResults();
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // If user is not authenticated, store URL and redirect to login
    if (!user) {
      // Store the URL in localStorage for later analysis
      localStorage.setItem('pendingAnalysisUrl', url);
      router.push('/auth/login');
      return;
    }

    // If user is authenticated, proceed with analysis
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setResult(data); // ✅ Save analysis globally
      router.push("/dashboard"); // ✅ Navigate to dashboard
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
    }
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="loading-spinner h-12 w-12 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Enhanced Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-responsive">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">Landing Page Critic</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/auth/login">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="btn-primary">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="container-responsive">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="h1 text-balance">
                Analyze Your Landing Pages with{" "}
                <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                  AI-Powered Insights
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
                Get comprehensive performance insights, accessibility scores, and intelligent recommendations 
                to optimize your landing pages for better user experience and conversions.
              </p>
            </div>
            
            {/* Enhanced URL Input Form */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter a landing page URL (e.g., https://example.com)"
                    className="input-field w-full"
                    disabled={isAnalyzing}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="btn-primary px-8"
                  disabled={isAnalyzing || !url.trim()}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="loading-spinner h-4 w-4 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analyze
                    </>
                  )}
                </Button>
              </form>
              <p className="mt-3 text-sm text-muted-foreground">
                {user 
                  ? (isAnalyzing ? 'Analyzing your landing page...' : 'Ready to analyze')
                  : 'Sign in to automatically analyze this URL'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="h2 mb-4">Everything you need to optimize your landing pages</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive analysis tools designed for developers, marketers, and business owners
            </p>
          </div>
          
          <div className="grid-responsive">
            <div className="group card-hover p-6 bg-card rounded-xl border">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="h5 mb-2">Performance Metrics</h3>
              <p className="text-muted-foreground">
                Get detailed performance scores including Core Web Vitals, Lighthouse metrics, and real-world user data.
              </p>
            </div>

            <div className="group card-hover p-6 bg-card rounded-xl border">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-success/10 text-success mb-4 group-hover:bg-success/20 transition-colors">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="h5 mb-2">AI-Powered Insights</h3>
              <p className="text-muted-foreground">
                Receive intelligent recommendations and actionable insights to improve your pages with machine learning.
              </p>
            </div>

            <div className="group card-hover p-6 bg-card rounded-xl border">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-warning/10 text-warning mb-4 group-hover:bg-warning/20 transition-colors">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="h5 mb-2">Accessibility Analysis</h3>
              <p className="text-muted-foreground">
                Ensure your pages are accessible to all users with comprehensive accessibility testing and compliance checks.
              </p>
            </div>

            <div className="group card-hover p-6 bg-card rounded-xl border">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-info/10 text-info mb-4 group-hover:bg-info/20 transition-colors">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="h5 mb-2">Multi-Platform Testing</h3>
              <p className="text-muted-foreground">
                Test across multiple platforms including Lighthouse, PageSpeed Insights, and WebPageTest for comprehensive coverage.
              </p>
            </div>

            <div className="group card-hover p-6 bg-card rounded-xl border">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-error/10 text-error mb-4 group-hover:bg-error/20 transition-colors">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="h5 mb-2">Security & Best Practices</h3>
              <p className="text-muted-foreground">
                Identify security vulnerabilities and ensure your pages follow web development best practices.
              </p>
            </div>

            <div className="group card-hover p-6 bg-card rounded-xl border">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="h5 mb-2">Performance Tracking</h3>
              <p className="text-muted-foreground">
                Track performance over time with historical data and trend analysis to measure improvement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-responsive">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="h2">Ready to optimize your landing pages?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of developers and marketers improving their web performance and user experience.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="btn-primary">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Free Analysis
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="btn-secondary">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container-responsive">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <BarChart3 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Landing Page Critic</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Landing Page Critic. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
