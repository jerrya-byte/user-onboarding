const ICON = { info: 'ℹ', warn: '⚠', error: '⚠', success: '✓' };

export default function Alert({ kind = 'info', children, className = '' }) {
  const cls = `gov-alert gov-alert-${kind} ${className}`;
  return (
    <div className={cls}>
      <span className="gov-alert-icon">{ICON[kind]}</span>
      <div>{children}</div>
    </div>
  );
}
