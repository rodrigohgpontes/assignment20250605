'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useTranslationKeys } from '../hooks/useTranslations';
import { useTranslationFilters } from '../hooks/useTranslationFilters';
import { useTranslationStore } from '../store/translationStore';
import { TranslationEditor } from './TranslationEditor';
import { SearchBar } from './ui/SearchBar';
import { CategoryFilter } from './ui/CategoryFilter';
import { LocaleFilter } from './ui/LocaleFilter';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';
import { VirtualizedList, useVirtualization } from './VirtualizedList';
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

export function TranslationKeyManager() {
    const [selectedLocale, setSelectedLocale] = useState('');

    // Fetch translation keys
    const { data: translationKeys = [], isLoading, error } = useTranslationKeys();

    // Get search filters and actions from store
    const {
        searchFilters,
        setSearchTerm,
        setSelectedCategory,
        setSelectedLocale: setStoreSelectedLocale,
        editingState,
        isEditing,
        startEditing,
    } = useTranslationStore();

    // Apply filters to the data
    const { filteredKeys, availableCategories, availableLocales, filteredCount, totalKeys } =
        useTranslationFilters(translationKeys);

    // Auto-select first available locale if none selected
    React.useEffect(() => {
        if (!selectedLocale && availableLocales.length > 0) {
            const firstLocale = availableLocales[0];
            setSelectedLocale(firstLocale);
            setStoreSelectedLocale(firstLocale);
        }
    }, [availableLocales, selectedLocale, setStoreSelectedLocale]);

    // Memoized callbacks for better performance
    const handleEditClick = useCallback((keyId: string, locale: string, currentValue: string) => {
        startEditing(keyId, locale, currentValue);
    }, [startEditing]);

    const handleLocaleChange = useCallback((locale: string) => {
        setSelectedLocale(locale);
        setStoreSelectedLocale(locale);
    }, [setStoreSelectedLocale]);

    // Check if virtualization should be enabled
    const shouldVirtualize = useVirtualization(filteredKeys.length);
    const ITEM_HEIGHT = 120; // Approximate height of each row
    const CONTAINER_HEIGHT = 600; // Fixed container height for virtualization

    // Memoized render function for virtualized items
    const renderTranslationKeyRow = useCallback((translationKey: TranslationKey) => (
        <TranslationKeyRow
            key={translationKey.id}
            translationKey={translationKey}
            selectedLocale={selectedLocale}
            isEditing={isEditing && editingState?.keyId === translationKey.id && editingState?.locale === selectedLocale}
            onEditClick={handleEditClick}
        />
    ), [selectedLocale, isEditing, editingState, handleEditClick]);

    // Memoized table content
    const tableContent = useMemo(() => {
        if (shouldVirtualize) {
            return (
                <VirtualizedList
                    items={filteredKeys}
                    itemHeight={ITEM_HEIGHT}
                    containerHeight={CONTAINER_HEIGHT}
                    renderItem={renderTranslationKeyRow}
                    className="divide-y divide-stone-200 dark:divide-stone-600"
                />
            );
        }

        return (
            <div className="divide-y divide-stone-200 dark:divide-stone-600">
                {filteredKeys.map((translationKey) => renderTranslationKeyRow(translationKey))}
            </div>
        );
    }, [shouldVirtualize, filteredKeys, renderTranslationKeyRow]);

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
                        <CategoryFilter
                            value={searchFilters.selectedCategory}
                            onChange={setSelectedCategory}
                            categories={availableCategories}
                            className="w-40"
                        />

                        <LocaleFilter
                            value={selectedLocale}
                            onChange={handleLocaleChange}
                            locales={availableLocales}
                            className="w-32"
                        />
                    </div>
                </div>

                {/* Results summary */}
                <div className="mt-3 text-sm text-stone-600 dark:text-stone-400">
                    Showing {filteredCount} of {totalKeys} translation keys
                    {searchFilters.searchTerm && ` for "${searchFilters.searchTerm}"`}
                    {searchFilters.selectedCategory && ` in category "${searchFilters.selectedCategory}"`}
                    {selectedLocale && ` with ${selectedLocale.toUpperCase()} translations`}
                    {shouldVirtualize && (
                        <span className="ml-2 text-blue-600 dark:text-blue-400">
                            (Virtualized for performance)
                        </span>
                    )}
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
                            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                                <div className="col-span-3">Key</div>
                                <div className="col-span-2">Category</div>
                                <div className="col-span-3">Description</div>
                                <div className="col-span-4">
                                    {getLocaleDisplayName(selectedLocale)} Translation
                                </div>
                            </div>
                        </div>

                        {/* Table body */}
                        {tableContent}
                    </div>
                )}
            </div>
        </div>
    );
}

// Row component for individual translation keys
interface TranslationKeyRowProps {
    translationKey: TranslationKey;
    selectedLocale: string;
    isEditing: boolean;
    onEditClick: (keyId: string, locale: string, currentValue: string) => void;
}

const TranslationKeyRow = React.memo(function TranslationKeyRow({
    translationKey,
    selectedLocale,
    isEditing,
    onEditClick
}: TranslationKeyRowProps) {
    const translation = translationKey.translations[selectedLocale];
    const hasTranslation = !!translation;
    const translationValue = translation?.value || '';

    const handleClick = React.useCallback(() => {
        if (!isEditing) {
            onEditClick(translationKey.id, selectedLocale, translationValue);
        }
    }, [isEditing, onEditClick, translationKey.id, selectedLocale, translationValue]);

    return (
        <div className="px-6 py-4 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors">
            <div className="grid grid-cols-12 gap-4 items-start">
                {/* Key */}
                <div className="col-span-3">
                    <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                        {translationKey.key}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        ID: {translationKey.id.slice(0, 8)}...
                    </div>
                </div>

                {/* Category */}
                <div className="col-span-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        {translationKey.category}
                    </span>
                </div>

                {/* Description */}
                <div className="col-span-3">
                    <div className="text-sm text-stone-600 dark:text-stone-400">
                        {translationKey.description || (
                            <span className="italic text-stone-400 dark:text-stone-500">No description</span>
                        )}
                    </div>
                </div>

                {/* Translation */}
                <div className="col-span-4">
                    {isEditing ? (
                        <TranslationEditor
                            keyId={translationKey.id}
                            locale={selectedLocale}
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
                                    Click to add {selectedLocale.toUpperCase()} translation
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}); 