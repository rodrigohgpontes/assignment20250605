import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CSVBulkImport } from '../../components/CSVBulkImport';
import { useTranslationStore } from '../../store/translationStore';
import { apiClient } from '../../lib/api';

// Mock the translation store
jest.mock('../../store/translationStore');
const mockUseTranslationStore = useTranslationStore as jest.MockedFunction<typeof useTranslationStore>;

// Mock the API client
jest.mock('../../lib/api');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Mock the store implementation
const mockAddToast = jest.fn();

describe('CSVBulkImport', () => {
    beforeEach(() => {
        mockUseTranslationStore.mockReturnValue({
            addToast: mockAddToast,
        } as ReturnType<typeof useTranslationStore>);

        mockApiClient.bulkImportFromCSV = jest.fn();
        jest.clearAllMocks();
    });

    it('renders CSV bulk import form', () => {
        render(<CSVBulkImport />);

        expect(screen.getByText('CSV Bulk Import')).toBeInTheDocument();
        expect(screen.getByText('Expected CSV Format:')).toBeInTheDocument();
        expect(screen.getByLabelText('CSV Data')).toBeInTheDocument();
        expect(screen.getByText('Import CSV')).toBeInTheDocument();
        expect(screen.getByText('Add Dummy Data')).toBeInTheDocument();
        expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('adds dummy data when button is clicked', () => {
        render(<CSVBulkImport />);

        const textarea = screen.getByLabelText('CSV Data') as HTMLTextAreaElement;
        const dummyDataButton = screen.getByText('Add Dummy Data');

        expect(textarea.value).toBe('');

        fireEvent.click(dummyDataButton);

        expect(textarea.value).toContain('key,category,description,en,es,pt');
        expect(textarea.value).toContain('app.title,general');
        expect(textarea.value).toContain('button.save,buttons');
    });

    it('clears textarea when clear button is clicked', () => {
        render(<CSVBulkImport />);

        const textarea = screen.getByLabelText('CSV Data') as HTMLTextAreaElement;
        const clearButton = screen.getByText('Clear');
        const dummyDataButton = screen.getByText('Add Dummy Data');

        // Add some data first
        fireEvent.click(dummyDataButton);
        expect(textarea.value).not.toBe('');

        // Clear it
        fireEvent.click(clearButton);
        expect(textarea.value).toBe('');
    });

    it('calls API and shows success message on successful import', async () => {
        const mockResult = {
            success: true,
            message: 'Import successful',
            data: {
                created_keys: 2,
                updated_keys: 0,
                translations_updated: 6,
                total_rows_processed: 2
            }
        };

        mockApiClient.bulkImportFromCSV.mockResolvedValue(mockResult);

        render(<CSVBulkImport />);

        const textarea = screen.getByLabelText('CSV Data') as HTMLTextAreaElement;
        const importButton = screen.getByText('Import CSV');

        // Add CSV data
        const csvData = 'key,category,description,en,es,pt\ntest.key,test,Test,Test,Prueba,Teste';
        fireEvent.change(textarea, { target: { value: csvData } });

        // Click import
        fireEvent.click(importButton);

        await waitFor(() => {
            expect(mockApiClient.bulkImportFromCSV).toHaveBeenCalledWith(csvData, 'csv_import');
            expect(mockAddToast).toHaveBeenCalledWith('CSV import completed successfully!', 'success');
            expect(screen.getByText('✅ Import Successful')).toBeInTheDocument();
            expect(screen.getByText('• Created keys: 2')).toBeInTheDocument();
        });
    });

    it('shows error message on failed import', async () => {
        const errorMessage = 'Invalid CSV format';
        mockApiClient.bulkImportFromCSV.mockRejectedValue(new Error(errorMessage));

        render(<CSVBulkImport />);

        const textarea = screen.getByLabelText('CSV Data') as HTMLTextAreaElement;
        const importButton = screen.getByText('Import CSV');

        // Add CSV data
        fireEvent.change(textarea, { target: { value: 'invalid,csv' } });

        // Click import
        fireEvent.click(importButton);

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(errorMessage, 'error');
            expect(screen.getByText('❌ Import Failed')).toBeInTheDocument();
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    it('disables import button when no CSV data', () => {
        render(<CSVBulkImport />);

        const importButton = screen.getByText('Import CSV') as HTMLButtonElement;
        expect(importButton.disabled).toBe(true);

        const textarea = screen.getByLabelText('CSV Data') as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: 'some,data' } });

        expect(importButton.disabled).toBe(false);
    });
}); 