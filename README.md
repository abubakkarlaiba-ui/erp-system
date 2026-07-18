# ERP System

Enterprise Resource Planning system built with Next.js 16 (Frontend) and Django 6 (Backend).

## Tech Stack

**Frontend:** Next.js 16, TypeScript, Tailwind CSS v4, Shadcn UI, Zustand, TanStack Query  
**Backend:** Django 6.0, Django REST Framework, SimpleJWT, drf-spectacular  
**Database:** PostgreSQL (NeonDB) / SQLite (development)  
**Storage:** Cloudinary  
**Deployment:** Docker, Nginx

## Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 15+ (or SQLite for dev)
- Docker & Docker Compose (optional)

## Quick Start

### 1. Clone & Setup

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend runs at http://localhost:8000  
API docs at http://localhost:8000/api/docs/

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:3000

### 4. Docker

```bash
docker-compose up --build
```

## API Documentation

- Swagger UI: http://localhost:8000/api/docs/
- OpenAPI Schema: http://localhost:8000/api/schema/

## Project Structure

```
ERP SYSTEM/
├── backend/          # Django REST API
│   ├── config/       # Settings, URLs, WSGI
│   └── apps/         # Django apps
│       ├── authentication/
│       ├── companies/
│       ├── employees/
│       ├── hr/
│       ├── accounting/
│       ├── inventory/
│       ├── sales/
│       └── purchase/
├── frontend/         # Next.js App
│   └── src/
│       ├── app/      # Routes
│       ├── features/ # Domain modules
│       ├── components/
│       └── lib/
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── nginx.conf
```

## Modules

- **Authentication** — JWT, RBAC, 2FA, Login History
- **Company Management** — Multi-company, Branches, Departments
- **Employee Management** — Profiles, Documents, Contracts
- **HR** — Attendance, Leave, Payroll, Recruitment, Performance
- **Accounting** — Chart of Accounts, Journals, Invoices, Payments
- **Inventory** — Products, Stock, Warehouses, Barcode
- **Sales** — Customers, Leads, Quotations, Orders
- **Purchase** — Suppliers, Purchase Orders, Goods Receipt

## License

Proprietary
