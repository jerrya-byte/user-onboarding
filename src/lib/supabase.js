// Supabase client. Reads keys from Vite env vars at build time.
//
// For local dev, create a `.env.local` file in the project root:
//   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
//
// For Vercel, add the same two variables under Project Settings →
// Environment Variables, then redeploy.
//
// If both vars are missing, the app silently falls back to its
// localStorage mock backend so the prototype still runs without keys.
//
// See SUPABASE_SETUP.md for the full setup walkthrough.

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(url && anon);

export const supabase = hasSupabase
  ? createClient(url, anon, {
      auth: {
        // Persist the candidate's session across page reloads (so the form
        // page still has a valid session if the candidate refreshes).
        persistSession: true,
        autoRefreshToken: true,
        // The candidate clicks a magic link that lands them on
        // /candidate/auth#access_token=...&type=magiclink. detectSessionInUrl
        // tells the client to parse that hash automatically on page load.
        detectSessionInUrl: true,
      },
    })
  : null;

// Convenience: single string banner shown in the UI when Supabase isn't set up.
export const supabaseStatusMessage = hasSupabase
  ? null
  : 'Running in prototype mode — Supabase not configured. See SUPABASE_SETUP.md to enable real magic-link emails.';
