'use client';

import { useState, useEffect, useRef } from 'react';
import { useUpdateTranslation } from '../hooks/useTranslations';
import { useTranslationStore } from '../store/translationStore';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface TranslationEditorProps {
    keyId: string;
    locale: string;
    value: string;
    onCancel?: () => void;
    className?: string;
}

export function TranslationEditor({
    keyId,
    locale,
    value,
    onCancel,
    className = '',
}: TranslationEditorProps) {
    const [editValue, setEditValue] = useState(value);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const { updateEditingValue, cancelEditing, confirmEditing } = useTranslationStore();
    const updateMutation = useUpdateTranslation();

    // Auto-focus when editing starts
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, []);

    // Update store when local value changes
    useEffect(() => {
        updateEditingValue(editValue);
    }, [editValue, updateEditingValue]);

    const handleSave = async () => {
        if (editValue === value) {
            handleCancel();
            return;
        }

        setIsSaving(true);
        try {
            await updateMutation.mutateAsync({
                keyId,
                locale,
                data: {
                    value: editValue,
                    updated_by: 'current_user',
                },
            });
            confirmEditing();
        } catch {
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditValue(value);
        cancelEditing();
        onCancel?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    };

    const hasChanges = editValue !== value;

    return (
        <div className={`relative ${className}`}>
            <div className="flex flex-col space-y-2">
                <textarea
                    ref={inputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={Math.max(2, editValue.split('\n').length)}
                    disabled={isSaving}
                    className="block w-full px-3 py-2 border-2 border-blue-500 rounded-md bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-500 dark:placeholder-stone-400 focus:outline-none focus:ring-0 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter translation..."
                />

                {/* Action buttons */}
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !hasChanges}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSaving ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-1" />
                                    Saving...
                                </>
                            ) : (
                                'Save'
                            )}
                        </button>

                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="inline-flex items-center px-3 py-1 border border-stone-300 dark:border-stone-600 text-xs font-medium rounded text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Status indicators */}
                    <div className="flex items-center space-x-2 text-stone-500 dark:text-stone-400">
                        {hasChanges && !isSaving && (
                            <span className="flex items-center">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                                Unsaved
                            </span>
                        )}
                        {isSaving && (
                            <span className="flex items-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                                Saving
                            </span>
                        )}
                        <span>Ctrl+Enter to save • Esc to cancel</span>
                    </div>
                </div>
            </div>

            {/* Error display */}
            {updateMutation.error && (
                <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                    Failed to save: {updateMutation.error.message}
                </div>
            )}
        </div>
    );
} 