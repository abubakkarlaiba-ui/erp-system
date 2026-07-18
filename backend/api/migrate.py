import os, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from django.conf import settings
from django.core.management import call_command
from io import StringIO

def handler(event, context):
    out = StringIO()
    err = StringIO()
    call_command("migrate", stdout=out, stderr=err, no_color=True, run_syncdb=False)
    return {
        "statusCode": 200,
        "body": out.getvalue() + "\n" + err.getvalue()
    }
