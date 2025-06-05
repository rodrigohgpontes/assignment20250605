from typing import List, Optional, Dict, Any
from uuid import UUID
from supabase import Client
from .config import get_supabase_client
from .models import (
    TranslationKey, 
    Translation, 
    TranslationKeyCreate, 
    TranslationKeyUpdate,
    TranslationCreate,
    TranslationUpdate,
    BulkTranslationUpdate
)


class DatabaseService:
    def __init__(self):
        try:
            self.client: Client = get_supabase_client()
        except Exception as e:
            import os
            if os.getenv("TESTING", "false").lower() == "true":
                self.client = None
            else:
                raise

    # Translation Keys CRUD operations
    
    async def get_translation_keys(self, category: Optional[str] = None) -> List[TranslationKey]:
        """Get all translation keys, optionally filtered by category"""
        try:
            query = self.client.table("translation_keys").select("*, translations(*)")
            
            if category:
                query = query.eq("category", category)
            
            response = query.execute()
            
            if response.data:
                return [TranslationKey(**item) for item in response.data]
            return []
        except Exception as e:
            raise Exception(f"Failed to fetch translation keys: {str(e)}")

    async def get_translation_key(self, key_id: UUID) -> Optional[TranslationKey]:
        """Get a single translation key by ID"""
        try:
            response = self.client.table("translation_keys").select(
                "*, translations(*)"
            ).eq("id", str(key_id)).execute()
            
            if response.data and len(response.data) > 0:
                return TranslationKey(**response.data[0])
            return None
        except Exception as e:
            raise Exception(f"Failed to fetch translation key: {str(e)}")

    async def get_translation_key_by_key(self, key: str) -> Optional[TranslationKey]:
        """Get a single translation key by key string"""
        try:
            response = self.client.table("translation_keys").select(
                "*, translations(*)"
            ).eq("key", key).execute()
            
            if response.data and len(response.data) > 0:
                return TranslationKey(**response.data[0])
            return None
        except Exception as e:
            raise Exception(f"Failed to fetch translation key by key: {str(e)}")

    async def create_translation_key(self, translation_key: TranslationKeyCreate) -> TranslationKey:
        """Create a new translation key"""
        try:
            response = self.client.table("translation_keys").insert(
                translation_key.model_dump()
            ).execute()
            
            if response.data and len(response.data) > 0:
                return TranslationKey(**response.data[0])
            raise Exception("Failed to create translation key")
        except Exception as e:
            raise Exception(f"Failed to create translation key: {str(e)}")

    async def update_translation_key(self, key_id: UUID, update_data: TranslationKeyUpdate) -> Optional[TranslationKey]:
        """Update an existing translation key"""
        try:
            # Only update fields that are not None
            update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
            
            response = self.client.table("translation_keys").update(
                update_dict
            ).eq("id", str(key_id)).execute()
            
            if response.data and len(response.data) > 0:
                return TranslationKey(**response.data[0])
            return None
        except Exception as e:
            raise Exception(f"Failed to update translation key: {str(e)}")

    async def delete_translation_key(self, key_id: UUID) -> bool:
        """Delete a translation key and all its translations"""
        try:
            response = self.client.table("translation_keys").delete().eq(
                "id", str(key_id)
            ).execute()
            return True
        except Exception as e:
            raise Exception(f"Failed to delete translation key: {str(e)}")

    # Translations CRUD operations

    async def get_translations_for_key(self, key_id: UUID) -> List[Translation]:
        """Get all translations for a specific translation key"""
        try:
            response = self.client.table("translations").select("*").eq(
                "translation_key_id", str(key_id)
            ).execute()
            
            if response.data:
                return [Translation(**item) for item in response.data]
            return []
        except Exception as e:
            raise Exception(f"Failed to fetch translations: {str(e)}")

    async def get_translation(self, key_id: UUID, language_code: str) -> Optional[Translation]:
        """Get a specific translation for a key and language"""
        try:
            response = self.client.table("translations").select("*").eq(
                "translation_key_id", str(key_id)
            ).eq("language_code", language_code).execute()
            
            if response.data and len(response.data) > 0:
                return Translation(**response.data[0])
            return None
        except Exception as e:
            raise Exception(f"Failed to fetch translation: {str(e)}")

    async def upsert_translation(self, key_id: UUID, language_code: str, translation_data: TranslationCreate) -> Translation:
        """Create or update a translation for a specific key and language"""
        try:
            data = translation_data.model_dump()
            data["translation_key_id"] = str(key_id)
            data["language_code"] = language_code
            
            response = self.client.table("translations").upsert(
                data, on_conflict="translation_key_id,language_code"
            ).execute()
            
            if response.data and len(response.data) > 0:
                return Translation(**response.data[0])
            raise Exception("Failed to upsert translation")
        except Exception as e:
            raise Exception(f"Failed to upsert translation: {str(e)}")

    async def bulk_update_translations(self, updates: List[BulkTranslationUpdate]) -> bool:
        """Bulk update multiple translations"""
        try:
            # Convert updates to the format expected by Supabase
            upsert_data = []
            for update in updates:
                upsert_data.append({
                    "translation_key_id": str(update.translation_key_id),
                    "language_code": update.language_code,
                    "value": update.value,
                    "updated_by": update.updated_by
                })
            
            response = self.client.table("translations").upsert(
                upsert_data, on_conflict="translation_key_id,language_code"
            ).execute()
            
            return True
        except Exception as e:
            raise Exception(f"Failed to bulk update translations: {str(e)}")

    # Utility methods

    async def get_categories(self) -> List[str]:
        """Get all unique categories"""
        try:
            response = self.client.table("translation_keys").select("category").execute()
            
            if response.data:
                categories = list(set(item["category"] for item in response.data))
                return sorted(categories)
            return []
        except Exception as e:
            raise Exception(f"Failed to fetch categories: {str(e)}")

    async def search_translation_keys(self, search_term: str) -> List[TranslationKey]:
        """Search translation keys by key name or description"""
        try:
            response = self.client.table("translation_keys").select(
                "*, translations(*)"
            ).or_(
                f"key.ilike.%{search_term}%,description.ilike.%{search_term}%"
            ).execute()
            
            if response.data:
                return [TranslationKey(**item) for item in response.data]
            return []
        except Exception as e:
            raise Exception(f"Failed to search translation keys: {str(e)}")


# Global database service instance
db_service = DatabaseService() 