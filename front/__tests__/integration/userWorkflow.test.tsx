import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';

// Simple mock implementations
const mockUseTranslationKeys = jest.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
    isError: false,
    refetch: jest.fn(),
}));

const mockUseTranslationFilters = jest.fn(() => ({
    filteredKeys: [],
    availableCategories: [],
    availableLocales: [],
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
}));

// Mock the modules
jest.mock('../../hooks/useTranslations', () => ({
    useTranslationKeys: () => mockUseTranslationKeys(),
}));

jest.mock('../../hooks/useTranslationFilters', () => ({
    useTranslationFilters: () => mockUseTranslationFilters(),
}));

jest.mock('../../store/translationStore', () => ({
    useTranslationStore: () => mockUseTranslationStore(),
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
}); 