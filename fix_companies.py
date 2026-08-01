import requests, json

base = 'https://erp-system-backend-five.vercel.app/api/v1'
r = requests.post(base + '/auth/login/', json={'email': 'abubakkar.laiba@gmail.com', 'password': 'abubakkar22131'})
h = {'Authorization': 'Bearer ' + r.json()['access']}

# Assign test@gmail.com to one of the Hashir Khan companies
r_users = requests.get(base + '/auth/users/', headers=h)
users = r_users.json()
if isinstance(users, dict) and 'results' in users:
    users = users['results']

# Get the user IDs
for u in users:
    print("User:", u['email'], "| id:", u['id'], "| company:", u.get('company'))

# Find test@gmail.com
test_user = [u for u in users if u['email'] == 'test@gmail.com'][0]
hashir_companies = [c for c in [
    {'name': 'Hashir Khan', 'id': 'e0f764fc-6926-48cb-bbe8-765f14e6b844'},
    {'name': 'Hashir Khan', 'id': '5b32def4-889c-4013-83da-2ca9eda5480e'},
    {'name': 'Hashir Khan', 'id': '436b6bf0-ab93-48d5-9ef2-8e90f383b7e1'},
    {'name': 'TEST COMPANY', 'id': '4e1b2b63-911c-4fa2-a255-dc3567a3be1a'},
]]

# Assign test user to first Hashir Khan company
print("\nAssigning test@gmail.com to Hashir Khan (e0f764fc...)")
r3 = requests.patch(
    base + '/auth/users/' + test_user['id'] + '/',
    json={'company': 'e0f764fc-6926-48cb-bbe8-765f14e6b844'},
    headers=h
)
print("Status:", r3.status_code)
if r3.status_code != 200:
    print("Body:", r3.text[:500])
else:
    print("OK:", r3.json().get('email'), "company:", r3.json().get('company'))

# Delete duplicate Hashir Khan companies and TEST COMPANY (keep one Hashir Khan)
dupes = ['5b32def4-889c-4013-83da-2ca9eda5480e', '436b6bf0-ab93-48d5-9ef2-8e90f383b7e1', '4e1b2b63-911c-4fa2-a255-dc3567a3be1a']
for cid in dupes:
    r4 = requests.delete(base + '/companies/companies/' + cid + '/', headers=h)
    print("Delete", cid[:8], ":", r4.status_code)

# Verify
r5 = requests.get(base + '/companies/companies/', headers=h)
companies = r5.json()
if isinstance(companies, dict) and 'results' in companies:
    companies = companies['results']
print("\nRemaining companies:", len(companies))
for c in companies:
    print("  ", c['name'], "|", c['id'])
