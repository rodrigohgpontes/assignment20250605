'use client';

import { useEffect, useState } from 'react';
import { useToasts } from '../../store/translationStore';
import { Toast as ToastType } from '../../lib/types';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
    onClose: () => void;
}

export function Toast({ message, type, duration = 4000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const typeStyles = {
        success: 'bg-green-500 border-green-600',
        error: 'bg-red-500 border-red-600',
        info: 'bg-blue-500 border-blue-600',
    };

    const iconMap = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
    };

    return (
        <div
            className={`fixed top-4 right-4 z-50 max-w-sm w-full ${isVisible ? 'animate-slide-in' : 'animate-slide-out'
                }`}
        >
            <div
                className={`${typeStyles[type]} text-white px-4 py-3 rounded-lg shadow-lg border-l-4 flex items-center justify-between`}
            >
                <div className="flex items-center">
                    <span className="text-lg mr-2">{iconMap[type]}</span>
                    <span className="text-sm font-medium">{message}</span>
                </div>
                <button
                    onClick={handleClose}
                    className="ml-4 text-white hover:text-gray-200 focus:outline-none"
                >
                    <span className="sr-only">Close</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export function ToastContainer() {
    const [isClient, setIsClient] = useState(false);
    const { toasts, removeToast } = useToasts();

    // Only render on client to avoid hydration issues
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast: ToastType) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
} 