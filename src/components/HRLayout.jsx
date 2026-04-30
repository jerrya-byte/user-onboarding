import { useEffect } from 'react';
import GovChrome from './GovChrome';
import SkipLink from './SkipLink';

// HRLayout is the standard wrapper for HR portal pages. It provides:
//   - a "Skip to main content" link for keyboard users (2.4.1)
//   - the gov chrome (gov bar + app header + HR nav)
//   - a real <main> landmark with id="main-content" so the skip link works
//     and screen reader users can jump straight to page content.
// `pageTitle` (optional) updates document.title to "<page> — Identity
// Onboarding Portal" so SR users hear a unique title per route (2.4.2).
export default function HRLayout({ children, pageTitle }) {
  useEffect(() => {
    if (pageTitle) {
      document.title = `${pageTitle} — Identity Onboarding Portal`;
    }
  }, [pageTitle]);

  return (
    <div className="min-h-screen">
      <SkipLink />
      <GovChrome variant="hr" />
      <main id="main-content" tabIndex={-1} className="px-8 py-8 max-w-[960px] mx-auto focus:outline-none">
        {children}
      </main>
    </div>
  );
}
