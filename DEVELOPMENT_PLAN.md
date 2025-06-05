# Localization Manager - Development Plan

## Project Overview
Building a localization management feature with React/Next.js frontend and FastAPI backend. Time estimate: 2-3 hours.

## Current Structure Analysis
- **Frontend**: Next.js 15.3.3 with TypeScript, Tailwind CSS (React Query and Zustand need to be added)
- **Backend**: Basic FastAPI with one endpoint `/localizations/{project_id}/{locale}`
- **Missing**: Supabase integration, React Query, Zustand, proper database schema

## Phase 1: Environment Setup (15 minutes)

### 1.1 Backend Dependencies
- [ ] Add Supabase client to requirements.txt
- [ ] Add pytest for testing
- [ ] Add pydantic for data models
- [ ] Install dependencies and verify FastAPI server runs

### 1.2 Frontend Dependencies
- [ ] Add React Query (@tanstack/react-query)
- [ ] Add Zustand for state management
- [ ] Add testing libraries (Jest, React Testing Library)
- [ ] Install dependencies and verify Next.js runs

### 1.3 Database Setup
- [ ] Create Supabase project (free tier) - Setup guide provided
- [ ] Design and create database schema for translation keys
- [ ] Set up environment variables for database connection

## Phase 2: Database Schema & Backend Core (30 minutes)

### 2.1 Database Schema
```sql
-- translation_keys table
CREATE TABLE translation_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- translations table
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  translation_key_id UUID REFERENCES translation_keys(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT NOT NULL,
  UNIQUE(translation_key_id, language_code)
);
```

### 2.2 Backend Models & Database Integration
- [ ] Create Pydantic models for TranslationKey and Translation
- [ ] Set up Supabase client configuration
- [ ] Create database service layer for queries
- [ ] Add sample data to database

### 2.3 Enhanced Endpoints
- [ ] Enhance existing endpoint to use real database
- [ ] Add endpoint to get translation key by ID: `GET /translation-keys/{id}`
- [ ] Add endpoint to list all translation keys: `GET /translation-keys`
- [ ] Add endpoint to create/update translations: `POST/PUT /translation-keys/{id}/translations/{locale}`

## Phase 3: Backend Feature Enhancement (20 minutes)

### 3.1 Choose One Feature to Implement
**Selected: Bulk Update Endpoint** (most practical for UI)
- [ ] Create `PUT /translation-keys/bulk` endpoint
- [ ] Accept array of translation updates
- [ ] Implement transaction handling
- [ ] Add validation and error handling

### 3.2 Backend Tests
- [ ] Test database queries with sample data
- [ ] Test bulk update functionality
- [ ] Test error scenarios and validation
- [ ] Test endpoint response formats

## Phase 4: Frontend State Management (25 minutes)

### 4.1 Zustand Store Design
```typescript
interface TranslationStore {
  translationKeys: TranslationKey[];
  loading: boolean;
  searchTerm: string;
  selectedCategory: string;
  // Actions
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  updateTranslation: (keyId: string, locale: string, value: string) => void;
}
```

### 4.2 React Query Setup
- [ ] Configure QueryClient with proper defaults
- [ ] Create custom hooks for API calls:
  - `useTranslationKeys()` - fetch all translation keys
  - `useTranslationKey(id)` - fetch single translation key
  - `useUpdateTranslation()` - mutation for updates
  - `useBulkUpdateTranslations()` - bulk update mutation

### 4.3 TypeScript Interfaces
- [ ] Define TranslationKey interface matching backend
- [ ] Define API response types
- [ ] Define form and component prop types

## Phase 5: Core UI Components (40 minutes)

### 5.1 TranslationKeyManager Component
- [ ] Display list of translation keys in a table/grid format
- [ ] Implement search functionality (real-time filtering)
- [ ] Add category filter dropdown
- [ ] Show loading states and error handling
- [ ] Responsive design with Tailwind CSS

### 5.2 Translation Editor Component
- [ ] Inline editing capability (click to edit)
- [ ] Support for multiple locales per key
- [ ] Auto-save functionality with debouncing
- [ ] Visual feedback for unsaved/saving/saved states
- [ ] Cancel/confirm edit actions

### 5.3 Supporting Components
- [ ] SearchBar component
- [ ] CategoryFilter component
- [ ] LoadingSpinner component
- [ ] ErrorMessage component

## Phase 6: UI Integration & Polish (30 minutes)

### 6.1 Main Page Integration
- [ ] Replace default Next.js page with TranslationKeyManager
- [ ] Implement proper layout and navigation
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
