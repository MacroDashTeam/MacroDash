from api.services import CoinGeckoService

service = CoinGeckoService()
result = service.get_historical_data('BTC', days=7)

print('Status:', result['status'])
if result['status'] == 'success':
    print('Symbol:', result['data']['symbol'])
    print('Days:', result['data']['days'])
    print('Prices count:', len(result['data']['prices']))
    if result['data']['prices']:
        print('First price:', result['data']['prices'][0])
        print('Last price:', result['data']['prices'][-1])
else:
    print('Error:', result.get('error'))
