from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
from uuid import UUID
import csv
import io
from mangum import Mangum

from .config import settings
from .database import DatabaseService
from .models import (
    TranslationKey,
    Translation,
    TranslationKeyCreate,
    TranslationKeyUpdate,
    TranslationCreate,
    BulkUpdateRequest,
    BulkTranslationUpdate,
    CSVBulkImportRequest,
    APIResponse
)

app = FastAPI(
    title="Localization Management API",
    description="API for managing translation keys and their translations",
    version="1.0.0",
    root_path="/api"
)

handler = Mangum(app)

# Lazy initialization of database service
_db_service = None

def get_db_service():
    global _db_service
    if _db_service is None:
        _db_service = DatabaseService()
    return _db_service

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Enhanced original endpoint - now uses real database
@app.get("/localizations/{project_id}/{locale}")
async def get_localizations(project_id: str, locale: str) -> Dict[str, Any]:
    """
    Get all localizations for a project and locale
    This is the original endpoint enhanced to use real database
    """
    try:
        # Get all translation keys
        db_service = get_db_service()
        translation_keys = await db_service.get_translation_keys()
        
        localizations = {}
        for key in translation_keys:
            # Find translation for the specified locale
            for translation in key.translations:
                if translation.language_code == locale:
                    localizations[key.key] = translation.value
                    break
        
        return {
            "project_id": project_id,
            "locale": locale,
            "localizations": localizations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch localizations: {str(e)}")


# Translation Keys endpoints

@app.get("/translation-keys", response_model=List[TranslationKey])
async def get_translation_keys(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search term for keys or descriptions")
) -> List[TranslationKey]:
    """Get all translation keys with optional filtering"""
    try:
        db_service = get_db_service()
        if search:
            return await db_service.search_translation_keys(search)
        else:
            return await db_service.get_translation_keys(category)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch translation keys: {str(e)}")


# Bulk operations

@app.put("/translation-keys/bulk", response_model=APIResponse)
async def bulk_update_translations(bulk_request: BulkUpdateRequest) -> APIResponse:
    """
    Bulk update multiple translations at once
    This is useful for updating many translations simultaneously from the UI
    """
    try:
        if not bulk_request.updates:
            raise HTTPException(status_code=400, detail="No updates provided")
        
        # Validate that all translation keys exist
        unique_key_ids = set(update.translation_key_id for update in bulk_request.updates)
        
        db_service = get_db_service()
        for key_id in unique_key_ids:
            translation_key = await db_service.get_translation_key(key_id)
            if not translation_key:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Translation key with ID {key_id} not found"
                )
        
        # Perform bulk update
        success = await db_service.bulk_update_translations(bulk_request.updates)
        
        if success:
            return APIResponse(
                success=True, 
                message=f"Successfully updated {len(bulk_request.updates)} translations",
                data={"updated_count": len(bulk_request.updates)}
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to perform bulk update")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to bulk update translations: {str(e)}")


@app.post("/translation-keys/bulk/csv", response_model=APIResponse)
async def bulk_import_from_csv(csv_request: CSVBulkImportRequest) -> APIResponse:
    """
    Bulk import translation keys and translations from CSV data
    Expected CSV format: key,category,description,en,es,pt
    """
    try:
        # Parse CSV data
        csv_reader = csv.DictReader(io.StringIO(csv_request.csv_data))
        
        db_service = get_db_service()
        created_keys = 0
        updated_keys = 0
        translation_updates = []
        
        for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 since row 1 is header
            try:
                # Validate required fields
                if not row.get('key') or not row.get('category'):
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Row {row_num}: 'key' and 'category' are required fields"
                    )
                
                key = row['key'].strip()
                category = row['category'].strip()
                description = row.get('description', '').strip() or None
                
                # Check if translation key exists
                existing_key = await db_service.get_translation_key_by_key(key)
                
                if not existing_key:
                    # Create new translation key
                    new_key = TranslationKeyCreate(
                        key=key,
                        category=category,
                        description=description
                    )
                    created_key = await db_service.create_translation_key(new_key)
                    key_id = created_key.id
                    created_keys += 1
                else:
                    # Update existing key if category or description changed
                    if existing_key.category != category or existing_key.description != description:
                        update_data = TranslationKeyUpdate(
                            category=category,
                            description=description
                        )
                        await db_service.update_translation_key(existing_key.id, update_data)
                        updated_keys += 1
                    key_id = existing_key.id
                
                # Prepare translation updates for en, es, pt
                for lang_code in ['en', 'es', 'pt']:
                    value = row.get(lang_code, '').strip()
                    if value:  # Only add non-empty translations
                        translation_updates.append(
                            BulkTranslationUpdate(
                                translation_key_id=key_id,
                                language_code=lang_code,
                                value=value,
                                updated_by=csv_request.updated_by
                            )
                        )
                        
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Error processing row {row_num}: {str(e)}"
                )
        
        # Perform bulk translation updates
        translation_success = True
        if translation_updates:
            translation_success = await db_service.bulk_update_translations(translation_updates)
        
        if not translation_success:
            raise HTTPException(status_code=500, detail="Failed to update translations")
        
        return APIResponse(
            success=True,
            message=f"CSV import completed successfully",
            data={
                "created_keys": created_keys,
                "updated_keys": updated_keys,
                "translations_updated": len(translation_updates),
                "total_rows_processed": created_keys + updated_keys
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to import CSV: {str(e)}")


@app.get("/translation-keys/{key_id}", response_model=TranslationKey)
async def get_translation_key(key_id: UUID) -> TranslationKey:
    """Get a single translation key by ID"""
    try:
        db_service = get_db_service()
        translation_key = await db_service.get_translation_key(key_id)
        if not translation_key:
            raise HTTPException(status_code=404, detail="Translation key not found")
        return translation_key
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch translation key: {str(e)}")


@app.post("/translation-keys", response_model=TranslationKey)
async def create_translation_key(translation_key: TranslationKeyCreate) -> TranslationKey:
    """Create a new translation key"""
    try:
        db_service = get_db_service()
        # Check if key already exists
        existing_key = await db_service.get_translation_key_by_key(translation_key.key)
        if existing_key:
            raise HTTPException(status_code=400, detail="Translation key already exists")
        
        return await db_service.create_translation_key(translation_key)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create translation key: {str(e)}")


@app.put("/translation-keys/{key_id}", response_model=TranslationKey)
async def update_translation_key(key_id: UUID, update_data: TranslationKeyUpdate) -> TranslationKey:
    """Update an existing translation key"""
    try:
        db_service = get_db_service()
        translation_key = await db_service.update_translation_key(key_id, update_data)
        if not translation_key:
            raise HTTPException(status_code=404, detail="Translation key not found")
        return translation_key
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update translation key: {str(e)}")


@app.delete("/translation-keys/{key_id}", response_model=APIResponse)
async def delete_translation_key(key_id: UUID) -> APIResponse:
    """Delete a translation key and all its translations"""
    try:
        db_service = get_db_service()
        # Check if key exists first
        existing_key = await db_service.get_translation_key(key_id)
        if not existing_key:
            raise HTTPException(status_code=404, detail="Translation key not found")
        
        success = await db_service.delete_translation_key(key_id)
        if success:
            return APIResponse(success=True, message="Translation key deleted successfully")
        else:
            raise HTTPException(status_code=500, detail="Failed to delete translation key")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete translation key: {str(e)}")


# Translations endpoints

@app.get("/translation-keys/{key_id}/translations", response_model=List[Translation])
async def get_translations_for_key(key_id: UUID) -> List[Translation]:
    """Get all translations for a specific translation key"""
    try:
        db_service = get_db_service()
        # Check if key exists
        translation_key = await db_service.get_translation_key(key_id)
        if not translation_key:
            raise HTTPException(status_code=404, detail="Translation key not found")
        
        return await db_service.get_translations_for_key(key_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch translations: {str(e)}")


@app.get("/translation-keys/{key_id}/translations/{locale}", response_model=Translation)
async def get_translation(key_id: UUID, locale: str) -> Translation:
    """Get a specific translation for a key and language"""
    try:
        db_service = get_db_service()
        translation = await db_service.get_translation(key_id, locale)
        if not translation:
            raise HTTPException(status_code=404, detail="Translation not found")
        return translation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch translation: {str(e)}")


@app.put("/translation-keys/{key_id}/translations/{locale}", response_model=Translation)
async def upsert_translation(key_id: UUID, locale: str, translation_data: TranslationCreate) -> Translation:
    """Create or update a translation for a specific key and language"""
    try:
        db_service = get_db_service()
        # Check if key exists
        translation_key = await db_service.get_translation_key(key_id)
        if not translation_key:
            raise HTTPException(status_code=404, detail="Translation key not found")
        
        return await db_service.upsert_translation(key_id, locale, translation_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upsert translation: {str(e)}")


@app.post("/translation-keys/{key_id}/translations/{locale}", response_model=Translation)
async def create_translation(key_id: UUID, locale: str, translation_data: TranslationCreate) -> Translation:
    """Create a new translation for a specific key and language"""
    try:
        db_service = get_db_service()
        # Check if key exists
        translation_key = await db_service.get_translation_key(key_id)
        if not translation_key:
            raise HTTPException(status_code=404, detail="Translation key not found")
        
        # Check if translation already exists
        existing_translation = await db_service.get_translation(key_id, locale)
        if existing_translation:
            raise HTTPException(status_code=400, detail="Translation already exists for this language")
        
        return await db_service.upsert_translation(key_id, locale, translation_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create translation: {str(e)}")


# Utility endpoints

@app.get("/categories", response_model=List[str])
async def get_categories() -> List[str]:
    """Get all unique categories"""
    try:
        db_service = get_db_service()
        return await db_service.get_categories()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch categories: {str(e)}")


@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint"""
    return {"status": "healthy", "message": "Localization Management API is running"}
