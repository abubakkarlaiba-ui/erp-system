from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.utils.text import slugify
from apps.utils.enums import Currency
from apps.utils.models.base import UUIDModel


class Company(UUIDModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    registration_number = models.CharField(max_length=100, blank=True)
    tax_id = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    website = models.URLField(blank=True)
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    logo = models.ImageField(upload_to="company_logos/", blank=True, null=True)
    default_currency = models.CharField(
        max_length=3,
        choices=[(c.value, c.value) for c in Currency],
        default=Currency.USD.value,
    )
    fiscal_year_start = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(12)],
    )
    settings = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "companies"
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Company.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
