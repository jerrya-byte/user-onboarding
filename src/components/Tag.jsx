const LABELS = {
  link_sent: { cls: 'gov-tag-sent', text: 'Link Sent' },
  pending:   { cls: 'gov-tag-pending', text: 'Pending' },
  completed: { cls: 'gov-tag-complete', text: 'Complete' },
  expired:   { cls: 'gov-tag-expired', text: 'Expired' },
};

export default function Tag({ status }) {
  const entry = LABELS[status] || { cls: 'gov-tag-pending', text: status };
  return <span className={`gov-tag ${entry.cls}`}>{entry.text}</span>;
}
