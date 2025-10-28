import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'macrodash.settings')
import django
django.setup()

from api.services import CoinMarketCapService

service = CoinMarketCapService()
print('API Key configured:', 'Yes' if service.api_key else 'No')
print('API Key:', service.api_key[:20] + '...' if service.api_key else 'None')
print('\nTesting crypto listings...')
result = service.get_crypto_listings(limit=5)
print('Status:', result.get('status'))
if result.get('status') == 'success':
    cryptos = result.get('data', {}).get('cryptos', [])
    print(f'Found {len(cryptos)} cryptocurrencies')
    for crypto in cryptos:
        print(f"  {crypto.get('name')} ({crypto.get('symbol')}) - ${crypto.get('current_price')} - Change 24h: {crypto.get('change_24h')}%")
else:
    print('Error:', result.get('error', 'Unknown error'))
