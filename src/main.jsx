import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MsalProvider } from '@azure/msal-react';
import './index.css';
import App from './App.jsx';
import { msalInstance, msalReady } from './lib/msal.js';

// MSAL v3 requires initialize() to complete before any other call,
// so we await it before mounting React. The wait is a single network-
// free call (just sets internal state), so it adds ~no perceptible
// delay to first paint.
msalReady.then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </StrictMode>
  );
});
