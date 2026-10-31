import React, { useRef, useState, useEffect, memo } from 'react';

interface AutoScrollTextProps {
  children: React.ReactNode;
  className?: string;
  pixelsPerSecond?: number;
  title?: string;
  onClick?: () => void;
}

// Global shared ResizeObserver to avoid creating dozens of observers across rows
type MeasureCallback = () => void;
const observerCallbacks = new WeakMap<Element, MeasureCallback>();
let sharedResizeObserver: ResizeObserver | null = null;
let scheduledFrameId: number | null = null;
const pendingElements = new Set<Element>();

function getSharedResizeObserver(): ResizeObserver | null {
  if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return null;
  if (!sharedResizeObserver) {
    sharedResizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        pendingElements.add(entry.target);
      }
      // Batch all measurements in a single requestAnimationFrame to eliminate layout thrashing
      if (scheduledFrameId === null) {
        scheduledFrameId = window.requestAnimationFrame(() => {
          scheduledFrameId = null;
          pendingElements.forEach((target) => {
            const cb = observerCallbacks.get(target);
            if (cb) cb();
          });
          pendingElements.clear();
        });
      }
    });
  }
  return sharedResizeObserver;
}

/**
 * High-performance AutoScrollText with zero input lag.
 * - Uses a single batched ResizeObserver singleton across all rows.
 * - Batches measurements in requestAnimationFrame to prevent forced reflows.
 * - Hardware-accelerated CSS marquee with hover/touch pause.
 * - Wrapped in React.memo to prevent unnecessary component re-renders.
 */
const AutoScrollTextComponent: React.FC<AutoScrollTextProps> = ({
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
    const measure = measureRef.current;
    if (!container || !measure) return;

    const measureLayout = () => {
      if (!containerRef.current || !measureRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const contentWidth = measureRef.current.scrollWidth;

      if (contentWidth > containerWidth + 4) {
        setIsOverflowing(true);
        const totalDistance = contentWidth + 32;
        const calculatedSeconds = Math.max(6, Math.min(30, totalDistance / pixelsPerSecond));
        setDuration(calculatedSeconds);
      } else {
        setIsOverflowing(false);
      }
    };

    // Initial measurement
    measureLayout();

    const observer = getSharedResizeObserver();
    if (observer) {
      observerCallbacks.set(container, measureLayout);
      observer.observe(container);
    }

    return () => {
      if (observer) {
        observer.unobserve(container);
        observerCallbacks.delete(container);
        pendingElements.delete(container);
      }
    };
  }, [children, pixelsPerSecond]);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      title={title}
      className={`relative max-w-full overflow-hidden select-text ${className}`}
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
        <div className="relative max-w-full overflow-hidden pr-3">
          <div
            className="animate-marquee-continuous"
            style={{ animationDuration: `${duration}s` }}
          >
            <span className="inline-block pr-8 whitespace-nowrap">{children}</span>
            <span className="inline-block pr-8 whitespace-nowrap" aria-hidden="true">
              {children}
            </span>
          </div>

          {/* Lightweight hardware-accelerated trailing fade edge (0 GPU overhead) */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white dark:from-[#161b22] to-transparent"
          />
        </div>
      ) : (
        <span className="truncate inline-block max-w-full whitespace-nowrap">
          {children}
        </span>
      )}
    </div>
  );
};

export const AutoScrollText = memo(AutoScrollTextComponent);
