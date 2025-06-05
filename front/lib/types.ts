export interface Translation {
    value: string;
    updated_at: string;
    updated_by: string;
}

export interface TranslationKey {
    id: string;
    key: string;
    category: string;
    description?: string;
    translations: Record<string, Translation>;
    created_at: string;
    updated_at: string;
}

export interface TranslationKeyResponse {
    data: TranslationKey;
    message: string;
}

export interface TranslationKeysResponse {
    data: TranslationKey[];
    message: string;
}

export interface UpdateTranslationRequest {
    value: string;
    updated_by?: string;
}

export interface BulkUpdateRequest {
    updates: {
        key_id: string;
        locale: string;
        value: string;
        updated_by?: string;
    }[];
}

export interface CreateTranslationKeyRequest {
    key: string;
    category: string;
    description?: string;
    initial_translations?: Record<string, string>;
}

export interface SearchFilters {
    searchTerm: string;
    selectedCategory: string;
    selectedLocale: string;
}

export interface ApiError {
    detail: string;
    status_code: number;
} 