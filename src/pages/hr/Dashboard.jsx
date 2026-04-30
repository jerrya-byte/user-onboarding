import { useEffect, useMemo, useState } from 'react';
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
import { hasSupabase } from '../../lib/supabase';
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
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notifs, setNotifs] = useState(() => listNotifications());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await seedIfEmpty();
        const refreshed = await refreshStatuses();
        if (!cancelled) {
          setRequests(refreshed);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setLoadError(err.message || 'Could not load requests.');
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const justCreated = search.get('justCreated');
  const emailSent = search.get('emailSent') === '1';
  const emailError = search.get('emailError');
  const justCreatedReq = justCreated
    ? requests.find((r) => r.id === justCreated)
    : null;

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
    <HRLayout pageTitle="Dashboard">
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

      {!hasSupabase && (
        <Alert kind="warn">
          Running in <strong>prototype mode</strong> (localStorage only). See{' '}
          <em>SUPABASE_SETUP.md</em> to enable real magic-link emails and database persistence.
        </Alert>
      )}

      {loadError && <Alert kind="error">Could not load requests: {loadError}</Alert>}

      {justCreatedReq && emailSent && (
        <Alert kind="success">
          Magic link email sent to <strong>{justCreatedReq.email}</strong> via Supabase Auth.
          The candidate should receive an email within ~30 seconds (check spam if not).
        </Alert>
      )}
      {justCreatedReq && !emailSent && !emailError && (
        <Alert kind="info">
          Request created for <strong>{justCreatedReq.email}</strong>. Invitation code:{' '}
          <code className="font-mono font-semibold">{justCreatedReq.inviteCode}</code>.{' '}
          <Link
            to={`/candidate/auth?request_id=${justCreatedReq.id}&preview=1&token=${encodeURIComponent(justCreatedReq.magicToken)}`}
            className="underline font-semibold"
          >
            Preview candidate link →
          </Link>
        </Alert>
      )}
      {emailError && (
        <Alert kind="error">
          Request created, but the magic-link email failed to send: <em>{emailError}</em>.
          Check Supabase rate limits or re-issue from the row below.
        </Alert>
      )}

      <div className="gov-stat-row max-md:grid-cols-2">
        <Stat value={stats.awaiting} label="Awaiting Candidate" variant="gold" />
        <Stat value={stats.completed} label="Completed this month" variant="green" />
        <Stat value={stats.expired} label="Links Expired" variant="red" />
        <Stat value={stats.total} label="Total this quarter" variant="teal" />
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-5 max-lg:grid-cols-1">
        <section className="gov-card p-0 overflow-hidden" aria-labelledby="requests-heading">
          <h2 id="requests-heading" className="sr-only">Onboarding requests</h2>
          <div className="px-6 pt-4">
            <div role="tablist" aria-label="Filter requests" className="flex border-b-2 border-border gap-0 -mb-0.5">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  aria-controls="requests-tabpanel"
                  onClick={() => setTab(t.key)}
                  className={`bg-transparent border-0 cursor-pointer py-3 px-[18px]
                              text-[13px] font-semibold border-b-2 transition-colors -mb-[2px]
                              min-h-[44px]
                              focus-visible:outline-2 focus-visible:outline-offset-[-2px]
                              focus-visible:outline-gold-light ${
                    tab === t.key
                      ? 'text-navy border-navy'
                      : 'text-ink-mid border-transparent hover:text-ink'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div id="requests-tabpanel" role="tabpanel" className="overflow-x-auto">
            <table className="gov-table">
              <caption className="sr-only">
                Onboarding requests — {filtered.length} {tab === 'all' ? 'total' : tab}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Candidate</th>
                  <th scope="col">Position</th>
                  <th scope="col">Link Sent</th>
                  <th scope="col">Expiry</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="text-center text-ink-soft py-6">
                      Loading requests…
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-ink-soft py-6">
                      No requests in this tab.
                    </td>
                  </tr>
                )}
                {!loading && filtered.map((r) => (
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
                          to={`/candidate/auth?request_id=${r.id}&preview=1&token=${encodeURIComponent(r.magicToken || '')}`}
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
        </section>

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
