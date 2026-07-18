from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

urlpatterns = [
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
