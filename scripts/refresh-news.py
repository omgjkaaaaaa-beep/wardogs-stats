"""Refresh official WARDOGS announcements without requesting player data."""
import hashlib
import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = 'https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=1867240&count=10&maxlength=0&feeds=steam_community_announcements'

def main():
    translations = json.loads((ROOT / 'news-translations-ru.json').read_text())
    with urllib.request.urlopen(SOURCE, timeout=30) as response:
        feed = json.load(response)['appnews']
    if feed.get('appid') != 1867240 or not isinstance(feed.get('newsitems'), list):
        raise ValueError('Unexpected Steam news response')
    news = []
    for item in feed['newsitems']:
        if item.get('feedname') != 'steam_community_announcements' or item.get('appid') != 1867240:
            continue
        gid = str(item['gid'])
        if not gid.isdecimal():
            raise ValueError('Invalid announcement identifier')
        translated = translations.get(gid, {})
        verified = translated.get('source_hash') == hashlib.sha256(item['contents'].encode()).hexdigest()
        news.append({'id': gid, 'title': translated['title'] if verified else item['title'],
                     'summary': translated['summary'] if verified else None, 'translated': verified,
                     'date': item['date'], 'url': 'https://steamcommunity.com/games/1867240/announcements/detail/' + gid})
    data = {'app_id': 1867240, 'updated_at': datetime.now(timezone.utc).isoformat(), 'news': sorted(news, key=lambda item: item['date'], reverse=True), 'source': SOURCE}
    temporary = ROOT / 'news.json.tmp'
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(ROOT / 'news.json')
    print(f"Updated {len(news)} official announcements.")

if __name__ == '__main__':
    main()
