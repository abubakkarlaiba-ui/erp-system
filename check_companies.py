import requests, json

base = 'https://erp-system-backend-five.vercel.app/api/v1'
r = requests.post(base + '/auth/login/', json={'email': 'abubakkar.laiba@gmail.com', 'password': 'abubakkar22131'})
h = {'Authorization': 'Bearer ' + r.json()['access']}

r_users = requests.get(base + '/auth/users/', headers=h)
print('Users status:', r_users.status_code)
if r_users.status_code == 200:
    users = r_users.json()
    if isinstance(users, dict) and 'results' in users:
        users = users['results']
    for u in users:
        print("  User:", u.get('email'), "| company:", u.get('company'), "| role:", u.get('role'), "| super:", u.get('is_superuser'))
else:
    print('Body:', r_users.text[:500])

r2 = requests.get(base + '/companies/companies/', headers=h)
companies = r2.json()
if isinstance(companies, dict) and 'results' in companies:
    companies = companies['results']
print("\nTotal companies:", len(companies))
for c in companies:
    print("  Company:", c['name'], "| id:", c['id'])
