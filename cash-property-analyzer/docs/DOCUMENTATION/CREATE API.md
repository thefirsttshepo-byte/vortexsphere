# CORE ENGINE API REFERENCE

## CALCULATION FUNCTIONS

All functions are pure (no side effects) and deterministic.

### `calculateNOI(deal: DealInput): number`

**Purpose**: Calculate Net Operating Income
**Formula**: `Gross Rent - Operating Expenses`
**Location**: `/src/core/calculations/index.ts`
**Tests**: 100% coverage required

### `calculateOwnerEarnings(deal: DealInput): number`

**Purpose**: Calculate true owner income after maintenance
**Formula**: `NOI - Maintenance Reserve`
**Edge Cases**: Handles zero and negative values

### `calculateOEY(deal: DealInput): number`

**Purpose**: Calculate Owner Earnings Yield (primary metric)
**Formula**: `Owner Earnings ÷ Purchase Price`
**Edge Cases**: Division by zero returns 0

### `calculatePayback(deal: DealInput): number`

**Purpose**: Calculate capital recovery period
**Formula**: `Purchase Price ÷ Owner Earnings`
**Edge Cases**: Infinite payback returns Infinity

## SCORING ENGINE

### `scoringEngine(deal: DealInput): ScoringResult`

**Execution Order**:

1. Validate inputs
2. Apply auto-reject gates
3. Run stress tests
4. Calculate component scores
5. Aggregate weighted score
6. Assign final status

**Status Labels**:

- `REJECTED`: Failed auto-reject gate or score < 60
- `BORDERLINE`: Score 60-69
- `ACCEPTED`: Score ≥ 70

## STRESS TEST ENGINE

**Location**: `/src/core/stress/`
**Methodology**: Apply shocks, take worst-case result
**Tests**: Vacancy (+20%), Municipal (+15%), Maintenance (2×)
