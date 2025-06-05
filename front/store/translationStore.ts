import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SearchFilters } from '../lib/types';

interface EditingState {
    keyId: string;
    locale: string;
    originalValue: string;
    currentValue: string;
}

interface TranslationStore {
    // Search and filters
    searchFilters: SearchFilters;

    // Editing state
    editingState: EditingState | null;
    isEditing: boolean;

    // UI state
    selectedKeys: Set<string>;
    isLoading: boolean;
    error: string | null;

    // Actions for search and filters
    setSearchTerm: (term: string) => void;
    setSelectedCategory: (category: string) => void;
    setSelectedLocale: (locale: string) => void;
    clearFilters: () => void;

    // Actions for editing
    startEditing: (keyId: string, locale: string, currentValue: string) => void;
    updateEditingValue: (value: string) => void;
    cancelEditing: () => void;
    confirmEditing: () => void;

    // Actions for selection
    toggleKeySelection: (keyId: string) => void;
    selectAllKeys: () => void;
    clearSelection: () => void;

    // Actions for UI state
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Utility actions
    reset: () => void;
}

const initialState = {
    searchFilters: {
        searchTerm: '',
        selectedCategory: '',
        selectedLocale: '',
    },
    editingState: null,
    isEditing: false,
    selectedKeys: new Set<string>(),
    isLoading: false,
    error: null,
};

export const useTranslationStore = create<TranslationStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            // Search and filter actions
            setSearchTerm: (term: string) =>
                set((state) => ({
                    searchFilters: { ...state.searchFilters, searchTerm: term },
                }), false, 'setSearchTerm'),

            setSelectedCategory: (category: string) =>
                set((state) => ({
                    searchFilters: { ...state.searchFilters, selectedCategory: category },
                }), false, 'setSelectedCategory'),

            setSelectedLocale: (locale: string) =>
                set((state) => ({
                    searchFilters: { ...state.searchFilters, selectedLocale: locale },
                }), false, 'setSelectedLocale'),

            clearFilters: () =>
                set({
                    searchFilters: {
                        searchTerm: '',
                        selectedCategory: '',
                        selectedLocale: '',
                    },
                }, false, 'clearFilters'),

            // Editing actions
            startEditing: (keyId: string, locale: string, currentValue: string) =>
                set({
                    editingState: {
                        keyId,
                        locale,
                        originalValue: currentValue,
                        currentValue,
                    },
                    isEditing: true,
                }, false, 'startEditing'),

            updateEditingValue: (value: string) =>
                set((state) => ({
                    editingState: state.editingState
                        ? { ...state.editingState, currentValue: value }
                        : null,
                }), false, 'updateEditingValue'),

            cancelEditing: () =>
                set({
                    editingState: null,
                    isEditing: false,
                }, false, 'cancelEditing'),

            confirmEditing: () => {
                const { editingState } = get();
                if (editingState) {
                    set({
                        editingState: null,
                        isEditing: false,
                    }, false, 'confirmEditing');
                }
            },

            // Selection actions
            toggleKeySelection: (keyId: string) =>
                set((state) => {
                    const newSelectedKeys = new Set(state.selectedKeys);
                    if (newSelectedKeys.has(keyId)) {
                        newSelectedKeys.delete(keyId);
                    } else {
                        newSelectedKeys.add(keyId);
                    }
                    return { selectedKeys: newSelectedKeys };
                }, false, 'toggleKeySelection'),

            selectAllKeys: () =>
                set({
                    selectedKeys: new Set<string>(),
                }, false, 'selectAllKeys'),

            clearSelection: () =>
                set({
                    selectedKeys: new Set<string>(),
                }, false, 'clearSelection'),

            setLoading: (loading: boolean) =>
                set({ isLoading: loading }, false, 'setLoading'),

            setError: (error: string | null) =>
                set({ error }, false, 'setError'),

            // Utility actions
            reset: () =>
                set(initialState, false, 'reset'),
        }),
        {
            name: 'translation-store',
        }
    )
);

// Selectors for commonly used computed values
export const useSearchFilters = () =>
    useTranslationStore((state) => state.searchFilters);

export const useEditingState = () =>
    useTranslationStore((state) => ({
        editingState: state.editingState,
        isEditing: state.isEditing,
    }));

export const useSelectedKeys = () =>
    useTranslationStore((state) => state.selectedKeys);

export const useUIState = () =>
    useTranslationStore((state) => ({
        isLoading: state.isLoading,
        error: state.error,
    })); 