import os
import sys
import json
import traceback
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ["DJANGO_SETTINGS_MODULE"] = "config.settings"

import django
django.setup()

from django.core.wsgi import get_wsgi_application

django_app = get_wsgi_application()

def application(environ, start_response):
    path = environ.get("PATH_INFO", "")
    if path == "/api/health/":
        start_response("200 OK", [("Content-Type", "application/json")])
        return [json.dumps({"status": "ok"}).encode()]

    if path == "/api/db-test/":
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
            start_response("200 OK", [("Content-Type", "application/json")])
            return [json.dumps({"db_ok": True, "result": str(result)}).encode()]
        except Exception as e:
            start_response("500 Internal Server Error", [("Content-Type", "application/json")])
            return [json.dumps({"db_ok": False, "error": str(e), "traceback": traceback.format_exc()}).encode()]

    return django_app(environ, start_response)
