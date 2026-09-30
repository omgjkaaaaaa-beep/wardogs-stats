import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

def load(url):
    with urllib.request.urlopen(url, timeout=30) as response:
        return json.load(response)

store = load('https://store.steampowered.com/api/appdetails?appids=1867240')['1867240']
if not store.get('success'):
    raise RuntimeError('Steam app lookup failed')
players = load('https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=1867240')['response']
if players.get('result') != 1 or not isinstance(players.get('player_count'), int):
    raise RuntimeError('Steam player count unavailable')
achievements = load('https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=1867240')['achievementpercentages']['achievements']
schema_path = Path(__file__).resolve().parents[1] / 'steam-schema.json'
definitions = {a['name']: a for a in json.loads(schema_path.read_text())['achievements']} if schema_path.exists() else {}
data = {'app_id': 1867240, 'name': store['data']['name'], 'developers': store['data']['developers'], 'updated_at': datetime.now(timezone.utc).isoformat(), 'player_count': players['player_count'], 'achievements': [{'name': a['name'], 'percent': float(a['percent']), 'display_name': definitions.get(a['name'], {}).get('displayName', a['name']), 'description': definitions.get(a['name'], {}).get('description', '')} for a in achievements], 'sources': ['https://store.steampowered.com/app/1867240/WARDOGS/', 'https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=1867240', 'https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=1867240']}
Path(__file__).resolve().parents[1].joinpath('stats.json').write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
