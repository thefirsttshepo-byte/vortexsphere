Financial Invariant Checklist (This is critical)

🔒 Core Mathematical Invariants

OEY is never NaN

OEY is never Infinity

Payback is Infinity iff owner earnings ≤ 0

Scores are integers

Scores are bounded [0, 100]

🔒 Decision Invariants

Auto-reject gates always override total score

ACCEPTED ⇔ score ≥ 70 and no gates triggered

BORDERLINE ⇔ score ∈ [50, 69] and no gates triggered

REJECTED ⇔ any gate triggered

🔒 Stress & Risk Invariants

Stress cash flow < 0 ⇒ REJECTED

Stress cash flow = 0 ⇒ PASS

Stock premium < 3% ⇒ REJECTED

🔒 UI Integrity Invariants

UI displays derived values only

UI never recomputes scores

UI never overrides decisions

If any invariant fails, the engine is unsafe.
