from django.db import models
from django.utils.text import slugify

from apps.utils.models.base import CompanyScopedModel


class Brand(CompanyScopedModel):
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=500, null=True, blank=True)
    logo = models.ImageField(upload_to="brands/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    slug = models.SlugField(max_length=255)

    class Meta:
        ordering = ["name"]
        unique_together = ["company", "slug"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
