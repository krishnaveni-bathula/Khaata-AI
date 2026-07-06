# Khata AI Design System - Warm Merchant Assistant

This document outlines the design language, color tokens, typography scales, spacing, and component definitions extracted from the "Khata AI" project.

## Brand & Style
The design system is centered on the persona of a **"Helpful Digital Assistant"** tailored for the Indian micro-entrepreneur. It prioritizes warmth, immediate utility, and extreme legibility to support shopkeepers who often operate in high-glare outdoor environments.

The style is **Modern-Friendly**, characterized by generous touch targets, high-contrast text, and a soft, approachable aesthetic. Exaggerated rounded corners make the interface feel less like a ledger and more like a conversation.

## Colors
Rooted in the "Golden Hour" of Indian commerce—vibrant, optimistic, and deeply familiar.

| Token | Hex Code | Description / Usage |
| :--- | :--- | :--- |
| **Primary** | `#ff8c00` | Deep Orange. Main actions (Adding a transaction, primary buttons). |
| **Secondary** | `#ffbf00` | Amber. Highlights, warnings, or secondary indicators. |
| **Tertiary** | `#1b6d24` | Green. Used specifically for "Credit/In" (Paid) transactions. |
| **Neutral Background** | `#f9f9f9` | Off-white. Base surface. Reduces eye strain. |
| **On-Background (Text)**| `#1a1c1c` | Near-black. High legibility under sunlight. |
| **On-Surface-Variant** | `#564334` | Warm dark brown. For secondary text, labels, and metadata. |
| **Surface-Container** | `#eeeeee` | Soft grey. Backgrounds for inputs, cards, and navigation. |
| **Surface-Container-Low**| `#f3f3f3` | Very soft grey. Subtle container background. |
| **Surface-Container-Lowest**| `#ffffff` | Pure White. Card bases, modals. |

## Typography
The typography utilizes the font **Be Vietnam Pro** (or standard sans-serif fallback). The scale is up-sized for older shopkeepers to easily read transaction details under sunlight.

- **display-lg**: 32px / line-height 40px / bold (`font-weight: 700`)
- **headline-lg**: 24px / line-height 32px / bold (`font-weight: 700`)
- **headline-md**: 20px / line-height 28px / semi-bold (`font-weight: 600`)
- **amount-display**: 28px / line-height 34px / bold (`font-weight: 700`)
- **body-lg**: 18px / line-height 26px / regular (`font-weight: 400`)
- **body-md**: 16px / line-height 24px / regular (`font-weight: 400`)
- **label-lg**: 14px / line-height 20px / semi-bold (`font-weight: 600`)
- **label-md**: 12px / line-height 16px / medium (`font-weight: 500`)

## Layout & Spacing
- **Touch Targets**: No interactive element should be smaller than **48px** in height.
- **Side Margins**: Mobile layout uses a **20px side margin** (container margin) to prevent thumbs from obscuring content on edge-to-edge displays.
- **Spacing Grid**: Rhythmic 8px increments (`8px`, `12px`, `16px`, `24px`, `32px`).
- **Layout Grid**: 4-column layout for mobile viewport.

## Elevation & Depth (Visual Metaphor: Stacked Paper)
- **Level 0 (Background)**: Off-white `#f9f9f9` flat.
- **Level 1 (Cards/Lists)**: White `#ffffff` with a soft diffused shadow: `shadow-md` or custom shadow (`0 4px 12px rgba(0,0,0,0.06)`).
- **Level 2 (Floating Actions)**: Pronounced shadow with a hint of primary color tint or dark shadow: `shadow-lg` (`0 8px 16px rgba(255, 140, 0, 0.15)`).

## Corner Radius
- **Base Roundness**: **1.5rem (24px)** corner radius for container wrappers and main buttons (`rounded-[24px]`).
- **Default Roundness**: `0.5rem (8px)` for smaller components.
- **Pill Roundness**: `full` for status badges and tags.
