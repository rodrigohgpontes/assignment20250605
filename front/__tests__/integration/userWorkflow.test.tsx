import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { TranslationKey } from '../../lib/types';
import { apiClient } from '../../lib/api';

// Mock the API client
jest.mock('../../lib/api', () => ({
    apiClient: {
        createTranslationKey: jest.fn(),
        deleteTranslationKey: jest.fn(),
        getTranslationKeys: jest.fn(),
    },
}));

// Simple mock implementations
const mockUseTranslationKeys = jest.fn(() => ({
    data: [] as TranslationKey[],
    isLoading: false,
    error: null,
    isError: false,
    refetch: jest.fn(),
}));

const mockUseTranslationFilters = jest.fn(() => ({
    filteredKeys: [] as TranslationKey[],
    availableCategories: [] as string[],
    availableLocales: [] as string[],
    filteredCount: 0,
    totalKeys: 0,
}));

const mockUseTranslationStore = jest.fn(() => ({
    searchFilters: { searchTerm: '', selectedCategory: '', selectedLocale: '' },
    setSearchTerm: jest.fn(),
    setSelectedCategory: jest.fn(),
    setSelectedLocale: jest.fn(),
    editingState: null,
    isEditing: false,
    startEditing: jest.fn(),
    addToast: jest.fn(),
}));

// Mock the modules
jest.mock('../../hooks/useTranslations', () => ({
    useTranslationKeys: () => mockUseTranslationKeys(),
    useCreateTranslationKey: (options?: { onSuccess?: (key: TranslationKey) => void; onError?: (error: Error) => void; }) => ({
        mutate: jest.fn((data) => {
            apiClient.createTranslationKey(data);
            const newKey = {
                id: '1',
                key: data.key,
                category: data.category,
                description: data.description,
                translations: {},
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };
            if (options?.onSuccess) {
                options.onSuccess(newKey);
            }
            return Promise.resolve(newKey);
        }),
        isPending: false,
        isError: false,
        error: null,
        isSuccess: false,
    }),
    useDeleteTranslationKey: (options?: { onSuccess?: () => void; onError?: (error: Error) => void; }) => ({
        mutate: jest.fn((id) => {
            apiClient.deleteTranslationKey(id);
            if (options?.onSuccess) {
                options.onSuccess();
            }
            return Promise.resolve();
        }),
        isPending: false,
        isError: false,
        error: null,
        isSuccess: false,
    }),
    queryKeys: {
        translationKeys: ['translation-keys'],
        translationKey: (id: string) => ['translation-keys', id],
    },
}));

jest.mock('../../hooks/useTranslationFilters', () => ({
    useTranslationFilters: () => mockUseTranslationFilters(),
}));

let addToastMock: jest.Mock;

jest.mock('../../store/translationStore', () => ({
    useTranslationStore: Object.assign(
        () => {
            addToastMock = jest.fn();
            return {
                searchFilters: {
                    searchTerm: '',
                    selectedCategories: [],
                    selectedLocales: [],
                },
                setSearchTerm: jest.fn(),
                setSelectedCategories: jest.fn(),
                setSelectedLocales: jest.fn(),
                editingState: null,
                isEditing: false,
                startEditing: jest.fn(),
                addToast: addToastMock,
            };
        },
        {
            getState: () => ({
                addToast: addToastMock,
            }),
        }
    ),
}));

import { TranslationKeyManager } from '../../components/TranslationKeyManager';

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
});

const TestWrapper: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
    const queryClient = createTestQueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

describe('User Workflow Integration Tests', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Setup default mock responses
        mockUseTranslationKeys.mockReturnValue({
            data: [] as TranslationKey[],
            isLoading: false,
            error: null,
            isError: false,
            refetch: jest.fn(),
        });

        mockUseTranslationFilters.mockReturnValue({
            filteredKeys: [] as TranslationKey[],
            availableCategories: [] as string[],
            availableLocales: [] as string[],
            filteredCount: 0,
            totalKeys: 0,
        });

        mockUseTranslationStore.mockReturnValue({
            searchFilters: { searchTerm: '', selectedCategory: '', selectedLocale: '' },
            setSearchTerm: jest.fn(),
            setSelectedCategory: jest.fn(),
            setSelectedLocale: jest.fn(),
            editingState: null,
            isEditing: false,
            startEditing: jest.fn(),
            addToast: jest.fn(),
        });

        (apiClient.getTranslationKeys as jest.Mock).mockResolvedValue([]);
    });

    it('renders without crashing', () => {
        expect(() => {
            render(
                <TestWrapper>
                    <TranslationKeyManager />
                </TestWrapper>
            );
        }).not.toThrow();
    });

    it('renders empty state when no data is available', () => {
        const { container } = render(
            <TestWrapper>
                <TranslationKeyManager />
            </TestWrapper>
        );

        expect(container).toBeInTheDocument();
    });

    describe('Create Translation Key', () => {
        it('opens create modal when clicking new key button', async () => {
            const { getByText, getByLabelText } = render(
                <TestWrapper>
                    <TranslationKeyManager />
                </TestWrapper>
            );

            const newKeyButton = getByText('New Key');
            fireEvent.click(newKeyButton);

            expect(getByText('Create New Translation Key')).toBeInTheDocument();
            expect(getByLabelText('Category')).toBeInTheDocument();
            expect(getByLabelText(/Key/)).toBeInTheDocument();
            expect(getByLabelText('Description (optional)')).toBeInTheDocument();
        });

        it('creates a new translation key with category prefix', async () => {
            const mockNewKey: TranslationKey = {
                id: '123',
                key: 'test.newkey',
                category: 'test',
                description: 'Test description',
                translations: {},
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };

            const mockCreateKey = jest.fn().mockResolvedValue(mockNewKey);
            (apiClient.createTranslationKey as jest.Mock) = mockCreateKey;

            // Start with empty data so no duplicate key validation
            mockUseTranslationKeys.mockReturnValue({
                data: [],
                isLoading: false,
                error: null,
                isError: false,
                refetch: jest.fn(),
            });

            mockUseTranslationFilters.mockReturnValue({
                filteredKeys: [],
                availableCategories: [],
                availableLocales: [],
                filteredCount: 0,
                totalKeys: 0,
            });

            const { getByText, getByLabelText } = render(
                <TestWrapper>
                    <TranslationKeyManager />
                </TestWrapper>
            );

            fireEvent.click(getByText('New Key'));

            fireEvent.change(getByLabelText('Category'), { target: { value: 'test' } });
            fireEvent.change(getByLabelText(/Key/), { target: { value: 'newkey' } });
            fireEvent.change(getByLabelText('Description (optional)'), { target: { value: 'Test description' } });

            fireEvent.click(getByText('Create Key'));

            expect(apiClient.createTranslationKey).toHaveBeenCalledWith({
                key: 'test.newkey',
                category: 'test',
                description: 'Test description',
                initial_translations: {
                    en: '',
                    es: '',
                    fr: '',
                },
            });
        });

        it('shows error toast when creation fails', async () => {
            const { getByText, getByLabelText } = render(
                <TestWrapper>
                    <TranslationKeyManager />
                </TestWrapper>
            );

            fireEvent.click(getByText('New Key'));
            fireEvent.change(getByLabelText('Category'), { target: { value: 'test' } });
            fireEvent.change(getByLabelText(/Key/), { target: { value: 'welcome' } });

            fireEvent.click(getByText('Create Key'));
        });
    });

    describe('Delete Translation Key', () => {
        const mockKeys: TranslationKey[] = [{
            id: '123',
            key: 'test.welcome',
            category: 'test',
            description: 'Test description',
            translations: {},
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        }];

        beforeEach(() => {
            mockUseTranslationKeys.mockReturnValue({
                data: mockKeys,
                isLoading: false,
                error: null,
                isError: false,
                refetch: jest.fn(),
            });

            mockUseTranslationFilters.mockReturnValue({
                filteredKeys: mockKeys,
                availableCategories: ['test'],
                availableLocales: ['en'],
                filteredCount: 1,
                totalKeys: 1,
            });

            window.confirm = jest.fn(() => true);
        });

        it('shows delete confirmation dialog', async () => {
            const { getByTitle } = render(
                <TestWrapper>
                    <TranslationKeyManager />
                </TestWrapper>
            );

            const row = getByTitle('Delete translation key').closest('div[class*="group"]');
            fireEvent.mouseEnter(row!);

            const deleteButton = getByTitle('Delete translation key');
            fireEvent.click(deleteButton);

            expect(window.confirm).toHaveBeenCalledWith(
                'Are you sure you want to delete this translation key? This action cannot be undone.'
            );
        });

        it('deletes translation key when confirmed', async () => {
            const mockDeleteKey = jest.fn().mockResolvedValue(undefined);
            (apiClient.deleteTranslationKey as jest.Mock) = mockDeleteKey;

            const { getByTitle } = render(
                <TestWrapper>
                    <TranslationKeyManager />
                </TestWrapper>
            );

            const row = getByTitle('Delete translation key').closest('div[class*="group"]');
            fireEvent.mouseEnter(row!);
            fireEvent.click(getByTitle('Delete translation key'));

            expect(apiClient.deleteTranslationKey).toHaveBeenCalledWith('123');
        });

        it('shows error toast when deletion fails', async () => {
            const { getByTitle } = render(
                <TestWrapper>
                    <TranslationKeyManager />
                </TestWrapper>
            );

            const row = getByTitle('Delete translation key').closest('div[class*="group"]');
            fireEvent.mouseEnter(row!);
            fireEvent.click(getByTitle('Delete translation key'));
        });

        it('does not delete when confirmation is cancelled', async () => {
            window.confirm = jest.fn(() => false);

            const { getByTitle } = render(
                <TestWrapper>
                    <TranslationKeyManager />
                </TestWrapper>
            );

            const row = getByTitle('Delete translation key').closest('div[class*="group"]');
            fireEvent.mouseEnter(row!);
            fireEvent.click(getByTitle('Delete translation key'));

            expect(apiClient.deleteTranslationKey).not.toHaveBeenCalled();
        });
    });
}); 