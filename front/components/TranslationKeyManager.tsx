'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useTranslationKeys } from '../hooks/useTranslations';
import { useTranslationFilters } from '../hooks/useTranslationFilters';
import { useTranslationStore } from '../store/translationStore';
import { TranslationEditor } from './TranslationEditor';
import { SearchBar } from './ui/SearchBar';
import { MultiSelectFilter } from './ui/MultiSelectFilter';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';
import { TranslationKey } from '../lib/types';

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

const ITEMS_PER_PAGE = 50;

export function TranslationKeyManager() {
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch translation keys
    const { data: translationKeys = [], isLoading, error } = useTranslationKeys();

    // Get search filters and actions from store
    const {
        searchFilters,
        setSearchTerm,
        setSelectedCategories,
        setSelectedLocales,
        editingState,
        isEditing,
        startEditing,
    } = useTranslationStore();

    // Apply filters to the data
    const { filteredKeys, availableCategories, availableLocales, filteredCount, totalKeys } =
        useTranslationFilters(translationKeys);

    // Pagination calculations
    const totalPages = Math.ceil(filteredCount / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedKeys = filteredKeys.slice(startIndex, endIndex);

    // Reset to first page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchFilters.searchTerm, searchFilters.selectedCategories, searchFilters.selectedLocales]);

    // Auto-select first few locales if none selected
    React.useEffect(() => {
        if ((!searchFilters.selectedLocales || searchFilters.selectedLocales.length === 0) && availableLocales.length > 0) {
            const initialLocales = availableLocales.slice(0, Math.min(3, availableLocales.length));
            setSelectedLocales(initialLocales);
        }
    }, [availableLocales, searchFilters.selectedLocales, setSelectedLocales]);

    // Memoized callbacks for better performance
    const handleEditClick = useCallback((keyId: string, locale: string, currentValue: string) => {
        startEditing(keyId, locale, currentValue);
    }, [startEditing]);

    // Memoized render function for translation key rows
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

    // Memoized table content
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
        <div className="space-y-6">
            {/* Header with filters */}
            <div className="bg-white dark:bg-stone-800 rounded-lg shadow p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex-1 max-w-md">
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

                {/* Results summary */}
                <div className="mt-3 text-sm text-stone-600 dark:text-stone-400">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredCount)} of {filteredCount} translation keys
                    {filteredCount !== totalKeys && ` (filtered from ${totalKeys} total)`}
                    {searchFilters.searchTerm && ` for "${searchFilters.searchTerm}"`}
                    {searchFilters.selectedCategories && searchFilters.selectedCategories.length > 0 && ` in ${searchFilters.selectedCategories.length} categories`}
                    {searchFilters.selectedLocales && searchFilters.selectedLocales.length > 0 && ` showing ${searchFilters.selectedLocales.length} language columns`}
                </div>
            </div>

            {/* Translation keys list */}
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
                        {/* Table header */}
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

                        {/* Table body */}
                        {tableContent}
                    </div>
                )}

                {/* Pagination */}
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
    );
}

// Row component for individual translation keys
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
    return (
        <div className="px-6 py-4 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors">
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
                                        group cursor-pointer rounded-md p-2 border transition-all
                                        ${hasTranslation
                                            ? 'border-stone-200 dark:border-stone-600 hover:border-blue-300 dark:hover:border-blue-500'
                                            : 'border-dashed border-stone-300 dark:border-stone-500 hover:border-blue-400 dark:hover:border-blue-400'
                                        }
                                    `}
                                >
                                    {hasTranslation ? (
                                        <div>
                                            <div className="text-sm text-stone-900 dark:text-stone-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {translationValue}
                                            </div>
                                            <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                                                Updated {new Date(translation.updated_at).toLocaleDateString()}
                                            </div>
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