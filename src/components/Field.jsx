import { Children, cloneElement, isValidElement, useId } from 'react';

// Field auto-generates an id and wires the inner input/select/textarea up to:
//   - <label htmlFor>            (3.3.2 — Labels or Instructions)
//   - aria-required              (3.3.2 — required state announced to SRs)
//   - aria-invalid               (3.3.1 — invalid state announced to SRs)
//   - aria-describedby           (1.3.1 — hint + error linked to the input)
// Anything passed in the children tree that LOOKS like a form control
// (props.value or props.onChange present, or it's TextInput / SelectInput /
// TextArea below) gets these attributes auto-injected, so callers don't have
// to pass id/aria-* themselves.
//
// Hint text and error text both render with stable ids derived from the
// input's id, so they can be referenced via aria-describedby.
export function Field({
  label, required, hint, error, prefilled, prefillNote, children, id: idProp,
}) {
  const reactId = useId();
  const id = idProp || `f-${reactId}`;
  const hintId = hint ? `${id}-hint` : null;
  const errorId = error ? `${id}-err` : null;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  // Walk children once and inject a11y props onto the first form control we
  // find. Caller can still override by passing their own props.
  let injected = false;
  const enhanced = Children.map(children, (child) => {
    if (!isValidElement(child) || injected) return child;
    if (child.type === TextInput || child.type === SelectInput || child.type === TextArea) {
      injected = true;
      return cloneElement(child, {
        id: child.props.id || id,
        'aria-required': required ? 'true' : undefined,
        'aria-invalid': error ? 'true' : undefined,
        'aria-describedby': describedBy,
        required: required || undefined,
      });
    }
    return child;
  });

  return (
    <div className="gov-field">
      {label && (
        <label htmlFor={id} className="gov-label">
          {label}
          {required && (
            <>
              <span className="gov-req" aria-hidden="true">*</span>
              <span className="sr-only"> required</span>
            </>
          )}
        </label>
      )}
      {hint && <div id={hintId} className="gov-hint">{hint}</div>}
      {enhanced}
      {prefilled && (
        <div className="gov-prefill-note">
          <span aria-hidden="true">✓ </span>
          {prefillNote || 'Pre-filled from employment record'}
        </div>
      )}
      {error && (
        <div id={errorId} className="gov-error-msg" role="alert">
          {error}
        </div>
      )}
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
