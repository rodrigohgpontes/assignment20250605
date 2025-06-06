import {
    TranslationKey,
    UpdateTranslationRequest,
    BulkUpdateRequest,
    CreateTranslationKeyRequest,
    ApiError,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const error: ApiError = await response.json();
                throw new Error(error.detail || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    async getTranslationKeys(): Promise<TranslationKey[]> {
        return await this.request<TranslationKey[]>('/translation-keys');
    }

    async getTranslationKey(id: string): Promise<TranslationKey> {
        return await this.request<TranslationKey>(`/translation-keys/${id}`);
    }

    async updateTranslation(
        keyId: string,
        locale: string,
        data: UpdateTranslationRequest
    ): Promise<TranslationKey> {
        await this.request(
            `/translation-keys/${keyId}/translations/${locale}`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    language_code: locale,
                    value: data.value,
                    updated_by: data.updated_by || 'user',
                }),
            }
        );

        return await this.getTranslationKey(keyId);
    }

    async bulkUpdateTranslations(data: BulkUpdateRequest): Promise<{ updated_count: number; }> {
        return await this.request<{ updated_count: number; }>('/translation-keys/bulk', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async createTranslationKey(data: CreateTranslationKeyRequest): Promise<TranslationKey> {
        return await this.request<TranslationKey>('/translation-keys', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deleteTranslationKey(id: string): Promise<void> {
        await this.request(`/translation-keys/${id}`, {
            method: 'DELETE',
        });
    }

    async bulkImportFromCSV(csvData: string, updatedBy: string = 'csv_import'): Promise<{
        success: boolean;
        message: string;
        data?: {
            created_keys: number;
            updated_keys: number;
            translations_updated: number;
            total_rows_processed: number;
        };
    }> {
        return await this.request('/translation-keys/bulk/csv', {
            method: 'POST',
            body: JSON.stringify({
                csv_data: csvData,
                updated_by: updatedBy,
            }),
        });
    }
}

export const apiClient = new ApiClient(); 