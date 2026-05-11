# UI Improvement Execution Plan

Date: 2026-05-11

## 1. Current Findings

This plan is based on:

- `doc/ui_improve_PLAN.md`
- `doc/landing_prototype.html`
- Current app structure under `src/`

Key implementation facts:

- The app is Vite + React 19 + MUI 7 + Zustand.
- There is no `react-router-dom` dependency today.
- `src/main.tsx` mounts `<App />` directly.
- `src/App.tsx` is the current simulator shell.
- i18n already exists through `I18nProvider`, `useI18n`, and `UiLanguage = 'en' | 'zh-Hant' | 'ja'`.
- The simulator store already has `setCurrentAge` and `setRetirementAge`, so landing CTA query parameters can prefill simulator age assumptions.
- The prototype is pure HTML/CSS/JS and should be ported into scoped React components, not copied globally.

## 2. Product Direction

Build an onboarding landing experience at `/` that explains the retirement Monte Carlo simulator in five scrollable scenes, then sends users into the existing simulator at `/simulator`.

The simulator itself should remain functionally unchanged except for accepting landing query parameters:

```text
/simulator?retireAge=50&lang=zh-Hant
```

Skip links should go directly to `/simulator` without applying onboarding choices.

## 3. Architecture Decision

Recommended path: add `react-router-dom`.

Reason:

- The plan needs stable `/` and `/simulator` URLs.
- Vite SPA routing is a normal fit here.
- It avoids hand-rolled URL parsing and history state in the root app.
- Future pages such as help, docs, or saved scenario sharing will be easier.

Required dependency:

```bash
npm install react-router-dom
```

Fallback if avoiding a new dependency:

- Implement a small `window.location.pathname` switch in `main.tsx`.
- Use `history.pushState` and `popstate`.
- This is acceptable for two routes, but less maintainable.

## 4. Proposed File Structure

```text
src/
  SimulatorApp.tsx
  App.tsx
  landing/
    LandingPage.tsx
    LandingPage.css
    landingContent.ts
    landingData.ts
    useActiveScene.ts
    components/
      TopNav.tsx
      ProgressDots.tsx
      Scene.tsx
      AgePicker.tsx
      UncertaintyGrid.tsx
      FourPercentDemo.tsx
      McSteps.tsx
```

`src/App.tsx` should become the routed root.

The current simulator code in `src/App.tsx` should move to `src/SimulatorApp.tsx` with minimal edits.

## 5. Implementation Phases

### Phase 1: Routing Shell

- Install `react-router-dom`.
- Move current simulator UI from `App.tsx` to `SimulatorApp.tsx`.
- Rebuild `App.tsx` as:

```tsx
import { Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from './landing/LandingPage'
import { SimulatorApp } from './SimulatorApp'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/simulator" element={<SimulatorApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
```

- Wrap `<App />` with `<BrowserRouter>` in `main.tsx`.

### Phase 2: Landing React Port

Port the prototype into React components:

- Scene 1: hook headline and scroll cue.
- Scene 2: retirement age picker.
- Scene 3: uncertainty grid.
- Scene 4: 4% rule illustrative chart.
- Scene 5: Monte Carlo explanation and CTA.
- Fixed top nav with language selector and skip button.
- Fixed progress dots linked to scene scroll.

Implementation notes:

- Use semantic `<section>`, `<button>`, and accessible labels.
- Use CSS transitions and `IntersectionObserver`.
- Keep animation CSS-only; do not add framer-motion.
- Keep landing CSS under `.landingPage` scope.
- Use plain SVG for the Scene 4 chart.

### Phase 3: i18n Integration

Use existing app language state:

- Map prototype `zh` to app `zh-Hant`.
- Add landing strings to existing `src/i18n/messages.ts` with `landing.*` keys, or keep isolated `landingContent.ts` typed by `UiLanguage`.

Recommendation:

- Use `landingContent.ts` first to avoid making `messages.ts` larger during the initial port.
- Later consolidate into `messages.ts` if the app wants one translation source.

Landing language selector should call existing `setLanguage`.

CTA should include language:

```text
/simulator?retireAge=50&lang=zh-Hant
```

### Phase 4: Simulator Query Parameter Intake

In `SimulatorApp`, read query params once on mount:

- `retireAge`: allowed values `30 | 40 | 50 | 60 | 70`.
- `lang`: allowed values `en | zh-Hant | ja`.

Apply:

- `setRetirementAge(retireAge)`
- `setLanguage(lang)`

Validation:

- Ignore invalid values.
- Do not override `currentAge` unless `retireAge <= currentAge`; if so, set `currentAge` to a safe value such as `Math.min(30, retireAge - 1)`.

### Phase 5: SEO And Head

Update `index.html`:

- Title
- Meta description
- Open Graph title and description
- Twitter card
- Canonical URL

Keep `og:image` as a TODO unless an actual asset is created.

Also update `I18nProvider` behavior if needed so simulator document title does not overwrite landing title after navigation.

### Phase 6: QA

Run:

```bash
npm run build
npm test
```

Manual QA:

- `/` opens landing.
- `/simulator` opens existing simulator.
- Skip goes to `/simulator` with no query params.
- CTA goes to `/simulator?retireAge=XX&lang=XX`.
- Invalid query params are ignored.
- Language switch updates landing copy.
- Mobile width 375px has no text overlap.
- Progress dots update on scroll.
- Keyboard tab order reaches nav, age buttons, sequence buttons, CTA.
- `prefers-reduced-motion: reduce` disables nonessential motion.

## 6. Risks And Adjustments

- `ui_improve_PLAN.md` appears to have encoding corruption when read in the current shell. Use `landing_prototype.html` as the copy/design source of truth unless a clean plan file is provided.
- Existing translated app messages also appear garbled in shell output for some locales. Before editing large translation sections, verify actual file encoding in the editor or through a UTF-8-safe viewer.
- Adding Google Fonts to the landing can affect performance. Use existing fonts first unless the visual style requires Fraunces and JetBrains Mono.
- The prototype uses `letter-spacing: -0.02em`; implementation should avoid negative letter spacing per current frontend guidance.
- The landing uses many full-height sections. On short mobile screens, use `min-height: 100svh` plus generous padding instead of forcing content into exactly one viewport.

## 7. Definition Of Done

- Routing works for `/` and `/simulator`.
- Landing matches the prototype structure and intent.
- Existing simulator behavior is preserved.
- CTA preloads retirement age and language.
- Build and tests pass.
- Landing is usable on mobile and desktop.
- Accessibility basics are covered for buttons, progress navigation, headings, and reduced motion.
