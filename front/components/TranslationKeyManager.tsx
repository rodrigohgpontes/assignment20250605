'use client';

import React, { useCallback, useMemo, useState, createContext } from 'react';
import { useTranslationKeys, useCreateTranslationKey, useDeleteTranslationKey, queryKeys } from '../hooks/useTranslations';
import { useTranslationFilters } from '../hooks/useTranslationFilters';
import { useTranslationStore } from '../store/translationStore';
import { useQueryClient } from '@tanstack/react-query';
import { TranslationEditor } from './TranslationEditor';
import { SearchBar } from './ui/SearchBar';
import { MultiSelectFilter } from './ui/MultiSelectFilter';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';
import { TranslationKey, CreateTranslationKeyRequest } from '../lib/types';

import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
    };

    return localeMap[localeCode] || localeCode.toUpperCase();
}

const ITEMS_PER_PAGE = 10;

interface CreateKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTranslationKeyRequest) => void;
    isLoading: boolean;
    availableLocales: string[];
    translationKeys: TranslationKey[];
}

function CreateKeyModal({ isOpen, onClose, onSubmit, isLoading, availableLocales, translationKeys }: CreateKeyModalProps) {
    const [formData, setFormData] = useState<CreateTranslationKeyRequest>({
        key: '',
        category: '',
        description: '',
        initial_translations: {},
    });
    const [selectedLocales, setSelectedLocales] = useState<string[]>([]);
    const [keyExists, setKeyExists] = useState(false);

    // Get all possible locales from the locale map
    const getAllPossibleLocales = React.useCallback(() => {
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
        };
        return Object.keys(localeMap);
    }, []);

    // Calculate default locales based on usage frequency
    const getDefaultLocales = React.useCallback(() => {
        if (translationKeys.length === 0 || availableLocales.length === 0) {
            // If no translation keys exist, select common languages from the locale map
            const commonLocales = ['en', 'es', 'fr']; // Default to English, Spanish, French
            return commonLocales.filter(locale => getAllPossibleLocales().includes(locale));
        }

        // Count how many keys have translations for each locale
        const localeCounts = new Map<string, number>();

        translationKeys.forEach(key => {
            Object.keys(key.translations).forEach(locale => {
                localeCounts.set(locale, (localeCounts.get(locale) || 0) + 1);
            });
        });

        // Sort locales by usage frequency and select top ones
        const sortedLocales = Array.from(localeCounts.entries())
            .sort((a, b) => b[1] - a[1]) // Sort by count descending
            .map(([locale]) => locale);

        // Return all locales that appear in at least 50% of translation keys
        // or at minimum, the top 3 most used locales
        const threshold = Math.max(1, Math.floor(translationKeys.length * 0.5));
        const frequentLocales = sortedLocales.filter(locale =>
            (localeCounts.get(locale) || 0) >= threshold
        );

        return frequentLocales.length > 0
            ? frequentLocales
            : sortedLocales.slice(0, Math.min(3, sortedLocales.length));
    }, [translationKeys, availableLocales, getAllPossibleLocales]);

    // Reset form when modal opens and pre-select default locales
    React.useEffect(() => {
        if (isOpen) {
            setFormData({
                key: '',
                category: '',
                description: '',
                initial_translations: {},
            });
            // Pre-select default locales based on usage frequency
            setSelectedLocales(getDefaultLocales());
        }
    }, [isOpen, getDefaultLocales]);

    const formattedKey = useMemo(() => {
        if (!formData.category) return formData.key;
        const cleanKey = formData.key.replace(/^[^.]*\./, ''); // Remove any existing category prefix
        return `${formData.category}.${cleanKey}`;
    }, [formData.category, formData.key]);

    // Check if the formatted key already exists
    React.useEffect(() => {
        if (formattedKey && formattedKey.trim()) {
            const exists = translationKeys.some(key => key.key === formattedKey);
            setKeyExists(exists);
        } else {
            setKeyExists(false);
        }
    }, [formattedKey, translationKeys]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check if key exists before submitting
        if (keyExists) {
            useTranslationStore.getState().addToast(
                `Translation key "${formattedKey}" already exists. Please choose a different name.`,
                'error'
            );
            return;
        }

        // Build initial translations from selected locales (including empty ones)
        const initial_translations: Record<string, string> = {};
        selectedLocales.forEach(locale => {
            const translationValue = formData.initial_translations?.[locale] || '';
            initial_translations[locale] = translationValue.trim();
        });

        onSubmit({
            ...formData,
            key: formattedKey,
            initial_translations,
        });
    };

    const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (formData.category && !value.startsWith(formData.category + '.')) {
            const cleanValue = value.replace(/^[^.]*\./, '');
            setFormData(prev => ({ ...prev, key: cleanValue }));
        } else {
            setFormData(prev => ({ ...prev, key: value }));
        }
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, category: value }));
    };

    const handleLocaleToggle = (locale: string) => {
        setSelectedLocales(prev => {
            const isSelected = prev.includes(locale);
            if (isSelected) {
                // Remove locale and its translation
                const newFormData = { ...formData };
                if (newFormData.initial_translations) {
                    delete newFormData.initial_translations[locale];
                }
                setFormData(newFormData);
                return prev.filter(l => l !== locale);
            } else {
                // Add locale
                return [...prev, locale];
            }
        });
    };

    const handleTranslationChange = (locale: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            initial_translations: {
                ...prev.initial_translations,
                [locale]: value,
            },
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-stone-800 rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700">
                    <h2 className="text-lg font-medium text-stone-900 dark:text-stone-100">Create New Translation Key</h2>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-stone-500 dark:text-stone-500 dark:hover:text-stone-400"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                            Category
                        </label>
                        <input
                            type="text"
                            id="category"
                            required
                            value={formData.category}
                            onChange={handleCategoryChange}
                            className="mt-1 block w-full rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 px-3 py-2 text-stone-900 dark:text-stone-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g., common"
                        />
                    </div>
                    <div>
                        <label htmlFor="key" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                            Key <br />
                            <div className="text-stone-500 dark:text-stone-400 pointer-events-none">
                                {formData.category || ' '}.
                            </div>
                        </label>
                        <div className="mt-1 relative">
                            <input
                                type="text"
                                id="key"
                                required
                                value={formData.key}
                                onChange={handleKeyChange}
                                className={`mt-1 block w-full rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 px-3 py-2 text-stone-900 dark:text-stone-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                placeholder="e.g., welcome_message"
                            />
                        </div>
                        {formData.category && (
                            <div className="mt-1">
                                <p className="text-sm text-stone-500 dark:text-stone-400">
                                    Full key will be: <span className="font-mono">{formattedKey}</span>
                                </p>
                                {keyExists && (
                                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        This translation key already exists
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                            Description (optional)
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="mt-1 block w-full rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 px-3 py-2 text-stone-900 dark:text-stone-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Describe what this translation key is used for"
                            rows={3}
                        />
                    </div>

                    {/* Language Selection */}
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                            Initial Translations (optional)
                            {selectedLocales.length > 0 && (
                                <span className="ml-2 text-xs font-normal text-stone-500 dark:text-stone-400">
                                    ({selectedLocales.length} selected)
                                </span>
                            )}
                        </label>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
                            {translationKeys.length > 0
                                ? "Languages commonly used in your existing translations are pre-selected."
                                : "Common languages are pre-selected to get you started."
                            } You can add or remove languages as needed. Translation text is optional - leave empty to add later.
                        </p>
                        <div className="space-y-3 max-h-64 overflow-y-auto border border-stone-200 dark:border-stone-600 rounded-md p-3">
                            {(availableLocales.length > 0 ? availableLocales : getAllPossibleLocales()).map((locale) => {
                                const isDefaultSelected = getDefaultLocales().includes(locale);
                                return (
                                    <div key={locale} className="flex items-start space-x-3">
                                        <div className="flex items-center h-9">
                                            <input
                                                type="checkbox"
                                                id={`locale-${locale}`}
                                                checked={selectedLocales.includes(locale)}
                                                onChange={() => handleLocaleToggle(locale)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-stone-300 dark:border-stone-600 rounded"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor={`locale-${locale}`} className="text-sm text-stone-700 dark:text-stone-300 font-medium flex items-center gap-2">
                                                {getLocaleDisplayName(locale)}
                                                {isDefaultSelected && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                                        commonly used
                                                    </span>
                                                )}
                                            </label>
                                            {selectedLocales.includes(locale) && (
                                                <div className="mt-1">
                                                    <input
                                                        type="text"
                                                        value={formData.initial_translations?.[locale] || ''}
                                                        onChange={(e) => handleTranslationChange(locale, e.target.value)}
                                                        className="block w-full rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 px-3 py-2 text-stone-900 dark:text-stone-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        placeholder={`Enter ${getLocaleDisplayName(locale)} translation (optional)`}
                                                    />
                                                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                                        Leave empty to add translation later
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {selectedLocales.length > 0 && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-4 w-4 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-2">
                                        <p className="text-xs text-blue-700 dark:text-blue-300">
                                            <strong>Tip:</strong> Selected languages will create translation placeholders even if left empty.
                                            You can add the actual translations now or later from the main interface.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md hover:bg-stone-50 dark:hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || keyExists}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating...' : keyExists ? 'Key Already Exists' : 'Create Key'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const NewKeyContext = createContext<string | null>(null);

export function TranslationKeyManager() {
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newKeyId, setNewKeyId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const { data: translationKeys = [], isLoading, error } = useTranslationKeys();

    const {
        searchFilters,
        setSearchTerm,
        setSelectedCategories,
        setSelectedLocales,
        editingState,
        isEditing,
        startEditing,
    } = useTranslationStore();

    const { filteredKeys, availableCategories, availableLocales, filteredCount, totalKeys } =
        useTranslationFilters(translationKeys);

    React.useEffect(() => {
        if (newKeyId && filteredKeys.length > 0) {
            const newKeyIndex = filteredKeys.findIndex(key => key.id === newKeyId);
            if (newKeyIndex !== -1) {
                const newPage = Math.floor(newKeyIndex / ITEMS_PER_PAGE) + 1;
                if (newPage !== currentPage) {
                    setCurrentPage(newPage);
                }
            }
        }
    }, [newKeyId, filteredKeys, currentPage]);

    const createKeyMutation = useCreateTranslationKey({
        onSuccess: (newKey) => {
            setIsCreateModalOpen(false);
            setNewKeyId(newKey.id);
            setTimeout(() => {
                setNewKeyId(null);
            }, 3000);
            useTranslationStore.getState().addToast('Translation key created successfully', 'success');
        },
        onError: (error) => {
            let errorMessage = error.message;
            let actionMessage = '';

            if (error.message.includes('Translation key already exists')) {
                errorMessage = 'A translation key with this name already exists.';
                actionMessage = ' Please choose a different key name or check the existing key in the list below.';
            }

            useTranslationStore.getState().addToast(errorMessage + actionMessage, 'error');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.translationKeys });
        },
    });

    const totalPages = Math.ceil(filteredCount / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedKeys = filteredKeys.slice(startIndex, endIndex);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchFilters.searchTerm, searchFilters.selectedCategories, searchFilters.selectedLocales]);

    React.useEffect(() => {
        if ((!searchFilters.selectedLocales || searchFilters.selectedLocales.length === 0) && availableLocales.length > 0) {
            const initialLocales = availableLocales.slice(0, Math.min(3, availableLocales.length));
            setSelectedLocales(initialLocales);
        }
    }, [availableLocales, searchFilters.selectedLocales, setSelectedLocales]);

    const handleEditClick = useCallback((keyId: string, locale: string, currentValue: string) => {
        startEditing(keyId, locale, currentValue);
    }, [startEditing]);

    const handleCreateNewKey = useCallback(() => {
        setIsCreateModalOpen(true);
    }, []);

    const handleCreateSubmit = useCallback((data: CreateTranslationKeyRequest) => {
        createKeyMutation.mutate(data);
    }, [createKeyMutation]);

    const renderTranslationKeyRow = useCallback((translationKey: TranslationKey) => (
        <TranslationKeyRow
            key={translationKey.id}
            translationKey={translationKey}
            selectedLocales={searchFilters.selectedLocales || []}
            editingState={editingState}
            isEditing={isEditing}
            onEditClick={handleEditClick}
        />
    ), [searchFilters.selectedLocales, isEditing, editingState, handleEditClick]);

    const tableContent = useMemo(() => {
        return (
            <div className="divide-y divide-stone-200 dark:divide-stone-600">
                {paginatedKeys.map((translationKey) => renderTranslationKeyRow(translationKey))}
            </div>
        );
    }, [paginatedKeys, renderTranslationKeyRow]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text="Loading translation keys..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-6">
                <ErrorMessage error={error} variant="banner" />
            </div>
        );
    }

    return (
        <NewKeyContext.Provider value={newKeyId}>
            <div className="space-y-6">
                <CreateKeyModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateSubmit}
                    isLoading={createKeyMutation.isPending}
                    availableLocales={availableLocales}
                    translationKeys={translationKeys}
                />

                <div className="bg-white dark:bg-stone-800 rounded-lg shadow p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex-1 max-w-md flex gap-2">
                            <button
                                onClick={handleCreateNewKey}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <PlusIcon className="h-5 w-5 mr-1" />
                                New Key
                            </button>
                            <SearchBar
                                value={searchFilters.searchTerm}
                                onChange={setSearchTerm}
                                placeholder="Search keys, categories, or translations..."
                            />
                        </div>

                        <div className="flex gap-2">
                            <MultiSelectFilter
                                value={searchFilters.selectedCategories || []}
                                onChange={setSelectedCategories}
                                options={availableCategories}
                                placeholder="All Categories"
                                className="w-40"
                            />

                            <MultiSelectFilter
                                value={searchFilters.selectedLocales || []}
                                onChange={setSelectedLocales}
                                options={availableLocales}
                                placeholder="Select Languages"
                                className="w-40"
                                getDisplayName={getLocaleDisplayName}
                            />
                        </div>
                    </div>

                    <div className="mt-3 text-sm text-stone-600 dark:text-stone-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredCount)} of {filteredCount} translation keys
                        {filteredCount !== totalKeys && ` (filtered from ${totalKeys} total)`}
                        {searchFilters.searchTerm && ` for "${searchFilters.searchTerm}"`}
                        {searchFilters.selectedCategories && searchFilters.selectedCategories.length > 0 && ` in ${searchFilters.selectedCategories.length} categories`}
                        {searchFilters.selectedLocales && searchFilters.selectedLocales.length > 0 && ` showing ${searchFilters.selectedLocales.length} language columns`}
                    </div>
                </div>

                <div className="bg-white dark:bg-stone-800 rounded-lg shadow">
                    {filteredKeys.length === 0 ? (
                        <div className="p-8 text-center text-stone-500 dark:text-stone-400">
                            {totalKeys === 0 ? (
                                <div>
                                    <p className="text-lg font-medium mb-2">No translation keys found</p>
                                    <p>Get started by creating your first translation key.</p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-lg font-medium mb-2">No results found</p>
                                    <p>Try adjusting your search terms or filters.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-hidden">
                            <div className="bg-stone-50 dark:bg-stone-700/50 px-6 py-3 border-b border-stone-200 dark:border-stone-600">
                                <div className="grid gap-4 text-xs font-medium text-stone-700 dark:text-stone-300 uppercase tracking-wider" style={{
                                    gridTemplateColumns: `2fr 1fr 2fr ${(searchFilters.selectedLocales || []).map(() => '2fr').join(' ')}`
                                }}>
                                    <div>Key</div>
                                    <div>Category</div>
                                    <div>Description</div>
                                    {(searchFilters.selectedLocales || []).map((locale) => (
                                        <div key={locale}>
                                            {getLocaleDisplayName(locale)} Translation
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {tableContent}
                        </div>
                    )}

                    {filteredCount > ITEMS_PER_PAGE && (
                        <div className="bg-white dark:bg-stone-800 px-6 py-3 border-t border-stone-200 dark:border-stone-600">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-stone-700 dark:text-stone-300">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 text-sm border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        First
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 text-sm border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 text-sm border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 text-sm border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Last
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </NewKeyContext.Provider>
    );
}

interface TranslationKeyRowProps {
    translationKey: TranslationKey;
    selectedLocales: string[];
    editingState: {
        keyId: string;
        locale: string;
        originalValue: string;
        currentValue: string;
    } | null;
    isEditing: boolean;
    onEditClick: (keyId: string, locale: string, currentValue: string) => void;
}

const TranslationKeyRow = React.memo(function TranslationKeyRow({
    translationKey,
    selectedLocales,
    editingState,
    isEditing,
    onEditClick
}: TranslationKeyRowProps) {
    const queryClient = useQueryClient();
    const rowRef = React.useRef<HTMLDivElement>(null);
    const newKeyId = React.useContext(NewKeyContext);

    React.useEffect(() => {
        if (newKeyId === translationKey.id && rowRef.current) {
            setTimeout(() => {
                rowRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 100);
        }
    }, [newKeyId, translationKey.id]);

    const deleteKeyMutation = useDeleteTranslationKey({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.translationKeys });
            useTranslationStore.getState().addToast('Translation key deleted successfully', 'success');
        },
        onError: (error) => {
            useTranslationStore.getState().addToast(error.message, 'error');
        },
    });
    const handleDelete = useCallback((e: React.MouseEvent, keyId: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this translation key? This action cannot be undone.')) {
            deleteKeyMutation.mutate(keyId);
        }
    }, [deleteKeyMutation]);

    return (
        <div
            ref={rowRef}
            className={`px-6 py-4 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors group relative ${newKeyId === translationKey.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
        >
            {/* Add delete button for the entire row */}
            <button
                onClick={(e) => handleDelete(e, translationKey.id)}
                className="absolute -right-1 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-red-500 dark:text-stone-500 dark:hover:text-red-400"
                title="Delete translation key"
            >
                <TrashIcon className="h-5 w-5" />
            </button>

            <div className="grid gap-4 items-start" style={{
                gridTemplateColumns: `2fr 1fr 2fr ${selectedLocales.map(() => '2fr').join(' ')}`
            }}>
                {/* Key */}
                <div>
                    <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                        {translationKey.key}
                    </div>
                </div>

                {/* Category */}
                <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        {translationKey.category}
                    </span>
                </div>

                {/* Description */}
                <div>
                    <div className="text-sm text-stone-600 dark:text-stone-400">
                        {translationKey.description || (
                            <span className="italic text-stone-400 dark:text-stone-500">No description</span>
                        )}
                    </div>
                </div>

                {/* Translation columns */}
                {selectedLocales.map((locale) => {
                    const translation = translationKey.translations[locale];
                    const hasTranslation = !!translation;
                    const translationValue = translation?.value || '';
                    const isCurrentlyEditing = isEditing && editingState?.keyId === translationKey.id && editingState?.locale === locale;

                    const handleClick = () => {
                        if (!isCurrentlyEditing) {
                            onEditClick(translationKey.id, locale, translationValue);
                        }
                    };

                    return (
                        <div key={locale}>
                            {isCurrentlyEditing ? (
                                <TranslationEditor
                                    keyId={translationKey.id}
                                    locale={locale}
                                    value={translationValue}
                                />
                            ) : (
                                <div
                                    onClick={handleClick}
                                    className={`
                                        cursor-pointer rounded-md p-2 border transition-all
                                        ${hasTranslation && translationValue.trim()
                                            ? 'border-stone-200 dark:border-stone-600 hover:border-blue-300 dark:hover:border-blue-500'
                                            : 'border-dashed border-stone-300 dark:border-stone-500 hover:border-blue-400 dark:hover:border-blue-400'
                                        }
                                    `}
                                >
                                    {hasTranslation && translationValue.trim() ? (
                                        <div className="text-sm text-stone-900 dark:text-stone-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {translationValue}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-stone-400 dark:text-stone-500 italic group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                                            Click to add {getLocaleDisplayName(locale)} translation
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}); 