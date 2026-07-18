import os, sys, json, traceback
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from django.conf import settings
from django.http import HttpResponse
from django.core.handlers.wsgi import WSGIHandler

class DebugWSGIHandler(WSGIHandler):
    def __call__(self, environ, start_response):
        try:
            request = self.request_class(environ)
            try:
                response = self.get_response(request)
            except Exception as exc:
                body = json.dumps({"get_response_failed": str(exc), "tb": traceback.format_exc()}).encode()
                start_response("500 Internal Server Error", [("Content-Type", "application/json")])
                return [body]
            status = "%d %s" % (response.status_code, response.reason_phrase)
            headers = [(k, v) for k, v in response.items()]
            start_response(status, headers)
            content = response.content
            return [content] if content else [b'[]']
        except Exception as e:
            body = json.dumps({"outer_failed": str(e), "tb": traceback.format_exc()}).encode()
            start_response("500 Internal Server Error", [("Content-Type", "application/json")])
            return [body]

application = DebugWSGIHandler()
