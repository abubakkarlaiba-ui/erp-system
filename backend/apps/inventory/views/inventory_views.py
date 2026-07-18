from django.db import models
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.inventory.models.adjustment import StockAdjustment, StockAdjustmentItem
from apps.inventory.models.brand import Brand
from apps.inventory.models.category import Category
from apps.inventory.models.product import Product, ProductVariant
from apps.inventory.models.stock import Stock, StockMovement
from apps.inventory.models.warehouse import Bin, Warehouse
from apps.inventory.serializers.inventory_serializers import (
    BinSerializer,
    BrandSerializer,
    CategorySerializer,
    ProductSerializer,
    ProductVariantSerializer,
    StockAdjustmentItemSerializer,
    StockAdjustmentSerializer,
    StockMovementSerializer,
    StockSerializer,
    WarehouseSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(
            company=self.request.user.company,
            is_active=True,
        )

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


class BrandViewSet(viewsets.ModelViewSet):
    serializer_class = BrandSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Brand.objects.filter(
            company=self.request.user.company,
            is_active=True,
        )

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Product.objects.filter(
            company=self.request.user.company,
        )
        category = self.request.query_params.get("category")
        brand = self.request.query_params.get("brand")
        product_type = self.request.query_params.get("product_type")
        is_active = self.request.query_params.get("is_active")
        search = self.request.query_params.get("search")

        if category:
            queryset = queryset.filter(category_id=category)
        if brand:
            queryset = queryset.filter(brand_id=brand)
        if product_type:
            queryset = queryset.filter(product_type=product_type)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search)
                | models.Q(sku__icontains=search)
                | models.Q(barcode__icontains=search)
            )
        return queryset

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


class ProductVariantViewSet(viewsets.ModelViewSet):
    serializer_class = ProductVariantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ProductVariant.objects.filter(
            product__company=self.request.user.company,
        )
        product = self.request.query_params.get("product")
        if product:
            queryset = queryset.filter(product_id=product)
        return queryset


class WarehouseViewSet(viewsets.ModelViewSet):
    serializer_class = WarehouseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Warehouse.objects.filter(
            company=self.request.user.company,
            is_active=True,
        )

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


class BinViewSet(viewsets.ModelViewSet):
    serializer_class = BinSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Bin.objects.filter(
            warehouse__company=self.request.user.company,
        )
        warehouse = self.request.query_params.get("warehouse")
        if warehouse:
            queryset = queryset.filter(warehouse_id=warehouse)
        return queryset


class StockViewSet(viewsets.ModelViewSet):
    serializer_class = StockSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Stock.objects.filter(
            company=self.request.user.company,
        )
        product = self.request.query_params.get("product")
        warehouse = self.request.query_params.get("warehouse")
        variant = self.request.query_params.get("variant")

        if product:
            queryset = queryset.filter(product_id=product)
        if warehouse:
            queryset = queryset.filter(warehouse_id=warehouse)
        if variant:
            queryset = queryset.filter(variant_id=variant)
        return queryset

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    @action(detail=False, methods=["get"])
    def low_stock(self, request):
        products_with_low_stock = Product.objects.filter(
            company=request.user.company,
            is_active=True,
            stocks__quantity__lte=models.F("reorder_level"),
        ).distinct()

        page = self.paginate_queryset(products_with_low_stock)
        if page is not None:
            serializer = ProductSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = ProductSerializer(products_with_low_stock, many=True)
        return Response(serializer.data)


class StockMovementViewSet(viewsets.ModelViewSet):
    serializer_class = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = StockMovement.objects.filter(
            company=self.request.user.company,
        )
        product = self.request.query_params.get("product")
        movement_type = self.request.query_params.get("movement_type")
        warehouse = self.request.query_params.get("warehouse")

        if product:
            queryset = queryset.filter(product_id=product)
        if movement_type:
            queryset = queryset.filter(movement_type=movement_type)
        if warehouse:
            queryset = queryset.filter(
                models.Q(from_warehouse_id=warehouse)
                | models.Q(to_warehouse_id=warehouse)
            )
        return queryset

    def perform_create(self, serializer):
        serializer.save(
            company=self.request.user.company,
            created_by=self.request.user,
        )


class StockAdjustmentViewSet(viewsets.ModelViewSet):
    serializer_class = StockAdjustmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = StockAdjustment.objects.filter(
            company=self.request.user.company,
        )
        status = self.request.query_params.get("status")
        warehouse = self.request.query_params.get("warehouse")

        if status:
            queryset = queryset.filter(status=status)
        if warehouse:
            queryset = queryset.filter(warehouse_id=warehouse)
        return queryset

    def perform_create(self, serializer):
        serializer.save(
            company=self.request.user.company,
            created_by=self.request.user,
        )

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        adjustment = self.get_object()
        if adjustment.status != StockAdjustment.Status.DRAFT:
            return Response(
                {"error": "Only draft adjustments can be submitted."},
                status=400,
            )
        adjustment.status = StockAdjustment.Status.SUBMITTED
        adjustment.save()
        return Response(StockAdjustmentSerializer(adjustment).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        adjustment = self.get_object()
        if adjustment.status != StockAdjustment.Status.SUBMITTED:
            return Response(
                {"error": "Only submitted adjustments can be approved."},
                status=400,
            )
        adjustment.status = StockAdjustment.Status.APPROVED
        adjustment.approved_by = request.user
        adjustment.save()
        return Response(StockAdjustmentSerializer(adjustment).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        adjustment = self.get_object()
        if adjustment.status != StockAdjustment.Status.SUBMITTED:
            return Response(
                {"error": "Only submitted adjustments can be rejected."},
                status=400,
            )
        adjustment.status = StockAdjustment.Status.REJECTED
        adjustment.save()
        return Response(StockAdjustmentSerializer(adjustment).data)


class StockAdjustmentItemViewSet(viewsets.ModelViewSet):
    serializer_class = StockAdjustmentItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = StockAdjustmentItem.objects.filter(
            adjustment__company=self.request.user.company,
        )
        adjustment = self.request.query_params.get("adjustment")
        if adjustment:
            queryset = queryset.filter(adjustment_id=adjustment)
        return queryset
