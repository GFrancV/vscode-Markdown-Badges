# Changelog

## [0.1.0] — 2026-05-11

### Added

- **Insert Badge(s)** command: search across 858+ badges by name or category and insert one or more at the cursor position. Selections are preserved as you refine the search query.
- **Browse by Category** command: explore badges through a two-step picker — choose a category first, then select badges from it.
- **Clear Cache** command: force a fresh fetch from the API on next use.
- In-memory cache per session — badges are fetched once and subsequent invocations are instant.
- Configurable API base URL via `markdownBadges.apiUrl` setting.
