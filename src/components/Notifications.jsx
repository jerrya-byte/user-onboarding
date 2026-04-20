import { timeAgo } from '../lib/format';

export default function Notifications({ items, onMarkAllRead }) {
  return (
    <div className="gov-card p-0 overflow-hidden">
      <div className="px-4 py-3.5 border-b border-border flex justify-between items-center">
        <div className="text-[13px] font-bold text-navy">Notifications</div>
        <button
          onClick={onMarkAllRead}
          className="text-[11px] text-gold-light cursor-pointer font-semibold bg-transparent border-0"
        >
          Mark all read
        </button>
      </div>
      {items.length === 0 && (
        <div className="px-4 py-5 text-[12px] text-ink-soft text-center">
          No notifications yet.
        </div>
      )}
      {items.slice(0, 6).map((n) => (
        <div
          key={n.id}
          className="py-3 px-4 border-b border-border flex gap-3 items-start last:border-b-0"
        >
          <div
            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
              n.read ? 'bg-border' : 'bg-gold-light'
            }`}
          />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-ink leading-snug">
              {n.title}
            </div>
            <div className="text-[12px] text-ink-soft mt-0.5">{n.body}</div>
            <div className="text-[11px] text-border-dark mt-1">
              {timeAgo(n.createdAt)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
