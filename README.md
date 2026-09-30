# Wardogs Stats

Russian-language prototype for player statistics, rankings, profile search and match history. All player and match data is fictional and explicitly marked as demo data. No real Wardogs API is connected.

## Development

Requires Node.js 22 or newer. No runtime packages or credentials are required.

```sh
npm ci --ignore-scripts
npm run check
npm run dev
```

The server listens on port 3000, or the port supplied by `PORT`. The cloud onboarding interface does not provide a localhost preview.

`app.js` contains the demo data and interface behavior. `style.css` contains responsive styles. `server.js` serves only the three public assets and index page. Before displaying real statistics, identify and validate an authorized game API or other data source; do not present the sample data as actual game statistics.

## GitHub Pages

Publish the `main` branch from `/ (root)` in Settings → Pages. The frontend uses relative asset paths and requires no server on GitHub Pages.
