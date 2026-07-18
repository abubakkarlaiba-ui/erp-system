import os
import sys
import logging
import json
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

# Run migrations on cold start (with error tracking)
migrations_ok = False
migrations_error = None

def run_migrations():
    global migrations_ok, migrations_error
    try:
        from django.core.management import call_command
        logger.info("Running migrations...")
        call_command("migrate", "--no-input", verbosity=0)
        migrations_ok = True
        logger.info("Migrations complete.")
    except Exception as e:
        migrations_error = str(e)
        logger.error(f"Migration error: {e}")
        import traceback
        traceback.print_exc()

run_migrations()

# Create the ASGI application
from django.core.asgi import get_asgi_application
django_asgi_app = get_asgi_application()

# Wrap with Mangum for Vercel serverless
from mangum import Mangum

handler = Mangum(django_asgi_app, lifespan="off")

def app(event, context):
    path = event.get("rawPath", "")

    if path == "/api/health":
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            db_ok = True
        except Exception as e:
            db_ok = False

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "status": "ok",
                "migrations": migrations_ok,
                "migration_error": migrations_error,
                "database": db_ok,
                "settings_module": os.environ.get("DJANGO_SETTINGS_MODULE"),
                "secret_key_set": bool(os.environ.get("SECRET_KEY")),
                "db_host": os.environ.get("DB_HOST", "not set"),
                "db_name": os.environ.get("DB_NAME", "not set"),
            }),
        }

    return handler(event, context)
