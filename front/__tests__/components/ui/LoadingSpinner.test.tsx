import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders with default props', () => {
        render(<LoadingSpinner />);

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('Loading')).toBeInTheDocument();
    });

    it('renders with custom text', () => {
        render(<LoadingSpinner text="Loading translation keys..." />);

        expect(screen.getByText('Loading translation keys...')).toBeInTheDocument();
    });

    it('renders without text when text is empty', () => {
        render(<LoadingSpinner text="" />);

        expect(screen.queryByText(/Loading/)).toBeInTheDocument(); // Screen reader text
    });

    it('applies size variants correctly', () => {
        const { rerender } = render(<LoadingSpinner size="sm" />);
        const spinner = screen.getByRole('status').querySelector('[aria-hidden="true"]');
        expect(spinner).toHaveClass('w-4', 'h-4');

        rerender(<LoadingSpinner size="md" />);
        const spinnerMd = screen.getByRole('status').querySelector('[aria-hidden="true"]');
        expect(spinnerMd).toHaveClass('w-6', 'h-6');

        rerender(<LoadingSpinner size="lg" />);
        const spinnerLg = screen.getByRole('status').querySelector('[aria-hidden="true"]');
        expect(spinnerLg).toHaveClass('w-8', 'h-8');
    });

    it('applies custom className', () => {
        render(<LoadingSpinner className="custom-class" />);

        expect(screen.getByRole('status')).toHaveClass('custom-class');
    });
}); 