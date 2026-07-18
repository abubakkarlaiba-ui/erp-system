import os
import sys
import logging
from pathlib import Path

# Add the backend directory to Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Set Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.production")

# Set critical environment variables if not already set
if not os.environ.get("SECRET_KEY"):
    os.environ["SECRET_KEY"] = "django-insecure-vercel-deploy-temp-key-change-me"

# Initialize Django
import django
django.setup()

logger = logging.getLogger(__name__)

# Run migrations on cold start
def run_migrations():
    try:
        from django.core.management import call_command
        logger.info("Running migrations...")
        call_command("migrate", "--no-input", verbosity=1)
        logger.info("Migrations complete.")
    except Exception as e:
        logger.error(f"Migration error: {e}")
        import traceback
        traceback.print_exc()

run_migrations()

# Create the ASGI application
from django.core.asgi import get_asgi_application
django_asgi_app = get_asgi_application()

# Wrap with Mangum for Vercel serverless
from mangum import Mangum

app = Mangum(django_asgi_app, lifespan="off")
