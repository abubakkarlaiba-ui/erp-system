import os
import sys
import json
import traceback
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ["DJANGO_SETTINGS_MODULE"] = "config.settings"

# Minimal init: just import django
django_ok = False
django_error = None

try:
    import django
    django_ok = True
except Exception as e:
    django_error = traceback.format_exc()

def application(environ, start_response):
    body = json.dumps({
        "django_ok": django_ok,
        "django_error": django_error,
    }).encode()
    start_response("200 OK", [("Content-Type", "application/json")])
    return [body]
