#!/usr/bin/env python3
"""
Test runner for the localization management API
Run this script to execute all tests with proper configuration
"""

import sys
import os
import subprocess
from pathlib import Path

def setup_test_environment():
    """Setup test environment variables"""
    # Add the src directory to Python path
    api_dir = Path(__file__).parent.parent
    src_dir = api_dir / "src"
    sys.path.insert(0, str(src_dir))
    
    # Load environment variables from .env file first
    from dotenv import load_dotenv
    env_path = api_dir / ".env"
    load_dotenv(env_path)
    
    # Set test environment variables (you may need to adjust these)
    test_env = os.environ.copy()
    test_env.update({
        "TESTING": "true",
        "SUPABASE_URL": os.getenv("SUPABASE_URL", ""),
        "SUPABASE_ANON_KEY": os.getenv("SUPABASE_ANON_KEY", ""),
        "SUPABASE_SERVICE_ROLE_KEY": os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""),
        "DEBUG": "true"
    })
    
    # Set environment variables in current process too
    for key, value in test_env.items():
        if key.startswith(("SUPABASE_", "TESTING", "DEBUG")):
            os.environ[key] = value
    
    return test_env

def run_tests():
    """Run the test suite"""
    print("Setting up test environment...")
    test_env = setup_test_environment()
    
    # Check if required environment variables are set
    required_vars = ["SUPABASE_URL", "SUPABASE_ANON_KEY"]
    missing_vars = [var for var in required_vars if not test_env.get(var)]
    
    if missing_vars:
        print(f"Warning: Missing environment variables: {', '.join(missing_vars)}")
        print("Some tests may fail without proper Supabase configuration.")
        print("Please set up your .env file with Supabase credentials.")
    
    print("Running tests...")
    
    # Run pytest
    api_dir = Path(__file__).parent.parent
    cmd = [
        sys.executable, "-m", "pytest",
        str(api_dir / "tests"),
        "-v",
        "--tb=short",
        "--asyncio-mode=auto"
    ]
    
    try:
        result = subprocess.run(cmd, env=test_env, cwd=str(api_dir))
        return result.returncode
    except KeyboardInterrupt:
        print("\nTests interrupted by user")
        return 1
    except Exception as e:
        print(f"Error running tests: {e}")
        return 1

if __name__ == "__main__":
    exit_code = run_tests()
    sys.exit(exit_code) 