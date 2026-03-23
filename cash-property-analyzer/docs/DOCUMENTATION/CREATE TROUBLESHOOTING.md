# TROUBLESHOOTING GUIDE

## COMMON ISSUES

### 1. "Deals not saving"

**Symptoms**: Deals disappear on page refresh
**Solution**:

1. Check IndexedDB in DevTools → Application → Storage
2. Verify `persistenceService.saveDeal()` is called
3. Check for errors in console

### 2. "PDF export shows wrong data"

**Symptoms**: PDF doesn't match screen display
**Solution**:

1. Ensure you're passing `StoredDeal` (not `RankedDeal`) to PDFExportButton
2. Check `/src/services/pdf/` page functions for data mapping
3. Verify all required properties exist in `DealReportData`

### 3. "TypeScript errors after changes"

**Symptoms**: Build fails with type errors
**Solution**:

1. Run `npm run type-check` for detailed errors
2. Check `src/core/types.ts` for type definitions
3. Ensure you're not mixing `DealInput`, `StoredDeal`, `RankedDeal`

### 4. "Tests failing after logic change"

**Symptoms**: Unit tests fail after modifying calculations
**Solution**:

1. Never modify golden reference deals (`/tests/golden/`)
2. Update test data if intentional change
3. Run `npm test -- --coverage` to see uncovered code

## DEBUGGING WORKFLOW

### Step 1: Isolate the Issue

```typescript
// In browser console
const testDeal = await persistenceService.getAllDeals()[0];
console.log("Full deal:", JSON.stringify(testDeal, null, 2));
```
