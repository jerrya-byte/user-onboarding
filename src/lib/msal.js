import { PublicClientApplication, EventType } from '@azure/msal-browser';

// Same Entra app registration that the Identity Proofing Solution uses,
// so HR staff get the same single-sign-on experience across both apps.
// Override per-deployment by setting VITE_ENTRA_TENANT_ID and
// VITE_ENTRA_CLIENT_ID in Vercel (or .env.local for local dev).
const TENANT_ID =
  import.meta.env.VITE_ENTRA_TENANT_ID || 'a3a371db-020d-48f0-8410-b59ac56ccc3e';
const CLIENT_ID =
  import.meta.env.VITE_ENTRA_CLIENT_ID || '131f0637-b48c-475b-894f-588e501aa42e';

export const LOGIN_REQUEST = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
  prompt: 'select_account',
};

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
});

// Initialise — required in msal-browser v3 before any other call.
// We surface a promise so the React provider can await it.
export const msalReady = msalInstance.initialize().then(() => {
  // If a session is already cached, mark the first account active so
  // useAccount() / useMsal() return it immediately on first render.
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0 && !msalInstance.getActiveAccount()) {
    msalInstance.setActiveAccount(accounts[0]);
  }

  // Keep activeAccount in sync after a successful login.
  msalInstance.addEventCallback((event) => {
    if (
      event.eventType === EventType.LOGIN_SUCCESS &&
      event.payload &&
      event.payload.account
    ) {
      msalInstance.setActiveAccount(event.payload.account);
    }
  });
});
