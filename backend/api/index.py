import os, sys, json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from django.core.wsgi import get_wsgi_application
from django.core.management import call_command
from io import StringIO

# Run migrations on cold start
try:
    import logging
    logger = logging.getLogger("migrations")
    out = StringIO()
    call_command("migrate", stdout=out, stderr=out, no_color=True, verbosity=2)
    logger.info("Migrations output: %s", out.getvalue())
except Exception as e:
    logger = logging.getLogger("migrations")
    logger.exception("Migration failed: %s", e)

application = get_wsgi_application()
