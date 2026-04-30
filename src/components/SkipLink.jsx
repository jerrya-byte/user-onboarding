// "Skip to main content" link — first focusable element on the page.
// Visually hidden until it receives keyboard focus, at which point it
// becomes a clearly visible button at top-left. Lets keyboard / screen
// reader users bypass the gov bar + app header + HR nav (~7 tab stops)
// on every page load. WCAG 2.4.1.
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50
                 focus:bg-navy focus:text-white focus:px-4 focus:py-2 focus:rounded
                 focus:outline-2 focus:outline-offset-2 focus:outline-gold-light
                 focus:no-underline focus:font-semibold"
    >
      Skip to main content
    </a>
  );
}
