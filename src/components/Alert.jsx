const ICON = { info: 'ℹ', warn: '⚠', error: '⚠', success: '✓' };

// Map alert kind → ARIA role / aria-live so screen readers announce it.
//   error → assertive ('alert')
//   warn / info / success → polite ('status')
const ROLE = {
  error: { role: 'alert', live: 'assertive' },
  warn:  { role: 'status', live: 'polite' },
  info:  { role: 'status', live: 'polite' },
  success: { role: 'status', live: 'polite' },
};

export default function Alert({ kind = 'info', children, className = '' }) {
  const cls = `gov-alert gov-alert-${kind} ${className}`;
  const { role, live } = ROLE[kind] || ROLE.info;
  return (
    <div className={cls} role={role} aria-live={live}>
      <span className="gov-alert-icon" aria-hidden="true">{ICON[kind]}</span>
      <div>{children}</div>
    </div>
  );
}
