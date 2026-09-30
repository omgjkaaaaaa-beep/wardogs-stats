# Wardogs Stats

WARDOGS (Steam app 1867240) statistics dashboard. Displays real Steam concurrent-player counts and global achievement percentages from a timestamped snapshot. Individual player statistics, rankings and match history are unavailable: no game API for these has been confirmed.

## Development

Node.js >=22, Python >=3.12 for data refresh. No packages or API keys required for the connected endpoints.

```sh
npm ci --ignore-scripts
python3 scripts/refresh-data.py
npm run check
npm run dev
```

GitHub Pages: publish `main` from `/ (root)`. All frontend paths are relative. The Refresh Steam statistics workflow refreshes the snapshot hourly and requests a Pages rebuild. Scheduled runs may be delayed; check the displayed timestamp. Workflow operation and deployment need verification in GitHub Actions. Fetch failures leave the previous snapshot unchanged.

Network: store.steampowered.com and api.steampowered.com. No Steam keys are embedded in the site. The browser reads stats.json rather than accessing Steam APIs directly.

## Russian achievements and official news

Achievement translations are maintained in translations-ru.json. Steam community announcements are fetched hourly by scripts/refresh-data.py alongside statistics. news-translations-ru.json contains manually prepared Russian abridged translations matched to source content hashes: new or edited posts display a pending-translation notice and original link until translated. Translation is not automatic. Only the steam_community_announcements feed for app 1867240 is included.
