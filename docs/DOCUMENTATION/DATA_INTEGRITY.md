# DATA INTEGRITY PROTOCOLS

## IMMUTABLE RULES

- **Golden references NEVER change** - If they fail, fix the bug, don't adjust the test
- **Scoring thresholds are LOCKED** - Changes require doctrinal review
- **No silent data migration** - Breaking changes require explicit versioning

## BACKUP DISCIPLINE

### Daily (Manual)

1. Export deals as JSON via UI
2. Save to encrypted cloud storage
3. Rename: `YYYY-MM-DD_cash_analyzer_backup.json`

### Weekly (Automated)

```typescript
// Add to persistence layer
export const createAutoBackup = () => {
  const deals = await persistenceService.exportDeals();
  const blob = new Blob([deals], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  // Trigger download automatically every Monday
};
```
