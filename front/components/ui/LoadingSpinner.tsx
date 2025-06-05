interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    text?: string;
}

export function LoadingSpinner({ size = 'md', className = '', text }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className="flex flex-col items-center space-y-2">
                <div
                    className={`${sizeClasses[size]} border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin`}
                ></div>
                {text && (
                    <p className="text-sm text-stone-500 dark:text-stone-400">{text}</p>
                )}
            </div>
        </div>
    );
} 