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

Required destination for updates: api.steampowered.com. Steam API keys, individual player profiles and match history are not used. Aggregate online count and achievement percentages are refreshed separately by scripts/refresh-overview.py; failure retains overview.json and does not block news refresh. Achievement names and descriptions use translations-ru.json.

## Coordinate calculator

calculator.js is our independent geometric distance and bearing calculator. Scale is 100 metres per map-coordinate unit, based on the community guide https://steamcommunity.com/sharedfiles/filedetails/?id=3800319041. Y direction is explicitly selectable; terrain height, weapon tilt and ballistics are not modelled. It is not a guaranteed artillery firing solution. No third-party calculator source code or map assets were incorporated.

## Budget planner and personal notes

Budget prices are entered manually by the player; no unverified item catalog is used. The planner computes kit cost, planned expenses, affordable full deployments and shortfall while protecting the chosen reserve. Up to 20 kits are stored locally. Achievements can be searched and manually marked as completed in local browser storage; there is no Steam account synchronization. News search filters the saved feed. Beginner guides link to official or community sources and distinguish third-party claims from tested functionality.

## Game item catalog

items.json contains 73 weapon, equipment and vehicle entries transcribed as factual values from https://steamcommunity.com/sharedfiles/filedetails/?id=3809584533 (source updated September 30, reviewed October 1, 2026). This is an unverified community dataset, not an official live price API. Incomplete entries are omitted; unspecified unlock costs and suspicious zero equipment weights are null. Catalog selection adds an editable price to the budget. Comparisons cover purchase price, known weight and role level only. Vehicle planner separates one-time unlock from repeated purchases and never substitutes zero for unknown unlock prices. No third-party source code is reused; catalog images link to the Steam guide.

## Map planning and resupply

planner.js implements an independent 2D coordinate grid with origin/target placement, route distance, map labels Bakurani/Ozeti/Zestafona, local per-map persistence and validated JSON import/export. Default bounds are a planning range, not verified map georeferencing. Users may load their own PNG/JPEG/WebP background and calibrate coordinate bounds; image files are not sent to a server, saved, or included in plan exports. No terrain, official game map, obstruction model or ballistics is embedded. L81 resupply uses the community-reported 30 supply units per shell with an editable rate; this is not a money calculation or verified SPH-2 cost. The screenshot gallery links official Steam promotional screenshots; they are not map backgrounds.

Каталог содержит 73 карточки; изображения 51 позиции загружаются напрямую из Steamusercontent по ссылкам руководства Steam 3809584533. Таблицы сообщества дополнены калибром и классом оружия, местами, скоростью и прочностью транспорта. Значения не подтверждены в текущем патче игры; отсутствие данных не означает ноль. Поиск учитывает название, роль и дополнительные характеристики. Сравнение доступно для всех категорий.

Навигация: главная, карты, калькуляторы, каталог, гайды, новости и достижения показываются отдельно через URL hash. Калькуляторы имеют отдельные вкладки и сохраняют состояние при переключении. navigation.js подключён после скриптов инструментов. В разделе карт встроен внешний N4Lab для Bakurani/Ozeti/Zestafona с отдельной ссылкой на случай ограничений iframe; локальные данные рельефа не включены. Выбор карты синхронизирован с планировщиком. Доступность и разрешение встраивания N4Lab в этой среде не подтверждены (HTTP 403).

Unlock research: 22 of 73 items have numeric unlock costs (including zero explicitly listed for starter vehicles). Official Season 1 announcement 1843481262690549 supplies prices for Medium/Large Hammer, SPH-2, AH-6M, Z20 Lakota, URAL, Dune Buggy and Kodiak Pickup. Per-item unlock_source_url/status are retained and linked in cards/comparisons. SPH-2 uses Career level 90 and Support role. Remaining 51 unlock prices are not established. Steam guide 3799535708 is WIP with no weapon database; guide 3799243904 documents an external progression planner with TBD prices. That planner is blocked by this environment network policy (403).
