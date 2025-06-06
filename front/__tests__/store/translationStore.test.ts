import { renderHook, act } from '@testing-library/react';
import { useTranslationStore } from '../../store/translationStore';

describe('TranslationStore', () => {
    beforeEach(() => {
        // Reset store state before each test
        const { result } = renderHook(() => useTranslationStore());
        act(() => {
            result.current.reset();
        });
    });

    describe('Search and Filter Actions', () => {
        it('updates search term', () => {
            const { result } = renderHook(() => useTranslationStore());

            act(() => {
                result.current.setSearchTerm('hello');
            });

            expect(result.current.searchFilters.searchTerm).toBe('hello');
        });

        it('updates selected categories', () => {
            const { result } = renderHook(() => useTranslationStore());

            act(() => {
                result.current.setSelectedCategories(['common', 'nav']);
            });

            expect(result.current.searchFilters.selectedCategories).toEqual(['common', 'nav']);
        });

        it('updates selected locales', () => {
            const { result } = renderHook(() => useTranslationStore());

            act(() => {
                result.current.setSelectedLocales(['en', 'es']);
            });

            expect(result.current.searchFilters.selectedLocales).toEqual(['en', 'es']);
        });

        it('clears all filters', () => {
            const { result } = renderHook(() => useTranslationStore());

            // Set some filters first
            act(() => {
                result.current.setSearchTerm('test');
                result.current.setSelectedCategories(['nav']);
                result.current.setSelectedLocales(['es']);
            });

            // Clear all filters
            act(() => {
                result.current.clearFilters();
            });

            expect(result.current.searchFilters).toEqual({
                searchTerm: '',
                selectedCategories: [],
                selectedLocales: [],
            });
        });
    });

    describe('Editing Actions', () => {
        it('starts editing with correct state', () => {
            const { result } = renderHook(() => useTranslationStore());

            act(() => {
                result.current.startEditing('key1', 'en', 'Hello');
            });

            expect(result.current.isEditing).toBe(true);
            expect(result.current.editingState).toEqual({
                keyId: 'key1',
                locale: 'en',
                originalValue: 'Hello',
                currentValue: 'Hello',
            });
        });

        it('updates editing value', () => {
            const { result } = renderHook(() => useTranslationStore());

            // Start editing first
            act(() => {
                result.current.startEditing('key1', 'en', 'Hello');
            });

            // Update the value
            act(() => {
                result.current.updateEditingValue('Hello World');
            });

            expect(result.current.editingState?.currentValue).toBe('Hello World');
            expect(result.current.editingState?.originalValue).toBe('Hello');
        });

        it('cancels editing', () => {
            const { result } = renderHook(() => useTranslationStore());

            // Start editing first
            act(() => {
                result.current.startEditing('key1', 'en', 'Hello');
            });

            // Cancel editing
            act(() => {
                result.current.cancelEditing();
            });

            expect(result.current.isEditing).toBe(false);
            expect(result.current.editingState).toBe(null);
        });

        it('confirms editing', () => {
            const { result } = renderHook(() => useTranslationStore());

            // Start editing first
            act(() => {
                result.current.startEditing('key1', 'en', 'Hello');
            });

            // Confirm editing
            act(() => {
                result.current.confirmEditing();
            });

            expect(result.current.isEditing).toBe(false);
            expect(result.current.editingState).toBe(null);
        });
    });

    describe('Toast Actions', () => {
        it('adds toast notification', () => {
            const { result } = renderHook(() => useTranslationStore());

            act(() => {
                result.current.addToast('Success message', 'success');
            });

            expect(result.current.toasts).toHaveLength(1);
            expect(result.current.toasts[0]).toMatchObject({
                message: 'Success message',
                type: 'success',
                duration: 4000,
            });
            expect(result.current.toasts[0]).toHaveProperty('id');
        });

        it('adds toast with custom duration', () => {
            const { result } = renderHook(() => useTranslationStore());

            act(() => {
                result.current.addToast('Error message', 'error', 2000);
            });

            expect(result.current.toasts[0]).toMatchObject({
                message: 'Error message',
                type: 'error',
                duration: 2000,
            });
        });

        it('removes toast notification', () => {
            const { result } = renderHook(() => useTranslationStore());

            // Add a toast first
            act(() => {
                result.current.addToast('Test message', 'info');
            });

            const toastId = result.current.toasts[0].id;

            // Remove the toast
            act(() => {
                result.current.removeToast(toastId);
            });

            expect(result.current.toasts).toHaveLength(0);
        });

        it('clears all toasts', () => {
            const { result } = renderHook(() => useTranslationStore());

            // Add multiple toasts
            act(() => {
                result.current.addToast('Message 1', 'success');
                result.current.addToast('Message 2', 'error');
                result.current.addToast('Message 3', 'info');
            });

            expect(result.current.toasts).toHaveLength(3);

            // Clear all toasts
            act(() => {
                result.current.clearToasts();
            });

            expect(result.current.toasts).toHaveLength(0);
        });
    });

    describe('Selection Actions', () => {
        it('toggles key selection', () => {
            const { result } = renderHook(() => useTranslationStore());

            // Select a key
            act(() => {
                result.current.toggleKeySelection('key1');
            });

            expect(result.current.selectedKeys.has('key1')).toBe(true);

            // Deselect the same key
            act(() => {
                result.current.toggleKeySelection('key1');
            });

            expect(result.current.selectedKeys.has('key1')).toBe(false);
        });

        it('clears all selections', () => {
            const { result } = renderHook(() => useTranslationStore());

            // Select some keys
            act(() => {
                result.current.toggleKeySelection('key1');
                result.current.toggleKeySelection('key2');
            });

            expect(result.current.selectedKeys.size).toBe(2);

            // Clear selections
            act(() => {
                result.current.clearSelection();
            });

            expect(result.current.selectedKeys.size).toBe(0);
        });
    });

    describe('UI State Actions', () => {
        it('sets loading state', () => {
            const { result } = renderHook(() => useTranslationStore());

            act(() => {
                result.current.setLoading(true);
            });

            expect(result.current.isLoading).toBe(true);

            act(() => {
                result.current.setLoading(false);
            });

            expect(result.current.isLoading).toBe(false);
        });

        it('sets error state', () => {
            const { result } = renderHook(() => useTranslationStore());

            act(() => {
                result.current.setError('Something went wrong');
            });

            expect(result.current.error).toBe('Something went wrong');

            act(() => {
                result.current.setError(null);
            });

            expect(result.current.error).toBe(null);
        });
    });
}); 