export function Field({
  label, required, hint, error, prefilled, prefillNote, children, id,
}) {
  return (
    <div className="gov-field">
      {label && (
        <label htmlFor={id} className="gov-label">
          {label}{required && <span className="gov-req">*</span>}
        </label>
      )}
      {hint && <div className="gov-hint">{hint}</div>}
      {children}
      {prefilled && (
        <div className="gov-prefill-note">
          ✓ {prefillNote || 'Pre-filled from employment record'}
        </div>
      )}
      {error && <div className="gov-error-msg">{error}</div>}
    </div>
  );
}

export function TextInput({ prefilled, error, className = '', ...props }) {
  const cls = [
    'gov-input',
    prefilled ? 'prefilled' : '',
    error ? 'error-border' : '',
    className,
  ].filter(Boolean).join(' ');
  return <input className={cls} readOnly={prefilled} {...props} />;
}

export function SelectInput({ prefilled, error, className = '', children, ...props }) {
  const cls = [
    'gov-input',
    prefilled ? 'prefilled' : '',
    error ? 'error-border' : '',
    className,
  ].filter(Boolean).join(' ');
  return <select className={cls} disabled={prefilled} {...props}>{children}</select>;
}

export function TextArea({ error, className = '', ...props }) {
  const cls = ['gov-input', error ? 'error-border' : '', className].filter(Boolean).join(' ');
  return <textarea className={cls} {...props} />;
}
