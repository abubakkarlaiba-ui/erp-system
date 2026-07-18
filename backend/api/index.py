import os
import sys
import json
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
        return [json.dumps({"status": "ok", "app": "erp-backend"}).encode()]
    return django_app(environ, start_response)
