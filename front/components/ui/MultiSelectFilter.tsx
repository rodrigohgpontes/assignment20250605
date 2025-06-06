'use client';

import { useState, useRef, useEffect } from 'react';

interface MultiSelectFilterProps {
    value: string[];
    onChange: (value: string[]) => void;
    options: string[];
    placeholder: string;
    className?: string;
    getDisplayName?: (value: string) => string;
}

export function MultiSelectFilter({
    value,
    onChange,
    options,
    placeholder,
    className = '',
    getDisplayName = (val) => val
}: MultiSelectFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleOption = (option: string) => {
        if (value.includes(option)) {
            onChange(value.filter(v => v !== option));
        } else {
            onChange([...value, option]);
        }
    };

    const handleClear = () => {
        onChange([]);
        setIsOpen(false);
    };

    const displayText = value.length === 0
        ? placeholder
        : value.length === 1
            ? getDisplayName(value[0])
            : `${value.length} selected`;

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="block w-full pl-3 pr-10 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-left"
            >
                <span className={value.length === 0 ? 'text-stone-500 dark:text-stone-400' : ''}>
                    {displayText}
                </span>
            </button>

            {/* Dropdown arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                    className={`w-5 h-5 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </div>

            {/* Clear button - only show when options are selected */}
            {value.length > 0 && (
                <button
                    onClick={handleClear}
                    className="absolute inset-y-0 right-8 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors pointer-events-auto z-10"
                    aria-label="Clear selection"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            )}

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-md shadow-lg max-h-60 overflow-auto">
                    {options.length === 0 ? (
                        <div className="px-3 py-2 text-stone-500 dark:text-stone-400 text-sm">
                            No options available
                        </div>
                    ) : (
                        options.map((option) => {
                            const isSelected = value.includes(option);
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleToggleOption(option)}
                                    className="w-full px-3 py-2 text-left hover:bg-stone-50 dark:hover:bg-stone-700 focus:outline-none focus:bg-stone-50 dark:focus:bg-stone-700 transition-colors flex items-center justify-between"
                                >
                                    <span className="text-stone-900 dark:text-stone-100">
                                        {getDisplayName(option)}
                                    </span>
                                    {isSelected && (
                                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
} 