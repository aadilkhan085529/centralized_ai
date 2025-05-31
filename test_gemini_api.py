import requests

API_URL = 'https://aadil.pythonanywhere.com/api/gemini'

prompt = input('Enter your prompt: ')

response = requests.post(
    API_URL,
    json={'prompt': prompt},
    headers={'Content-Type': 'application/json'}
)

try:
    data = response.json()
    print('Status:', response.status_code)
    print('Response:', data.get('text') or data)
except Exception as e:
    print('Failed to parse response:', e)
    print('Raw response:', response.text)
