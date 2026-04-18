# compliance/missing-human-gate

**Severity:** warning
**Category:** compliance
**Fixable:** no

## What it catches

A binding rule that permits a high-impact action — deploy, release, send, charge, revoke — without any human-in-the-loop cue ("approval", "review", "sign-off", "oncall", "ask").

## Why it matters

Destructive-but-necessary actions are the riskiest part of any agent spec. Even if the agent behaves correctly 99% of the time, the 1% that doesn't will cost you a customer, a payment, or a database. An explicit human gate in the spec gives you a contractual checkpoint: the agent *must* stop, not just *should*.

Related: `tools/destructive-no-confirm` catches explicit tool references; this rule catches the broader class of sensitive verbs in directive prose.

## Example — bad

```markdown
- You must deploy the release candidate every Monday.
```

## Example — good

```markdown
- You must deploy the release candidate every Monday, after getting approval from the oncall engineer.
```
