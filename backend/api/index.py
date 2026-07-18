import os, sys, json, traceback
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from django.conf import settings
from django.core.handlers.wsgi import WSGIHandler

class DebugWSGIHandler(WSGIHandler):
    def __call__(self, environ, start_response):
        request = self.request_class(environ)
        response = self.get_response(request)
        body_start = response.content[:2000] if response.content else b''
        resp_headers = dict(response.items())
        body = json.dumps({
            "content": body_start.decode('utf-8', errors='replace'),
            "content_type": resp_headers.get("Content-Type", ""),
            "status": response.status_code,
        }).encode()
        start_response("%d %s" % (response.status_code, response.reason_phrase), [("Content-Type", "application/json")])
        return [body]

application = DebugWSGIHandler()
