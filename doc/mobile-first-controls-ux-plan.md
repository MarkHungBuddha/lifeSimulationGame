# Mobile-first controls UX plan

## Goal

Improve the mobile experience so a first-time user immediately understands the next action without opening a hamburger menu. The mobile first screen should make the primary workflow visible:

1. Choose a scenario.
2. Review or adjust the main assumptions.
3. Run the simulation or generate the story.
4. Read the result.

Desktop should keep the current left-side controls drawer because it already matches the available space and tool-style workflow.

## Current Problem

On mobile, `App.tsx` hides all controls inside a top-left hamburger-triggered `Drawer`. That makes the primary task look like navigation instead of setup. The empty result state then needs to explain how to use the app, and the guide copy currently includes steps such as "Open the menu" / "打開選單". This is a sign that the interaction is not self-evident.

The current mobile path is too indirect:

1. User lands on result guide.
2. User must notice the hamburger icon.
3. User opens the drawer.
4. User scrolls through a long form.
5. User finds the run button near the bottom.
6. User closes the drawer to view the result.

This is especially weak for a simulation tool because the main action is not visible at the moment the user arrives.

## UX Principles

- The primary action must be visible without opening navigation.
- Controls should be labeled by intent, not by generic menu affordances.
- Mobile should expose a short setup path first and move detailed assumptions into a secondary panel.
- Advanced modules should not compete with the first run.
- The user should always have a clear action available: adjust assumptions, run simulation, switch view, or read output.

## Proposed Mobile IA

### First screen

On mobile, the top of the main content should include a compact setup panel above the result guide or result content.

Visible fields:

- Region / currency selector.
- Lifestyle preset selector.
- View mode segmented control: simulation / story.
- Primary CTA:
  - Simulation mode: "Run simulation" / "執行模擬" / "シミュレーション実行".
  - Story mode: "Generate life story" / "生成人生故事" / "人生ストーリー生成".
- Secondary CTA: "Adjust assumptions" / "調整假設" / "前提を調整".

This gives users a complete minimal path without opening a menu.

### Detailed settings

Replace the mobile left drawer with a bottom sheet style settings panel.

Recommended behavior:

- Use MUI `Drawer` with `anchor="bottom"` on mobile.
- Use a clear trigger label instead of a hamburger icon.
- Title the panel "Assumptions" / "模擬假設" / "前提".
- Keep existing `Controls` inside the sheet for the first iteration.
- Limit sheet height to roughly `calc(100dvh - app bar height)` and allow internal scroll.
- Add an obvious close action at the top of the sheet.

This keeps implementation risk low because `Controls` can remain the canonical detailed form.

### Sticky mobile action bar

Add a bottom fixed action bar on mobile.

Suggested actions:

- Left: `Adjust assumptions`.
- Center or primary: current run action.
- Right: view mode toggle or compact icon toggle.

Behavior:

- The run button should be disabled for the same reasons as the existing `Controls` button: invalid allocation, invalid immigration allocation, or active run state.
- Show progress state when simulation/story generation is running.
- Add bottom padding to the main content so the action bar does not cover charts, tables, or timeline content.

### Empty result guide

Update `GuidePanel` and i18n copy so the mobile guide no longer says "Open the menu".

New mobile guide flow:

1. Choose a scenario.
2. Confirm the key assumptions.
3. Run the simulation or story.
4. Review the result.

The guide should describe the product workflow, not the UI mechanics.

## Component Plan

### `src/App.tsx`

Responsibilities:

- Keep permanent left drawer on desktop.
- On mobile:
  - Remove hamburger as the main setup entry.
  - Add state for bottom sheet open/close.
  - Render a mobile setup summary panel in `main`.
  - Render a bottom-anchored settings drawer containing `Controls`.
  - Render a sticky mobile action bar.

Implementation notes:

- `drawerOpen` can be renamed to `settingsOpen`.
- Desktop should still use `Drawer variant="permanent"`.
- Mobile should use `Drawer anchor="bottom"`.
- The app bar should keep language and color mode controls.
- If a menu icon remains, it should be secondary and labeled with accessible text like "Open assumptions", not treated as the only entry.

### New `src/components/MobileQuickSetup.tsx`

Purpose:

- Provide the visible first-run controls on mobile.

Contents:

- Region selector.
- Lifestyle preset selector.
- Current assumptions summary:
  - annual income
  - annual expense
  - retirement age
  - annual contribution
- View mode toggle.
- Primary run button.
- Secondary adjust button.

State source:

- Use `useGameStore`.
- Use region helpers from `src/config/regions.ts`.
- Use lifestyle helpers from `src/i18n/lifestyles.ts` and existing lifestyle lists.

Design:

- Compact, functional panel.
- Avoid large marketing-style hero treatment.
- Use MUI `Paper` or an unframed full-width section with restrained styling.
- No nested cards.
- Keep touch targets at least 44px high.

### New `src/components/MobileActionBar.tsx`

Purpose:

- Keep the user's next action available after scrolling.

Contents:

- `Adjust` button.
- Primary run/generate button.
- Optional view mode toggle or icon button if space allows.

Implementation notes:

- Use `position: fixed`, bottom safe-area inset, and `zIndex` below modal/drawer but above content.
- Add `pb` to main content on mobile, for example `calc(72px + env(safe-area-inset-bottom))`.
- Reuse the same disabled conditions as `Controls`.

### Existing `src/components/Controls.tsx`

Keep `Controls` as the full detailed settings surface for the first implementation.

Optional refactor after the first pass:

- Extract run button logic into a shared hook such as `useRunControls`.
- Extract allocation validity into a selector/helper to avoid duplicating disabled logic between `Controls`, `MobileQuickSetup`, and `MobileActionBar`.
- Split the long `Controls` component into sections only after the mobile flow is working.

### `src/components/GuidePanel.tsx`

Changes:

- Remove mobile-specific instruction that says the user must open the menu.
- Reframe guide steps around product goals.
- Consider reducing visual height on mobile once `MobileQuickSetup` exists, because the setup panel will become the primary onboarding surface.

### `src/i18n/messages.ts`

Add or update keys for:

- `mobile_setup.title`
- `mobile_setup.subtitle`
- `mobile_setup.adjust_assumptions`
- `mobile_setup.key_assumptions`
- `mobile_action.adjust`
- `mobile_action.run`
- `mobile_action.generate_story`
- `settings_sheet.title`
- Updated `guide.mobile.*` copy in English, Traditional Chinese, and Japanese.

Important:

- Current `Controls.tsx` includes local `COPY` for some labels. New mobile components should preferably use central i18n keys from `messages.ts` where possible.
- Avoid introducing new copy inside components unless the existing pattern requires it.

## Interaction Details

### First visit

Expected mobile screen order:

1. App bar.
2. Compact setup panel.
3. Empty result guide.
4. Sticky action bar.

The user can run the default simulation immediately or adjust assumptions.

### After running simulation

Expected mobile screen order:

1. App bar.
2. Optional compact setup summary, collapsed or less prominent.
3. Result summary and charts.
4. Sticky action bar.

The user can rerun with changed assumptions without searching for the controls.

### Opening detailed settings

Expected behavior:

1. User taps `Adjust assumptions`.
2. Bottom sheet opens.
3. User edits detailed controls.
4. User taps run in the sheet or closes it and uses the sticky action bar.

For the first iteration, the run button inside `Controls` can remain. A later refinement can keep only one primary run action inside the sheet header/footer.

## Validation Plan

Manual viewport checks:

- iPhone SE width around 375px.
- iPhone 14/15 width around 390px.
- Small Android width around 360px.
- Tablet boundary around MUI `md`.
- Desktop width above `md` to confirm permanent drawer still works.

Functional checks:

- Default simulation can run from mobile quick setup.
- Default story can run after switching to story mode.
- Detailed settings bottom sheet opens and closes.
- Region selection updates lifestyle presets and currency labels.
- Lifestyle selection updates income, expense, and contribution summary.
- Disabled run state matches existing `Controls` behavior when allocation is invalid.
- Existing saved records flow still works inside detailed settings.
- Language switch updates mobile setup and action bar copy.
- Dark mode does not reduce contrast.

Automated checks:

- Run `npm.cmd test` if existing tests cover store or engine behavior.
- Run `npm.cmd run build` to catch TypeScript and bundling errors.
- If Playwright or another browser test setup exists later, add a mobile smoke test for:
  - visible setup panel
  - visible run CTA
  - bottom sheet open/close

## Rollout Plan

### Phase 1: Low-risk UX improvement

- Add mobile quick setup panel.
- Replace mobile side drawer with bottom sheet.
- Add sticky mobile action bar.
- Update mobile guide copy.
- Keep desktop unchanged.
- Keep `Controls` mostly unchanged.

### Phase 2: Reduce duplicated run logic

- Extract shared selectors/helpers for:
  - allocation validity
  - immigration allocation validity
  - current run label
  - current run disabled state
- Reuse helpers in `Controls`, `MobileQuickSetup`, and `MobileActionBar`.

### Phase 3: Improve detailed settings hierarchy

- Split detailed settings into collapsible sections:
  - Basics
  - Finances
  - Timeline
  - Portfolio
  - Events
  - Demo modules
  - Save/load
- Keep high-risk advanced modules collapsed by default on mobile.

## Risks

- Duplicate run buttons may confuse users if both quick setup and detailed settings show primary CTAs. Phase 1 can tolerate this, but the sheet should visually prioritize settings.
- `Controls.tsx` is long and contains local copy, so extracting shared mobile pieces may expose existing i18n inconsistencies.
- Bottom fixed UI can cover tables or timeline content unless main content receives enough mobile bottom padding.
- Story mode currently returns `GuidePanel mode="simulation"` when empty in `StoryPanel.tsx`; this should be reviewed during implementation because it may show the wrong guide mode.

## Acceptance Criteria

- On mobile, the first screen has a visible run/generate action without opening a hamburger menu.
- On mobile, settings are opened through a clearly labeled action such as `Adjust assumptions`, not only a generic menu icon.
- The full detailed controls remain accessible.
- Desktop behavior remains functionally unchanged.
- Guide copy no longer instructs mobile users to open the menu as step one.
- Build succeeds.
- The implementation is usable at 360px width without text overlap or hidden primary actions.
