"""Inspect public stat definitions; never log credentials or request URLs."""
import json
import os
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

key = os.environ.get('STEAM_WEB_API_KEY')
if not key:
    raise SystemExit('Add the STEAM_WEB_API_KEY repository secret before running this check.')
query = urllib.parse.urlencode({'appid': 1867240, 'key': key})
try:
    with urllib.request.urlopen('https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?'+query, timeout=30) as response:
        payload = json.load(response)
except urllib.error.HTTPError as error:
    raise SystemExit(f'Steam schema request failed: HTTP {error.code}. Response body and URL omitted.') from None
except (urllib.error.URLError, ValueError):
    raise SystemExit('Steam schema request failed: network or response error. Request details omitted.') from None

game = payload.get('game', {})
available = game.get('availableGameStats', {})
result = {
    'app_id': 1867240,
    'game_name': game.get('gameName'),
    'stats': [{k: stat[k] for k in ('name', 'displayName', 'defaultvalue') if k in stat} for stat in available.get('stats', [])],
    'achievements': [{k: item[k] for k in ('name', 'displayName', 'description', 'hidden') if k in item} for item in available.get('achievements', [])],
    'note': 'Stat definitions only. Does not verify individual player visibility or match history access.',
}
Path('steam-schema.json').write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
print(f"Steam returned {len(result['stats'])} stat definitions and {len(result['achievements'])} achievements.")
