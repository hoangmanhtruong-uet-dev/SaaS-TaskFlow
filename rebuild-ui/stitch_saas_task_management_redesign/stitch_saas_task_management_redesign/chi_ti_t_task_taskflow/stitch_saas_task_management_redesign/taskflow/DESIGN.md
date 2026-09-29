---
name: TaskFlow
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353943'
  surface-container-lowest: '#0a0e17'
  surface-container-low: '#181b25'
  surface-container: '#1c1f29'
  surface-container-high: '#262a34'
  surface-container-highest: '#31353f'
  on-surface: '#dfe2ef'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#dfe2ef'
  inverse-on-surface: '#2c303a'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#c0c1ff'
  on-secondary: '#1000a9'
  secondary-container: '#3131c0'
  on-secondary-container: '#b0b2ff'
  tertiary: '#bec6e0'
  on-tertiary: '#283044'
  tertiary-container: '#9ba2bb'
  on-tertiary-container: '#31394d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#0f131c'
  on-background: '#dfe2ef'
  surface-variant: '#31353f'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system is built for a professional SaaS productivity platform, combining the high-velocity precision of Linear with the modular clarity of Notion. The brand personality is focused, efficient, and relentlessly modern. 

The UI evokes an emotional response of absolute control, calm focus, and technical elegance. It strips away visual noise to let complex workflows feel effortless. The chosen design style is a refined Corporate/Modern approach with subtle High-Contrast accents, prioritizing utility, sharp information hierarchy, and deep immersion through a dark-mode-first paradigm.

## Colors

The color architecture is anchored by a deep slate and charcoal foundation that reduces eye strain during prolonged workspace sessions. The primary accent is a vibrant emerald green (`#10B981`), used strictly for high-priority actions, active states, and success indicators. 

Secondary indigo tones provide contextual depth for auxiliary tags and active selections, while the neutral scale spans from absolute pitch-black surfaces up to luminous white text, ensuring WCAG AAA compliance across all data densities.

## Typography

Typography acts as the structural skeleton of the interface. We utilize a single, hyper-legible neutral grotesque family across all weights to maintain extreme consistency in dense data tables and kanban boards. 

Tight letter-spacing on large headlines creates a commanding editorial presence, while tabular numerals must be enforced on all metadata, timers, and metric readouts to prevent layout jitter during live updates.

## Layout & Spacing

The layout relies on a flexible 12-column grid system paired with an 8px baseline grid rhythm. This guarantees predictable spatial relationships between complex sidebar navigation, collapsible inspectors, and central canvas areas.

On mobile devices, the layout collapses into a single-column stack where sidebars transform into off-canvas drawer overlays, preserving the 1.5rem margin system to ensure touch targets remain uncompromised.

## Elevation & Depth

Depth is achieved through low-contrast outlines and meticulous tonal layering rather than heavy drop shadows. Surfaces build hierarchy by stepping up in lightness against the pitch-black background canvas. 

Interactive elements utilize delicate "ghost borders" (1px translucent white/slate strokes) to define boundaries, shifting to glowing emerald or solid white outlines upon focus or hover. Floating panels like dropdowns and command palettes employ subtle ambient shadows paired with soft backdrop blurs for spatial separation.

## Shapes

The shape language is clean, restrained, and purposeful. A subtle soft-roundedness level (`0.25rem` for base elements, up to `0.75rem` for large containers) projects a modern SaaS aesthetic without feeling overly playful or juvenile. 

Inputs, buttons, and card containers share uniform corner radii to ensure visual harmony when nested within complex dashboard layouts.

## Components

### Buttons
Primary actions utilize the solid emerald accent (`#10B981`) with high-contrast dark text, featuring an immediate brightness shift on hover. Secondary actions are rendered as ghost buttons with subtle border strokes and transparent fills. Destructive actions utilize muted crimson tones.

### Chips & Tags
Compact inline indicators featuring low-opacity background fills matching their semantic category (e.g., status tags, priority markers), paired with `label-sm` typography and soft-rounded pill shapes.

### Input Fields
Deep charcoal backgrounds with 1px slate borders. Focus states instantly swap the border to the primary emerald accent with a matching 2px outer ring glow. Include clear label placement and persistent helper text positioning.

### Checkboxes & Radio Buttons
Custom geometric boxes with a 0.125rem corner radius. Checked states fill entirely with the primary accent color and display a crisp white checkmark icon.

### Cards & Containers
Modular surface containers utilizing tonal elevation steps, framed by 1px low-contrast outlines. They encapsulate padding matching `space-lg` and maintain internal grid alignments for task metadata.

### Additional Components
- **Command Palette:** A centered modal search input with keyboard shortcut badges, optimized for rapid navigation.
- **Data Tables:** Dense row layouts featuring hover high-lighting, sticky headers, and inline status modification triggers.