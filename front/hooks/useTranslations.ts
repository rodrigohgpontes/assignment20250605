import {
    useQuery,
    useMutation,
    useQueryClient,
    UseQueryOptions,
    UseMutationOptions,
} from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import {
    TranslationKey,
    UpdateTranslationRequest,
    BulkUpdateRequest,
    CreateTranslationKeyRequest,
} from '../lib/types';

// Query Keys
export const queryKeys = {
    translationKeys: ['translation-keys'] as const,
    translationKey: (id: string) => ['translation-keys', id] as const,
};

export function useTranslationKeys(
    options?: Omit<UseQueryOptions<TranslationKey[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: queryKeys.translationKeys,
        queryFn: async () => {
            const result = await apiClient.getTranslationKeys();
            return result || [];
        },
        ...options,
    });
}

export function useTranslationKey(
    id: string,
    options?: Omit<UseQueryOptions<TranslationKey>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: queryKeys.translationKey(id),
        queryFn: () => apiClient.getTranslationKey(id),
        enabled: !!id,
        ...options,
    });
}
export function useUpdateTranslation(
    options?: UseMutationOptions<
        TranslationKey,
        Error,
        { keyId: string; locale: string; data: UpdateTranslationRequest; }
    >
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ keyId, locale, data }) =>
            apiClient.updateTranslation(keyId, locale, data),
        onSuccess: (updatedKey, { keyId }) => {
            queryClient.setQueryData(queryKeys.translationKey(keyId), updatedKey);
            queryClient.setQueryData(
                queryKeys.translationKeys,
                (oldData: TranslationKey[] | undefined) => {
                    if (!oldData) return [updatedKey];
                    return oldData.map(key => key.id === keyId ? updatedKey : key);
                }
            );
        },
        ...options,
    });
}

export function useBulkUpdateTranslations(
    options?: UseMutationOptions<
        { updated_count: number; },
        Error,
        BulkUpdateRequest
    >
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => apiClient.bulkUpdateTranslations(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.translationKeys,
            });
        },
        ...options,
    });
}

export function useCreateTranslationKey(
    options?: UseMutationOptions<
        TranslationKey,
        Error,
        CreateTranslationKeyRequest
    >
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => apiClient.createTranslationKey(data),
        onSuccess: (newKey) => {
            queryClient.setQueryData(
                queryKeys.translationKeys,
                (oldData: TranslationKey[] | undefined) => {
                    if (!oldData) return [newKey];
                    return [...oldData, newKey];
                }
            );
            queryClient.setQueryData(queryKeys.translationKey(newKey.id), newKey);
        },
        ...options,
    });
}

export function useDeleteTranslationKey(
    options?: UseMutationOptions<void, Error, string>
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => apiClient.deleteTranslationKey(id),
        onSuccess: (_, deletedId) => {
            queryClient.setQueryData(
                queryKeys.translationKeys,
                (oldData: TranslationKey[] | undefined) => {
                    if (!oldData) return [];
                    return oldData.filter(key => key.id !== deletedId);
                }
            );
            queryClient.removeQueries({
                queryKey: queryKeys.translationKey(deletedId),
            });
        },
        ...options,
    });
} 