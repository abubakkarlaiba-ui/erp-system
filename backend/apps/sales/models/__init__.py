from apps.sales.models.customer import Customer
from apps.sales.models.lead import Lead
from apps.sales.models.opportunity import Opportunity
from apps.sales.models.quotation import Quotation, QuotationItem
from apps.sales.models.sales_order import SalesOrder, SalesOrderItem
from apps.sales.models.return import SalesReturn

__all__ = [
    "Customer",
    "Lead",
    "Opportunity",
    "Quotation",
    "QuotationItem",
    "SalesOrder",
    "SalesOrderItem",
    "SalesReturn",
]
