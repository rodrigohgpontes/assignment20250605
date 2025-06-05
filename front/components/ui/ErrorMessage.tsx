interface ErrorMessageProps {
    error: string | Error;
    variant?: 'inline' | 'toast' | 'banner';
    onDismiss?: () => void;
    className?: string;
}

export function ErrorMessage({
    error,
    variant = 'inline',
    onDismiss,
    className = ''
}: ErrorMessageProps) {
    const errorText = typeof error === 'string' ? error : error.message;

    const variantClasses = {
        inline: 'p-3 text-sm border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md',
        toast: 'p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg shadow-lg',
        banner: 'p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    };

    return (
        <div className={`${variantClasses[variant]} ${className}`}>
            <div className="flex items-start justify-between">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg
                            className="w-5 h-5 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="font-medium">
                            {errorText}
                        </p>
                    </div>
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="ml-4 flex-shrink-0 text-red-400 hover:text-red-600 dark:text-red-300 dark:hover:text-red-100 transition-colors"
                        aria-label="Dismiss error"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
} 