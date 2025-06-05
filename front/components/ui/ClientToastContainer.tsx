'use client';

import dynamic from 'next/dynamic';

// Import ToastContainer only on client side to avoid hydration issues
const DynamicToastContainer = dynamic(
    () => import('./Toast').then((mod) => ({ default: mod.ToastContainer })),
    {
        ssr: false,
        loading: () => null,
    }
);

export function ClientToastContainer() {
    return <DynamicToastContainer />;
} 