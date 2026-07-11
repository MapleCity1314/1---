---
version: alpha
name: Tavily
description: >-
  Tavily is an AI-powered search and research platform. The design system emphasizes clarity, accessibility, and
  trustworthiness through a clean, minimalist interface layered over serene natural imagery.
logo:
  src: https://app.tavily.com/img/logo/new_logo.svg
colors:
  surface: '#ffffff'
  surface-dim: '#f5f5f5'
  surface-bright: '#ffffff'
  surface-container-lowest: '#fafafa'
  surface-container-low: '#f0f0f0'
  surface-container: '#e9ecef'
  surface-container-high: '#e0e0e0'
  surface-container-highest: '#d0d0d0'
  on-surface: '#1e293b'
  on-surface-variant: '#65676e'
  inverse-surface: '#1f1e1e'
  inverse-on-surface: '#ffffff'
  outline: '#c9cace'
  outline-variant: '#c2c8d0'
  surface-tint: '#1f1e1e'
  primary: '#1f1e1e'
  on-primary: '#ffffff'
  primary-container: '#3f3f3f'
  on-primary-container: '#ffffff'
  inverse-primary: '#ffffff'
  secondary: '#0088ff'
  on-secondary: '#ffffff'
  secondary-container: '#e3f2fd'
  on-secondary-container: '#0088ff'
  tertiary: '#13a688'
  on-tertiary: '#ffffff'
  tertiary-container: '#c8f0e8'
  on-tertiary-container: '#13a688'
  error: '#d03c38'
  on-error: '#ffffff'
  error-container: '#ffebee'
  on-error-container: '#d03c38'
  primary-fixed: '#3f3f3f'
  primary-fixed-dim: '#2d2d2d'
  on-primary-fixed: '#ffffff'
  on-primary-fixed-variant: '#ffffff'
  secondary-fixed: '#0088ff'
  secondary-fixed-dim: '#0059d6'
  on-secondary-fixed: '#ffffff'
  on-secondary-fixed-variant: '#ffffff'
  tertiary-fixed: '#13a688'
  tertiary-fixed-dim: '#0d8b73'
  on-tertiary-fixed: '#ffffff'
  on-tertiary-fixed-variant: '#ffffff'
  background: '#81b09a'
  on-background: '#1e293b'
  surface-variant: '#c9cace'
typography:
  display:
    fontFamily: ulp-font, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, sans-serif
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: '-0.02em'
  headline-lg:
    fontFamily: ulp-font, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, sans-serif
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: '-0.015em'
  headline-md:
    fontFamily: ulp-font, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, sans-serif
    fontSize: 27px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: 0em
  title-lg:
    fontFamily: ulp-font, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, sans-serif
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: ulp-font, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, sans-serif
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: ulp-font, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, sans-serif
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  label-md:
    fontFamily: ulp-font, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, sans-serif
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: ulp-font, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, sans-serif
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 3px
  DEFAULT: 5px
  md: 8px
  lg: 12px
  xl: 24px
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  container-max: 1280px
elevation:
  sm: 0 1px 2px rgba(0, 0, 0, 0.06)
  md: 0 3px 8px rgba(0, 0, 0, 0.15)
  lg: 0 12px 40px rgba(0, 0, 0, 0.12)
layout:
  containerMaxWidth: 1280px
  gridColumns: 12
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    typography: '{typography.body-lg}'
    rounded: '{rounded.full}'
    padding: 12px 32px
    height: 48px
    border: none
    boxShadow: '{elevation.md}'
  button-primary-hover:
    backgroundColor: '{colors.primary-container}'
    textColor: '{colors.on-primary}'
    transition: background-color 200ms cubic-bezier(0.2, 0, 0, 1)
  button-primary-active:
    backgroundColor: '{colors.primary-fixed-dim}'
    textColor: '{colors.on-primary}'
  button-secondary:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.on-surface}'
    typography: '{typography.body-md}'
    rounded: '{rounded.full}'
    padding: 12px 24px
    height: 48px
    border: 1px solid {colors.outline}
    boxShadow: none
  button-secondary-hover:
    backgroundColor: '{colors.surface-container-high}'
    borderColor: '{colors.outline-variant}'
    transition: background-color 200ms ease-out
  button-social:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.on-surface}'
    typography: '{typography.body-md}'
    rounded: '{rounded.full}'
    padding: 12px 24px
    height: 48px
    border: 1px solid {colors.outline}
    display: flex
    alignItems: center
    gap: 12px
  button-social-hover:
    backgroundColor: '{colors.surface-container-low}'
    borderColor: '{colors.outline-variant}'
  input-field:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.on-surface}'
    typography: '{typography.body-md}'
    rounded: '{rounded.full}'
    padding: 12px 20px
    height: 48px
    border: 1px solid {colors.outline}
    boxShadow: none
  input-field-focus:
    borderColor: '{colors.primary}'
    boxShadow: 0 0 0 3px rgba(31, 30, 30, 0.15)
    outline: none
  card:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.xl}'
    padding: '{spacing.md}'
    boxShadow: '{elevation.md}'
    border: none
  card-hover:
    boxShadow: '{elevation.lg}'
    transition: box-shadow 200ms ease-out
  success-message:
    backgroundColor: '{colors.tertiary-container}'
    textColor: '{colors.on-tertiary-container}'
    typography: '{typography.body-md}'
    rounded: '{rounded.md}'
    padding: '{spacing.md}'
    border: 1px solid {colors.tertiary}
    display: flex
    alignItems: center
    gap: 12px
  error-message:
    backgroundColor: '{colors.error-container}'
    textColor: '{colors.error}'
    typography: '{typography.body-md}'
    rounded: '{rounded.md}'
    padding: '{spacing.md}'
    border: 1px solid {colors.error}
  link:
    textColor: '{colors.secondary}'
    typography: '{typography.body-md}'
    textDecoration: none
    fontWeight: '600'
    cursor: pointer
  link-hover:
    textDecoration: underline
    opacity: '0.8'
---

## Overview

Tavily is an AI-powered research and search platform designed for professionals, researchers, and knowledge workers who demand precision and trustworthiness in their information retrieval. The design system embodies "Minimalist Clarity"—a philosophy that strips away visual noise to create a serene, focused interface. The aesthetic combines a clean white card-based UI layered over a soft, photographic background (typically nature imagery), creating visual depth without complexity. The brand personality is professional yet approachable: calm, precise, and human-centered. Voice example: "Your research, refined. Tavily delivers verified sources in seconds, not hours."

## Colors

The color palette is anchored by a near-black primary (#1F1E1E) used exclusively for primary CTAs, focus states, and key interactive elements—creating a high-contrast, trustworthy anchor. Secondary blue (#0088FF) serves as the accent for links, highlights, and secondary actions, evoking clarity and intelligence. Success green (#13A688) is reserved for validation states and positive feedback. Error red (#D03C38) signals warnings and destructive actions. The surface stack is predominantly white (#FFFFFF) and light grays (#F5F5F5 through #D0D0D0), creating a clean, minimal aesthetic. Neutral gray (#65676E) is used for secondary text and disabled states. All interactive elements use the primary color (#1F1E1E) on hover to maintain visual consistency; focus states apply rgba(31, 30, 30, 0.15) a

## Typography

The type system uses a single font family (ulp-font with system fallbacks) across all scales, prioritizing consistency and legibility. Display and headline weights (700) are reserved for page titles and section headers, establishing visual hierarchy through size rather than weight variation. Body text (400 weight) is set at 16–18px with 24–28px line-height, ensuring comfortable reading on both desktop and mobile. Labels and small text (12–14px) use 500–600 weight to maintain legibility at reduced sizes. Letter-spacing is minimal (0 to 0.02em) to preserve the clean, professional aesthetic. On backgrounds with high visual complexity (the photographic hero), apply text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15) to ensure text remains readable over the nature imagery.

## Layout

The layout uses a centered, card-based composition with a fixed max-width of 1280px. The login form is centered vertically and horizontally within a full-viewport container (100vh), with the background image providing visual context. Spacing follows an 8px unit system: section separation uses lg spacing (40px), component padding uses md spacing (24px), and internal element gaps use sm spacing (12px). The form card itself uses 24px padding with 12px gaps between form fields. Input fields and buttons span the full width of their container (typically 320–400px on desktop) to maximize touch targets and maintain visual balance. White space is generous—the form card is surrounded by at least 40px of breathing room on all sides, allowing the background imagery to frame the interface without distr

## Elevation & Depth

Depth is achieved through subtle shadows and layering rather than dramatic effects. The base layer is the full-bleed background image (no shadow). The card layer (form container) uses box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15), creating a soft separation from the background. On hover, cards elevate to box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12), signaling interactivity. Buttons and inputs use the same md-level shadow (0 3px 8px) to sit slightly above the card surface. Focus states add a thin outline (3px rgba(31, 30, 30, 0.15)) around interactive elements rather than relying on shadow alone, im

## Shapes

The shape philosophy is "Soft-Technical Minimalism"—rounded corners are used strategically to soften the interface without sacrificing clarity. Buttons and inputs use full-radius (9999px / border-radius: 9999px), creating pill-shaped elements that feel modern and approachable. Cards and containers use xl radius (24px), providing subtle rounding that distinguishes them from the background without appearing overly organic. Smaller UI elements (error messages, badges) use md radius (8px). The form container itself uses xl radius (24px) to match card styling. This tiered approach creates visual co

## Components

### Action Elements
Buttons are the primary interaction mechanism. Primary buttons (Continue, Sign up) use full-radius (9999px), 48px height, 12px vertical / 32px horizontal padding, and the primary color (#1F1E1E) background with white text. On hover, the background shifts to #3F3F3F (primary-container) with a 200ms cubic-bezier transition. On active/press, the background darkens to #2D2D2D. Social login buttons (Continue with Google, GitHub, LinkedIn, Microsoft) mirror the primary button shape but use a white background with 1px border (#C9CACE) and black text, with a light gray hover state (#F0F0F0). All buttons include the md-level shadow (0 3px 8px rgba(0, 0, 0, 0.15)) to lift them off the card surface.

### Containers & Surfaces
The form card uses a white background (#FFFFFF), 24px p

## Do's and Don'ts

**Do**
- Do use the primary color (#1F1E1E) exclusively for primary CTAs and focus states—it's the brand's trust anchor and must remain reserved.
- Do maintain the full-bleed background image as a constant visual frame; it provides context and personality without competing with the interface.
- Do apply the md-level shadow (0 3px 8px rgba(0, 0, 0, 0.15)) to all elevated surfaces (cards, buttons, inputs) to create consistent depth.
- Do use full-radius (9999px) for all interactive elements (buttons, inputs) to signal interactivity and maintain the soft-technical aesthetic.
- Do pair headline text with the body-lg typography (18px, 400 weight) for supporting copy to create clear visual hierarchy without weight changes.

**Don't**
- Don't use secondary blue (#0088FF) for primary CTAs—it's reserved for links and secondary actions only; using it for primary buttons dilutes the brand's visual authority.
- Don't add drop shadows exceeding 12px blur radius; the design system prioritizes subtlety and clarity, not dramatic depth.
- Don't apply rounded corners to the page background or outer container—only interior components (cards, buttons, inputs) should use rounding.
- Don't use system fonts (system-ui, sans-serif) in place of ulp-font; the custom font is essential to the brand's visual identity.
- Don't override the focus ring (rgba(31, 30, 30, 0.15)) with a solid outline; the subtle overlay maintains accessibility while preserving the minimal aesthetic.
