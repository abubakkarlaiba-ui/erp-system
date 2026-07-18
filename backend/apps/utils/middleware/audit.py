import json
import logging

from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger("apps.audit")


class AuditLogMiddleware(MiddlewareMixin):
    AUDITABLE_METHODS = ("POST", "PUT", "PATCH", "DELETE")

    def process_request(self, request):
        request._audit_body = None
        if request.method in self.AUDITABLE_METHODS and hasattr(request, "body"):
            try:
                request._audit_body = json.loads(request.body)
            except (json.JSONDecodeError, UnicodeDecodeError):
                request._audit_body = None

    def process_response(self, request, response):
        if not hasattr(request, "_audit_body"):
            return response

        if not hasattr(request, "user") or not getattr(request.user, "is_authenticated", False):
            return response

        if request.path.startswith("/admin/") or request.path.startswith("/api/docs/"):
            return response

        try:
            from apps.authentication.models import AuditLog

            model_name = self._extract_model_name(request)
            object_id = self._extract_object_id(request)
            action = self._get_action(request.method)

            if action and model_name:
                changes = self._get_changes(request, response)
                AuditLog.objects.create(
                    user=request.user,
                    action=action,
                    model_name=model_name,
                    object_id=object_id or "",
                    changes=changes,
                    ip_address=self._get_client_ip(request),
                    user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
                )
        except Exception as e:
            logger.error("Audit log error: %s", e)

        return response

    def _get_action(self, method):
        return {
            "POST": "create",
            "PUT": "update",
            "PATCH": "update",
            "DELETE": "delete",
        }.get(method)

    def _extract_model_name(self, request):
        parts = request.path.strip("/").split("/")
        for part in parts:
            if part.startswith("api"):
                continue
            if part.startswith("v1"):
                continue
            if part.isdigit():
                continue
            if part in ("auth", "companies", "employees", "hr", "accounting", "inventory", "sales", "purchase"):
                return part
        return None

    def _extract_object_id(self, request):
        parts = request.path.strip("/").split("/")
        for i, part in enumerate(parts):
            if part in ("auth", "companies", "employees", "hr", "accounting", "inventory", "sales", "purchase"):
                if i + 1 < len(parts) and parts[i + 1].isdigit():
                    return parts[i + 1]
        return None

    def _get_changes(self, request, response):
        changes = {}
        if request._audit_body:
            changes["request_data"] = request._audit_body
        if hasattr(response, "data") and isinstance(response.data, dict):
            changes["response_status"] = response.status_code
        return changes

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR", "")
