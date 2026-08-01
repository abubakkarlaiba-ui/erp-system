from django.db import migrations


def make_admin_superuser(apps, schema_editor):
    User = apps.get_model("authentication", "User")
    User.objects.filter(
        email="abubakkar.laiba@gmail.com"
    ).update(
        is_staff=True,
        is_superuser=True,
        role="admin",
    )


def reverse_make_admin_superuser(apps, schema_editor):
    User = apps.get_model("authentication", "User")
    User.objects.filter(
        email="abubakkar.laiba@gmail.com"
    ).update(
        is_staff=False,
        is_superuser=False,
        role="employee",
    )


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0004_avatar_to_textfield"),
    ]

    operations = [
        migrations.RunPython(make_admin_superuser, reverse_make_admin_superuser),
    ]
