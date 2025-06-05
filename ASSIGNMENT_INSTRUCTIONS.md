# Full Stack Localization Manager - Take Home Assignment

## Overview

Build a focused localization management feature that allows users to manage translation keys and their values. This is designed to evaluate your ability to create functional React components, make targeted backend improvements, and design small but effective systems.

## Tech Stack Requirements

- **Frontend**: Next.js 14+ with TypeScript, React Query, Zustand (boilerplate provided)
- **Backend**: FastAPI with Python (boilerplate provided)
- **Database**: Supabase (PostgreSQL)
    - Please create a personal Supabase instance using their free tier.

## Time Estimate

2-3 hours

## What We'll Provide

- FastAPI boilerplate with basic CRUD endpoints
- Database schema and Supabase setup
- Starter Next.js project structure

## Your Tasks

### Frontend

### 1. Translation Key Management Component

Create a `TranslationKeyManager` component that:

- Displays a list of translation keys with their values
- Includes search/filter functionality

### 2. State Management with Zustand

Design and implement a Zustand store for the UI.

### 3. Translation Editor Component

Build an inline editing interface that allows editing translations directly in the list view.

### 4. Frontend Tests

Build a simple suite of frontend tests for the created components.

### Backend (Secondary Focus)

### 1. Enhance Existing Endpoints

You'll receive a python FastAPI server with a basic CRUD endpoint. Your task is to **make sure that we can retrieve** localized text from the server.

- Make sure we can query both by id and by list
- Use the python supabase client to query a supabase table

### 2. Add One New Feature

Implement **one** of these features with tests:

- Bulk update endpoint for multiple translations
- Translation validation endpoint (check for missing interpolations)
- Simple analytics endpoint (translation completion percentages)

### 3. Write Targeted Tests

Write focused tests for:

- Your new endpoint functionality
- Database query performance with sample data

---

## Specific Technical Requirements

### React Query Usage

- Implement proper query keys and invalidation strategies

### Zustand Store Design

- Create a clean, typed store interface

### Component Architecture

- Build reusable, composable components
- Implement proper TypeScript interfaces

## Deliverables

### 1. Working Code

- Functional React components with the specified features
- Enhanced FastAPI endpoints with tests
- Clear commit history showing your thought process

### 2. Working Tests

Explain your approach to testing, the cases you are considering, and make sure all the tests work and are repeatable.

⚠️ **Add Your Response Here:** https://docs.google.com/forms/d/e/1FAIpQLSf6x-feoN9JYBUXD8pyjB7CXvvo_sMsJOG3Mx5YOpPBLa1e7w/viewform?usp=sharing&ouid=106561496989765490584

---

## Sample Data Structure

```tsx
interface TranslationKey {
  id: string;
  key: string; // e.g., "button.save"
  category: string; // e.g., "buttons"
  description?: string;
  translations: {
    [languageCode: string]: {
      value: string;
      updatedAt: string;
      updatedBy: string;
    }
  }
}

```

## Success Criteria

**We're looking for:**

- Functional components that demonstrate React Query and Zustand expertise
- Really damn good UI design (focus on functionality)
- Comprehensive feature completeness
- Clean, testable code improvements to the backend
- Evidence of considering user experience and performance

**We're NOT looking for:**

- Complex architectural patterns
- Extensive documentation

## Submission

- GitHub repository with clear setup instructions
- Brief README explaining your approach and any trade-offs
- Deployed demo (optional but appreciated)

## Questions?

Reach out if you need clarification on the provided boilerplate or have questions about scope. We want to see your practical development skills, not your ability to build everything from scratch.