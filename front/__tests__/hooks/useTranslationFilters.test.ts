import { renderHook } from '@testing-library/react';
import { useTranslationFilters } from '../../hooks/useTranslationFilters';
import { TranslationKey } from '../../lib/types';

const mockTranslationKeys: TranslationKey[] = [
    {
        id: '1',
        key: 'common.greeting',
        category: 'common',
        description: 'Greeting message',
        translations: {
            en: { value: 'Hello', updated_at: '2023-01-01T00:00:00Z', updated_by: 'user1' },
            es: { value: 'Hola', updated_at: '2023-01-01T00:00:00Z', updated_by: 'user1' },
            fr: { value: 'Bonjour', updated_at: '2023-01-01T00:00:00Z', updated_by: 'user1' },
        },
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
    },
    {
        id: '2',
        key: 'nav.home',
        category: 'navigation',
        description: 'Home navigation link',
        translations: {
            en: { value: 'Home', updated_at: '2023-01-01T00:00:00Z', updated_by: 'user1' },
            es: { value: 'Inicio', updated_at: '2023-01-01T00:00:00Z', updated_by: 'user1' },
        },
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
    },
    {
        id: '3',
        key: 'common.farewell',
        category: 'common',
        description: 'Farewell message',
        translations: {
            en: { value: 'Goodbye', updated_at: '2023-01-01T00:00:00Z', updated_by: 'user1' },
        },
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
    },
];

// Mock the store
jest.mock('../../store/translationStore', () => ({
    useTranslationStore: () => ({
        searchFilters: {
            searchTerm: '',
            selectedCategory: '',
            selectedLocale: '',
        },
    }),
}));

describe('useTranslationFilters', () => {
    it('returns all keys when no filters are applied', () => {
        const { result } = renderHook(() => useTranslationFilters(mockTranslationKeys));

        expect(result.current.filteredKeys).toHaveLength(3);
        expect(result.current.totalKeys).toBe(3);
        expect(result.current.filteredCount).toBe(3);
    });

    it('extracts available categories correctly', () => {
        const { result } = renderHook(() => useTranslationFilters(mockTranslationKeys));

        expect(result.current.availableCategories).toEqual(['common', 'navigation']);
    });

    it('extracts available locales correctly', () => {
        const { result } = renderHook(() => useTranslationFilters(mockTranslationKeys));

        expect(result.current.availableLocales).toEqual(['en', 'es', 'fr']);
    });

    it('handles empty translation keys array', () => {
        const { result } = renderHook(() => useTranslationFilters([]));

        expect(result.current.filteredKeys).toHaveLength(0);
        expect(result.current.totalKeys).toBe(0);
        expect(result.current.filteredCount).toBe(0);
        expect(result.current.availableCategories).toEqual([]);
        expect(result.current.availableLocales).toEqual([]);
    });

    it('filters unique categories and locales', () => {
        const duplicateKeys: TranslationKey[] = [
            ...mockTranslationKeys,
            {
                id: '4',
                key: 'common.button',
                category: 'common', // duplicate category
                description: 'Button text',
                translations: {
                    en: { value: 'Click', updated_at: '2023-01-01T00:00:00Z', updated_by: 'user1' },
                    es: { value: 'Hacer clic', updated_at: '2023-01-01T00:00:00Z', updated_by: 'user1' },
                },
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-01T00:00:00Z',
            },
        ];

        const { result } = renderHook(() => useTranslationFilters(duplicateKeys));

        expect(result.current.availableCategories).toEqual(['common', 'navigation']);
        expect(result.current.availableLocales).toEqual(['en', 'es', 'fr']);
    });

    it('sorts categories and locales alphabetically', () => {
        const unsortedKeys: TranslationKey[] = [
            {
                id: '1',
                key: 'test.key',
                category: 'zebra',
                description: '',
                translations: {
                    zh: { value: '测试', updated_at: '2023-01-01T00:00:00Z', updated_by: 'user1' },
                    de: { value: 'Test', updated_at: '2023-01-01T00:00:00Z', updated_by: 'user1' },
                    ar: { value: 'اختبار', updated_at: '2023-01-01T00:00:00Z', updated_by: 'user1' },
                },
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-01T00:00:00Z',
            },
            {
                id: '2',
                key: 'test.key2',
                category: 'alpha',
                description: '',
                translations: {
                    en: { value: 'Test', updated_at: '2023-01-01T00:00:00Z', updated_by: 'user1' },
                },
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-01T00:00:00Z',
            },
        ];

        const { result } = renderHook(() => useTranslationFilters(unsortedKeys));

        expect(result.current.availableCategories).toEqual(['alpha', 'zebra']);
        expect(result.current.availableLocales).toEqual(['ar', 'de', 'en', 'zh']);
    });
}); 