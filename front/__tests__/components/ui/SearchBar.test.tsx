import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBar } from '../../../components/ui/SearchBar';
import '@testing-library/jest-dom';

describe('SearchBar', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with placeholder text', () => {
        render(
            <SearchBar
                value=""
                onChange={mockOnChange}
                placeholder="Search translation keys..."
            />
        );

        expect(screen.getByPlaceholderText('Search translation keys...')).toBeInTheDocument();
    });

    it('displays the current value', () => {
        render(
            <SearchBar
                value="test query"
                onChange={mockOnChange}
                placeholder="Search..."
            />
        );

        expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
    });

    it('calls onChange when typing', async () => {
        render(
            <SearchBar
                value=""
                onChange={mockOnChange}
                placeholder="Search..."
            />
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'new search' } });

        await waitFor(() => {
            expect(mockOnChange).toHaveBeenCalledWith('new search');
        });
    });

    it('shows clear button when value is not empty', () => {
        render(
            <SearchBar
                value="search term"
                onChange={mockOnChange}
                placeholder="Search..."
            />
        );

        expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });

    it('hides clear button when value is empty', () => {
        render(
            <SearchBar
                value=""
                onChange={mockOnChange}
                placeholder="Search..."
            />
        );

        expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
    });

    it('clears the input when clear button is clicked', () => {
        render(
            <SearchBar
                value="search term"
                onChange={mockOnChange}
                placeholder="Search..."
            />
        );

        const clearButton = screen.getByRole('button', { name: /clear/i });
        fireEvent.click(clearButton);

        expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('applies custom className', () => {
        const { container } = render(
            <SearchBar
                value=""
                onChange={mockOnChange}
                placeholder="Search..."
                className="custom-class"
            />
        );

        expect(container.firstChild).toHaveClass('custom-class');
    });
}); 