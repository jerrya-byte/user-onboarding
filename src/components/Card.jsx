export function Card({ title, subtitle, accent, children, className = '', style }) {
  const accentStyle = accent
    ? { borderTop: `3px solid var(--accent-color, ${accent})` }
    : {};
  return (
    <div
      className={`gov-card ${className}`}
      style={{ ...accentStyle, ...style }}
    >
      {title && <div className="gov-card-title">{title}</div>}
      {subtitle && <div className="gov-card-sub">{subtitle}</div>}
      {children}
    </div>
  );
}

export function Breadcrumb({ items }) {
  return (
    <div className="gov-breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {item.href ? <a href={item.href}>{item.label}</a> : <span>{item.label}</span>}
          {i < items.length - 1 && <span className="sep">/</span>}
        </span>
      ))}
    </div>
  );
}

export function PageHeader({ title, subtitle, right }) {
  if (right) {
    return (
      <div className="gov-page-header flex justify-between items-start">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="mt-1">{right}</div>
      </div>
    );
  }
  return (
    <div className="gov-page-header">
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

export function SectionSep({ children }) {
  return <div className="gov-section-sep">{children}</div>;
}
