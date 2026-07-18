import os, sys, json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from io import StringIO
from django.core.wsgi import get_wsgi_application
from django.core.management import call_command
from django.http import JsonResponse

MIGRATION_OUTPUT = None
try:
    out = StringIO()
    call_command("migrate", stdout=out, stderr=out, no_color=True, verbosity=2)
    MIGRATION_OUTPUT = out.getvalue()
except Exception as e:
    import traceback
    MIGRATION_OUTPUT = f"FAILED: {e}\n{traceback.format_exc()}"

from django.core.handlers.wsgi import WSGIHandler
from django.conf import settings

class MigrationAwareHandler(WSGIHandler):
    def __call__(self, environ, start_response):
        if environ.get("PATH_INFO") == "/api/migrate-status/":
            body = json.dumps({"migration_output": MIGRATION_OUTPUT, "debug": settings.DEBUG}).encode()
            start_response("200 OK", [("Content-Type", "application/json")])
            return [body]
        return super().__call__(environ, start_response)

application = MigrationAwareHandler()
