import os
import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ["DJANGO_SETTINGS_MODULE"] = "config.settings"

def application(environ, start_response):
    try:
        import django
        django.setup()
        start_response("200 OK", [("Content-Type", "application/json")])
        return [json.dumps({
            "django_ok": True,
            "env": os.environ.get("DJANGO_ENVIRONMENT"),
        }).encode()]
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        start_response("500 Internal Server Error", [("Content-Type", "application/json")])
        return [json.dumps({
            "error": str(e),
            "traceback": tb,
        }).encode()]
