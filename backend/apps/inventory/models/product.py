from django.core.validators import MinValueValidator
from django.db import models
from django.utils.text import slugify

from apps.utils.models.base import CompanyScopedModel


class Product(CompanyScopedModel):
    class ProductType(models.TextChoices):
        GOODS = "goods", "Goods"
        SERVICE = "service", "Service"
        SUBSCRIPTION = "subscription", "Subscription"

    class Unit(models.TextChoices):
        PIECE = "piece", "Piece"
        KG = "kg", "Kilogram"
        LITER = "liter", "Liter"
        METER = "meter", "Meter"
        BOX = "box", "Box"

    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100)
    barcode = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    category = models.ForeignKey(
        "inventory.Category",
        on_delete=models.PROTECT,
        related_name="products",
    )
    brand = models.ForeignKey(
        "inventory.Brand",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )
    product_type = models.CharField(
        max_length=20,
        choices=ProductType.choices,
        default=ProductType.GOODS,
    )
    cost_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    selling_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    unit = models.CharField(
        max_length=10,
        choices=Unit.choices,
        default=Unit.PIECE,
    )
    minimum_stock = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
    )
    reorder_level = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
    )
    weight = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    dimensions = models.CharField(max_length=255, null=True, blank=True)
    image = models.ImageField(upload_to="products/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    slug = models.SlugField(max_length=255)

    class Meta:
        ordering = ["name"]
        unique_together = ["company", "sku"]

    def __str__(self):
        return f"{self.name} ({self.sku})"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def current_stock(self):
        from apps.inventory.models.stock import Stock

        total = Stock.objects.filter(
            product=self,
            warehouse__company=self.company,
        ).aggregate(total=models.Sum("quantity"))["total"]
        return total or 0


class ProductVariant(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="variants",
    )
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100)
    barcode = models.CharField(max_length=255, null=True, blank=True)
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    cost_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    attributes = models.JSONField(default=dict)
    image = models.ImageField(upload_to="product_variants/", null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        unique_together = ["product", "sku"]

    def __str__(self):
        return f"{self.product.name} - {self.name}"
