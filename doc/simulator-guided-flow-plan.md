# Simulator Guided Flow Plan

Date: 2026-05-11

## Goal

Reduce simulator complexity by replacing the dense always-visible settings panel with a guided, step-by-step setup flow.

The simulator should feel like continuing the landing page: users answer a small number of focused questions, run the simulation, then refine assumptions only when needed.

## Current Problem

The current simulator exposes too many controls at once:

- Region, lifestyle, finances, ages, allocation, withdrawal, event modules, housing, immigration, occupation, path count, saved records, and view mode all compete for attention.
- The desktop drawer is powerful but visually dense.
- Mobile has a quick setup, but the full settings drawer still feels like an advanced configuration panel.
- Users arriving from landing already entered basic inputs, so showing every setting immediately is redundant.

## Proposed UX

Use a guided setup wizard as the default simulator experience.

High-level flow:

```text
Step 1: Basics
Step 2: Money
Step 3: Retirement Plan
Step 4: Risk And Assumptions
Step 5: Review And Run
Step 6: Results And Refinement
```

The existing full `Controls` panel should remain available as an advanced mode, not the default first screen.

## Step Details

### Step 1: Basics

Purpose:
Confirm who and where the simulation is for.

Inputs:

- Region
- Current age
- Retirement age
- Lifestyle preset

Behavior:

- If user came from landing with query params, prefill these values.
- Show a compact summary: `Age X -> retire at Y`.
- Do not show investment allocation or advanced modules yet.

### Step 2: Money

Purpose:
Collect the inputs that most directly affect feasibility.

Inputs:

- Annual income
- Annual spending
- Annual invest
- Current portfolio

Derived feedback:

- Monthly spending
- Savings rate
- Years until retirement
- Simple 4% rule target comparison:

```text
4% target = annual spending / 0.04
Gap = target - current portfolio
```

### Step 3: Retirement Plan

Purpose:
Translate user inputs into retirement withdrawal assumptions.

Inputs:

- Withdrawal strategy
- Default recommendation: fixed amount equal to annual spending
- End age

Copy:

- Explain that this is where the simulator decides how much is spent after retirement.
- Keep fixed rate / dynamic options collapsed under "More withdrawal options".

### Step 4: Risk And Assumptions

Purpose:
Ask for risk preference without forcing users to manage every asset class.

Inputs:

- Risk preset:
  - Conservative
  - Balanced
  - Growth
  - Custom

Mapping:

- Conservative: lower stock, higher bond/cash
- Balanced: default mixed allocation
- Growth: higher stock
- Custom: opens the existing allocation sliders

Optional toggles:

- Random events
- Housing plan
- Immigration plan
- Occupation simulation

Default:

- Keep optional modules collapsed.
- Show them as cards with short explanations and explicit enable buttons.

### Step 5: Review And Run

Purpose:
Give users confidence before running.

Show:

- One-page summary of assumptions
- Key warnings:
  - Retirement age <= current age
  - Annual spending > annual income
  - Allocation total invalid
  - End age too close to retirement age

Primary action:

- Run simulation

Secondary action:

- Edit previous step

### Step 6: Results And Refinement

Purpose:
Make results actionable instead of dropping users into charts only.

Show:

- Survival rate hero
- Plain-language verdict:
  - Strong plan
  - Borderline plan
  - Fragile plan
- Three suggested adjustments:
  - Retire later
  - Spend less
  - Invest more

Refinement controls:

- Keep quick sliders near the result:
  - Retirement age
  - Annual spending
  - Annual invest
  - Stock allocation preset

Advanced:

- Link to "Open advanced settings" to reveal the existing full Controls panel.

## Architecture

Recommended new files:

```text
src/simulator/
  GuidedSimulator.tsx
  guidedFlow.ts
  guidedCopy.ts
  GuidedSimulator.css
  steps/
    BasicsStep.tsx
    MoneyStep.tsx
    RetirementPlanStep.tsx
    RiskStep.tsx
    ReviewRunStep.tsx
    ResultsRefineStep.tsx
```

Current `SimulatorApp.tsx` should become the shell:

```text
SimulatorApp
  AppBar
  GuidedSimulator
  Advanced drawer/dialog containing existing Controls
```

Keep current components:

- `Controls` remains the advanced editor.
- `ResultPanel` remains the detailed result view.
- `StoryPanel` remains behind existing feature flag.
- `MobileActionBar` can be replaced by step navigation in guided mode.

## State Strategy

Use existing `useGameStore`.

Do not create a second simulator state store unless necessary.

Guided steps should call existing store actions:

- `setRegion`
- `applyLifestyle`
- `setCurrentAge`
- `setRetirementAge`
- `setAnnualIncome`
- `setAnnualExpense`
- `setAnnualContribution`
- `setInitialPortfolio`
- `setAllocation`
- `setWithdrawal`
- `runSimulation`

Add only lightweight guided UI state:

```ts
type GuidedStep = 'basics' | 'money' | 'retirement' | 'risk' | 'review' | 'results'
```

This can live in component state first.

## Landing Integration

Landing already sends:

```text
/simulator?currentAge=30&retireAge=50&annualIncome=80000&annualExpense=40000&annualContribution=20000&initialPortfolio=250000&stockPct=70&lang=en&autoRun=1
```

Guided simulator behavior:

- If `autoRun=1`, apply params and run.
- After auto-run starts, open directly on Results step.
- If no result exists yet, show progress state in Results step.
- If user visits `/simulator` directly, start at Step 1.

## Visual Direction

Match the landing demo style:

- Full-width bands, not nested cards.
- Thin black dividers.
- Fraunces headings.
- JetBrains Mono labels.
- Sparse controls per step.
- Red accent only for active/important actions.
- No dense dashboard on first view.

## Implementation Plan

### Phase 1: Guided Shell

- Add `GuidedSimulator`.
- Replace desktop permanent drawer as default.
- Add "Advanced settings" button that opens the existing `Controls` in a drawer.
- Keep result rendering intact.

### Phase 2: Core Steps

- Build Basics, Money, Retirement Plan, Risk, Review.
- Add stepper/progress nav.
- Add validation and next/back behavior.

### Phase 3: Results Refinement

- Move survival rate and key result summary into guided results step.
- Add quick adjustment controls.
- Keep detailed `ResultPanel` below or behind "Detailed charts".

### Phase 4: Mobile Polish

- Replace bottom action bar with step navigation.
- Make each step fit comfortably on 375px width.
- Keep advanced drawer accessible but secondary.

### Phase 5: QA

Run:

```bash
npm run build
npm test
```

Manual QA:

- Direct `/simulator` starts at Step 1.
- Landing CTA with `autoRun=1` opens results/progress directly.
- Advanced settings still works.
- Existing simulations still run correctly.
- Mobile step navigation is usable.
- Invalid inputs block "Next" or "Run" with clear messages.

## Definition Of Done

- Simulator default screen is guided, not dense settings drawer.
- Landing-to-simulator path runs automatically and lands on result/progress.
- Advanced controls remain available.
- Build and tests pass.
- No simulator engine behavior changes except input application from guided flow.
