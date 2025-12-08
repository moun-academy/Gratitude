# Gratitude Community Wellbeing Snapshot

This project hosts a vetted dataset of US community wellbeing indicators and a lightweight viewer that can run entirely offline. The loader is designed so the local file read can later be swapped for a remote fetch while maintaining versioning and graceful degradation.

## Dataset
- **Files:** `data/stats.json` and `data/stats.csv`
- **Coverage:** Homelessness, hunger, health, safety, and social connection.
- **Fields:** category, metric, value, unit, update date, source title, and source URL, plus dataset metadata (version and last_checked).

## Running locally
Serve the files with any static server (for example, Python's built-in server) and open `http://localhost:8000` in your browser:

```bash
python -m http.server 8000
```

The page will attempt to load `data/stats.json`. If that fails (e.g., offline), it automatically falls back to the bundled copy in `src/fallbackData.js`, preserving the version metadata and displaying a gentle warning.
