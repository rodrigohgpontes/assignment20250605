import pytest
from typing import List
from uuid import uuid4

from src.localization_management_api.models import (
    TranslationKeyCreate, 
    TranslationKeyUpdate,
    TranslationCreate,
    BulkTranslationUpdate
)


class TestDatabaseService:
    """Test the database service layer functionality."""

    @pytest.fixture
    def db_service(self):
        """Get the database service (will be mocked automatically)"""
        from src.localization_management_api.database import db_service
        return db_service

    @pytest.mark.asyncio
    async def test_create_translation_key(self, db_service, sample_translation_key):
        """Test creating a translation key."""
        created_key = await db_service.create_translation_key(sample_translation_key)
        
        assert created_key.key == sample_translation_key.key
        assert created_key.category == sample_translation_key.category
        assert created_key.description == sample_translation_key.description
        assert created_key.id is not None
        assert created_key.created_at is not None
        assert created_key.updated_at is not None

    @pytest.mark.asyncio
    async def test_get_translation_key_by_id(self, db_service, sample_translation_key):
        """Test retrieving a translation key by ID."""
        created_key = await db_service.create_translation_key(sample_translation_key)
        retrieved_key = await db_service.get_translation_key(created_key.id)
        
        assert retrieved_key is not None
        assert retrieved_key.id == created_key.id
        assert retrieved_key.key == created_key.key

    @pytest.mark.asyncio
    async def test_get_translation_key_by_key_string(self, db_service, sample_translation_key):
        """Test retrieving a translation key by key string."""
        created_key = await db_service.create_translation_key(sample_translation_key)
        retrieved_key = await db_service.get_translation_key_by_key(created_key.key)
        
        assert retrieved_key is not None
        assert retrieved_key.id == created_key.id
        assert retrieved_key.key == created_key.key

    @pytest.mark.asyncio
    async def test_get_nonexistent_translation_key(self, db_service):
        """Test retrieving a non-existent translation key returns None."""
        fake_uuid = uuid4()
        result = await db_service.get_translation_key(fake_uuid)
        assert result is None

    @pytest.mark.asyncio
    async def test_update_translation_key(self, db_service, sample_translation_key):
        """Test updating a translation key."""
        created_key = await db_service.create_translation_key(sample_translation_key)
        
        update_data = TranslationKeyUpdate(
            category="updated_category",
            description="Updated description"
        )
        
        updated_key = await db_service.update_translation_key(created_key.id, update_data)
        
        assert updated_key is not None
        assert updated_key.category == "updated_category"
        assert updated_key.description == "Updated description"
        assert updated_key.key == created_key.key  # Key should remain unchanged

    @pytest.mark.asyncio
    async def test_delete_translation_key(self, db_service, sample_translation_key):
        """Test deleting a translation key."""
        created_key = await db_service.create_translation_key(sample_translation_key)
        
        # Verify key exists
        assert await db_service.get_translation_key(created_key.id) is not None
        
        # Delete key
        success = await db_service.delete_translation_key(created_key.id)
        assert success is True
        
        # Verify key is deleted
        assert await db_service.get_translation_key(created_key.id) is None

    @pytest.mark.asyncio
    async def test_get_translation_keys_by_category(self, db_service, sample_translation_keys):
        """Test retrieving translation keys filtered by category."""
        # Create multiple keys
        created_keys = []
        for key_data in sample_translation_keys:
            created_key = await db_service.create_translation_key(key_data)
            created_keys.append(created_key)
        
        # Get common category keys
        common_keys = await db_service.get_translation_keys(category="common")
        common_key_names = [key.key for key in common_keys]
        
        # Verify we get the correct keys
        for created_key in created_keys:
            if created_key.category == "common":
                assert created_key.key in common_key_names

    @pytest.mark.asyncio
    async def test_search_translation_keys(self, db_service, sample_translation_keys):
        """Test searching translation keys by key name or description."""
        # Create test keys
        for key_data in sample_translation_keys:
            await db_service.create_translation_key(key_data)
        
        # Search by key pattern
        search_results = await db_service.search_translation_keys("greeting")
        
        # Should find keys containing "greeting"
        assert len(search_results) > 0
        for result in search_results:
            assert "greeting" in result.key.lower() or "greeting" in (result.description or "").lower()

    @pytest.mark.asyncio
    async def test_upsert_translation(self, db_service, sample_translation_key, sample_translation):
        """Test creating and updating translations."""
        # Create translation key first
        created_key = await db_service.create_translation_key(sample_translation_key)
        
        # Create translation
        created_translation = await db_service.upsert_translation(
            created_key.id, 
            sample_translation.language_code, 
            sample_translation
        )
        
        assert created_translation.language_code == sample_translation.language_code
        assert created_translation.value == sample_translation.value
        assert created_translation.updated_by == sample_translation.updated_by
        
        # Update same translation
        updated_translation_data = TranslationCreate(
            language_code=sample_translation.language_code,
            value="Updated Hello World",
            updated_by="updated_user"
        )
        
        updated_translation = await db_service.upsert_translation(
            created_key.id,
            sample_translation.language_code,
            updated_translation_data
        )
        
        assert updated_translation.value == "Updated Hello World"
        assert updated_translation.updated_by == "updated_user"

    @pytest.mark.asyncio
    async def test_get_translations_for_key(self, db_service, sample_translation_key, sample_translations):
        """Test retrieving all translations for a key."""
        # Create translation key
        created_key = await db_service.create_translation_key(sample_translation_key)
        
        # Create multiple translations
        for translation_data in sample_translations:
            await db_service.upsert_translation(
                created_key.id,
                translation_data.language_code,
                translation_data
            )
        
        # Get all translations for the key
        translations = await db_service.get_translations_for_key(created_key.id)
        
        assert len(translations) == len(sample_translations)
        language_codes = [t.language_code for t in translations]
        
        for sample_translation in sample_translations:
            assert sample_translation.language_code in language_codes

    @pytest.mark.asyncio
    async def test_bulk_update_translations(self, db_service, sample_translation_keys, sample_translations):
        """Test bulk updating multiple translations."""
        # Create translation keys
        created_keys = []
        for key_data in sample_translation_keys[:2]:  # Use first 2 keys
            created_key = await db_service.create_translation_key(key_data)
            created_keys.append(created_key)
        
        # Prepare bulk updates
        bulk_updates = []
        for i, created_key in enumerate(created_keys):
            for j, translation in enumerate(sample_translations[:2]):  # Use first 2 translations
                bulk_updates.append(BulkTranslationUpdate(
                    translation_key_id=created_key.id,
                    language_code=translation.language_code,
                    value=f"Bulk updated value {i}-{j}",
                    updated_by="bulk_user"
                ))
        
        # Perform bulk update
        success = await db_service.bulk_update_translations(bulk_updates)
        assert success is True
        
        # Verify translations were updated
        for created_key in created_keys:
            translations = await db_service.get_translations_for_key(created_key.id)
            assert len(translations) >= 2  # Should have at least 2 translations

    @pytest.mark.asyncio
    async def test_get_categories(self, db_service, sample_translation_keys):
        """Test retrieving all unique categories."""
        # Create translation keys with different categories
        for key_data in sample_translation_keys:
            await db_service.create_translation_key(key_data)
        
        categories = await db_service.get_categories()
        
        # Should contain all unique categories from sample data
        expected_categories = set(key.category for key in sample_translation_keys)
        for expected_category in expected_categories:
            assert expected_category in categories 