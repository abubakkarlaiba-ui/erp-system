from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.utils.permissions import IsCompanyOwnerOrEmployee
from apps.sales.models import (
    Customer,
    Lead,
    Opportunity,
    Quotation,
    QuotationItem,
    SalesOrder,
    SalesOrderItem,
    SalesReturn,
)
from apps.sales.serializers.sales_serializers import (
    CustomerSerializer,
    LeadSerializer,
    OpportunitySerializer,
    QuotationSerializer,
    QuotationCreateSerializer,
    QuotationItemSerializer,
    SalesOrderSerializer,
    SalesOrderCreateSerializer,
    SalesOrderItemSerializer,
    SalesReturnSerializer,
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


customer_list_schema = extend_schema(summary="List customers", tags=["Sales - Customers"])
customer_create_schema = extend_schema(summary="Create a customer", tags=["Sales - Customers"])
customer_retrieve_schema = extend_schema(summary="Retrieve a customer", tags=["Sales - Customers"])
customer_update_schema = extend_schema(summary="Update a customer", tags=["Sales - Customers"])
customer_partial_update_schema = extend_schema(summary="Partially update a customer", tags=["Sales - Customers"])
customer_destroy_schema = extend_schema(summary="Delete a customer", tags=["Sales - Customers"])

lead_list_schema = extend_schema(summary="List leads", tags=["Sales - Leads"])
lead_create_schema = extend_schema(summary="Create a lead", tags=["Sales - Leads"])
lead_retrieve_schema = extend_schema(summary="Retrieve a lead", tags=["Sales - Leads"])
lead_update_schema = extend_schema(summary="Update a lead", tags=["Sales - Leads"])
lead_partial_update_schema = extend_schema(summary="Partially update a lead", tags=["Sales - Leads"])
lead_destroy_schema = extend_schema(summary="Delete a lead", tags=["Sales - Leads"])

opportunity_list_schema = extend_schema(summary="List opportunities", tags=["Sales - Opportunities"])
opportunity_create_schema = extend_schema(summary="Create an opportunity", tags=["Sales - Opportunities"])
opportunity_retrieve_schema = extend_schema(summary="Retrieve an opportunity", tags=["Sales - Opportunities"])
opportunity_update_schema = extend_schema(summary="Update an opportunity", tags=["Sales - Opportunities"])
opportunity_partial_update_schema = extend_schema(summary="Partially update an opportunity", tags=["Sales - Opportunities"])
opportunity_destroy_schema = extend_schema(summary="Delete an opportunity", tags=["Sales - Opportunities"])

quotation_list_schema = extend_schema(summary="List quotations", tags=["Sales - Quotations"])
quotation_create_schema = extend_schema(summary="Create a quotation", tags=["Sales - Quotations"])
quotation_retrieve_schema = extend_schema(summary="Retrieve a quotation", tags=["Sales - Quotations"])
quotation_update_schema = extend_schema(summary="Update a quotation", tags=["Sales - Quotations"])
quotation_partial_update_schema = extend_schema(summary="Partially update a quotation", tags=["Sales - Quotations"])
quotation_destroy_schema = extend_schema(summary="Delete a quotation", tags=["Sales - Quotations"])

quotation_item_list_schema = extend_schema(summary="List quotation items", tags=["Sales - Quotation Items"])
quotation_item_create_schema = extend_schema(summary="Create a quotation item", tags=["Sales - Quotation Items"])
quotation_item_retrieve_schema = extend_schema(summary="Retrieve a quotation item", tags=["Sales - Quotation Items"])
quotation_item_update_schema = extend_schema(summary="Update a quotation item", tags=["Sales - Quotation Items"])
quotation_item_partial_update_schema = extend_schema(summary="Partially update a quotation item", tags=["Sales - Quotation Items"])
quotation_item_destroy_schema = extend_schema(summary="Delete a quotation item", tags=["Sales - Quotation Items"])

sales_order_list_schema = extend_schema(summary="List sales orders", tags=["Sales - Orders"])
sales_order_create_schema = extend_schema(summary="Create a sales order", tags=["Sales - Orders"])
sales_order_retrieve_schema = extend_schema(summary="Retrieve a sales order", tags=["Sales - Orders"])
sales_order_update_schema = extend_schema(summary="Update a sales order", tags=["Sales - Orders"])
sales_order_partial_update_schema = extend_schema(summary="Partially update a sales order", tags=["Sales - Orders"])
sales_order_destroy_schema = extend_schema(summary="Delete a sales order", tags=["Sales - Orders"])

sales_order_item_list_schema = extend_schema(summary="List sales order items", tags=["Sales - Order Items"])
sales_order_item_create_schema = extend_schema(summary="Create a sales order item", tags=["Sales - Order Items"])
sales_order_item_retrieve_schema = extend_schema(summary="Retrieve a sales order item", tags=["Sales - Order Items"])
sales_order_item_update_schema = extend_schema(summary="Update a sales order item", tags=["Sales - Order Items"])
sales_order_item_partial_update_schema = extend_schema(summary="Partially update a sales order item", tags=["Sales - Order Items"])
sales_order_item_destroy_schema = extend_schema(summary="Delete a sales order item", tags=["Sales - Order Items"])

sales_return_list_schema = extend_schema(summary="List sales returns", tags=["Sales - Returns"])
sales_return_create_schema = extend_schema(summary="Create a sales return", tags=["Sales - Returns"])
sales_return_retrieve_schema = extend_schema(summary="Retrieve a sales return", tags=["Sales - Returns"])
sales_return_update_schema = extend_schema(summary="Update a sales return", tags=["Sales - Returns"])
sales_return_partial_update_schema = extend_schema(summary="Partially update a sales return", tags=["Sales - Returns"])
sales_return_destroy_schema = extend_schema(summary="Delete a sales return", tags=["Sales - Returns"])


@extend_schema_view(
    list=customer_list_schema,
    create=customer_create_schema,
    retrieve=customer_retrieve_schema,
    update=customer_update_schema,
    partial_update=customer_partial_update_schema,
    destroy=customer_destroy_schema,
)
class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        return _filter_by_company(
            Customer.objects.all(), self.request
        )

    def perform_create(self, serializer):
        company_id = self.kwargs.get("company_pk")
        if company_id:
            serializer.save(company_id=company_id)
        else:
            serializer.save()


@extend_schema_view(
    list=lead_list_schema,
    create=lead_create_schema,
    retrieve=lead_retrieve_schema,
    update=lead_update_schema,
    partial_update=lead_partial_update_schema,
    destroy=lead_destroy_schema,
)
class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        return _filter_by_company(
            Lead.objects.select_related("assigned_to").all(), self.request
        )

    def perform_create(self, serializer):
        company_id = self.kwargs.get("company_pk")
        if company_id:
            serializer.save(company_id=company_id)
        else:
            serializer.save()


@extend_schema_view(
    list=opportunity_list_schema,
    create=opportunity_create_schema,
    retrieve=opportunity_retrieve_schema,
    update=opportunity_update_schema,
    partial_update=opportunity_partial_update_schema,
    destroy=opportunity_destroy_schema,
)
class OpportunityViewSet(viewsets.ModelViewSet):
    serializer_class = OpportunitySerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        return _filter_by_company(
            Opportunity.objects.select_related(
                "lead", "customer", "assigned_to"
            ).all(),
            self.request,
        )

    def perform_create(self, serializer):
        company_id = self.kwargs.get("company_pk")
        if company_id:
            serializer.save(company_id=company_id)
        else:
            serializer.save()


@extend_schema_view(
    list=quotation_list_schema,
    create=quotation_create_schema,
    retrieve=quotation_retrieve_schema,
    update=quotation_update_schema,
    partial_update=quotation_partial_update_schema,
    destroy=quotation_destroy_schema,
)
class QuotationViewSet(viewsets.ModelViewSet):
    serializer_class = QuotationSerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        return _filter_by_company(
            Quotation.objects.select_related(
                "customer", "created_by"
            ).all(),
            self.request,
        )

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return QuotationCreateSerializer
        return QuotationSerializer

    def perform_create(self, serializer):
        company_id = self.kwargs.get("company_pk")
        if company_id:
            serializer.save(company_id=company_id)
        else:
            serializer.save()


@extend_schema_view(
    list=quotation_item_list_schema,
    create=quotation_item_create_schema,
    retrieve=quotation_item_retrieve_schema,
    update=quotation_item_update_schema,
    partial_update=quotation_item_partial_update_schema,
    destroy=quotation_item_destroy_schema,
)
class QuotationItemViewSet(viewsets.ModelViewSet):
    serializer_class = QuotationItemSerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        qs = QuotationItem.objects.select_related("product").all()
        quotation_id = self.kwargs.get("quotation_pk")
        if quotation_id:
            qs = qs.filter(quotation_id=quotation_id)
        return qs

    def perform_create(self, serializer):
        quotation_id = self.kwargs.get("quotation_pk")
        if quotation_id:
            serializer.save(quotation_id=quotation_id)
        else:
            serializer.save()


@extend_schema_view(
    list=sales_order_list_schema,
    create=sales_order_create_schema,
    retrieve=sales_order_retrieve_schema,
    update=sales_order_update_schema,
    partial_update=sales_order_partial_update_schema,
    destroy=sales_order_destroy_schema,
)
class SalesOrderViewSet(viewsets.ModelViewSet):
    serializer_class = SalesOrderSerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        return _filter_by_company(
            SalesOrder.objects.select_related(
                "customer", "quotation", "created_by"
            ).all(),
            self.request,
        )

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return SalesOrderCreateSerializer
        return SalesOrderSerializer

    def perform_create(self, serializer):
        company_id = self.kwargs.get("company_pk")
        if company_id:
            serializer.save(company_id=company_id)
        else:
            serializer.save()


@extend_schema_view(
    list=sales_order_item_list_schema,
    create=sales_order_item_create_schema,
    retrieve=sales_order_item_retrieve_schema,
    update=sales_order_item_update_schema,
    partial_update=sales_order_item_partial_update_schema,
    destroy=sales_order_item_destroy_schema,
)
class SalesOrderItemViewSet(viewsets.ModelViewSet):
    serializer_class = SalesOrderItemSerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        qs = SalesOrderItem.objects.select_related("product").all()
        order_id = self.kwargs.get("order_pk")
        if order_id:
            qs = qs.filter(order_id=order_id)
        return qs

    def perform_create(self, serializer):
        order_id = self.kwargs.get("order_pk")
        if order_id:
            serializer.save(order_id=order_id)
        else:
            serializer.save()


@extend_schema_view(
    list=sales_return_list_schema,
    create=sales_return_create_schema,
    retrieve=sales_return_retrieve_schema,
    update=sales_return_update_schema,
    partial_update=sales_return_partial_update_schema,
    destroy=sales_return_destroy_schema,
)
class SalesReturnViewSet(viewsets.ModelViewSet):
    serializer_class = SalesReturnSerializer
    permission_classes = [IsAuthenticated, IsCompanyOwnerOrEmployee]

    def get_queryset(self):
        return _filter_by_company(
            SalesReturn.objects.select_related(
                "customer", "sales_order", "created_by"
            ).all(),
            self.request,
        )

    def perform_create(self, serializer):
        company_id = self.kwargs.get("company_pk")
        if company_id:
            serializer.save(company_id=company_id)
        else:
            serializer.save()
