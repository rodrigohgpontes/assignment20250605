import { useMemo } from 'react';
import { TranslationKey } from '../lib/types';
import { useTranslationStore } from '../store/translationStore';

export function useTranslationFilters(translationKeys: TranslationKey[]) {
    const { searchFilters } = useTranslationStore();

    // Extract unique categories and locales from the data
    const { availableCategories, availableLocales } = useMemo(() => {
        const categories = new Set<string>();
        const locales = new Set<string>();

        translationKeys.forEach((key) => {
            categories.add(key.category);
            Object.keys(key.translations).forEach((locale) => {
                locales.add(locale);
            });
        });

        return {
            availableCategories: Array.from(categories).sort(),
            availableLocales: Array.from(locales).sort(),
        };
    }, [translationKeys]);

    // Filter translation keys based on search criteria
    const filteredKeys = useMemo(() => {
        let filtered = translationKeys;

        // Filter by search term (search in key, category, description, and translation values)
        if (searchFilters.searchTerm) {
            const searchTerm = searchFilters.searchTerm.toLowerCase();
            filtered = filtered.filter((key) => {
                // Search in key name
                if (key.key.toLowerCase().includes(searchTerm)) return true;

                // Search in category
                if (key.category.toLowerCase().includes(searchTerm)) return true;

                // Search in description
                if (key.description?.toLowerCase().includes(searchTerm)) return true;

                // Search in translation values
                return Object.values(key.translations).some((translation) =>
                    translation.value.toLowerCase().includes(searchTerm)
                );
            });
        }

        // Filter by category
        if (searchFilters.selectedCategory) {
            filtered = filtered.filter((key) => key.category === searchFilters.selectedCategory);
        }

        // Filter by locale (only show keys that have translations for the selected locale)
        if (searchFilters.selectedLocale) {
            filtered = filtered.filter((key) =>
                key.translations[searchFilters.selectedLocale]
            );
        }

        return filtered;
    }, [translationKeys, searchFilters]);



    return {
        filteredKeys,
        availableCategories,
        availableLocales,
        totalKeys: translationKeys.length,
        filteredCount: filteredKeys.length,
        hasFilters: !!(
            searchFilters.searchTerm ||
            searchFilters.selectedCategory ||
            searchFilters.selectedLocale
        ),
    };
} 