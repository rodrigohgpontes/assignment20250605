import pytest
from httpx import AsyncClient
from uuid import uuid4

from src.localization_management_api.models import BulkUpdateRequest, BulkTranslationUpdate


class TestAPIEndpoints:
    """Test all API endpoints for proper functionality and error handling."""

    @pytest.mark.asyncio
    async def test_health_check(self, client: AsyncClient):
        """Test the health check endpoint."""
        response = await client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "message" in data

    @pytest.mark.asyncio
    async def test_create_translation_key_success(self, client: AsyncClient, sample_translation_key):
        """Test successfully creating a translation key."""
        response = await client.post(
            "/translation-keys",
            json=sample_translation_key.model_dump()
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["key"] == sample_translation_key.key
        assert data["category"] == sample_translation_key.category
        assert data["description"] == sample_translation_key.description
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    @pytest.mark.asyncio
    async def test_create_duplicate_translation_key(self, client: AsyncClient, sample_translation_key):
        """Test creating a duplicate translation key returns error."""
        # Create first key
        response1 = await client.post(
            "/translation-keys",
            json=sample_translation_key.model_dump()
        )
        assert response1.status_code == 200
        
        # Try to create duplicate
        response2 = await client.post(
            "/translation-keys",
            json=sample_translation_key.model_dump()
        )
        assert response2.status_code == 400
        assert "already exists" in response2.json()["detail"]

    @pytest.mark.asyncio
    async def test_get_translation_keys(self, client: AsyncClient, sample_translation_keys):
        """Test retrieving all translation keys."""
        # Create some keys first
        created_keys = []
        for key_data in sample_translation_keys:
            response = await client.post(
                "/translation-keys",
                json=key_data.model_dump()
            )
            assert response.status_code == 200
            created_keys.append(response.json())
        
        # Get all keys
        response = await client.get("/translation-keys")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= len(sample_translation_keys)
        
        # Verify our created keys are in the response
        retrieved_keys = {key["key"]: key for key in data}
        for created_key in created_keys:
            assert created_key["key"] in retrieved_keys

    @pytest.mark.asyncio
    async def test_get_translation_keys_by_category(self, client: AsyncClient, sample_translation_keys):
        """Test filtering translation keys by category."""
        # Create keys
        for key_data in sample_translation_keys:
            await client.post("/translation-keys", json=key_data.model_dump())
        
        # Filter by common category
        response = await client.get("/translation-keys?category=common")
        assert response.status_code == 200
        
        data = response.json()
        for key in data:
            if key["key"].startswith("test.common"):  # Our test keys
                assert key["category"] == "common"

    @pytest.mark.asyncio
    async def test_search_translation_keys(self, client: AsyncClient, sample_translation_keys):
        """Test searching translation keys."""
        # Create keys
        for key_data in sample_translation_keys:
            await client.post("/translation-keys", json=key_data.model_dump())
        
        # Search for greeting
        response = await client.get("/translation-keys?search=greeting")
        assert response.status_code == 200
        
        data = response.json()
        # Should find keys containing "greeting"
        assert len(data) > 0
        for key in data:
            if key["key"].startswith("test."):  # Our test keys
                assert "greeting" in key["key"].lower() or "greeting" in (key["description"] or "").lower()

    @pytest.mark.asyncio
    async def test_get_translation_key_by_id(self, client: AsyncClient, sample_translation_key):
        """Test retrieving a specific translation key by ID."""
        # Create key
        create_response = await client.post(
            "/translation-keys",
            json=sample_translation_key.model_dump()
        )
        assert create_response.status_code == 200
        created_key = create_response.json()
        
        # Get by ID
        response = await client.get(f"/translation-keys/{created_key['id']}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == created_key["id"]
        assert data["key"] == created_key["key"]

    @pytest.mark.asyncio
    async def test_get_nonexistent_translation_key(self, client: AsyncClient):
        """Test retrieving a non-existent translation key returns 404."""
        fake_uuid = uuid4()
        response = await client.get(f"/translation-keys/{fake_uuid}")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_update_translation_key(self, client: AsyncClient, sample_translation_key):
        """Test updating a translation key."""
        # Create key
        create_response = await client.post(
            "/translation-keys",
            json=sample_translation_key.model_dump()
        )
        created_key = create_response.json()
        
        # Update key
        update_data = {
            "category": "updated_category",
            "description": "Updated description"
        }
        
        response = await client.put(
            f"/translation-keys/{created_key['id']}",
            json=update_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["category"] == "updated_category"
        assert data["description"] == "Updated description"
        assert data["key"] == created_key["key"]  # Key should remain unchanged

    @pytest.mark.asyncio
    async def test_delete_translation_key(self, client: AsyncClient, sample_translation_key):
        """Test deleting a translation key."""
        # Create key
        create_response = await client.post(
            "/translation-keys",
            json=sample_translation_key.model_dump()
        )
        created_key = create_response.json()
        
        # Delete key
        response = await client.delete(f"/translation-keys/{created_key['id']}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "deleted successfully" in data["message"]
        
        # Verify key is deleted
        get_response = await client.get(f"/translation-keys/{created_key['id']}")
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_create_translation(self, client: AsyncClient, sample_translation_key, sample_translation):
        """Test creating a translation for a key."""
        # Create key first
        create_response = await client.post(
            "/translation-keys",
            json=sample_translation_key.model_dump()
        )
        created_key = create_response.json()
        
        # Create translation
        response = await client.post(
            f"/translation-keys/{created_key['id']}/translations/{sample_translation.language_code}",
            json=sample_translation.model_dump()
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["language_code"] == sample_translation.language_code
        assert data["value"] == sample_translation.value
        assert data["updated_by"] == sample_translation.updated_by

    @pytest.mark.asyncio
    async def test_upsert_translation(self, client: AsyncClient, sample_translation_key, sample_translation):
        """Test creating and updating a translation."""
        # Create key first
        create_response = await client.post(
            "/translation-keys",
            json=sample_translation_key.model_dump()
        )
        created_key = create_response.json()
        
        # Create translation
        response = await client.put(
            f"/translation-keys/{created_key['id']}/translations/{sample_translation.language_code}",
            json=sample_translation.model_dump()
        )
        assert response.status_code == 200
        original_data = response.json()
        
        # Update same translation
        updated_translation = {
            "language_code": sample_translation.language_code,
            "value": "Updated value",
            "updated_by": "updated_user"
        }
        
        response = await client.put(
            f"/translation-keys/{created_key['id']}/translations/{sample_translation.language_code}",
            json=updated_translation
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["value"] == "Updated value"
        assert data["updated_by"] == "updated_user"

    @pytest.mark.asyncio
    async def test_get_translations_for_key(self, client: AsyncClient, sample_translation_key, sample_translations):
        """Test retrieving all translations for a key."""
        # Create key
        create_response = await client.post(
            "/translation-keys",
            json=sample_translation_key.model_dump()
        )
        created_key = create_response.json()
        
        # Create multiple translations
        for translation in sample_translations:
            await client.put(
                f"/translation-keys/{created_key['id']}/translations/{translation.language_code}",
                json=translation.model_dump()
            )
        
        # Get all translations
        response = await client.get(f"/translation-keys/{created_key['id']}/translations")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == len(sample_translations)
        
        language_codes = [t["language_code"] for t in data]
        for sample_translation in sample_translations:
            assert sample_translation.language_code in language_codes

    @pytest.mark.asyncio
    async def test_bulk_update_translations(self, client: AsyncClient, sample_translation_keys):
        """Test bulk updating multiple translations."""
        # Create translation keys
        created_keys = []
        for key_data in sample_translation_keys[:2]:
            response = await client.post("/translation-keys", json=key_data.model_dump())
            created_keys.append(response.json())
        
        # Prepare bulk update request
        bulk_updates = []
        for i, key in enumerate(created_keys):
            bulk_updates.extend([
                BulkTranslationUpdate(
                    translation_key_id=key["id"],
                    language_code="en",
                    value=f"English value {i}",
                    updated_by="bulk_user"
                ),
                BulkTranslationUpdate(
                    translation_key_id=key["id"],
                    language_code="es",
                    value=f"Spanish value {i}",
                    updated_by="bulk_user"
                )
            ])
        
        bulk_request = BulkUpdateRequest(updates=bulk_updates)
        
        # Perform bulk update
        response = await client.put(
            "/translation-keys/bulk",
            json=bulk_request.model_dump(mode="json")
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["updated_count"] == len(bulk_updates)
        
        # Verify updates
        for key in created_keys:
            translations_response = await client.get(f"/translation-keys/{key['id']}/translations")
            translations = translations_response.json()
            assert len(translations) >= 2  # At least en and es
            
            for translation in translations:
                if translation["language_code"] in ["en", "es"]:
                    assert translation["updated_by"] == "bulk_user"

    @pytest.mark.asyncio
    async def test_bulk_update_with_invalid_key(self, client: AsyncClient):
        """Test bulk update with non-existent translation key returns error."""
        fake_uuid = uuid4()
        bulk_updates = [
            BulkTranslationUpdate(
                translation_key_id=fake_uuid,
                language_code="en",
                value="Test value",
                updated_by="test_user"
            )
        ]
        
        bulk_request = BulkUpdateRequest(updates=bulk_updates)
        
        response = await client.put(
            "/translation-keys/bulk",
            json=bulk_request.model_dump(mode="json")
        )
        
        assert response.status_code == 404
        assert str(fake_uuid) in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_bulk_update_empty_request(self, client: AsyncClient):
        """Test bulk update with empty updates returns error."""
        bulk_request = BulkUpdateRequest(updates=[])
        
        response = await client.put(
            "/translation-keys/bulk",
            json=bulk_request.model_dump()
        )
        
        assert response.status_code == 400
        assert "No updates provided" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_get_categories(self, client: AsyncClient, sample_translation_keys):
        """Test retrieving all categories."""
        # Create keys with different categories
        for key_data in sample_translation_keys:
            await client.post("/translation-keys", json=key_data.model_dump())
        
        response = await client.get("/categories")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        # Should contain our test categories
        expected_categories = set(key.category for key in sample_translation_keys)
        actual_categories = set(data)
        assert expected_categories.issubset(actual_categories)

    @pytest.mark.asyncio
    async def test_get_localizations_endpoint(self, client: AsyncClient, sample_translation_key, sample_translations):
        """Test the original localizations endpoint with real data."""
        # Create key and translations
        create_response = await client.post(
            "/translation-keys",
            json=sample_translation_key.model_dump()
        )
        created_key = create_response.json()
        
        # Add translations
        for translation in sample_translations:
            await client.put(
                f"/translation-keys/{created_key['id']}/translations/{translation.language_code}",
                json=translation.model_dump()
            )
        
        # Test localizations endpoint
        response = await client.get("/localizations/test-project/en")
        assert response.status_code == 200
        
        data = response.json()
        assert data["project_id"] == "test-project"
        assert data["locale"] == "en"
        assert "localizations" in data
        
        # Should contain our test key
        localizations = data["localizations"]
        if created_key["key"] in localizations:
            assert localizations[created_key["key"]] == "Hello"  # From sample_translations 