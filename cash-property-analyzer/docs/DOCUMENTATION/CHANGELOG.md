# CHANGELOG

## [1.0.0] - 2026-01-11

### Added

- Core calculation engine (NOI, OEY, Payback)
- Stress testing engine (vacancy, municipal, maintenance)
- Deterministic scoring engine with auto-reject gates
- PWA with IndexedDB persistence
- 6-page PDF report generation
- Deal ranking and comparison table

### Fixed

- PDF layout issues on pages 4-6
- TypeScript type mismatches in DealRankingScreen
- IndexedDB export/import functionality

### Doctrine

- Initial investment doctrine encoded
- Auto-reject gates: OEY<12%, Payback>12yrs, Negative stress, Stock premium<3%
- Scoring weights locked (OEY:30%, Payback:20%, Stress:25%, etc.)

## [Unreleased]

### Breaking Changes Planned

- None. Scoring formula is locked per doctrine.
