---
version: alpha
name: Шиномонтаж на Шамшиных
colors:
  background: '#f4f7fa'
  surface: '#ffffff'
  text: '#142235'
  muted: '#54647a'
  primary: '#2456ee'
  secondary: '#dce7ff'
  line: '#d4deea'
typography:
  body:
    fontFamily: 'Golos Text, Arial, sans-serif'
  display:
    fontFamily: 'Unbounded, Arial, sans-serif'
rounded:
  button: '999px'
  panel: '24px'
spacing:
  unit: '8px'
components:
  button:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.surface}'
    rounded: '{rounded.button}'
  panel:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    rounded: '{rounded.panel}'
  caption:
    textColor: '{colors.muted}'
  divider:
    backgroundColor: '{colors.line}'
---

# Шиномонтаж на Семьи Шамшиных, 93а

## Overview
Russian sales demo for the exact workshop at Семьи Шамшиных, 93а, Novosibirsk, 2GIS firm 70000001025191287. The user requested another independent tyre workshop website with a different visual style and strong motion/3D. The design is the builder's choice under that brief: a bright cobalt automotive service station. Real workshop photos and every published price belong in the first version.

## Colors
Cool white and blue-grey surfaces, cobalt service signals and dark navy typography. CSS owns the runtime tokens: background maps to --bg, surface --surface, text --ink, muted --muted, primary --blue, secondary --soft-blue, line --line. White on cobalt buttons is contrast-checked. No orange/charcoal Black House palette or jungle imagery.

## Typography
Locally hosted Cyrillic Unbounded for a compact, wide and rounded headline; Golos Text for practical Russian copy, prices and contacts. Oversized type is used in the hero, while service and price names remain easy to scan. Avoid made-up brand names: combine the workshop category and its real street address in the wordmark.

## Layout
A light header, broad white hero and offset cobalt 3D stage create the first composition. Round contact pills, full-width photographic service panels, a blue price sidebar and an airy image grid provide rhythm. Services use an interactive selection panel instead of identical equal tiles. A bright blue contact ending brings the address and phone forward. Keep native document scrolling and 20px gutters on narrow phones.

## Elevation & Depth
The tyre floats over a tilted cobalt stage with address lettering and a soft static shadow. Genuine WebGL has drag and keyboard rotation, exploded-view control, pause, reduced-motion and fallback; stop rendering offscreen and in hidden tabs. No continuous layout, blur or scrolling JS effects. Section entrance and photo zoom use only opacity/transform.

## Shapes
Practical rounded panels and pill actions suit a approachable city workshop. Tokens --radius-panel and --radius-button map to the frontmatter. Physical tyre tread, a blue diagonal stage and rounded typographic forms are the signature; numbered decorations are not needed.

## Components
All appointment CTAs lead to #contacts. Display only verified phone and social links. Every gallery image opens a native dialog with original photographer/source attribution, arrows, Escape and focus restoration. Prices retain exact from/range/unit/date semantics. Where diameter rates are absent, a selector prepares an inquiry and never calculates an invented price or claims a reservation.

## Do's and Don'ts
- Keep Jumanji and Black House source trees and servers unchanged; this demo uses a separate repository and port 5175.
- Use primary 2GIS records for ID 70000001025191287; do not confuse a building ID or map center with business coordinates.
- Use real photos from this workshop only, preserve watermarks and source attribution.
- Do not invent reviews, speed, guarantees, prices, brand history or social accounts.
- Keep visible focus, accessible names, 44px controls, reduced motion, image geometry and scrollbars.
- Keep the demo footer and noindex; publish to a separate GitHub Pages repository under existing session authorization.
