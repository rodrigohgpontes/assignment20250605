import os
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Optional

# Load environment variables
load_dotenv()


class Settings:
    def __init__(self):
        self.supabase_url: str = os.getenv("SUPABASE_URL", "")
        self.supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", "")
        self.supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        self.api_host: str = os.getenv("API_HOST", "127.0.0.1")
        self.api_port: int = int(os.getenv("API_PORT", "8000"))
        self.debug: bool = os.getenv("DEBUG", "false").lower() == "true"
        self.allowed_origins: list = os.getenv("ALLOWED_ORIGINS", "").split(",")
        
        # Validate required environment variables
        if not self.supabase_url or not self.supabase_anon_key:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables")

    @property
    def database_url(self) -> Optional[str]:
        """Get database URL if using direct PostgreSQL connection"""
        return os.getenv("DATABASE_URL")


# Global settings instance
settings = Settings()


# Supabase client instances
def get_supabase_client() -> Client:
    """Get Supabase client with anon key (for general operations)"""
    return create_client(settings.supabase_url, settings.supabase_anon_key)


def get_supabase_admin_client() -> Client:
    """Get Supabase client with service role key (for admin operations)"""
    if not settings.supabase_service_role_key:
        raise ValueError("SUPABASE_SERVICE_ROLE_KEY must be set for admin operations")
    return create_client(settings.supabase_url, settings.supabase_service_role_key) 