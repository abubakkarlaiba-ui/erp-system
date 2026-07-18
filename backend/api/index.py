import os
import sys
import json
import traceback
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.production")

setup_error = None
handler = None

try:
    import django
    django.setup()
    from django.core.asgi import get_asgi_application
    django_asgi_app = get_asgi_application()
    from mangum import Mangum
    handler = Mangum(django_asgi_app, lifespan="off")
except Exception as e:
    setup_error = f"{type(e).__name__}: {str(e)}\n{traceback.format_exc()}"

def app(event, context):
    path = event.get("rawPath", "")
    if path == "/api/health":
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "status": "error" if setup_error else "ok",
                "setup_error": setup_error,
            }),
        }
    if setup_error:
        return {"statusCode": 500, "body": setup_error}
    return handler(event, context)
