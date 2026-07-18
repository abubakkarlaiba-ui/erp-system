import os
import sys
import json
import traceback
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ["DJANGO_SETTINGS_MODULE"] = "config.settings"

import django
django.setup()

from django.conf import settings
from django.http import HttpResponse
from django.core.handlers.wsgi import WSGIHandler

# Capture errors during url loading
url_errors = None
try:
    from config.urls import urlpatterns as urls
except Exception as e:
    url_errors = traceback.format_exc()

class SafeWSGIHandler(WSGIHandler):
    def __call__(self, environ, start_response):
        if url_errors:
            body = json.dumps({"url_loading_error": url_errors}).encode()
            start_response("500 Internal Server Error", [("Content-Type", "application/json")])
            return [body]
        
        request = self.request_class(environ)
        try:
            response = self.get_response(request)
        except Exception as exc:
            tb = traceback.format_exc()
            body = json.dumps({"error": str(exc), "traceback": tb}).encode()
            start_response("500 Internal Server Error", [("Content-Type", "application/json")])
            return [body]
            
        response = self.apply_response_fixes(request, response)
        return response(environ, start_response)

application = SafeWSGIHandler()
