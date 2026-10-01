# WARDOGS News

Independent Russian-language news portal for WARDOGS (Steam app 1867240). Includes official developer announcements from Steam, manually prepared Russian abridged translations and links to original publications. Military camouflage theme with responsive layouts.

## Development

Node.js >=22; Python >=3.12 for refreshing the news feed. No packages or API keys are required.

```sh
npm ci --ignore-scripts
python3 scripts/refresh-news.py
npm run check
npm run dev
```

Default local port: 3000 (override with PORT). GitHub Pages publishes main from / (root); the frontend uses relative paths.

## News and translations

scripts/refresh-news.py fetches only steam_community_announcements for WARDOGS and writes news.json. The Refresh official Wardogs news workflow runs hourly; scheduled runs can be delayed. A failed refresh retains the previous feed. Translations in news-translations-ru.json are matched against content hashes. New or edited posts show the original headline and a pending-translation notice until their Russian translation is prepared. Translation is manual, not automatic.

Required destination for updates: api.steampowered.com. Steam API keys, player statistics, achievements and match data are not used.
