# Retirement Expense Success Rule Plan

## Problem

The current simulation success rate is based only on whether a path goes bankrupt:

```ts
successRate = nonBankruptPaths / totalPaths
```

This creates a misleading result for `fixed_rate` withdrawal strategies such as the 4% rule. If the user has a small portfolio, the 4% withdrawal amount becomes small as well, so the path can avoid bankruptcy while failing to provide enough retirement spending.

Example:

- Region: Cebu
- Annual income: PHP 300,000
- Annual contribution: PHP 50,000
- Initial portfolio: PHP 50,000
- Retirement age: 60
- Withdrawal strategy: 4% rule

The model can still show a high survival rate because it treats "spending very little" as success.

## Goal

Update the success definition so a path only counts as successful when it:

1. Does not go bankrupt.
2. Provides a minimum retirement spending level relative to `annualExpense`.

Initial proposed threshold:

```ts
annualWithdrawal >= annualExpense * 0.8
```

This makes success mean "not depleted and mostly able to fund the planned lifestyle", instead of only "portfolio did not reach zero".

## Scope

In scope:

- Thread `annualExpense` into the simulation engine request.
- Add a retirement spending adequacy check for `fixed_rate` withdrawals.
- Update Monte Carlo aggregation so `successRate` uses the new success definition.
- Preserve existing depletion and bankruptcy behavior.
- Add focused regression tests.
- Update result/help copy so the metric is clearly explained.

Out of scope for this plan:

- Recalibrating all lifestyle presets.
- Enabling housing, occupation, immigration, or random events by default.
- Changing historical return data.
- Adding new charts unless needed to explain the metric.

## Proposed Model

### Path-Level Success

Add a path-level flag such as:

```ts
successful: boolean
retirementSpendingAdequate: boolean
retirementYearsBelowExpenseFloor: number
retirementYearsEvaluated: number
```

For non-retired years, do not apply the spending adequacy check.

For retired years:

- Compute the effective annual retirement withdrawal already produced by the engine.
- Compare it against the inflation-adjusted expense floor.
- Count years below the floor.

Suggested default:

```ts
expenseFloor = annualExpense * 0.8 * inflationAdjustment
```

### Strict vs Tolerant Rule

Two viable definitions:

#### Option A: Strict

Every retired year must meet the floor:

```ts
retirementSpendingAdequate = retirementYearsBelowExpenseFloor === 0
```

Pros:

- Easy to explain.
- Catches underfunded 4% rule plans immediately.

Cons:

- One bad or edge year can fail the whole path.

#### Option B: Tolerant

Allow up to 20% of retired years to fall below the floor:

```ts
retirementSpendingAdequate =
  retirementYearsBelowExpenseFloor / retirementYearsEvaluated <= 0.2
```

Pros:

- More realistic for flexible retirement spending.
- Avoids over-penalizing short market stress periods.

Cons:

- Slightly harder to explain.

Recommended first implementation: **Option A** for clarity, then evaluate whether Option B is needed after seeing results.

## Engine Changes

### `src/engine/simulator.ts`

Add `annualExpense` to `SimulationParams`.

Track retirement spending adequacy inside `simulatePath`.

Important detail:

- For `fixed_amount`, the withdrawal amount is already the retirement spending target, so the check should usually pass unless the user deliberately sets withdrawal below expenses.
- For `fixed_rate`, this check prevents low-asset paths from being counted as successful merely because withdrawals shrink.
- For `dynamic`, compare actual withdrawal against the same floor.

Add fields to `PathResult`:

```ts
successful: boolean
retirementSpendingAdequate: boolean
retirementYearsBelowExpenseFloor: number
retirementYearsEvaluated: number
```

Compute:

```ts
successful = !bankrupt && retirementSpendingAdequate
```

If there are no retirement years, fall back to `!bankrupt`.

### `src/engine/runner.ts`

Change success aggregation from:

```ts
paths.filter(p => !p.bankrupt).length
```

to:

```ts
paths.filter(p => p.successful).length
```

Keep depletion statistics based on bankruptcy, not success failure.

### `src/store/gameStore.ts`

Pass `annualExpense` into both:

- batch simulation worker request
- story simulation request

### `src/engine/worker.ts`

No structural change should be needed if it forwards `SimulationParams`, but verify typing after adding `annualExpense`.

## UI And Copy Changes

### Result Metric Naming

Current UI often calls the metric "success rate" or "survival rate". After this change, it should be explained as:

> Successful paths avoid depletion and meet the retirement spending floor.

Potential labels:

- English: `Success rate`
- Traditional Chinese: `達標率`
- Japanese: `達成率`

If keeping "success rate", the tooltip must define it clearly.

### Help Text

Update result help copy in `src/i18n/messages.ts`:

- Explain that success now includes the spending floor.
- Mention the default floor: 80% of annual expense.
- Keep translations aligned for `en`, `zh-Hant`, and `ja`.

### Result Detail

Optional but useful:

- Add a small stat card or tooltip line showing:
  - spending floor
  - number/share of paths failing spending adequacy

This can be deferred if the initial implementation only needs corrected success rate.

## Tests

Add tests in `tests/engine.test.ts`.

### Regression: Low Portfolio 4% Rule Fails Spending Adequacy

Scenario:

- initial portfolio low
- annual contribution modest
- retirement at 60
- annual expense high enough that 4% withdrawal is below 80% floor
- fixed_rate withdrawal

Expected:

- path may not be bankrupt
- `retirementSpendingAdequate` is false
- `successful` is false

### Regression: Fixed Amount Matching Expense Passes

Scenario:

- fixed_amount withdrawal equals annual expense
- portfolio remains non-bankrupt

Expected:

- `retirementSpendingAdequate` is true
- `successful` is true

### Aggregation Uses New Success Flag

Create a deterministic small Monte Carlo case where at least one path is non-bankrupt but fails spending adequacy.

Expected:

- `successRate` is lower than non-bankrupt survival rate.

## Migration And Compatibility

Saved records already persist `annualExpense`, so old saved scenarios can be re-run with the new rule.

Expected behavior change:

- Some `fixed_rate` scenarios will show materially lower success rates.
- This is intended and should be documented in release notes or README if shipped.

## Implementation Steps

1. Add `annualExpense` to `SimulationParams` and all call sites.
2. Track retirement spending adequacy in `simulatePath`.
3. Add `successful` and adequacy fields to `PathResult`.
4. Update `runMonteCarlo` success aggregation.
5. Update i18n help copy for success/survival explanation.
6. Add focused engine tests.
7. Run `npm.cmd test`.
8. Run `npm.cmd run build`.
9. Manually compare the Cebu case:
   - income PHP 300,000
   - contribution PHP 50,000
   - initial portfolio PHP 50,000
   - retirement age 60
   - 4% rule

Expected manual result:

- success rate should drop significantly from the previous 88% if 4% withdrawals do not meet the expense floor.

## Implementation Status

Implemented on branch `plan/retirement-expense-success-rule`:

- Added `annualExpense` to `SimulationParams`.
- Added path-level retirement spending adequacy fields.
- Changed Monte Carlo `successRate` aggregation to use `path.successful`.
- Updated batch and story simulation requests to pass `annualExpense`.
- Updated result/help copy in English, Traditional Chinese, and Japanese.
- Added regression tests for low-withdrawal 4% rule paths and aggregation behavior.

## Open Questions

1. Should the 80% threshold be hard-coded initially or configurable later?
2. Should `successRate` be renamed to avoid confusion with pure survival rate?
3. Should ResultPanel show both:
   - survival rate: not bankrupt
   - lifestyle success rate: not bankrupt and spending adequate
4. Should the adequacy rule apply only to `fixed_rate`, or to all withdrawal strategies?

Recommended answers for first implementation:

1. Hard-code 80% as a named constant.
2. Keep internal `successRate`, improve UI copy.
3. Defer dual metrics unless users need both.
4. Apply to all withdrawal strategies for consistency.
