# Set up EntraID (Microsoft) sign-in for HR staff

The HR side of the portal (`/hr/*`) now requires a Microsoft sign-in.
Candidates are unaffected — they keep using the magic-link flow.

The app reuses the **same Entra app registration** as your existing
Identity Proofing Solution, so HR staff who can sign into the IDP app
can sign into this one too. There are two small pieces of setup:

1. Tell Azure that the new Vercel URL is allowed to redirect back to
   itself after sign-in (~3 minutes).
2. (Optional) Override the tenant/client IDs via Vercel env vars if
   you ever want a different app registration (~2 minutes).

Total time: **~5 minutes**.

---

## Step 1 — Add the Vercel URL as a redirect URI in Azure

1. Go to **<https://portal.azure.com>** → sign in with your admin
   account.
2. Search for **"App registrations"** in the top bar → open it.
3. Click the **"All applications"** tab and find the registration you
   used for the Identity Proofing Solution. (App ID
   `131f0637-b48c-475b-894f-588e501aa42e`.) Click into it.
4. In the left sidebar click **"Authentication"**.
5. Under **"Platform configurations"** you should already have a
   **"Single-page application"** entry from the IDP app. Click it
   (or click **"+ Add a platform"** → **"Single-page application"**
   if it's not there).
6. Under **"Redirect URIs"** click **"Add URI"** and add **each** of
   the following (one per line; click "Add URI" again for each):
   - `https://user-onboarding-portal.vercel.app`
   - `https://user-onboarding-portal.vercel.app/`
   - `http://localhost:5173`
   - `http://localhost:5173/`

   > Use whatever your actual Vercel URL is — if you renamed the
   > Vercel project, swap it in. The URL must match exactly (including
   > the protocol). Adding both with-and-without trailing slash avoids
   > a common gotcha.

7. Scroll down. Under **"Implicit grant and hybrid flows"** make sure
   **both checkboxes are unchecked** (we use the modern PKCE flow,
   not implicit grant).
8. Click **"Save"** at the top.

That's it for Azure. The change is live immediately.

---

## Step 2 — (Optional) Override tenant/client IDs in Vercel

By default the app uses the same tenant + client ID as your IDP app,
which is what you want. If you ever want to point this app at a
different Entra app registration (e.g. a separate one for production
HR), set these in Vercel:

1. Vercel dashboard → your project → **Settings** → **Environment
   Variables**.
2. Add two variables (check all three environments for each):
   - **Name:** `VITE_ENTRA_TENANT_ID` — **Value:** your Tenant ID
     (a GUID, found on the Azure App Registration "Overview" page).
   - **Name:** `VITE_ENTRA_CLIENT_ID` — **Value:** your Application
     (client) ID — also on the Overview page.
3. **Deployments** tab → three-dot menu on the latest deployment
   → **Redeploy**.

Skip this step if you're happy reusing the IDP app registration.

---

## Step 3 — Test it

1. Open your Vercel URL (e.g. `https://user-onboarding-portal.vercel.app`)
   in a fresh browser tab (or an incognito window — that guarantees
   no cached session).
2. You should land on a **"HR Administration Sign-in"** screen with a
   **"Sign in with Microsoft"** button.
3. Click it → a Microsoft sign-in popup opens. Sign in with your
   department account.
4. The popup closes and the HR Dashboard loads. Your **name and email
   appear in the top-right** of the header, with a **"Sign out"**
   button next to them.
5. Click **"Sign out"** → you're returned to the login screen.

If sign-in fails with `AADSTS50011` (redirect URI mismatch), re-check
Step 1 — the Vercel URL in Azure must match the URL in your browser
**exactly**.

---

## Step 4 — (Optional) Restrict access to specific HR users

By default, **anyone in your tenant** with valid credentials can sign
into the HR portal. To restrict to a named group:

1. Azure Portal → **Enterprise applications** → find "Identity
   Proofing Solution" (same app, different blade).
2. Left sidebar → **Properties** → set **"Assignment required?"** to
   **Yes** → **Save**.
3. Left sidebar → **Users and groups** → **+ Add user/group** → pick
   the HR staff (or an HR security group) → **Assign**.

Now only those people can sign into either the IDP app or this one.
Everyone else gets a polite "you don't have access" message from
Microsoft before they ever reach the portal.

---

## How it works (so you can explain it)

- The app uses **MSAL.js** (Microsoft's official JavaScript library
  for EntraID sign-in) — same library the IDP app uses.
- When an HR user opens any `/hr/*` URL, the app checks if they have
  a valid Microsoft session in `sessionStorage`. If yes, the page
  renders. If no, the **LoginScreen** shows instead.
- Clicking "Sign in with Microsoft" opens the standard Microsoft
  popup — the user signs in there (with MFA, conditional access,
  whatever your tenant requires), and Azure returns an ID token to
  the app.
- The app never sees the user's password — only the signed token
  Microsoft returns.
- Sign-out clears the session. Closing the tab also clears it
  (because we use `sessionStorage`, not `localStorage`).
- The candidate-facing pages (`/candidate/*`) are **not** behind
  Microsoft auth — they're protected by their one-time magic link
  instead. That's deliberate: candidates don't have department
  Microsoft accounts yet.

---

## Troubleshooting

- **"AADSTS50011: The redirect URI specified in the request does not
  match"** — the URL in your browser doesn't match what's whitelisted
  in Azure. Re-do Step 1, paying close attention to `https` vs
  `http`, trailing slashes, and the exact subdomain.
- **Popup is blocked** — your browser blocked the Microsoft popup.
  Allow popups for the Vercel domain and try again.
- **"AADSTS700016: Application … was not found in the directory"** —
  you set `VITE_ENTRA_CLIENT_ID` to a GUID that isn't a real app
  registration in your tenant. Remove the env var (to fall back to
  the default) or fix the value.
- **Sign-out button doesn't visually change anything** — Microsoft is
  smart about silent re-auth. If you want to fully reset, close the
  tab or use an incognito window.
