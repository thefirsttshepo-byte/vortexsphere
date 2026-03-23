# ARCHITECTURAL DECISION RECORDS (ADRs)

## ADR-001: Offline-First PWA

**Date**: [Current Date]
**Status**: Accepted
**Context**: Need to analyze deals without internet, protect sensitive financial data
**Decision**: Build as Progressive Web App (PWA) with IndexedDB storage
**Consequences**:

- ✅ No server costs, no dependency on connectivity
- ✅ Data never leaves device (privacy)
- ❌ No real-time collaboration features
- ❌ Manual backup required

## ADR-002: TypeScript Strict Mode

**Date**: [Current Date]
**Status**: Accepted
**Context**: Financial calculations require absolute correctness
**Decision**: Enable TypeScript strict mode with no exceptions
**Consequences**:

- ✅ Catches type errors at compile time
- ✅ Self-documenting code via types
- ❌ More verbose code
- ❌ Steeper learning curve for contributors

## ADR-003: No Business Logic in UI

**Date**: [Current Date]
**Status**: Accepted
**Context**: Need to test core logic independently of UI changes
**Decision**: All business logic in `/core/` folder, UI only displays
**Consequences**:

- ✅ Core engine can be unit tested
- ✅ UI can be redesigned without breaking calculations
- ❌ More indirection between layers

## ADR-004: Deterministic Scoring

**Date**: [Current Date]
**Status**: Accepted
**Context**: Need consistent deal evaluation regardless of when/where run
**Decision**: All calculations are pure functions with no randomness
**Consequences**:

- ✅ Same inputs → Same outputs, always
- ✅ Reproducible results for auditing
- ❌ No adaptive learning or ML features
