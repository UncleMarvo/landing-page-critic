# DashboardContext Implementation

This document describes the DashboardContext implementation for managing shared state in the Next.js dashboard application.

## Overview

The `DashboardContext` provides centralized state management for the dashboard, including:
- Current URL being analyzed
- Web Vitals data from Lighthouse analysis
- Historical performance metrics
- Loading states
- Data fetching logic

## Files Created/Modified

### New Files
- `src/context/DashboardContext.tsx` - Main context implementation
- `src/components/ui/url-input.tsx` - URL input component for switching URLs
- `DASHBOARD_CONTEXT_README.md` - This documentation

### Modified Files
- `src/components/cards/webvitalscard.tsx` - Updated to use context instead of props
- `src/components/cards/performancemetricscard.tsx` - Updated to use context instead of props
- `src/app/dashboard/page.tsx` - Updated to use DashboardProvider and removed prop passing

## Context State Interface

```typescript
interface DashboardState {
  currentUrl: string;
  setCurrentUrl: (url: string) => void;

  webVitalsData: WebVitalsPanelProps[] | null;
  setWebVitalsData: (data: WebVitalsPanelProps[]) => void;

  performanceHistory: HistoryEntry[] | null;
  setPerformanceHistory: (history: HistoryEntry[]) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  refreshData: () => Promise<void>;
}
```

## Usage

### 1. Wrap your dashboard with the provider

```tsx
import { DashboardProvider } from "@/context/DashboardContext";

function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
```

### 2. Use the context in components

```tsx
import { useDashboard } from "@/context/DashboardContext";

function MyComponent() {
  const { 
    currentUrl, 
    setCurrentUrl, 
    webVitalsData, 
    performanceHistory, 
    isLoading,
    refreshData 
  } = useDashboard();

  // Use the context data and functions
  return (
    <div>
      <p>Current URL: {currentUrl}</p>
      {isLoading && <p>Loading...</p>}
      <button onClick={() => setCurrentUrl("https://example.com")}>
        Analyze Example.com
      </button>
      <button onClick={refreshData}>
        Refresh Data
      </button>
    </div>
  );
}
```

### 3. Switch between different URLs

The context automatically fetches data when `currentUrl` changes:

```tsx
const { setCurrentUrl } = useDashboard();

// This will trigger data fetching for the new URL
setCurrentUrl("https://google.com");
```

## Data Fetching

The context automatically handles data fetching when the URL changes:

1. **Lighthouse Analysis**: Fetches from `/api/analyze` endpoint
2. **Historical Data**: Fetches from `/api/timeline` endpoint
3. **Loading States**: Manages loading state during fetch operations
4. **Error Handling**: Gracefully handles fetch errors without clearing existing data

## Features

### Automatic Data Fetching
- When `currentUrl` is updated, the context automatically fetches both analysis and historical data
- Loading states are managed automatically
- Errors are logged but don't clear existing context state

### Refresh Functionality
- `refreshData()` function allows refreshing data without changing the URL
- Useful for getting the latest analysis results

### TypeScript Support
- Full TypeScript typing for all context values
- Proper type definitions for Web Vitals and History data
- Type-safe context usage with error handling

### Immutable State Updates
- All state updates follow React best practices
- Context state is updated immutably
- Proper dependency arrays in useEffect hooks

## Example Implementation

The dashboard now includes several components that demonstrate the context usage:

### URL Input Component
```tsx
<UrlInput className="mb-6" />
```

### Dashboard Status Component
```tsx
<DashboardStatus />
```

### Complete Dashboard Example
```tsx
export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}

function DashboardContent() {
  const { setCurrentUrl, currentUrl, isLoading, refreshData } = useDashboard();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lighthouse Dashboard</h1>
        <Button onClick={refreshData} disabled={isLoading}>
          {isLoading ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      <UrlInput />
      
      {isLoading ? (
        <div>Loading dashboard data...</div>
      ) : (
        <>
          <WebVitalsCard />
          <PerformanceMetricsCard />
          <DashboardStatus />
        </>
      )}
    </div>
  );
}
```

These components allow users to:
- Enter a new URL for analysis
- See the currently analyzed URL
- View loading states during analysis
- Switch between different websites seamlessly
- Refresh data without changing the URL
- Monitor context state in real-time

## Benefits

1. **Centralized State**: All dashboard data is managed in one place
2. **Automatic Fetching**: Data is fetched automatically when URLs change
3. **Loading States**: Built-in loading state management
4. **Error Handling**: Graceful error handling without data loss
5. **Type Safety**: Full TypeScript support
6. **Reusability**: Context can be used by any component in the dashboard
7. **Performance**: Efficient data fetching with proper caching

## Testing

To test the implementation:

1. Start the development server
2. Navigate to the dashboard
3. Use the URL input to switch between different websites
4. Verify that Web Vitals and Performance Metrics cards update automatically
5. Check that loading states work correctly
6. Test the refresh functionality

The context provides a robust foundation for managing dashboard state and can be easily extended with additional features as needed.
