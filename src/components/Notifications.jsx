import { timeAgo } from '../lib/format';

export default function Notifications({ items, onMarkAllRead }) {
  return (
    <aside className="gov-card p-0 overflow-hidden" aria-label="Notifications">
      <div className="px-4 py-3.5 border-b border-border flex justify-between items-center">
        <h2 className="text-[13px] font-bold text-navy m-0">Notifications</h2>
        <button
          type="button"
          onClick={onMarkAllRead}
          className="text-[12px] text-navy underline cursor-pointer font-semibold
                     bg-transparent border-0 px-2 py-1 rounded
                     hover:text-navy-dark
                     focus-visible:outline-2 focus-visible:outline-offset-2
                     focus-visible:outline-gold-light"
        >
          Mark all read
        </button>
      </div>
      {items.length === 0 && (
        <div className="px-4 py-5 text-[12px] text-ink-soft text-center">
          No notifications yet.
        </div>
      )}
      <ul className="list-none m-0 p-0">
        {items.slice(0, 6).map((n) => (
          <li
            key={n.id}
            className="py-3 px-4 border-b border-border flex gap-3 items-start last:border-b-0"
          >
            <span
              aria-hidden="true"
              className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                n.read ? 'bg-border-dark' : 'bg-gold-light'
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-ink leading-snug">
                {!n.read && <span className="sr-only">Unread: </span>}
                {n.title}
              </div>
              <div className="text-[12px] text-ink-soft mt-0.5">{n.body}</div>
              <div className="text-[11px] text-ink-soft mt-1">
                {timeAgo(n.createdAt)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
