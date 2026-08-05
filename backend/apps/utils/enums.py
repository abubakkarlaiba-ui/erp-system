from django.db import models


class Currency(models.TextChoices):
    USD = "USD", "US Dollar"
    EUR = "EUR", "Euro"
    GBP = "GBP", "British Pound"
    JPY = "JPY", "Japanese Yen"
    CAD = "CAD", "Canadian Dollar"
    AUD = "AUD", "Australian Dollar"
    INR = "INR", "Indian Rupee"
    AED = "AED", "UAE Dirham"
    SAR = "SAR", "Saudi Riyal"
    PKR = "PKR", "Pakistani Rupee"
    CNY = "CNY", "Chinese Yuan"
    TRY = "TRY", "Turkish Lira"
    BRL = "BRL", "Brazilian Real"
    KRW = "KRW", "South Korean Won"
    NGN = "NGN", "Nigerian Naira"
    ZAR = "ZAR", "South African Rand"
    EGP = "EGP", "Egyptian Pound"
    THB = "THB", "Thai Baht"
    MYR = "MYR", "Malaysian Ringgit"
    IDR = "IDR", "Indonesian Rupiah"
    PHP = "PHP", "Philippine Peso"
    VND = "VND", "Vietnamese Dong"
    KWD = "KWD", "Kuwaiti Dinar"
    QAR = "QAR", "Qatari Riyal"
    BHD = "BHD", "Bahraini Dinar"
    OMR = "OMR", "Omani Rial"
    JOD = "JOD", "Jordanian Dinar"
    LBP = "LBP", "Lebanese Pound"
    IQD = "IQD", "Iraqi Dinar"
    MAD = "MAD", "Moroccan Dirham"
    TND = "TND", "Tunisian Dinar"
    KES = "KES", "Kenyan Shilling"
    GHS = "GHS", "Ghanaian Cedi"
    TZS = "TZS", "Tanzanian Shilling"
    UGX = "UGX", "Ugandan Shilling"
    ETB = "ETB", "Ethiopian Birr"
    XOF = "XOF", "CFA Franc"
    RUB = "RUB", "Russian Ruble"
    UAH = "UAH", "Ukrainian Hryvnia"
    PLN = "PLN", "Polish Zloty"
    SEK = "SEK", "Swedish Krona"
    NOK = "NOK", "Norwegian Krone"
    DKK = "DKK", "Danish Krone"
    CHF = "CHF", "Swiss Franc"
    NZD = "NZD", "New Zealand Dollar"
    HKD = "HKD", "Hong Kong Dollar"
    SGD = "SGD", "Singapore Dollar"
    TWD = "TWD", "Taiwan Dollar"
    MUR = "MUR", "Mauritian Rupee"
    BDT = "BDT", "Bangladeshi Taka"
    LKR = "LKR", "Sri Lankan Rupee"
    NPR = "NPR", "Nepalese Rupee"
    AFN = "AFN", "Afghan Afghani"
    MMK = "MMK", "Myanmar Kyat"
    KHR = "KHR", "Cambodian Riel"
    LAK = "LAK", "Laotian Kip"
    MNT = "MNT", "Mongolian Tugrik"
    GEL = "GEL", "Georgian Lari"
    AMD = "AMD", "Armenian Dram"
    AZN = "AZN", "Azerbaijani Manat"
    KZT = "KZT", "Kazakhstani Tenge"
    UZS = "UZS", "Uzbekistani Som"
    TJS = "TJS", "Tajikistani Somoni"
    KGS = "KGS", "Kyrgystani Som"
    TMT = "TMT", "Turkmenistani Manat"
    BYN = "BYN", "Belarusian Ruble"
    MDA = "MDA", "Moldovan Leu"
    ALL = "ALL", "Albanian Lek"
    BAM = "BAM", "Bosnia-Herzegovina Mark"
    MKD = "MKD", "Macedonian Denar"
    RSD = "RSD", "Serbian Dinar"
    HRK = "HRK", "Croatian Kuna"
    BGN = "BGN", "Bulgarian Lev"
    ISK = "ISK", "Icelandic Krona"
    HUF = "HUF", "Hungarian Forint"
    CZK = "CZK", "Czech Koruna"
    MDL = "MDL", "Moldovan Leu"
    GMD = "GMD", "Gambian Dalasi"
    SLL = "SLL", "Sierra Leonean Leone"
    LRD = "LRD", "Liberian Dollar"
    CDF = "CDF", "Congolese Franc"
    BIF = "BIF", "Burundian Franc"
    RWF = "RWF", "Rwandan Franc"
    MWK = "MWK", "Malawian Kwacha"
    ZMW = "ZMW", "Zambian Kwacha"
    SZL = "SZL", "Swazi Lilangeni"
    LSL = "LSL", "Lesotho Loti"
    NAD = "NAD", "Namibian Dollar"
    BWP = "BWP", "Botswana Pula"
    MZN = "MZN", "Mozambican Metical"
    AOA = "AOA", "Angolan Kwanza"
    MGA = "MGA", "Malagasy Ariary"
    SCR = "SCR", "Seychellois Rupee"
    MVR = "MVR", "Maldivian Rufiyaa"
    BTN = "BTN", "Bhutanese Ngultrum"
    BND = "BND", "Brunei Dollar"
    XPF = "XPF", "CFP Franc"
    TOP = "TOP", "Tongan Pa'anga"
    WST = "WST", "Samoan Tala"
    FJD = "FJD", "Fijian Dollar"
    PGK = "PGK", "Papua New Guinean Kina"
    SBD = "SBD", "Solomon Islands Dollar"
    VUV = "VUV", "Vanuatu Vatu"


class PaymentMethod(models.TextChoices):
    CASH = "cash", "Cash"
    BANK_TRANSFER = "bank_transfer", "Bank Transfer"
    CHECK = "check", "Check"
    CREDIT_CARD = "credit_card", "Credit Card"
    DEBIT_CARD = "debit_card", "Debit Card"
    ONLINE = "online", "Online Payment"
    WALLET = "wallet", "Digital Wallet"


class OrderStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PENDING = "pending", "Pending"
    CONFIRMED = "confirmed", "Confirmed"
    PROCESSING = "processing", "Processing"
    SHIPPED = "shipped", "Shipped"
    DELIVERED = "delivered", "Delivered"
    COMPLETED = "completed", "Completed"
    CANCELLED = "cancelled", "Cancelled"
    REFUNDED = "refunded", "Refunded"


class InvoiceStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PENDING = "pending", "Pending"
    SENT = "sent", "Sent"
    PAID = "paid", "Paid"
    PARTIAL = "partial", "Partially Paid"
    OVERDUE = "overdue", "Overdue"
    CANCELLED = "cancelled", "Cancelled"


class PaymentStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    COMPLETED = "completed", "Completed"
    FAILED = "failed", "Failed"
    REFUNDED = "refunded", "Refunded"


class LeaveStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"
    CANCELLED = "cancelled", "Cancelled"


class AttendanceStatus(models.TextChoices):
    PRESENT = "present", "Present"
    ABSENT = "absent", "Absent"
    LATE = "late", "Late"
    HALF_DAY = "half_day", "Half Day"
    ON_LEAVE = "on_leave", "On Leave"
    HOLIDAY = "holiday", "Holiday"


class EmployeeStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    INACTIVE = "inactive", "Inactive"
    ON_LEAVE = "on_leave", "On Leave"
    TERMINATED = "terminated", "Terminated"
    RESIGNED = "resigned", "Resigned"
    RETIRED = "retired", "Retired"


class StockMovementType(models.TextChoices):
    PURCHASE = "purchase", "Purchase"
    SALE = "sale", "Sale"
    TRANSFER = "transfer", "Transfer"
    ADJUSTMENT = "adjustment", "Adjustment"
    RETURN = "return", "Return"
    DAMAGE = "damage", "Damage"
    PRODUCTION = "production", "Production"


class AssetStatus(models.TextChoices):
    AVAILABLE = "available", "Available"
    ASSIGNED = "assigned", "Assigned"
    MAINTENANCE = "maintenance", "Maintenance"
    RETIRED = "retired", "Retired"


class TicketStatus(models.TextChoices):
    OPEN = "open", "Open"
    IN_PROGRESS = "in_progress", "In Progress"
    RESOLVED = "resolved", "Resolved"
    CLOSED = "closed", "Closed"


class TicketPriority(models.TextChoices):
    LOW = "low", "Low"
    MEDIUM = "medium", "Medium"
    HIGH = "high", "High"
    URGENT = "urgent", "Urgent"


class AccountType(models.TextChoices):
    ASSET = "asset", "Asset"
    LIABILITY = "liability", "Liability"
    EQUITY = "equity", "Equity"
    REVENUE = "revenue", "Revenue"
    EXPENSE = "expense", "Expense"


class JournalEntryStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    POSTED = "posted", "Posted"
    CANCELLED = "cancelled", "Cancelled"


class DayOfWeek(models.TextChoices):
    MONDAY = "0", "Monday"
    TUESDAY = "1", "Tuesday"
    WEDNESDAY = "2", "Wednesday"
    THURSDAY = "3", "Thursday"
    FRIDAY = "4", "Friday"
    SATURDAY = "5", "Saturday"
    SUNDAY = "6", "Sunday"
