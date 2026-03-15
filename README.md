# Teal & Tale Aesthetics

Premium bilingual portfolio demo for a beauty salon landing page in Krakow, Zablocie.

## Overview

Teal & Tale Aesthetics is a showcase project built as a premium editorial-style beauty landing page. The project combines a polished marketing front-end with a lightweight MVP backend for booking leads.

The goal of the repository is to demonstrate:

- Astro architecture with localized routing
- a data-driven content model
- premium UI direction with motion and glassmorphism
- a simple lead capture flow with file-based persistence
- a realistic portfolio-ready product structure

## Tech Stack

- Astro
- Tailwind CSS 4
- GSAP
- TypeScript
- Zod
- Astro Node adapter

## Key Features

- `/pl/` and `/en/` localized routes
- all main marketing content stored in `src/data/content.json`
- premium landing structure:
  - Hero
  - Services
  - Experience
  - Trust
  - Instagram
  - Booking
  - FAQ
- sticky booking CTA
- ambient glow and reveal animations
- booking channel selection via WhatsApp, Telegram, or Email
- API routes for lead creation and lead status updates
- local JSON storage for demo leads
- demo admin view for lead review

## Project Structure

```text
src/
  components/
  data/
    content.json
  layouts/
  lib/
    content.ts
    leads.ts
  pages/
    api/
      leads.ts
      leads/[id]/status.ts
    index.astro
    [locale]/
      admin/
        leads.astro
      index.astro
      privacy-policy.astro
  styles/
    global.css
storage/
public/
REPORT.md
```

## Content Model

The main source of truth for editable site content is:

- `src/data/content.json`

It stores:

- SEO copy
- brand copy
- service names, prices, durations
- trust block content
- booking form labels
- FAQ
- privacy policy content
- image references and alt text

Runtime lead data is stored separately in:

- `storage/leads.json`

This file is intentionally ignored by git, because it acts as demo runtime storage.

## Lead Flow

1. The user selects a service and fills in the booking form.
2. The frontend sends a request to `POST /api/leads`.
3. The backend validates and saves the lead to local storage.
4. After a successful save, the selected contact channel opens with a prepared message.
5. Lead statuses can be updated through the demo admin flow.

Supported statuses:

- `new`
- `contacted`
- `awaiting_confirmation`
- `confirmed`
- `redirected_to_booksy`
- `cancelled`
- `no_response`

## Development

```bash
npm install
npm run dev
npm run build
npm run preview
npm run check
```

## Notes

- This is a portfolio demo, not a production booking platform.
- Ratings, reviews, contacts, and legal content may be demo content depending on the current iteration.
- Booksy is treated as a future system of record, but live synchronization is not implemented.
- The admin lead view is intentionally lightweight and not protected for real production use.

## Verification

The project was verified with:

- `npm run build`
- `npm run check`
