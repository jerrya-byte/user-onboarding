# Identity Onboarding Portal — Prototype

A working React prototype of the Department of Superheroes User Onboarding
application, based on the HLD, architecture flow, and HTML mockup in the
project folder.

## Getting started

```bash
cd onboarding-app
npm install           # once (already run)
npm run dev           # starts Vite at http://localhost:5173
```

Then open:

- **HR Dashboard:** http://localhost:5173/hr/dashboard
- **Submit new request:** http://localhost:5173/hr/new
- **Reissue link:** http://localhost:5173/hr/reissue

The dashboard seeds itself with demo data (including one expired candidate)
on first load so there's always something to look at.

## End-to-end flow

1. **HR creates a request** (`/hr/new`) — form validation inline, required
   fields flagged.
2. **Magic link generated** — on submit, you land on the dashboard with a
   one-time preview link to the candidate auth screen. The invitation code
   is shown in the banner (and again on the candidate auth page for demo).
3. **Candidate clicks the magic link** (`/candidate/auth?token=...`) —
   confirms email + invitation code.
4. **Onboarding form** (`/candidate/form`) — pre-populated with the data HR
   submitted. Extra fields (DOB, emergency contact, TFN, bank) are
   validated before submit.
5. **Confirmation** (`/candidate/done`) — shows reference number,
   submission summary, next steps.
6. **HR dashboard** — status flips to "Complete", notification fires.

### Error path

- Magic links expire after 72 hours (configurable in the reissue screen).
- When a link expires, the dashboard auto-flags it and the **Reissue** button
  appears. Clicking it loads the full candidate record for verification,
  prompts for a reason, and issues a fresh link.
- If a candidate opens an expired link, they see a dedicated error screen
  with guidance to contact HR.

## Tech

- **Vite + React 19** — SPA, HMR dev loop
- **React Router v7** — real URLs per screen (shareable, bookmarkable)
- **Tailwind v3** — design tokens lifted directly from the mockup's
  CSS variables (navy/gold gov palette, Georgia serif headings)
- **localStorage mock backend** — `src/lib/store.js` simulates the App
  Backend described in the HLD (magic link signing, Supabase attribute
  retrieval, IAM DB insertion). No real server required to click through
  the full flow.

## Project structure

```
src/
├── App.jsx                      # Router
├── main.jsx
├── index.css                    # Tailwind + gov component classes
├── lib/
│   ├── store.js                 # Mock backend (localStorage)
│   └── format.js                # Date formatting helpers
├── components/                  # Shared UI
│   ├── GovChrome.jsx            # Gov bar + app header + HR nav
│   ├── CandidateChrome.jsx      # Candidate-facing header
│   ├── HRLayout.jsx             # HR page layout
│   ├── Card.jsx / Field.jsx / Alert.jsx / Tag.jsx / ...
└── pages/
    ├── hr/
    │   ├── NewRequest.jsx       # Screen 1 — submit email
    │   ├── Dashboard.jsx        # Screen 2 — stats + table + notifs
    │   └── ReissueLink.jsx      # Screen 3 — reissue expired link
    └── candidate/
        ├── AuthLanding.jsx      # Screen 4 — magic link landing
        ├── OnboardingForm.jsx   # Screen 5 — pre-populated form
        └── Confirmation.jsx     # Screen 6 — submission confirmation
```

## What's mocked vs. real

| Concern            | Prototype                                 | Production equivalent           |
|--------------------|-------------------------------------------|---------------------------------|
| Magic link signing | Base64-url JSON with expiry timestamp     | HMAC/JWT signed server-side     |
| Email delivery     | Preview banner on dashboard               | Transactional email service     |
| Attribute storage  | Mixed into the request record             | Supabase attributes token       |
| IAM DB insert      | `updateRequest()` flips status to complete | Real INSERT + MIM import trigger |
| HR auth            | Hard-coded "Sarah Chen"                   | SSO / IAM-fronted session       |

## Clearing demo state

Open devtools → Application → Local Storage → delete keys starting with
`onboarding.` and refresh. The demo data will reseed automatically.
