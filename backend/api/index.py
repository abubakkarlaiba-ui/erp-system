import os
import sys
import json
import traceback
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ["DJANGO_SETTINGS_MODULE"] = "config.settings"

import django
django.setup()

from django.core.handlers.wsgi import WSGIHandler

class ErrorCatchingHandler(WSGIHandler):
    def __call__(self, environ, start_response):
        try:
            return super().__call__(environ, start_response)
        except Exception as e:
            tb = traceback.format_exc()
            body = json.dumps({"error": str(e), "traceback": tb}).encode()
            start_response("500 Internal Server Error", [("Content-Type", "application/json")])
            return [body]

application = ErrorCatchingHandler()
