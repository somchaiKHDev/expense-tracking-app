# Theme Token System Display in Playground

**Date:** 2026-05-20
**Status:** Approved

## Summary

Add a "Theme Token System" section at the top of the playground page (`/playground`) that reads all DaisyUI design tokens from live CSS custom properties and displays them grouped by category. Values update automatically on dark mode toggle and on page reload after `app.css` changes.

## Architecture

### Files Created
- `src/lib/components/ui/ThemeTokens.svelte` — standalone component that owns all token reading and display logic

### Files Modified
- `src/lib/components/ui/index.ts` — add `ThemeTokens` export
- `src/routes/playground/+page.svelte` — import `ThemeTokens` and place it as the first section before Button

## Component Design

### Token Groups (predefined list)

| Group | CSS Variable Prefix | Tokens |
|---|---|---|
| Colors | `--color-` | primary, primary-content, secondary, secondary-content, accent, accent-content, neutral, neutral-content, base-100, base-200, base-300, base-400, base-500, base-content, info, info-content, success, success-content, warning, warning-content, error, error-content |
| Radius | `--radius-` | selector, field, box |
| Sizes | `--size-` | selector, field |
| Border | `--border` | (single value) |
| Effects | `--depth`, `--noise` | depth, noise |

### Reading Values

Values are read with:
```ts
getComputedStyle(document.documentElement).getPropertyValue('--color-primary')
```

Triggered:
1. On `onMount` — covers initial render and hot reload
2. On `MutationObserver` watching `data-theme` attribute on `<html>` — covers dark mode toggle

Observer is disconnected in `onDestroy` to prevent memory leaks.

### Display per Group

**Colors** — responsive grid of swatches. Each swatch:
- A colored box using `style="background: var(--color-xxx)"` so it is always live
- Token name label (e.g. `primary`)
- Resolved hex/oklch value read via `getComputedStyle`

**Radius** — a row of rounded boxes, each with `style="border-radius: <computed value>"`, plus label and value text.

**Sizes / Border** — simple label + value list.

**Effects** — simple label + value list.

### Missing Token Handling

If `getComputedStyle` returns an empty string for a token, display `—` instead. No crash, no warning.

## Data Flow

```
app.css (CSS custom properties)
  └─> Browser resolves variables onto :root
        └─> onMount / MutationObserver triggers read
              └─> Svelte reactive state updated
                    └─> ThemeTokens re-renders swatches
```

## Testing

- Run dev server and navigate to `/playground`
- Verify all color swatches render with correct colors
- Toggle dark mode — confirm swatches update immediately
- Change a color value in `app.css` — after HMR reload, confirm playground reflects the new value
- Verify any undefined token shows `—` without errors
