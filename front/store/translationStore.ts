import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SearchFilters, Toast } from '../lib/types';

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

    // Toast notifications
    toasts: Toast[];

    // Actions for search and filters
    setSearchTerm: (term: string) => void;
    setSelectedCategories: (categories: string[]) => void;
    setSelectedLocales: (locales: string[]) => void;
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

    // Toast actions
    addToast: (message: string, type: Toast['type'], duration?: number) => void;
    removeToast: (id: string) => void;
    clearToasts: () => void;

    // Utility actions
    reset: () => void;
}

const initialState = {
    searchFilters: {
        searchTerm: '',
        selectedCategories: [],
        selectedLocales: [],
    },
    editingState: null,
    isEditing: false,
    selectedKeys: new Set<string>(),
    isLoading: false,
    error: null,
    toasts: [],
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

            setSelectedCategories: (categories: string[]) =>
                set((state) => ({
                    searchFilters: { ...state.searchFilters, selectedCategories: categories },
                }), false, 'setSelectedCategories'),

            setSelectedLocales: (locales: string[]) =>
                set((state) => ({
                    searchFilters: { ...state.searchFilters, selectedLocales: locales },
                }), false, 'setSelectedLocales'),

            clearFilters: () =>
                set({
                    searchFilters: {
                        searchTerm: '',
                        selectedCategories: [],
                        selectedLocales: [],
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

            // Toast actions
            addToast: (message: string, type: Toast['type'], duration = 4000) => {
                const id = Math.random().toString(36).substr(2, 9);
                const toast: Toast = { id, message, type, duration };
                set((state) => ({
                    toasts: [...state.toasts, toast],
                }), false, 'addToast');
            },

            removeToast: (id: string) =>
                set((state) => ({
                    toasts: state.toasts.filter(toast => toast.id !== id),
                }), false, 'removeToast'),

            clearToasts: () =>
                set({ toasts: [] }, false, 'clearToasts'),

            // Utility actions
            reset: () =>
                set(initialState, false, 'reset'),
        }),
        {
            name: 'translation-store',
        }
    )
);

// Stable selectors to prevent hydration issues
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

// Create a stable selector for toasts with proper SSR handling
export const useToasts = () => {
    const toasts = useTranslationStore((state) => state.toasts);
    const removeToast = useTranslationStore((state) => state.removeToast);
    const addToast = useTranslationStore((state) => state.addToast);
    const clearToasts = useTranslationStore((state) => state.clearToasts);

    return {
        toasts,
        removeToast,
        addToast,
        clearToasts,
    };
}; 