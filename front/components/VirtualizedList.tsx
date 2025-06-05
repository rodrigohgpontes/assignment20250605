'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

interface VirtualizedListProps<T> {
    items: T[];
    itemHeight: number;
    containerHeight: number;
    renderItem: (item: T) => React.ReactNode;
    overscan?: number;
    className?: string;
}

export function VirtualizedList<T>({
    items,
    itemHeight,
    containerHeight,
    renderItem,
    overscan = 5,
    className = '',
}: VirtualizedListProps<T>) {
    const [scrollTop, setScrollTop] = useState(0);
    const scrollElementRef = useRef<HTMLDivElement>(null);

    const totalHeight = items.length * itemHeight;

    const visibleRange = useMemo(() => {
        const visibleStart = Math.floor(scrollTop / itemHeight);
        const visibleEnd = Math.min(
            visibleStart + Math.ceil(containerHeight / itemHeight),
            items.length - 1
        );

        const startIndex = Math.max(0, visibleStart - overscan);
        const endIndex = Math.min(items.length - 1, visibleEnd + overscan);

        return { startIndex, endIndex };
    }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

    const visibleItems = useMemo(() => {
        return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
    }, [items, visibleRange.startIndex, visibleRange.endIndex]);

    const offsetY = visibleRange.startIndex * itemHeight;

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    };

    useEffect(() => {
        const scrollElement = scrollElementRef.current;
        if (scrollElement) {
            scrollElement.scrollTop = scrollTop;
        }
    }, [scrollTop]);

    return (
        <div
            ref={scrollElementRef}
            className={`overflow-auto ${className}`}
            style={{ height: containerHeight }}
            onScroll={handleScroll}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                <div style={{ transform: `translateY(${offsetY}px)` }}>
                    {visibleItems.map((item, index) => (
                        <div key={`item-${visibleRange.startIndex + index}`}>
                            {renderItem(item)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Hook for detecting if virtualization should be enabled
export function useVirtualization(itemCount: number, threshold = 100) {
    return itemCount > threshold;
} 