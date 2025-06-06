'use client';

import React, { useState, useEffect } from 'react';
import { TranslationKeyManager } from '../components/TranslationKeyManager';
import { CSVBulkImport } from '../components/CSVBulkImport';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../hooks/useTranslations';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'manage' | 'import'>('manage');
  const queryClient = useQueryClient();

  // Refresh translation data when switching to manage tab
  useEffect(() => {
    if (activeTab === 'manage') {
      queryClient.invalidateQueries({ queryKey: queryKeys.translationKeys });
    }
  }, [activeTab, queryClient]);
  return (
    <div className="flex flex-col min-h-screen bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="bg-white dark:bg-stone-800 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-stone-700 dark:text-stone-200">
                Helium Localization Manager
              </span>
            </div>
            <nav className="flex items-center space-x-4">
              <div className="text-sm p-2 border border-dashed border-stone-300 dark:border-stone-600 rounded-md text-stone-500 dark:text-stone-400">
                [User Profile Placeholder]
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            Translation Management
          </h1>
          <p className="text-stone-600 dark:text-stone-400">
            Manage your application&apos;s translation keys and values across different languages.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-stone-200 dark:border-stone-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('manage')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
                  }`}
              >
                Manage Translations
              </button>
              <button
                onClick={() => setActiveTab('import')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'import'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
                  }`}
              >
                CSV Bulk Import
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'manage' && <TranslationKeyManager />}
        {activeTab === 'import' && <CSVBulkImport />}
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-stone-500 dark:text-stone-400">
          <p>&copy; {new Date().getFullYear()} Helium Contractor Assignment. Good luck!</p>
          <div className="mt-1">
            <a href="#" className="hover:underline mx-2">Documentation (Placeholder)</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
