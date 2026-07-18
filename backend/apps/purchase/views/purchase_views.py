from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.utils.permissions import IsCompanyOwnerOrEmployee
from apps.purchase.models import (
    Supplier,
    PurchaseRequest,
    PurchaseRequestItem,
    PurchaseOrder,
    PurchaseOrderItem,
    GoodsReceipt,
    GoodsReceiptItem,
    VendorBill,
    PurchaseReturn,
)
from apps.purchase.serializers.purchase_serializers import (
    SupplierSerializer,
    PurchaseRequestSerializer,
    PurchaseRequestItemSerializer,
    PurchaseOrderSerializer,
    PurchaseOrderItemSerializer,
    GoodsReceiptSerializer,
    GoodsReceiptItemSerializer,
    VendorBillSerializer,
    PurchaseReturnSerializer,
)


def _get_user_company(request):
    if hasattr(request.user, "company") and request.user.company:
        return request.user.company
    return None


def _filter_by_company(queryset, request):
    if request.user.is_superuser:
        return queryset
    company = _get_user_company(request)
    if company:
        return queryset.filter(company=company)
    return queryset.none()


class SupplierViewSet(viewsets.ModelViewSet):
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        return _filter_by_company(
            Supplier.objects.select_related("company"), self.request
        )

    def perform_create(self, serializer):
        serializer.save()


class PurchaseRequestViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseRequestSerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        return _filter_by_company(
            PurchaseRequest.objects.select_related(
                "requested_by", "department"
            ),
            self.request,
        )

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)


class PurchaseRequestItemViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseRequestItemSerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        qs = PurchaseRequestItem.objects.select_related("product")
        request_pk = self.kwargs.get("request_pk")
        if request_pk:
            qs = qs.filter(request_id=request_pk)
        return qs

    def perform_create(self, serializer):
        request_pk = self.kwargs.get("request_pk")
        if request_pk:
            serializer.save(request_id=request_pk)
        else:
            serializer.save()


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        return _filter_by_company(
            PurchaseOrder.objects.select_related("supplier", "created_by"),
            self.request,
        )

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PurchaseOrderItemViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseOrderItemSerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        qs = PurchaseOrderItem.objects.select_related("product")
        order_pk = self.kwargs.get("order_pk")
        if order_pk:
            qs = qs.filter(order_id=order_pk)
        return qs

    def perform_create(self, serializer):
        order_pk = self.kwargs.get("order_pk")
        if order_pk:
            serializer.save(order_id=order_pk)
        else:
            serializer.save()


class GoodsReceiptViewSet(viewsets.ModelViewSet):
    serializer_class = GoodsReceiptSerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        qs = GoodsReceipt.objects.select_related(
            "purchase_order", "warehouse", "received_by"
        )
        if not self.request.user.is_superuser:
            company = _get_user_company(self.request)
            if company:
                qs = qs.filter(purchase_order__company=company)
            else:
                qs = qs.none()
        return qs

    def perform_create(self, serializer):
        serializer.save(received_by=self.request.user)


class GoodsReceiptItemViewSet(viewsets.ModelViewSet):
    serializer_class = GoodsReceiptItemSerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        qs = GoodsReceiptItem.objects.select_related(
            "product", "purchase_order_item"
        )
        receipt_pk = self.kwargs.get("receipt_pk")
        if receipt_pk:
            qs = qs.filter(receipt_id=receipt_pk)
        return qs

    def perform_create(self, serializer):
        receipt_pk = self.kwargs.get("receipt_pk")
        if receipt_pk:
            serializer.save(receipt_id=receipt_pk)
        else:
            serializer.save()


class VendorBillViewSet(viewsets.ModelViewSet):
    serializer_class = VendorBillSerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        return _filter_by_company(
            VendorBill.objects.select_related("supplier", "created_by"),
            self.request,
        )

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PurchaseReturnViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseReturnSerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        return _filter_by_company(
            PurchaseReturn.objects.select_related(
                "supplier", "purchase_order", "created_by"
            ),
            self.request,
        )

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
