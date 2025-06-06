'use client';

import React, { useState, useCallback } from 'react';
import { useTranslationStore } from '../store/translationStore';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { apiClient } from '../lib/api';

interface CSVImportResult {
    success: boolean;
    message: string;
    data?: {
        created_keys: number;
        updated_keys: number;
        translations_updated: number;
        total_rows_processed: number;
    };
}

export function CSVBulkImport() {
    const [csvData, setCsvData] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<CSVImportResult | null>(null);
    const { addToast } = useTranslationStore();

    const handleImport = useCallback(async () => {
        if (!csvData.trim()) {
            addToast('Please paste CSV data before importing', 'error');
            return;
        }

        setIsImporting(true);
        setImportResult(null);

        try {
            const result = await apiClient.bulkImportFromCSV(csvData, 'csv_import');

            setImportResult(result);
            addToast('CSV import completed successfully!', 'success');
            setCsvData(''); // Clear the textarea after successful import
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setImportResult({
                success: false,
                message: errorMessage
            });
            addToast(errorMessage, 'error');
        } finally {
            setIsImporting(false);
        }
    }, [csvData, addToast]);

    const handleClear = useCallback(() => {
        setCsvData('');
        setImportResult(null);
    }, []);

    const sampleCSV = `key,category,description,en,es,pt
button.save,buttons,Save button text,Save,Guardar,Salvar
button.cancel,buttons,Cancel button text,Cancel,Cancelar,Cancelar
nav.home,navigation,Home link,Home,Inicio,Início
message.welcome,messages,Welcome message,Welcome!,¡Bienvenido!,Bem-vindo!`;

    const dummyCSV = `key,category,description,en,es,pt
app.title,general,Application title,Localization Manager,Gestor de Localización,Gerenciador de Localização
app.subtitle,general,Application subtitle,Manage your translations,Gestiona tus traducciones,Gerencie suas traduções
button.save,buttons,Save button,Save,Guardar,Salvar
button.cancel,buttons,Cancel button,Cancel,Cancelar,Cancelar
button.edit,buttons,Edit button,Edit,Editar,Editar
button.delete,buttons,Delete button,Delete,Eliminar,Excluir
button.add,buttons,Add button,Add,Agregar,Adicionar
nav.home,navigation,Home navigation,Home,Inicio,Início
nav.settings,navigation,Settings navigation,Settings,Configuración,Configurações
nav.profile,navigation,Profile navigation,Profile,Perfil,Perfil
nav.logout,navigation,Logout navigation,Logout,Cerrar Sesión,Sair
message.welcome,messages,Welcome message,Welcome to the app!,¡Bienvenido a la aplicación!,Bem-vindo ao aplicativo!
message.error,messages,Error message,An error occurred,Ocurrió un error,Ocorreu um erro
message.success,messages,Success message,Operation completed successfully,Operación completada exitosamente,Operação concluída com sucesso
message.confirm,messages,Confirmation message,Are you sure?,¿Estás seguro?,Tem certeza?
form.email,forms,Email field label,Email,Correo electrónico,E-mail
form.password,forms,Password field label,Password,Contraseña,Senha
form.name,forms,Name field label,Name,Nombre,Nome
form.phone,forms,Phone field label,Phone,Teléfono,Telefone
form.address,forms,Address field label,Address,Dirección,Endereço
validation.required,validation,Required field error,This field is required,Este campo es obligatorio,Este campo é obrigatório
validation.email,validation,Invalid email error,Please enter a valid email,Por favor ingrese un email válido,Por favor insira um e-mail válido
validation.minLength,validation,Minimum length error,Minimum length is {min} characters,La longitud mínima es {min} caracteres,O comprimento mínimo é {min} caracteres
status.active,status,Active status,Active,Activo,Ativo
status.inactive,status,Inactive status,Inactive,Inactivo,Inativo
status.pending,status,Pending status,Pending,Pendiente,Pendente`;

    const handleAddDummyData = useCallback(() => {
        setCsvData(dummyCSV);
        setImportResult(null);
    }, [dummyCSV]);

    return (
        <div className="bg-white dark:bg-stone-800 rounded-lg shadow p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                    CSV Bulk Import
                </h2>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                    Import translation keys and their translations (EN, ES, PT) from CSV data.
                </p>
            </div>

            {/* CSV Format Info */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Expected CSV Format:
                </h3>
                <pre className="text-xs text-blue-800 dark:text-blue-200 font-mono whitespace-pre-wrap">
                    {sampleCSV}
                </pre>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                    • Required columns: <code>key</code>, <code>category</code><br />
                    • Optional columns: <code>description</code>, <code>en</code>, <code>es</code>, <code>pt</code><br />
                    • Existing keys will be updated, new keys will be created
                </p>
            </div>

            {/* CSV Input */}
            <div className="mb-6">
                <label
                    htmlFor="csv-data"
                    className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2"
                >
                    CSV Data
                </label>
                <textarea
                    id="csv-data"
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    placeholder="Paste your CSV data here..."
                    rows={10}
                    className="block w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-500 dark:placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 mb-6">
                <button
                    onClick={handleImport}
                    disabled={isImporting || !csvData.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isImporting ? (
                        <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Importing...
                        </>
                    ) : (
                        'Import CSV'
                    )}
                </button>

                <button
                    onClick={handleAddDummyData}
                    disabled={isImporting}
                    className="inline-flex items-center px-4 py-2 border border-green-300 dark:border-green-600 text-sm font-medium rounded-md text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Add Dummy Data
                </button>

                <button
                    onClick={handleClear}
                    disabled={isImporting}
                    className="inline-flex items-center px-4 py-2 border border-stone-300 dark:border-stone-600 text-sm font-medium rounded-md text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Clear
                </button>
            </div>

            {/* Import Result */}
            {importResult && (
                <div className={`p-4 rounded-lg border ${importResult.success
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                    }`}>
                    <div className={`text-sm font-medium ${importResult.success
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-red-900 dark:text-red-100'
                        }`}>
                        {importResult.success ? '✅ Import Successful' : '❌ Import Failed'}
                    </div>
                    <div className={`text-sm mt-1 ${importResult.success
                        ? 'text-green-800 dark:text-green-200'
                        : 'text-red-800 dark:text-red-200'
                        }`}>
                        {importResult.message}
                    </div>

                    {importResult.success && importResult.data && (
                        <div className="text-xs text-green-700 dark:text-green-300 mt-2 space-y-1">
                            <div>• Created keys: {importResult.data.created_keys}</div>
                            <div>• Updated keys: {importResult.data.updated_keys}</div>
                            <div>• Translations updated: {importResult.data.translations_updated}</div>
                            <div>• Total rows processed: {importResult.data.total_rows_processed}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 