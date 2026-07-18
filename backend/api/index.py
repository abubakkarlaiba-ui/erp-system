import os
import sys
import json
import traceback
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.production")

import django
django.setup()

from django.conf import settings
from django.core.asgi import get_asgi_application

django_asgi_app = get_asgi_application()

from mangum import Mangum

handler = Mangum(django_asgi_app, lifespan="off")

def app(event, context):
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        db_ok = True
    except Exception as e:
        db_ok = False

    path = event.get("rawPath", "")
    if path == "/api/health":
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "status": "ok",
                "database": db_ok,
                "django_settings": str(settings),
                "debug": settings.DEBUG,
                "allowed_hosts": settings.ALLOWED_HOSTS,
            }),
        }

    return handler(event, context)
