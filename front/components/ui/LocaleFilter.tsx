// Helper function to get display name for locale codes
function getLocaleDisplayName(localeCode: string): string {
    const localeMap: Record<string, string> = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese',
        '0': 'Language 0',
        '1': 'Language 1',
        '2': 'Language 2',
        '3': 'Language 3',
    };

    return localeMap[localeCode] || localeCode.toUpperCase();
}

interface LocaleFilterProps {
    value: string;
    onChange: (value: string) => void;
    locales: string[];
    className?: string;
}

export function LocaleFilter({
    value,
    onChange,
    locales,
    className = ''
}: LocaleFilterProps) {
    const handleClear = () => {
        onChange('');
    };

    return (
        <div className={`relative ${className}`}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
            >
                <option value="">All Languages</option>
                {locales.map((locale) => (
                    <option key={locale} value={locale}>
                        {getLocaleDisplayName(locale)}
                    </option>
                ))}
            </select>

            {/* Custom dropdown arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                    className="w-5 h-5 text-stone-400"
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

            {/* Clear button - only show when a locale is selected */}
            {value && (
                <button
                    onClick={handleClear}
                    className="absolute inset-y-0 right-8 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors pointer-events-auto"
                    aria-label="Clear locale filter"
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
        </div>
    );
} 