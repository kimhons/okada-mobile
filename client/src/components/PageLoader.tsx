import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  message?: string;
}

/**
 * Full-page loading component for React.lazy code splitting.
 * Shows a centered spinner with optional message.
 */
export function PageLoader({ message = "Loading..." }: PageLoaderProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
}

/**
 * Inline loading component for smaller sections.
 */
export function SectionLoader({ message = "Loading..." }: PageLoaderProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for cards and content blocks.
 */
export function CardLoader() {
  return (
    <div className="animate-pulse space-y-4 p-6 border rounded-lg">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded"></div>
        <div className="h-3 bg-muted rounded w-5/6"></div>
      </div>
    </div>
  );
}

export default PageLoader;
