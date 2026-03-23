# CASH-ONLY PROPERTY ANALYZER - SYSTEM ARCHITECTURE

## 🎯 PURPOSE

This app exists to evaluate 100% cash-only residential multi‑let property deals in South Africa and rank them by risk‑adjusted owner earnings quality. It directly informs real capital allocation decisions.

## 🏗️ ARCHITECTURAL PRINCIPLES

1. **Offline-first**: No backend dependency, works fully offline
2. **Deterministic calculations**: Same inputs → Same outputs, always
3. **UI/business logic separation**: UI must never contain business logic
4. **Testable core**: Core engine can be tested in isolation
5. **No third-party dependencies**: No APIs, no analytics, no external calls

## 🧱 LAYERED ARCHITECTURE

### Layer 1: UI (React Components)

Location: `/src/ui/`

- Pure presentation layer
- No business logic
- Components receive data via props
- Screens: AddDeal, DealRanking, DealDetail

### Layer 2: Application Orchestration

Location: `/src/core/adapters/`, `/src/utils/`

- Glue layer between UI and core
- Data transformation (mapDealToRankingRow)
- Event handling

### Layer 3: Core Engine (Pure Functions)

Location: `/src/core/calculations/`, `/src/core/scoring/`

- **Pure functions only**: No side effects
- **Deterministic**: Same inputs → Same outputs
- **Testable in isolation**: No UI dependencies
- Contains: Calculation engine, Stress testing, Scoring engine

### Layer 4: Configuration Layer

Location: `/src/config/`

- Centralized thresholds and assumptions
- No magic numbers in logic
- Single source: `saConfig.ts`

### Layer 5: Persistence Layer

Location: `/src/data/persistence/`

- IndexedDB for offline storage
- JSON export/import
- Manual backup support

## 🔗 DATA FLOW
