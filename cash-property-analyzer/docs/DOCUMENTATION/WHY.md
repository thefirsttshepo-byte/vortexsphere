# WHY THESE DECISIONS WERE MADE

## Why TypeScript Strict Mode?

Because financial calculations must be correct. A single type error could lead to incorrect capital allocation. Strict mode catches these at compile time.

## Why No Backend?

Because investment analysis is sensitive. Your deal data should never leave your device. Offline-first means you can analyze deals anywhere.

## Why Pure Functions?

Because we need deterministic, testable calculations. Same inputs → same outputs, always. No side effects means no hidden dependencies.

## Why Auto-Reject Gates?

Because discipline protects capital. Humans rationalize bad deals; code doesn't. These gates enforce the doctrine without emotion.

## Why PDF Export?

Because you need an audit trail. Every decision should be documented for future review. The PDF creates a permanent record of your analysis.
