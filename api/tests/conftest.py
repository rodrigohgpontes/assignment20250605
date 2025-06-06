import os
import pytest
import pytest_asyncio
import asyncio
from typing import AsyncGenerator, List, Dict, Optional, Any
from httpx import AsyncClient
from uuid import uuid4, UUID
from unittest.mock import AsyncMock, MagicMock

# Set TESTING environment variable as early as possible
os.environ["TESTING"] = "true"

from src.localization_management_api.main import app
from src.localization_management_api.models import (
    TranslationKeyCreate, 
    TranslationCreate, 
    TranslationKey, 
    Translation,
    TranslationKeyUpdate,
    BulkTranslationUpdate
)


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# Mock database service for all tests
class MockDatabaseService:
    def __init__(self):
        self.translation_keys: Dict[str, TranslationKey] = {}
        self.translations: Dict[str, Dict[str, Translation]] = {}
    
    async def create_translation_key(self, key_data: TranslationKeyCreate) -> TranslationKey:
        """Mock creating a translation key"""
        # Check for duplicates
        for existing_key in self.translation_keys.values():
            if existing_key.key == key_data.key:
                raise Exception(f"Translation key '{key_data.key}' already exists")
        
        key_id = str(uuid4())
        translation_key = TranslationKey(
            id=key_id,
            key=key_data.key,
            category=key_data.category,
            description=key_data.description,
            created_at="2023-01-01T00:00:00Z",
            updated_at="2023-01-01T00:00:00Z",
            translations={}
        )
        self.translation_keys[key_id] = translation_key
        self.translations[key_id] = {}
        return translation_key
    
    async def get_translation_key(self, key_id: UUID) -> Optional[TranslationKey]:
        """Mock getting a translation key by ID"""
        key_str = str(key_id)
        if key_str in self.translation_keys:
            key = self.translation_keys[key_str]
            # Add current translations - convert to dict format expected by TranslationKey
            key.translations = {
                lang: {
                    "value": translation["value"],
                    "updated_at": translation["updated_at"],
                    "updated_by": translation["updated_by"]
                }
                for lang, translation in self.translations.get(key_str, {}).items()
            }
            return key
        return None
    
    async def get_translation_key_by_key(self, key: str) -> Optional[TranslationKey]:
        """Mock getting a translation key by key string"""
        for translation_key in self.translation_keys.values():
            if translation_key.key == key:
                # Add current translations - convert to dict format expected by TranslationKey
                translation_key.translations = {
                    lang: {
                        "value": translation["value"],
                        "updated_at": translation["updated_at"],
                        "updated_by": translation["updated_by"]
                    }
                    for lang, translation in self.translations.get(translation_key.id, {}).items()
                }
                return translation_key
        return None
    
    async def get_translation_keys(self, category: Optional[str] = None) -> List[TranslationKey]:
        """Mock getting all translation keys"""
        keys = list(self.translation_keys.values())
        if category:
            keys = [key for key in keys if key.category == category]
        
        # Add translations to each key - convert to dict format expected by TranslationKey
        for key in keys:
            key.translations = {
                lang: {
                    "value": translation["value"],
                    "updated_at": translation["updated_at"],
                    "updated_by": translation["updated_by"]
                }
                for lang, translation in self.translations.get(key.id, {}).items()
            }
        return keys
    
    async def update_translation_key(self, key_id: UUID, update_data: TranslationKeyUpdate) -> Optional[TranslationKey]:
        """Mock updating a translation key"""
        key_str = str(key_id)
        if key_str in self.translation_keys:
            key = self.translation_keys[key_str]
            if update_data.category is not None:
                key.category = update_data.category
            if update_data.description is not None:
                key.description = update_data.description
            key.updated_at = "2023-01-01T00:00:00Z"
            return key
        return None
    
    async def delete_translation_key(self, key_id: UUID) -> bool:
        """Mock deleting a translation key"""
        key_str = str(key_id)
        if key_str in self.translation_keys:
            del self.translation_keys[key_str]
            if key_str in self.translations:
                del self.translations[key_str]
            return True
        return False
    
    async def search_translation_keys(self, search_term: str) -> List[TranslationKey]:
        """Mock searching translation keys"""
        search_lower = search_term.lower()
        results = []
        for key in self.translation_keys.values():
            if (search_lower in key.key.lower() or 
                search_lower in key.category.lower() or 
                (key.description and search_lower in key.description.lower())):
                # Add translations - convert to dict format expected by TranslationKey
                key.translations = {
                    lang: {
                        "value": translation["value"],
                        "updated_at": translation["updated_at"],
                        "updated_by": translation["updated_by"]
                    }
                    for lang, translation in self.translations.get(key.id, {}).items()
                }
                results.append(key)
        return results
    
    async def upsert_translation(self, key_id: UUID, language_code: str, translation_data: TranslationCreate) -> Translation:
        """Mock creating/updating a translation"""
        key_str = str(key_id)
        if key_str not in self.translation_keys:
            raise Exception(f"Translation key not found: {key_id}")
        
        if key_str not in self.translations:
            self.translations[key_str] = {}
        
        translation = {
            "id": str(uuid4()),
            "translation_key_id": key_id,
            "language_code": language_code,
            "value": translation_data.value,
            "updated_at": "2023-01-01T00:00:00Z",
            "updated_by": translation_data.updated_by
        }
        self.translations[key_str][language_code] = translation
        return Translation(**translation)
    
    async def get_translations_for_key(self, key_id: UUID) -> List[Translation]:
        """Mock getting translations for a key"""
        key_str = str(key_id)
        translations = self.translations.get(key_str, {}).values()
        return [Translation(**t) for t in translations]
    
    async def get_translation(self, key_id: UUID, language_code: str) -> Optional[Translation]:
        """Mock getting a specific translation"""
        key_str = str(key_id)
        if key_str in self.translations and language_code in self.translations[key_str]:
            translation_data = self.translations[key_str][language_code]
            return Translation(**translation_data)
        return None
    
    async def bulk_update_translations(self, updates: List[BulkTranslationUpdate]) -> bool:
        """Mock bulk updating translations"""
        try:
            for update in updates:
                key_str = str(update.translation_key_id)
                if key_str not in self.translation_keys:
                    raise Exception(f"Translation key not found: {update.translation_key_id}")
                
                if key_str not in self.translations:
                    self.translations[key_str] = {}
                
                translation = {
                    "id": str(uuid4()),
                    "translation_key_id": update.translation_key_id,
                    "language_code": update.language_code,
                    "value": update.value,
                    "updated_at": "2023-01-01T00:00:00Z",
                    "updated_by": update.updated_by
                }
                self.translations[key_str][update.language_code] = translation
            return True
        except Exception:
            return False
    
    async def get_categories(self) -> List[str]:
        """Mock getting all categories"""
        categories = set()
        for key in self.translation_keys.values():
            categories.add(key.category)
        return sorted(list(categories))


@pytest.fixture(autouse=True)
def mock_database_service(monkeypatch):
    """Automatically mock the database service for all tests"""
    # Set TESTING environment variable to prevent real database connections
    monkeypatch.setenv("TESTING", "true")
    
    mock_service = MockDatabaseService()
    
    # Replace the global db_service instance
    import src.localization_management_api.database
    monkeypatch.setattr(src.localization_management_api.database, "db_service", mock_service)
    
    # Also replace it in main.py where it's imported
    import src.localization_management_api.main
    monkeypatch.setattr(src.localization_management_api.main, "db_service", mock_service)
    
    return mock_service


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Create an async HTTP client for testing the API."""
    from httpx import ASGITransport
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.fixture
def sample_translation_key() -> TranslationKeyCreate:
    """Create a sample translation key for testing."""
    return TranslationKeyCreate(
        key=f"test.key.{uuid4().hex[:8]}",
        category="test",
        description="Test description"
    )


@pytest.fixture
def sample_translation_keys() -> List[TranslationKeyCreate]:
    """Create multiple sample translation keys for testing."""
    return [
        TranslationKeyCreate(
            key=f"test.common.greeting.{uuid4().hex[:8]}",
            category="common",
            description="Greeting message"
        ),
        TranslationKeyCreate(
            key=f"test.common.farewell.{uuid4().hex[:8]}",
            category="common",
            description="Farewell message"
        ),
        TranslationKeyCreate(
            key=f"test.nav.home.{uuid4().hex[:8]}",
            category="navigation",
            description="Home navigation"
        ),
    ]


@pytest.fixture
def sample_translation() -> TranslationCreate:
    """Create a sample translation for testing."""
    return TranslationCreate(
        language_code="en",
        value="Hello World",
        updated_by="test_user"
    )


@pytest.fixture
def sample_translations() -> List[TranslationCreate]:
    """Create multiple sample translations for testing."""
    return [
        TranslationCreate(
            language_code="en",
            value="Hello",
            updated_by="test_user"
        ),
        TranslationCreate(
            language_code="es",
            value="Hola",
            updated_by="test_user"
        ),
        TranslationCreate(
            language_code="fr",
            value="Bonjour",
            updated_by="test_user"
        ),
    ] 