import React, { useRef, useState, useEffect } from 'react';

interface AutoScrollTextProps {
  children: React.ReactNode;
  className?: string;
  pixelsPerSecond?: number;
  title?: string;
  onClick?: () => void;
}

/**
 * AutoScrollText smoothly marquee-scrolls overflowing text in a continuous loop
 * while preserving all child elements (such as yellow search highlight <mark> tags).
 * Automatically measures container overflow using ResizeObserver.
 * Pauses automatically on hover or touch so users can read or click comfortably.
 */
export const AutoScrollText: React.FC<AutoScrollTextProps> = ({
  children,
  className = '',
  pixelsPerSecond = 32,
  title,
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(10);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkOverflow = () => {
      if (!containerRef.current || !measureRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const contentWidth = measureRef.current.scrollWidth;

      if (contentWidth > containerWidth + 4) {
        setIsOverflowing(true);
        // Calculate duration based on distance to keep smooth readable speed
        const totalDistance = contentWidth + 32; // includes gap
        const calculatedSeconds = Math.max(6, Math.min(30, totalDistance / pixelsPerSecond));
        setDuration(calculatedSeconds);
      } else {
        setIsOverflowing(false);
      }
    };

    checkOverflow();

    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });

    resizeObserver.observe(container);
    if (measureRef.current) {
      resizeObserver.observe(measureRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [children, pixelsPerSecond]);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      title={title}
      className={`relative max-w-full overflow-hidden select-text ${className}`}
      style={
        isOverflowing
          ? {
              maskImage:
                'linear-gradient(to right, black 0%, black calc(100% - 20px), transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to right, black 0%, black calc(100% - 20px), transparent 100%)',
            }
          : undefined
      }
    >
      {/* Hidden measure element to check true text width */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none absolute invisible whitespace-nowrap opacity-0"
      >
        {children}
      </span>

      {isOverflowing ? (
        <div
          className="animate-marquee-continuous"
          style={{ animationDuration: `${duration}s` }}
        >
          <span className="inline-block pr-8 whitespace-nowrap">{children}</span>
          <span className="inline-block pr-8 whitespace-nowrap" aria-hidden="true">
            {children}
          </span>
        </div>
      ) : (
        <span className="truncate inline-block max-w-full whitespace-nowrap">
          {children}
        </span>
      )}
    </div>
  );
};
