import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from '@azure/msal-react';
import LoginScreen from './LoginScreen';

/**
 * Wrap any route element that should require Microsoft sign-in.
 * Used for /hr/* routes; candidate routes stay public because they
 * use their own magic-link flow.
 */
export default function ProtectedRoute({ children }) {
  const { inProgress } = useMsal();

  // While MSAL is mid-flow (handling a redirect, etc.) show a quiet
  // placeholder so we don't briefly flash the login screen.
  if (inProgress === 'startup' || inProgress === 'handleRedirect') {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-soft text-sm">
        Loading…
      </div>
    );
  }

  return (
    <>
      <AuthenticatedTemplate>{children}</AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <LoginScreen />
      </UnauthenticatedTemplate>
    </>
  );
}
