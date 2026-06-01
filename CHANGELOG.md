# Changelog

All notable changes to the **Firestore Exporter** desktop companion and universal landing page visualizer will be documented in this file.

---

## [1.0.2] - 2026-06-01

### 🚀 Premium Developer Dashboard Features
- **Visual Multi-Query Builder**: Chain multiple visual query filters (`where` clauses and `orderBy` sorting) dynamically in the workspace header panel.
- **Custom `starts-with` Prefix Range operator**: Native query translation transforming text prefixes into fast, indexed database range scans (`>= prefix` and `< prefix + \uf8ff`).
- **Interactive Monaco Scripting Shell**: Embed isolated JavaScript code map-reduce blocks to map, filter, clean, and re-format JSON collection arrays in real-time on-the-fly.
- **Spreadsheets virtualized Layout**: Support TanStack-virtualized data spreadsheets rendering high-density rows and dynamic hideable columns.
- **Collapsible Hierarchical Tree View**: Expandable custom JSON rendering nodes with integrated GeoPoint map redirection, Cloud Storage image previews, and DocumentReference hooks.
- **SQL Blueprint Migration Engine**: Deduce document properties into robust database types (Boolean, Real, Integer, Timestamp, Varchar, JSON) producing copy-ready relational SQL `CREATE TABLE` and batch `INSERT INTO` statements.
- **Flashing Live Cloud Production Alerts**: Toggles strict Read-Only mode safety constraints showing highly distinct crimson alert visuals for active live production credentials.

### 🐛 Visual & Compiler Bug Fixes
- **Vite & TS Website Compilation Repair**: Add explicit string type declaration to `valType` in mockup database mapping nodes to resolve strict typescript compile crashes during landing page build runs.
- **Linux Download Card JSX Markup**: Repair truncated elements in the Linux AppImage installer mockup block which caused JSX rendering boundaries to break.
- **Tsup Watch Dev-Electron Hook**: Relocate the `dev-electron.js` launcher task directly into a programmatic `onSuccess` config hook inside `tsup.config.ts` to ensure consistent live-reload launches.
