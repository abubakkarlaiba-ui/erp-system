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
from django.http import JsonResponse

# Force DEBUG off so we can see our custom error handler
settings.DEBUG = False

# Monkey-patch Django's exception handler
from django.core.handlers import base as handlers_base

original_handle_uncaught = handlers_base.BaseHandler.handle_uncaught_exception

def json_error_handler(self, request, exc):
    tb = traceback.format_exc()
    return JsonResponse({"error": str(exc), "traceback": tb}, status=500)

handlers_base.BaseHandler.handle_uncaught_exception = json_error_handler

# Also override process_exception_by_middleware to catch middleware-processed exceptions
original_process_exception = handlers_base.BaseHandler.process_exception_by_middleware

def debug_process_exception(self, request, exception):
    response = original_process_exception(self, request, exception)
    if response is None:
        return None
    return response

handlers_base.BaseHandler.process_exception_by_middleware = debug_process_exception

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
