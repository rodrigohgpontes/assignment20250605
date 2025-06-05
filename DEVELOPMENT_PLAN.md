# Localization Manager - Development Plan

## Project Overview
Building a localization management feature with React/Next.js frontend and FastAPI backend. Time estimate: 2-3 hours.

## Current Structure Analysis
- **Frontend**: Next.js 15.3.3 with TypeScript, Tailwind CSS, React Query, Zustand
- **Backend**: FastAPI with complete CRUD endpoints for translation management
- **Database**: Supabase PostgreSQL with proper schema

## Phase 1: Environment Setup (15 minutes)

### 1.1 Backend Dependencies
- [x] Add Supabase client to requirements.txt
- [x] Add pytest for testing
- [x] Add pydantic for data models
- [x] Install dependencies and verify FastAPI server runs

### 1.2 Frontend Dependencies
- [x] Add React Query (@tanstack/react-query)
- [x] Add Zustand for state management
- [x] Add testing libraries (Jest, React Testing Library)
- [x] Install dependencies and verify Next.js runs

### 1.3 Database Setup
- [x] Create Supabase project (free tier) - Setup guide provided
- [x] Design and create database schema for translation keys
- [x] Set up environment variables for database connection

## Phase 2: Database Schema & Backend Core (30 minutes)

### 2.1 Database Schema
- [x] Database tables created (translation_keys and translations)

### 2.2 Backend Models & Database Integration
- [x] Create Pydantic models for TranslationKey and Translation
- [x] Set up Supabase client configuration
- [x] Create database service layer for queries

### 2.3 Enhanced Endpoints
- [x] Enhance existing endpoint to use real database
- [x] Add endpoint to get translation key by ID: `GET /translation-keys/{id}`
- [x] Add endpoint to list all translation keys: `GET /translation-keys`
- [x] Add endpoint to create/update translations: `POST/PUT /translation-keys/{id}/translations/{locale}`

## Phase 3: Backend Feature Enhancement (20 minutes)

### 3.1 Choose One Feature to Implement
**Selected: Bulk Update Endpoint** (most practical for UI)
- [x] Create `PUT /translation-keys/bulk` endpoint
- [x] Accept array of translation updates
- [x] Implement transaction handling
- [x] Add validation and error handling

### 3.2 Backend Tests
- [x] Test database queries with sample data
- [x] Test bulk update functionality
- [x] Test error scenarios and validation
- [x] Test endpoint response formats

## Phase 4: Frontend State Management (25 minutes)

### 4.1 TypeScript Interfaces
- [x] Define TranslationKey interface matching backend
- [x] Define API response types
- [x] Define form and component prop types
- [x] Create comprehensive type system for all data models

### 4.2 React Query Setup
- [x] Configure QueryClient with proper defaults
- [x] Create API client with error handling
- [x] Create custom hooks for API calls:
  - `useTranslationKeys()` - fetch all translation keys
  - `useTranslationKey(id)` - fetch single translation key
  - `useUpdateTranslation()` - mutation for updates
  - `useBulkUpdateTranslations()` - bulk update mutation
  - `useCreateTranslationKey()` - create new keys
  - `useDeleteTranslationKey()` - delete keys
- [x] Implement proper cache invalidation and optimistic updates
- [x] Set up ReactQueryProvider in app layout

### 4.3 Zustand Store Design
- [x] Create comprehensive Zustand store for UI state management
- [x] Implement search and filter state management
- [x] Add editing state management with optimistic updates
- [x] Create selection state for bulk operations
- [x] Add loading and error state management
- [x] Implement optimized selectors for performance
- [x] Create filtering utility hook with debouncing
- [x] Add devtools integration for debugging

## Phase 5: Core UI Components (40 minutes)

### 5.1 TranslationKeyManager Component
- [x] Display list of translation keys in a table/grid format
- [x] Implement search functionality (real-time filtering)
- [x] Add category filter dropdown
- [x] Add locale filter dropdown for language selection
- [x] Show loading states and error handling
- [x] Responsive design with Tailwind CSS
- [x] Results summary with count information
- [x] Empty states for no data and no results

### 5.2 Translation Editor Component
- [x] Inline editing capability (click to edit)
- [x] Support for multiple locales per key
- [x] Auto-save functionality with error handling
- [x] Visual feedback for unsaved/saving/saved states
- [x] Cancel/confirm edit actions
- [x] Keyboard shortcuts (Ctrl+Enter to save, Esc to cancel)
- [x] Auto-focus and text selection for better UX
- [x] Dynamic textarea sizing for multiline content

### 5.3 Supporting Components
- [x] SearchBar component with debounced input and clear functionality
- [x] CategoryFilter component with dropdown and clear option
- [x] LocaleFilter component for language selection
- [x] LoadingSpinner component with multiple sizes and text option
- [x] ErrorMessage component with multiple variants (inline, toast, banner)

## Phase 6: UI Integration & Polish (30 minutes)

### 6.1 Main Page Integration
- [x] Replace default Next.js page with TranslationKeyManager
- [x] Implement proper layout and navigation
- [ ] Add proper page head metadata
- [ ] Ensure proper hydration and SSR compatibility

### 6.2 UX Enhancements
- [ ] Add keyboard shortcuts (Enter to save, Esc to cancel)
- [ ] Implement optimistic updates for better UX
- [ ] Add proper focus management
- [ ] Add success/error toast notifications

### 6.3 Performance Optimization
- [ ] Implement proper query invalidation strategies
- [ ] Add pagination or virtualization for large datasets
- [ ] Optimize re-renders with React.memo where appropriate

## Phase 7: Testing (20 minutes)

### 7.1 Frontend Tests
- [ ] Test TranslationKeyManager component rendering
- [ ] Test search and filter functionality
- [ ] Test inline editing behavior
- [ ] Test React Query integration and error handling
- [ ] Test Zustand store actions

### 7.2 Integration Tests
- [ ] Test full user workflows
- [ ] Test API integration with mock responses
- [ ] Test error scenarios and edge cases

## Phase 8: Final Polish & Documentation (10 minutes)

### 8.1 Code Quality
- [ ] ESLint/TypeScript error cleanup
- [ ] Code formatting and consistency
- [ ] Remove console.logs and debug code
- [ ] Add proper error boundaries

### 8.2 Documentation
- [ ] Update README with setup instructions
- [ ] Document API endpoints
- [ ] Add brief architecture explanation
- [ ] Note any trade-offs or future improvements

## Key Technical Decisions

### React Query Strategy
- Use React Query for server state management
- Implement proper cache invalidation
- Use optimistic updates for better UX

### Component Architecture
- Composition over inheritance
- Separate data fetching from presentation
- Reusable, testable components

### State Management Split
- Zustand for client-side UI state (search, filters)
- React Query for server state (translation data)

### Testing Strategy
- Focus on user behavior over implementation details
- Test critical user workflows
- Mock API calls for predictable testing

## Success Metrics
- [ ] All CRUD operations working with real database
- [ ] Smooth inline editing experience
- [ ] Fast search and filtering
- [ ] Proper error handling and loading states
- [ ] Clean, typed codebase
- [ ] Working test suite
- [ ] Professional UI/UX

## Risk Mitigation
- Start with minimal viable features and iterate
- Test database connection early
- Keep UI simple but functional
- Focus on core requirements over nice-to-haves
