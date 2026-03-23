### **2. `RELEASE_CHECKLIST.md`** - Quality Gate

```markdown
# RELEASE CHECKLIST (MANDATORY)

## BEFORE ANY RELEASE

### ✅ Tests

- [ ] All unit tests pass (100% core coverage)
- [ ] Golden reference deals pass unchanged
- [ ] Stress tests produce deterministic results
- [ ] Integration test: Input → Verdict pipeline works

### ✅ Code Review

- [ ] No business logic in UI components
- [ ] No magic numbers in calculations
- [ ] All TypeScript strict mode errors resolved
- [ ] Auto-reject gates cannot be bypassed

### ✅ Documentation

- [ ] CHANGELOG.md updated with changes
- [ ] Breaking changes documented in MIGRATION.md
- [ ] API.md updated for new functions

## DEPLOYMENT STEPS

1. `npm run test:coverage` (must be ≥90% core)
2. `npm run build` (no errors)
3. `npm run preview` (verify locally)
4. Deploy to hosting
5. Clear service worker cache (if PWA issues)
6. Test on fresh browser profile

## POST-RELEASE VERIFICATION

- [ ] PWA installs correctly on mobile/desktop
- [ ] IndexedDB persists across reloads
- [ ] PDF export generates 6-page report correctly
- [ ] All auto-reject gates function
```
