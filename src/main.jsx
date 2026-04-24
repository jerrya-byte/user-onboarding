import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MsalProvider } from '@azure/msal-react';
import './index.css';
import App from './App.jsx';
import { msalInstance, msalReady } from './lib/msal.js';

// Boot marker — bump this string whenever main.jsx changes so we can
// confirm in the browser console that the latest bundle is live.
console.log('[main] boot v4 (loginRedirect mode)');

// With loginRedirect, Microsoft sends the user back to this app at the
// configured redirectUri with the auth code in the URL. We MUST call
// handleRedirectPromise() before React mounts so MSAL can process that
// response, populate its cache, and fire LOGIN_SUCCESS — otherwise
// React Router will navigate away and the auth params will be lost.
async function boot() {
  await msalReady;

  try {
    const response = await msalInstance.handleRedirectPromise();
    if (response) {
      console.log(
        '[main] handleRedirectPromise returned account:',
        response.account?.username
      );
      // Belt-and-braces: explicitly set the active account so the very
      // first React render after the redirect already shows the user
      // as signed in.
      if (response.account) {
        msalInstance.setActiveAccount(response.account);
      }
    } else {
      console.log('[main] no redirect response (normal page load)');
    }
  } catch (err) {
    console.error('[main] handleRedirectPromise error:', err);
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </StrictMode>
  );
}

boot();
