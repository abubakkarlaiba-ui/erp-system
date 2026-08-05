from django.db import migrations


def backfill_created_by(apps, schema_editor):
    Company = apps.get_model("companies", "Company")
    User = apps.get_model("authentication", "User")
    for company in Company.objects.filter(created_by__isnull=True):
        user = User.objects.filter(company=company).first()
        if user:
            company.created_by = user
            company.save(update_fields=["created_by"])
        else:
            owner = User.objects.filter(role="company_owner").first()
            if owner:
                company.created_by = owner
                company.save(update_fields=["created_by"])


def reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("companies", "0003_add_created_by_to_company"),
        ("authentication", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(backfill_created_by, reverse),
    ]
