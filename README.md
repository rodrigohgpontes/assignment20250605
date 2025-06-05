# Localization Management System

A full-stack localization management system built with Next.js, FastAPI, and Supabase. This application allows users to manage translation keys and their values across multiple languages with an intuitive interface.

## Features

- **Translation Key Management**: Create, update, and delete translation keys with categories
- **Multi-language Support**: Add translations for different locales
- **Inline Editing**: Edit translations directly in the interface
- **Search & Filter**: Find translations by key, category, or locale
- **Bulk Operations**: Update multiple translations at once
- **Real-time Updates**: Changes are reflected immediately
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- **Next.js 15.3.3** with TypeScript
- **Tailwind CSS** for styling
- **React Query** for server state management
- **Zustand** for client state management
- **Jest** and **React Testing Library** for testing

### Backend
- **FastAPI** with Python
- **Supabase** (PostgreSQL) for database
- **Pydantic** for data validation
- **Pytest** for testing

## Project Structure

```
├── front/                    # Next.js frontend application
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Zustand store
│   ├── lib/                # Utility functions
│   └── __tests__/          # Frontend tests
├── api/                     # FastAPI backend application
│   ├── src/                # Source code
│   └── tests/              # Backend tests
└── database/               # Database schema and migrations
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Supabase account (free tier)

### Backend Setup

1. **Navigate to the API directory**:
   ```bash
   cd api
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   ```bash
   cp environment.template .env
   ```
   Edit `.env` with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   ```

4. **Run database migrations**:
   ```bash
   # Execute the SQL scripts in database/ directory in your Supabase SQL editor
   ```

5. **Start the FastAPI server**:
   ```bash
   uvicorn src.localization_management_api.main:app --reload
   ```

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd front
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp environment.template .env.local
   ```
   Edit `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## API Endpoints

### Translation Keys
- `GET /translation-keys` - List all translation keys
- `POST /translation-keys` - Create a new translation key
- `GET /translation-keys/{id}` - Get a specific translation key
- `PUT /translation-keys/{id}` - Update a translation key
- `DELETE /translation-keys/{id}` - Delete a translation key

### Translations
- `POST /translation-keys/{id}/translations/{locale}` - Create/update a translation
- `GET /translation-keys/{id}/translations` - Get all translations for a key
- `PUT /translation-keys/bulk` - Bulk update translations

### Utility
- `GET /health` - Health check endpoint
- `GET /categories` - Get all categories
- `GET /localizations` - Get localized content (legacy endpoint)

## Testing

### Frontend Tests
```bash
cd front
npm test
```

Tests: 36 passing tests across 5 test suites ✅

### Backend Tests
```bash
cd api
python -m pytest
```

Tests: 30 passing tests covering database and API endpoints ✅

**Note**: All builds and tests run without warnings. Frontend uses Next.js 15 viewport configuration, and backend uses modern Pydantic ConfigDict.

## Architecture Decisions

### State Management
- **React Query**: Handles server state, caching, and synchronization
- **Zustand**: Manages client-side UI state (search, filters, editing states)
- **Separation of Concerns**: Server state and client state are handled separately

### Component Architecture
- **Composition over Inheritance**: Components are designed to be composable
- **Single Responsibility**: Each component has a focused purpose
- **TypeScript**: Full type safety throughout the application

### Performance Optimizations
- **React Query Caching**: Reduces API calls with intelligent caching
- **Optimistic Updates**: UI updates immediately before server confirmation
- **Debounced Search**: Prevents excessive API calls during search
- **Memoization**: Strategic use of React.memo and useMemo

## Trade-offs and Future Improvements

### Current Limitations
- **No Authentication**: For simplicity, no user authentication is implemented
- **Basic Error Handling**: Error messages could be more user-friendly
- **No File Upload**: Translations must be entered manually
- **No Translation Memory**: No suggestions based on similar translations

### Potential Enhancements
- **Import/Export**: CSV/JSON import/export functionality
- **Translation Memory**: AI-powered translation suggestions
- **Pluralization**: Support for plural forms
- **Version Control**: Track changes and rollback capability
- **Advanced Permissions**: Role-based access control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License. 