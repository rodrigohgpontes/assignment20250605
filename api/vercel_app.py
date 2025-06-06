import sys
import os

# Ensure the src directory (package code) is on the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

# Import the FastAPI application instance
from localization_management_api import main

# The Vercel Python runtime looks for a module-level variable named `app`
# (WSGI or ASGI callable). Expose the FastAPI instance created in main.py.
app = main.app  # type: ignore

# Optional: If you still need the Mangum handler (e.g. for local AWS Lambda
# testing) you can keep the line below, but it is **not** used by Vercel.
# handler = main.handler