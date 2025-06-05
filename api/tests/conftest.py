import pytest
import pytest_asyncio
import asyncio
from typing import AsyncGenerator, List
from httpx import AsyncClient
from uuid import uuid4

from src.localization_management_api.main import app
from src.localization_management_api.models import TranslationKeyCreate, TranslationCreate


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


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
        description="Test translation key"
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
        )
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
        )
    ] 