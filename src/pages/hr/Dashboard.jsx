import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import HRLayout from '../../components/HRLayout';
import { Breadcrumb, PageHeader } from '../../components/Card';
import Stat from '../../components/Stat';
import Tag from '../../components/Tag';
import Alert from '../../components/Alert';
import Notifications from '../../components/Notifications';
import {
  listNotifications,
  markAllNotificationsRead,
  refreshStatuses,
  seedIfEmpty,
} from '../../lib/store';
import { formatDate } from '../../lib/format';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
  { key: 'expired', label: 'Expired' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [tab, setTab] = useState('all');
  // Lazy init reads from localStorage exactly once on mount.
  const [requests] = useState(() => {
    seedIfEmpty();
    return refreshStatuses();
  });
  const [notifs, setNotifs] = useState(() => listNotifications());

  const justCreated = search.get('justCreated');
  const justCreatedReq = justCreated ? requests.find((r) => r.id === justCreated) : null;

  const filtered = useMemo(() => {
    if (tab === 'all') return requests;
    if (tab === 'pending')
      return requests.filter((r) => r.status === 'link_sent' || r.status === 'pending');
    if (tab === 'completed') return requests.filter((r) => r.status === 'completed');
    if (tab === 'expired') return requests.filter((r) => r.status === 'expired');
    return requests;
  }, [tab, requests]);

  const stats = useMemo(() => {
    return {
      awaiting: requests.filter((r) => r.status === 'link_sent' || r.status === 'pending').length,
      completed: requests.filter((r) => r.status === 'completed').length,
      expired: requests.filter((r) => r.status === 'expired').length,
      total: requests.length,
    };
  }, [requests]);

  return (
    <HRLayout>
      <Breadcrumb
        items={[{ label: 'Home', href: '#' }, { label: 'Onboarding Dashboard' }]}
      />
      <PageHeader
        title="Onboarding Dashboard"
        subtitle="Monitor the status of all active and recent onboarding requests."
        right={
          <Link to="/hr/new" className="gov-btn gov-btn-primary gov-btn-sm">
            + New Request
          </Link>
        }
      />

      {justCreatedReq && (
        <Alert kind="success">
          Magic link generated and sent to <strong>{justCreatedReq.email}</strong>.
          Invitation code: <code className="font-mono font-semibold">{justCreatedReq.inviteCode}</code>.
          {' '}
          <Link
            to={`/candidate/auth?token=${encodeURIComponent(justCreatedReq.magicToken)}`}
            className="underline font-semibold"
          >
            Preview candidate link →
          </Link>
        </Alert>
      )}

      <div className="gov-stat-row max-md:grid-cols-2">
        <Stat value={stats.awaiting} label="Awaiting Candidate" variant="gold" />
        <Stat value={stats.completed} label="Completed this month" variant="green" />
        <Stat value={stats.expired} label="Links Expired" variant="red" />
        <Stat value={stats.total} label="Total this quarter" variant="teal" />
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-5 max-lg:grid-cols-1">
        <div className="gov-card p-0 overflow-hidden">
          <div className="px-6 pt-4">
            <div className="flex border-b-2 border-border gap-0 -mb-0.5">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`bg-transparent border-0 cursor-pointer py-2.5 px-[18px]
                              text-[13px] font-semibold border-b-2 transition-colors -mb-[2px] ${
                    tab === t.key
                      ? 'text-navy border-navy'
                      : 'text-ink-soft border-transparent hover:text-ink'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Link Sent</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-ink-soft py-6">
                      No requests in this tab.
                    </td>
                  </tr>
                )}
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.givenName} {r.familyName}</strong>
                      <br />
                      <span className="text-[11px] text-ink-soft">{r.email}</span>
                    </td>
                    <td>{r.position}</td>
                    <td>{formatDate(r.linkSentAt)}</td>
                    <td>{formatDate(r.expiresAt)}</td>
                    <td><Tag status={r.status} /></td>
                    <td>
                      {r.status === 'expired' ? (
                        <button
                          className="gov-btn gov-btn-danger gov-btn-sm"
                          onClick={() => navigate(`/hr/reissue/${r.id}`)}
                        >
                          Reissue
                        </button>
                      ) : r.status === 'link_sent' ? (
                        <Link
                          to={`/candidate/auth?token=${encodeURIComponent(r.magicToken)}`}
                          className="gov-btn gov-btn-secondary gov-btn-sm"
                        >
                          Preview Link
                        </Link>
                      ) : (
                        <button className="gov-btn gov-btn-secondary gov-btn-sm">
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Notifications
          items={notifs}
          onMarkAllRead={() => {
            markAllNotificationsRead();
            setNotifs(listNotifications());
          }}
        />
      </div>
    </HRLayout>
  );
}
