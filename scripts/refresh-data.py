import json
import hashlib
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
root = Path(__file__).resolve().parents[1]
ru = json.loads((root / 'translations-ru.json').read_text())['achievements']
news_translations = json.loads((root / 'news-translations-ru.json').read_text())
news_response = load('https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=1867240&count=10&maxlength=0&feeds=steam_community_announcements')['appnews']
news = []
for item in news_response['newsitems']:
    if item.get('feedname') != 'steam_community_announcements' or item.get('appid') != 1867240:
        continue
    translated = news_translations.get(item['gid'], {})
    verified = translated.get('source_hash') == hashlib.sha256(item['contents'].encode()).hexdigest()
    news.append({'id': item['gid'], 'title': translated.get('title') if verified else item['title'], 'summary': translated.get('summary') if verified else None, 'translated': verified, 'date': item['date'], 'url': 'https://steamcommunity.com/games/1867240/announcements/detail/' + item['gid']})
data = {'app_id': 1867240, 'name': store['data']['name'], 'developers': store['data']['developers'], 'updated_at': datetime.now(timezone.utc).isoformat(), 'player_count': players['player_count'], 'achievements': [{'name': a['name'], 'percent': float(a['percent']), 'display_name': ru.get(a['name'], {}).get('title', definitions.get(a['name'], {}).get('displayName', 'Название пока недоступно')), 'description': ru.get(a['name'], {}).get('description', definitions.get(a['name'], {}).get('description', 'Описание пока недоступно'))} for a in achievements], 'news': news, 'sources': ['https://store.steampowered.com/app/1867240/WARDOGS/', 'https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=1867240', 'https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=1867240']}
Path(__file__).resolve().parents[1].joinpath('stats.json').write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
