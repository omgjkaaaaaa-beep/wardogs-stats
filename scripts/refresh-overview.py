"""Refresh aggregate Steam online count and achievements; no profiles or matches."""
import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
def load(url):
    with urllib.request.urlopen(url, timeout=30) as response:
        return json.load(response)

def main():
    players = load('https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=1867240')['response']
    if players.get('result') != 1 or not isinstance(players.get('player_count'), int) or players['player_count'] < 0:
        raise ValueError('Steam player count unavailable')
    achievements = load('https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=1867240')['achievementpercentages']['achievements']
    translations = json.loads((ROOT / 'translations-ru.json').read_text())['achievements']
    data = {'app_id': 1867240, 'updated_at': datetime.now(timezone.utc).isoformat(), 'player_count': players['player_count'], 'achievements': [{'name': a['name'], 'title': translations.get(a['name'], {}).get('title', 'Новое достижение'), 'description': translations.get(a['name'], {}).get('description', 'Описание ещё не перевели.'), 'percent': float(a['percent'])} for a in achievements]}
    if any(not 0 <= a['percent'] <= 100 for a in data['achievements']):
        raise ValueError('Invalid achievement percentage')
    temporary = ROOT / 'overview.json.tmp'
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
    temporary.replace(ROOT / 'overview.json')
    print('Updated aggregate online count and achievements.')

if __name__ == '__main__':
    main()
