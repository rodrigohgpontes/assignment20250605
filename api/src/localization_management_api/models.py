from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID


class TranslationKeyBase(BaseModel):
    key: str = Field(..., description="Unique translation key identifier")
    category: str = Field(..., description="Category for organizing translation keys")
    description: Optional[str] = Field(None, description="Optional description of the translation key")


class TranslationKeyCreate(TranslationKeyBase):
    pass


class TranslationKeyUpdate(TranslationKeyBase):
    key: Optional[str] = None
    category: Optional[str] = None


class TranslationBase(BaseModel):
    language_code: str = Field(..., description="Language code (e.g., 'en', 'es', 'fr')")
    value: str = Field(..., description="Translated text value")
    updated_by: str = Field(..., description="User who last updated this translation")


class TranslationCreate(TranslationBase):
    pass


class TranslationUpdate(BaseModel):
    value: Optional[str] = None
    updated_by: Optional[str] = None


class Translation(TranslationBase):
    id: UUID
    translation_key_id: UUID
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TranslationKey(TranslationKeyBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    translations: Dict[str, Dict[str, str]] = {}

    model_config = ConfigDict(from_attributes=True)


class BulkTranslationUpdate(BaseModel):
    translation_key_id: UUID
    language_code: str
    value: str
    updated_by: str


class BulkUpdateRequest(BaseModel):
    updates: List[BulkTranslationUpdate]


class CSVRow(BaseModel):
    key: str = Field(..., description="Translation key identifier")
    category: str = Field(..., description="Category for the translation key")
    description: Optional[str] = Field(None, description="Optional description")
    en: Optional[str] = Field(None, description="English translation")
    es: Optional[str] = Field(None, description="Spanish translation")
    pt: Optional[str] = Field(None, description="Portuguese translation")


class CSVBulkImportRequest(BaseModel):
    csv_data: str = Field(..., description="CSV content as string")
    updated_by: str = Field(default="bulk_import", description="User performing the bulk import")


class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None 