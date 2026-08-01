import requests, json

base = 'https://erp-system-backend-five.vercel.app/api/v1'
r = requests.post(base + '/auth/login/', json={'email': 'abubakkar.laiba@gmail.com', 'password': 'abubakkar22131'})
h = {'Authorization': 'Bearer ' + r.json()['access']}

# Check ALL users to understand permissions
r_u = requests.get(base + '/auth/users/', headers=h)
users = r_u.json()
if isinstance(users, dict) and 'results' in users:
    users = users['results']
for u in users:
    print("User:", u['email'], "| company:", u.get('company'), "| is_superuser:", u.get('is_superuser'), "| role:", u.get('role'))

# Also check if abubakkar is superuser via admin endpoint
r_check = requests.get(base + '/auth/users/' + [u for u in users if u['email'] == 'abubakkar.laiba@gmail.com'][0]['id'] + '/', headers=h)
print("\nabubakkar full:", json.dumps(r_check.json(), indent=2)[:500])
