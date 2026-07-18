import json

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.companies.models import Company, Branch, Department, Designation, FiscalYear

User = get_user_model()


class Command(BaseCommand):
    help = "Seed the database with initial data"

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        company, _ = Company.objects.get_or_create(
            name="Demo Corporation",
            defaults={
                "registration_number": "REG-2026-001",
                "tax_id": "TAX-12345678",
                "email": "info@democorp.com",
                "phone": "+1-555-0100",
                "website": "https://democorp.com",
                "address_line1": "100 Business Ave",
                "city": "New York",
                "state": "NY",
                "country": "US",
                "postal_code": "10001",
                "default_currency": "USD",
            },
        )
        self.stdout.write(self.style.SUCCESS(f"Created company: {company.name}"))

        headquarters, _ = Branch.objects.get_or_create(
            company=company,
            name="Headquarters",
            defaults={
                "code": "HQ",
                "address_line1": "100 Business Ave",
                "city": "New York",
                "state": "NY",
                "country": "US",
                "is_headquarters": True,
            },
        )
        Branch.objects.get_or_create(
            company=company,
            name="West Coast Office",
            defaults={
                "code": "WC",
                "address_line1": "200 Tech Blvd",
                "city": "San Francisco",
                "state": "CA",
                "country": "US",
            },
        )
        self.stdout.write(self.style.SUCCESS("Created branches"))

        departments_data = [
            ("Executive", "EXEC"),
            ("Human Resources", "HR"),
            ("Finance", "FIN"),
            ("Sales", "SAL"),
            ("Marketing", "MKT"),
            ("IT", "IT"),
            ("Operations", "OPS"),
            ("Legal", "LEG"),
        ]
        for name, code in departments_data:
            Department.objects.get_or_create(
                company=company, code=code, defaults={"name": name}
            )
        self.stdout.write(self.style.SUCCESS("Created departments"))

        designations_data = [
            ("CEO", "Executive", 10),
            ("CTO", "Executive", 10),
            ("CFO", "Executive", 10),
            ("VP Sales", "Sales", 9),
            ("HR Manager", "Human Resources", 8),
            ("Software Engineer", "IT", 6),
            ("Accountant", "Finance", 6),
            ("Sales Representative", "Sales", 5),
            ("Marketing Specialist", "Marketing", 5),
            ("Office Administrator", "Operations", 4),
        ]
        for title, dept_name, level in designations_data:
            dept = Department.objects.filter(company=company, name=dept_name).first()
            Designation.objects.get_or_create(
                company=company,
                name=title,
                defaults={"code": title.upper().replace(" ", "-"), "level": level},
            )
        self.stdout.write(self.style.SUCCESS("Created designations"))

        FiscalYear.objects.get_or_create(
            company=company,
            name="FY 2026",
            defaults={
                "start_date": "2026-01-01",
                "end_date": "2026-12-31",
                "is_current": True,
            },
        )
        self.stdout.write(self.style.SUCCESS("Created fiscal year"))

        if not User.objects.filter(email="admin@demo.com").exists():
            admin = User.objects.create_superuser(
                email="admin@demo.com",
                password="admin123",
                first_name="Admin",
                last_name="User",
                role="super_admin",
                is_verified=True,
            )
            self.stdout.write(self.style.SUCCESS(f"Created super admin: admin@demo.com"))

        if not User.objects.filter(email="owner@demo.com").exists():
            owner = User.objects.create_user(
                email="owner@demo.com",
                password="owner123",
                first_name="John",
                last_name="Owner",
                role="company_owner",
                company=company,
                is_verified=True,
            )
            self.stdout.write(self.style.SUCCESS(f"Created company owner: owner@demo.com"))

        if not User.objects.filter(email="hr@demo.com").exists():
            User.objects.create_user(
                email="hr@demo.com",
                password="hr12345",
                first_name="Sarah",
                last_name="HR Manager",
                role="hr_manager",
                company=company,
                is_verified=True,
            )

        if not User.objects.filter(email="sales@demo.com").exists():
            User.objects.create_user(
                email="sales@demo.com",
                password="sales123",
                first_name="Mike",
                last_name="Sales Rep",
                role="sales_staff",
                company=company,
                is_verified=True,
            )

        if not User.objects.filter(email="accountant@demo.com").exists():
            User.objects.create_user(
                email="accountant@demo.com",
                password="account123",
                first_name="Lisa",
                last_name="Accountant",
                role="accountant",
                company=company,
                is_verified=True,
            )

        self.stdout.write(self.style.SUCCESS("Created demo users"))
        self.stdout.write(self.style.SUCCESS("\nDemo Credentials:"))
        self.stdout.write(f"  Super Admin: admin@demo.com / admin123")
        self.stdout.write(f"  Company Owner: owner@demo.com / owner123")
        self.stdout.write(f"  HR Manager: hr@demo.com / hr12345")
        self.stdout.write(f"  Sales: sales@demo.com / sales123")
        self.stdout.write(f"  Accountant: accountant@demo.com / account123")
        self.stdout.write(self.style.SUCCESS("\nDone!"))
