import { useState, useRef, useEffect, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  placeholderClassName?: string;
  threshold?: number;
  rootMargin?: string;
}

/**
 * LazyImage component that uses Intersection Observer to lazy load images.
 * Shows a skeleton placeholder until the image is in view and loaded.
 */
export function LazyImage({
  src,
  alt,
  fallback = "/placeholder.svg",
  className,
  placeholderClassName,
  threshold = 0.1,
  rootMargin = "50px",
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = imgRef.current;
    if (!element) return;

    // Check if IntersectionObserver is available
    if (!("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", className)}>
      {/* Skeleton placeholder */}
      {!isLoaded && (
        <Skeleton
          className={cn(
            "absolute inset-0 w-full h-full",
            placeholderClassName
          )}
        />
      )}

      {/* Actual image - only load when in view */}
      {isInView && (
        <img
          src={hasError ? fallback : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
}

/**
 * LazyAvatar component for user avatars with lazy loading
 */
interface LazyAvatarProps {
  src?: string | null;
  alt: string;
  fallbackInitials?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

export function LazyAvatar({
  src,
  alt,
  fallbackInitials,
  size = "md",
  className,
}: LazyAvatarProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = avatarRef.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "20px" }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const initials = fallbackInitials || alt.slice(0, 2).toUpperCase();
  const showFallback = !src || hasError || !isLoaded;

  return (
    <div
      ref={avatarRef}
      className={cn(
        "relative rounded-full overflow-hidden bg-muted flex items-center justify-center",
        SIZE_CLASSES[size],
        className
      )}
    >
      {/* Fallback initials */}
      {showFallback && (
        <span className="font-medium text-muted-foreground">{initials}</span>
      )}

      {/* Avatar image */}
      {src && isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-200",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          loading="lazy"
        />
      )}
    </div>
  );
}

export default LazyImage;
