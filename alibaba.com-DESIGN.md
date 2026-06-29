# Design System Inspired by Alibaba

## 1. Visual Theme & Atmosphere

Alibaba's design system embodies a bold, commerce-driven aesthetic that balances professionalism with energy. The visual language prioritizes clarity and trust—essential for a global B2B marketplace connecting buyers and suppliers across continents. Vibrant accent colors punctuate a neutral foundation, creating visual hierarchy that guides users through complex product discovery and transaction flows. The design feels both premium and approachable, leveraging clean typography and generous spacing to reduce cognitive load while maintaining a sense of dynamism and forward momentum.

**Key Characteristics**
- Bold, high-contrast primary accent in bright orange drives attention and conversions
- Clean neutral foundation ensures legibility across product-heavy layouts
- Generous whitespace creates breathing room in data-dense interfaces
- Error and alert states use warm, saturated reds for immediate recognition
- Rounded corners on key interactive elements soften the industrial marketplace aesthetic
- Typography hierarchy is subtle but deliberate, guiding users naturally through content

## 2. Color Palette & Roles

### Primary
- **Alibaba Orange** (`#FF8A24`): Primary call-to-action buttons, active states, and brand highlights
- **Alibaba Orange (Dark)** (`#FF6600`): Hover and pressed states for primary actions
- **Alibaba Orange (Bright)** (`#FA6400`): Secondary orange accent for featured content and notifications

### Accent Colors
- **Brand Blue** (`#0088FF`): Secondary interactive elements, links, and information states

### Interactive
- **Button Orange** (`#FF6600`): Active and hover states for primary buttons
- **Focus Indicator Blue** (`#0088FF`): Focus states and interactive feedback

### Neutral Scale
- **Text Primary** (`#222222`): Main body text, headings, and primary UI labels
- **Text Secondary** (`#333333`): Secondary labels and supporting text
- **Text Tertiary** (`#767676`): Disabled text, hints, and tertiary information
- **Pure Black** (`#000000`): High contrast text and borders
- **Pure White** (`#FFFFFF`): Primary background and text on dark surfaces

### Surface & Borders
- **Border Light** (`#E5E7EB`): Primary border color for cards, inputs, and dividers
- **Border Subtle** (`#DDDDDD`): Secondary dividers and subtle separation
- **Surface Light** (`#F4F4F4`): Subtle background for inactive states and hover overlays

### Semantic / Status
- **Error Critical** (`#D64000`): Primary error and danger states
- **Error High** (`#DE0505`): Secondary error states and validation failures
- **Error Alert** (`#F7421E`): Warning and alert notifications
- **Error Dark** (`#CC3D00`): Hover and pressed states for error elements

## 3. Typography Rules

### Font Family
**Primary:** Alibaba_B2B_Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

**Secondary:** Alibaba_B2B_Sans, system-ui, sans-serif (fallback identical to primary due to single-font strategy)

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|-----------------|-------|
| Display / H1 | Alibaba_B2B_Sans | 32px | 600 | 40px | 0px | Page titles and hero statements |
| Heading / H2 | Alibaba_B2B_Sans | 24px | 600 | 32px | 0px | Section headings and category titles |
| Heading / H3 | Alibaba_B2B_Sans | 20px | 600 | 28px | 0px | Subsection headings and card titles |
| Subheading | Alibaba_B2B_Sans | 16px | 500 | 22px | 0px | Product names and emphasis text |
| Body / Paragraph | Alibaba_B2B_Sans | 14px | 400 | 18px | 0px | Primary content and descriptions |
| Body / Small | Alibaba_B2B_Sans | 14px | 400 | 18px | 0px | Form labels and secondary copy |
| Button / Large | Alibaba_B2B_Sans | 16px | 500 | 24px | 0px | Primary CTA buttons, 44px height |
| Button / Medium | Alibaba_B2B_Sans | 14px | 500 | 18px | 0px | Standard buttons and secondary actions |
| Button / Small | Alibaba_B2B_Sans | 12px | 500 | 16px | 0px | Compact buttons and tags |
| Link | Alibaba_B2B_Sans | 14px | 400 | 18px | 0px | Inline and navigation links |
| Caption | Alibaba_B2B_Sans | 12px | 400 | 16px | 0px | Helper text, metadata, and footnotes |
| Code / Mono | Alibaba_B2B_Sans | 13px | 400 | 18px | 0px | Monospace code blocks (fallback to monospace) |

### Principles
- **Hierarchy through weight:** Consistent use of 400 (regular) and 500–600 (bold) creates clear visual separation without requiring font switches
- **Line height consistency:** All text maintains proportional line height (1.25–1.4x) for improved readability across screen sizes
- **Single font family:** Alibaba_B2B_Sans across all roles ensures brand coherence and reduces cognitive load
- **Metric precision:** Exact pixel values ensure pixel-perfect layouts on both desktop and mobile viewports
- **Accessible contrast:** Text colors maintain 4.5:1 or higher contrast ratios against backgrounds for WCAG AA compliance

## 4. Component Stylings

### Buttons

**Button / Primary Large**
- Background Color: `#FF8A24`
- Text Color: `#222222`
- Font Size: `16px`
- Font Weight: `500`
- Font Family: Alibaba_B2B_Sans
- Padding: `0px 24px`
- Border Radius: `100px`
- Border: `0px solid transparent`
- Height: `44px`
- Line Height: `24px`
- Box Shadow: `rgba(255, 255, 255, 0.4) 0px 0px 8px 0px inset`
- Hover: Background `#FF6600`, Box Shadow `rgba(255, 255, 255, 0.5) 0px 0px 10px 0px inset`
- Active: Background `#FA6400`, Box Shadow `rgba(0, 0, 0, 0.1) 0px 2px 8px 0px`
- Disabled: Background `#E5E7EB`, Text Color `#767676`, Box Shadow none

**Button / Primary Medium**
- Background Color: `#FF8A24`
- Text Color: `#222222`
- Font Size: `14px`
- Font Weight: `500`
- Font Family: Alibaba_B2B_Sans
- Padding: `0px 16px`
- Border Radius: `100px`
- Border: `0px solid transparent`
- Height: `32px`
- Line Height: `18px`
- Box Shadow: `rgba(255, 255, 255, 0.4) 0px 0px 8px 0px inset`
- Hover: Background `#FF6600`, Box Shadow `rgba(255, 255, 255, 0.5) 0px 0px 8px 0px inset`
- Active: Background `#FA6400`, Box Shadow `rgba(0, 0, 0, 0.1) 0px 2px 6px 0px`
- Disabled: Background `#E5E7EB`, Text Color `#767676`, Box Shadow none

**Button / Secondary**
- Background Color: transparent
- Text Color: `#222222`
- Font Size: `14px`
- Font Weight: `400`
- Font Family: Alibaba_B2B_Sans
- Padding: `8px 8px`
- Border Radius: `8px`
- Border: `1px solid #E5E7EB`
- Height: `40px`
- Box Shadow: none
- Hover: Background `#F4F4F4`, Border Color `#DDDDDD`
- Active: Background `#E5E7EB`, Border Color `#767676`
- Disabled: Background transparent, Text Color `#767676`, Border Color `#DDDDDD`

**Button / Ghost (Icon)**
- Background Color: transparent
- Text Color: `#333333`
- Font Size: `16px`
- Font Weight: `400`
- Font Family: Alibaba_B2B_Sans
- Padding: `4px 4px`
- Border Radius: `0px`
- Border: `0px solid transparent`
- Height: `40px`
- Width: `40px`
- Box Shadow: none
- Hover: Background `#F4F4F4`
- Active: Text Color `#222222`, Background `#E5E7EB`
- Disabled: Text Color `#DDDDDD`, Background transparent

### Cards & Containers

**Card / Product**
- Background Color: `#FFFFFF`
- Border: `1px solid #E5E7EB`
- Border Radius: `0px`
- Padding: `12px 12px`
- Box Shadow: none
- Hover: Border Color `#DDDDDD`, Box Shadow `rgba(0, 0, 0, 0.05) 0px 0px 5px 0px, rgba(0, 0, 0, 0.07) 0px 1px 10px 0px`
- Height: auto (min `299px`)
- Text Color: `#222222`
- Font Size: `14px`
- Font Weight: `400`
- Line Height: `18px`

**Card / Hero / Rounded**
- Background Color: `#FFFFFF`
- Border: `2px solid #FF8A24`
- Border Radius: `16px`
- Padding: `16px 20px`
- Box Shadow: none
- Height: auto
- Text Color: `#222222`
- Font Size: `14px`
- Hover: Border Color `#FF6600`, Box Shadow `rgba(255, 138, 36, 0.1) 0px 0px 8px 0px`

**Card / Elevated**
- Background Color: `#FFFFFF`
- Border: `1px solid #E5E7EB`
- Border Radius: `0px 12px 12px 0px`
- Padding: `16px 20px`
- Box Shadow: `rgba(0, 0, 0, 0.05) 0px 0px 5px 0px, rgba(0, 0, 0, 0.07) 0px 1px 10px 0px`
- Height: auto
- Text Color: `#222222`
- Font Size: `14px`
- Hover: Box Shadow `rgba(0, 0, 0, 0.1) 0px 2px 12px 0px`

### Inputs & Forms

**Input / Text Default**
- Background Color: transparent
- Border Bottom: `1px solid #E5E7EB`
- Border Radius: `0px`
- Padding: `8px 0px`
- Font Size: `16px`
- Font Weight: `400`
- Font Family: Alibaba_B2B_Sans
- Text Color: `#222222`
- Line Height: `22px`
- Placeholder Color: `#767676`
- Focus: Border Bottom `2px solid #FF8A24`, Padding `8px 0px` (border absorbs)
- Disabled: Background `#F4F4F4`, Text Color `#DDDDDD`, Border Bottom `1px solid #DDDDDD`

**Input / Search**
- Background Color: `#FFFFFF`
- Border: `2px solid #FF8A24`
- Border Radius: `100px`
- Padding: `0px 16px`
- Font Size: `16px`
- Font Weight: `400`
- Font Family: Alibaba_B2B_Sans
- Text Color: `#222222`
- Height: `44px`
- Line Height: `22px`
- Placeholder Color: `#767676`
- Focus: Border `2px solid #FF6600`, Box Shadow `rgba(255, 138, 36, 0.1) 0px 0px 8px 0px`
- Hover: Border `2px solid #FF8A24`, Background `#FFFFFF`

**Label / Form**
- Font Size: `14px`
- Font Weight: `500`
- Font Family: Alibaba_B2B_Sans
- Text Color: `#222222`
- Margin Bottom: `8px`
- Line Height: `18px`

**Helper Text**
- Font Size: `12px`
- Font Weight: `400`
- Font Family: Alibaba_B2B_Sans
- Text Color: `#767676`
- Margin Top: `4px`
- Line Height: `16px`

**Error State (Input)**
- Border Color: `#D64000`
- Focus: Border `2px solid #D64000`, Box Shadow `rgba(214, 64, 0, 0.1) 0px 0px 8px 0px`
- Helper Text Color: `#D64000`

### Navigation

**Navigation / Horizontal**
- Background Color: `#FFFFFF`
- Border Bottom: `1px solid #E5E7EB`
- Padding: `0px 0px`
- Height: `38px`
- Font Size: `16px`
- Font Weight: `400`
- Font Family: Alibaba_B2B_Sans
- Text Color: `#000000`
- Line Height: `24px`

**Navigation / Item**
- Padding: `8px 16px`
- Text Color: `#222222`
- Font Size: `14px`
- Font Weight: `400`
- Hover: Color `#FF8A24`, Background transparent
- Active: Color `#FF8A24`, Border Bottom `2px solid #FF8A24`

**Navigation / Link**
- Text Color: `#222222`
- Font Size: `14px`
- Font Weight: `400`
- Text Decoration: none
- Hover: Color `#FF8A24`, Text Decoration underline
- Active: Color `#FF8A24`, Font Weight `500`
- Visited: Color `#767676`

### Badges & Tags

**Badge / Default**
- Background Color: `#F4F4F4`
- Text Color: `#222222`
- Font Size: `12px`
- Font Weight: `500`
- Font Family: Alibaba_B2B_Sans
- Padding: `4px 8px`
- Border Radius: `8px`
- Border: `1px solid #E5E7EB`
- Line Height: `16px`

**Badge / Error**
- Background Color: `#FFF0EB`
- Text Color: `#D64000`
- Font Size: `12px`
- Font Weight: `500`
- Padding: `4px 8px`
- Border Radius: `8px`
- Border: `1px solid #F7421E`

**Badge / Success**
- Background Color: `#E8F5E9`
- Text Color: `#2E7D32`
- Font Size: `12px`
- Font Weight: `500`
- Padding: `4px 8px`
- Border Radius: `8px`
- Border: `1px solid #81C784`

### Modals & Dialogs

**Modal / Overlay**
- Background Color: `rgba(0, 0, 0, 0.6)`
- Backdrop Filter: blur `4px`
- Z-Index: `1000`

**Modal / Content**
- Background Color: `#FFFFFF`
- Border Radius: `8px`
- Padding: `24px 24px`
- Box Shadow: `rgba(0, 0, 0, 0.15) 0px 4px 24px 0px`
- Min Width: `400px`
- Max Width: `600px`

**Modal / Close Button**
- Background Color: transparent
- Border: none
- Font Size: `20px`
- Text Color: `#767676`
- Padding: `8px 8px`
- Hover: Text Color `#222222`, Background `#F4F4F4`

## 5. Layout Principles

### Spacing System

**Base Unit:** `4px`

**Scale:**
- `4px`: Micro spacing (internal padding in compact components)
- `8px`: Extra-small gaps (space within button groups, minimal padding)
- `12px`: Small gaps (internal card padding, label margins)
- `16px`: Medium gaps (primary padding, section gutters)
- `20px`: Large padding (card content, modal padding)
- `24px`: Extra-large padding (modal frames, major section padding)
- `28px`: Extra gaps (section spacing)
- `40px`: Xlarge padding (page margins, hero sections)

**Usage Contexts:**
- Component internal padding: `8px`, `12px`, `16px`
- Vertical spacing between sections: `24px`, `28px`, `40px`
- Horizontal margins on pages: `40px` per side (min) to `60px` per side (large screens)
- Gap between grid items: `16px`
- Input field padding: `8px` vertical, `12px` horizontal
- Button padding: `16px`–`24px` horizontal, `8px`–`12px` vertical

### Grid & Container

**Max Width:** `1200px` (standard containers), `1400px` (hero/full-bleed sections)

**Column Strategy:** 12-column grid at desktop, adaptive at tablet and mobile

**Gutter Width:** `16px` (half-gutter `8px` per side of column)

**Section Patterns:**
- Full-width hero: `100%` width, `40px` padding left/right, centered content
- Product grid: 4 columns desktop, 2 columns tablet, 1 column mobile
- Two-column layout: 60/40 or 50/50 split with `16px` gap
- Three-column layout: Equal columns with `16px` gutters

### Whitespace Philosophy

Alibaba's design prioritizes generous whitespace to manage information density. Between major content blocks (sections, cards), use `24px` minimum vertical spacing. Within cards, use `16px` padding to create breathing room around text and images. Navigation and header elements remain compact (`38px` height) to preserve vertical real estate. On mobile, reduce horizontal padding to `16px` but maintain vertical breathing space. Never reduce whitespace below `12px` between interactive elements to ensure touch target spacing.

### Border Radius Scale

- `0px`: Card edges, input fields, navigation bars (geometric, business-focused feel)
- `8px`: Small buttons, secondary cards, badge/tag backgrounds
- `16px`: Elevated cards, hero containers, rounded modal content
- `18px`: Large card containers, rounded hero images
- `100px`: Primary buttons, fully rounded elements (pill-shaped CTAs)
- `0px 12px 12px 0px`: Asymmetric cards (skewed right-aligned hero cards)

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (No Shadow) | No shadow, solid borders only | Cards, inputs, navigation, inactive components |
| Subtle (Small) | `rgba(0, 0, 0, 0.05) 0px 0px 5px 0px, rgba(0, 0, 0, 0.07) 0px 1px 10px 0px` | Dropdown menus, hover states on cards, floating labels |
| Medium (Raised) | `rgba(0, 0, 0, 0.1) 0px 2px 8px 0px` | Active buttons, elevated cards on hover, popovers |
| Strong (Overlay) | `rgba(0, 0, 0, 0.15) 0px 4px 24px 0px` | Modals, dialogs, prominent overlays |
| Inset (Interior) | `rgba(255, 255, 255, 0.4) 0px 0px 8px 0px inset` | Button interior glow, pressed states |

**Shadow Philosophy:** Alibaba uses shadows sparingly to maintain a clean, modern aesthetic. Shadows appear primarily on hover states and elevated components (modals, dropdowns) to indicate interactivity and depth hierarchy. Inset shadows on buttons create subtle visual feedback without heavy drop shadows. Border lines (`1px solid #E5E7EB`) serve as the primary depth separator on most components. High-contrast hover states (background color changes, orange accents) take precedence over shadow effects.

## 7. Do's and Don'ts

### Do
- **Use orange accents strategically.** Reserve `#FF8A24` for primary CTAs and active states only. Avoid orange for secondary or tertiary actions.
- **Maintain contrast.** All text on backgrounds must meet WCAG AA standards (4.5:1 contrast minimum for body text).
- **Align to the 4px grid.** Sizing, padding, margins, and positioning must be multiples of `4px` for consistency.
- **Pair rounded buttons with structured cards.** Pill-shaped buttons (`100px` radius) pair well with square or minimally rounded card layouts.
- **Use border colors instead of shadows for primary depth.** The `#E5E7EB` border should be the default depth separator.
- **Provide clear focus states.** All interactive elements must show a distinct focus state (border color change, background highlight, or outline).
- **Group related elements with consistent spacing.** Use `12px` or `16px` gaps to visually cluster related items.
- **Keep typography hierarchy simple.** Stick to font sizes in the provided scale; avoid arbitrary sizes.

### Don't
- **Never use orange for secondary buttons or negative actions.** Secondary buttons use transparent backgrounds with `#E5E7EB` borders.
- **Don't apply shadows to every component.** Shadows are reserved for hover states, modals, and dropdown elements.
- **Avoid mixing rounded and sharp corners excessively.** If using rounded pill buttons, use minimal or no rounding on cards (or apply asymmetric rounding like `0px 12px 12px 0px`).
- **Don't reduce padding below `8px` on buttons or input fields.** Minimum padding is `8px` to ensure touch-friendly dimensions.
- **Avoid light text on light backgrounds.** Text colors on white must be at least `#333333`; never use anything lighter.
- **Don't override the spacing scale.** Use values from the provided scale only; custom margins/padding undermine consistency.
- **Avoid overusing the primary blue accent (`#0088FF`).**  Blue is reserved for secondary interactive states and focus indicators.
- **Don't apply multiple shadow levels to a single component.** Choose one shadow level and stick with it per state.

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | `0px` – `599px` | Single-column layout, `16px` horizontal padding, `32px` button height, font sizes scale down (body `13px`), stacked navigation, touch target min `44px`, grid gap `12px` |
| Tablet | `600px` – `1023px` | Two-column product grid, `20px` horizontal padding, `40px` button height maintained, navigation adapts to horizontal scroll or collapse, grid gap `16px` |
| Desktop | `1024px` – `1399px` | Four-column product grid, `40px` horizontal padding, full navigation visible, `44px` button height, 12-column grid active, gap `16px` |
| Large Desktop | `1400px`+ | Four-column grid with increased card size, `60px` horizontal padding, max-width containers at `1200px` centered, enhanced spacing between sections |

### Touch Targets

- **Minimum size:** `44px × 44px` for all interactive elements (buttons, links, icon buttons)
- **Recommended size:** `48px × 48px` for navigation and primary CTAs
- **Spacing between targets:** Minimum `12px` gap to prevent accidental activation
- **Small buttons:** If smaller than `44px` (e.g., secondary buttons at `32px`), ensure surrounding whitespace of at least `12px`

### Collapsing Strategy

**Navigation:**
- Desktop: Horizontal navigation bar with all items visible
- Tablet (600px–1023px): Navigation items collapse into a horizontal scrollable container or hamburger menu
- Mobile: Hamburger menu with full-screen overlay or slide-out drawer

**Product Grid:**
- Desktop: 4 columns with `16px` gaps
- Tablet: 2 columns with `16px` gaps
- Mobile: 1 column with `12px` gaps

**Padding & Margins:**
- Desktop / Large Desktop: `40px`–`60px` horizontal padding
- Tablet: `20px` horizontal padding
- Mobile: `16px` horizontal padding
- Vertical spacing remains consistent: `24px` between sections, never reduced on mobile

**Typography:**
- Body text: `14px` on desktop/tablet, `13px` on mobile (for extended content)
- Headings: `32px` on desktop, `24px` on tablet, `20px` on mobile (H1), proportional scaling for H2/H3
- Buttons: `16px` font on desktop/tablet, `14px` on mobile

**Card Layout:**
- Desktop: Wide cards with image, title, and metadata visible simultaneously
- Tablet: Slightly compressed cards, metadata may stack
- Mobile: Full-width cards, image-dominant layout, metadata stacked below

**Images & Media:**
- Desktop: 100% width up to container max-width
- Tablet: 100% width with container max-width adaptive
- Mobile: 100% width with `16px` horizontal padding, maintain aspect ratio

## 9. Agent Prompt Guide

### Quick Color Reference

- **Primary CTA:** Alibaba Orange (`#FF8A24`) — use on buttons, active states, prominent calls to action
- **Secondary CTA / Hover:** Alibaba Orange Dark (`#FF6600`) — hover and pressed button states
- **Background / Surface:** Pure White (`#FFFFFF`) — primary page and card backgrounds
- **Text / Heading:** Text Primary (`#222222`) — main body text, primary headings
- **Border / Divider:** Border Light (`#E5E7EB`) — card borders, input underlines, subtle dividers
- **Error / Alert:** Error Critical (`#D64000`) — error states, validation failures, danger actions
- **Focus / Secondary Interactive:** Brand Blue (`#0088FF`) — focus states, secondary interactive elements
- **Disabled / Tertiary:** Text Tertiary (`#767676`) — disabled states, helper text, hints
- **Surface Secondary:** Surface Light (`#F4F4F4`) — inactive backgrounds, hover overlays, subtle accents

### Iteration Guide

1. **Always use `#FF8A24` for primary buttons and CTAs.** All other colors are neutral or secondary. Verify orange is applied to the highest-priority action on each page.

2. **Button sizing rule:** `32px` height with `16px` padding for medium buttons, `44px` height with `24px` padding for large buttons. Border radius is always `100px` for pill-shaped buttons or `8px` for squared buttons.

3. **Typography scale is fixed.** Use only the font sizes in the Hierarchy table (16px, 14px, 12px, etc.). Never interpolate between sizes. Body text is always `14px / 18px line-height`.

4. **Spacing is modular:** All gaps, padding, and margins must be `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `28px`, or `40px`. No custom values.

5. **Borders before shadows.** Use `1px solid #E5E7EB` as the primary depth indicator. Apply shadows only on hover states, dropdowns, and modals (use provided shadow values exactly).

6. **Rounded corners by component type.** Cards: `0px` or `0px 12px 12px 0px` (asymmetric). Buttons: `100px` (pill) or `8px` (squared). Inputs: `0px`. Badges: `8px`.

7. **Input styling.** Text inputs use transparent backgrounds with `1px solid #E5E7EB` bottom borders. On focus, change border to `2px solid #FF8A24` (no background change). Search inputs use full `2px solid #FF8A24` border, `100px` radius, and `44px` height.

8. **Error states.** Change border color to `#D64000`, helper text to `#D64000`, and badge background to `#FFF0EB` with `#D64000` text. Apply error red to all related feedback elements.

9. **Navigation and links.** Navigation items are `14px / 400 weight` with `#222222` text. On hover, change text color to `#FF8A24`. Active state: add `2px solid #FF8A24` bottom border.

10. **Responsive breakpoints.** At `600px` breakpoint, reduce padding to `20px`, stack grid to 2 columns, collapse navigation to hamburger. At `1024px`, expand to 4 columns, full navigation, `40px` padding. Maintain vertical section spacing (`24px`) across all breakpoints.