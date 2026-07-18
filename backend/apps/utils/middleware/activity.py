import logging

from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger("apps.activity")


class ActivityLogMiddleware(MiddlewareMixin):
    SKIP_PATHS = (
        "/admin/",
        "/api/docs/",
        "/api/schema/",
        "/static/",
        "/media/",
        "/favicon.ico",
    )

    def process_response(self, request, response):
        if not hasattr(request, "user") or not getattr(request.user, "is_authenticated", False):
            return response

        if any(request.path.startswith(p) for p in self.SKIP_PATHS):
            return response

        if request.method not in ("POST", "PUT", "PATCH", "DELETE"):
            return response

        try:
            from apps.authentication.models import ActivityLog

            ActivityLog.objects.create(
                user=request.user,
                action=f"{request.method} {request.path}",
                description=self._build_description(request),
                ip_address=self._get_client_ip(request),
            )
        except Exception as e:
            logger.error("Activity log error: %s", e)

        return response

    def _build_description(self, request):
        method = request.method
        path = request.path.rstrip("/")
        return f"{method} {path}"

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR", "")
