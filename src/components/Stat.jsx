export default function Stat({ value, label, variant }) {
  const v = variant ? variant : '';
  return (
    <div className={`gov-stat-card ${v}`}>
      <div className="gov-stat-num">{value}</div>
      <div className="gov-stat-label">{label}</div>
    </div>
  );
}
