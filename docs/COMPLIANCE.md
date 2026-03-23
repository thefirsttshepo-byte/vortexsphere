# Compliance Documentation

# Cash-Only Property Analysis PWA

## Investment Doctrine & Governance

### 1. Core Principles (Non-Negotiable)

- **No Leverage**: 100% cash-only analysis only
- **No IRR/Appreciation**: Current owner earnings only
- **No Overrides**: Auto-reject gates are absolute
- **Cash Flow Focus**: Observable, repeatable cash flows only

### 2. Auto-Reject Gates (Hard Rules)

| Rule           | Threshold          | Business Justification     |
| -------------- | ------------------ | -------------------------- |
| OEY            | < 12%              | Minimum return requirement |
| Payback Period | > 12 years         | Capital recovery timeframe |
| Stress Test    | Negative cash flow | Risk tolerance boundary    |
| Stock Premium  | < 3% vs. benchmark | Opportunity cost threshold |

### 3. Scoring Weights (Locked)

| Component            | Weight | Calculation Method           |
| -------------------- | ------ | ---------------------------- |
| Owner Earnings Yield | 30%    | Direct percentage scoring    |
| Payback Period       | 20%    | Inverse relationship scoring |
| Stress Survival      | 25%    | Binary pass/fail             |
| Expense Quality      | 10%    | Expense ratio to gross rent  |
| Deal Simplicity      | 10%    | Unit count complexity        |
| Stock Premium        | 5%     | Premium over SA Top 40 yield |

### 4. Stress Test Parameters

| Stress Scenario    | Shock Applied          | Regulatory Reference        |
| ------------------ | ---------------------- | --------------------------- |
| Vacancy Shock      | +20% vacancy           | Historical downturn data    |
| Municipal Increase | +15% rates & utilities | Municipal budget trends     |
| Maintenance Surge  | 2× reserve             | Unexpected repair scenarios |

### 5. Configuration Management

| Parameter       | Value    | Locked Until | Change Authority           |
| --------------- | -------- | ------------ | -------------------------- |
| Stock Benchmark | 4.2%     | Q4 2024      | CIO + Investment Committee |
| OEY Thresholds  | 12% min  | Indefinite   | Board approval required    |
| Payback Max     | 12 years | Indefinite   | Board approval required    |

### 6. Testing & Validation Requirements

| Test Type                | Frequency  | Success Criteria            |
| ------------------------ | ---------- | --------------------------- |
| Golden Reference Tests   | Pre-commit | 100% pass, scores unchanged |
| Boundary Condition Tests | Pre-commit | All edge cases handled      |
| Security Audit           | Monthly    | No critical vulnerabilities |
| Penetration Testing      | Quarterly  | No security breaches        |

### 7. Data Retention & Audit Trail

| Record Type       | Retention Period | Storage Method          |
| ----------------- | ---------------- | ----------------------- |
| Deal Calculations | 7 years          | Encrypted IndexedDB     |
| Scoring Decisions | 7 years          | Encrypted local storage |
| User Inputs       | 7 years          | Encrypted backups       |

### 8. Change Control Process

All changes to scoring logic require:

1. Investment committee approval
2. Updated golden reference tests
3. Full test suite pass
4. Documentation update
5. 30-day notice to users

## Regulatory References

- Financial Advisory and Intermediary Services Act
- Protection of Personal Information Act (POPIA)
- Electronic Communications and Transactions Act
