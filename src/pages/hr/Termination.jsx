import { useEffect, useMemo, useState } from 'react';
import HRLayout from '../../components/HRLayout';
import { Breadcrumb, PageHeader } from '../../components/Card';
import Alert from '../../components/Alert';
import { listIdentityRecords, setTerminationDate } from '../../lib/store';
import { hasSupabase } from '../../lib/supabase';
import { formatDate } from '../../lib/format';

// Tomorrow as a YYYY-MM-DD string — used as the `min` attribute on the
// <input type="date"> so the browser also nudges HR away from past dates.
function tomorrowYMD() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function Termination() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  // Per-row local state: the date that's currently in the input box,
  // and a per-row save state (saving / error / success).
  const [drafts, setDrafts] = useState({}); // { [id]: 'YYYY-MM-DD' }
  const [rowState, setRowState] = useState({}); // { [id]: { saving, error, savedAt } }

  const minDate = tomorrowYMD();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listIdentityRecords();
        if (!cancelled) {
          setRecords(list);
          // Pre-fill drafts with whatever termination date is already set,
          // so HR sees the current value when they search and can adjust.
          const initialDrafts = {};
          list.forEach((r) => {
            if (r.terminationDate) initialDrafts[r.id] = r.terminationDate;
          });
          setDrafts(initialDrafts);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setLoadError(err.message || 'Could not load identities.');
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Search by name or email only — Jerry's spec was explicit on this.
  // We match across given name, family name, the full "given family"
  // string, and the email — case-insensitive.
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return records.filter((r) => {
      const full = `${r.givenName || ''} ${r.familyName || ''}`.trim().toLowerCase();
      return (
        full.includes(q) ||
        (r.givenName || '').toLowerCase().includes(q) ||
        (r.familyName || '').toLowerCase().includes(q) ||
        (r.preferredName || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q)
      );
    });
  }, [query, records]);

  const onChangeDraft = (id, value) => {
    setDrafts((d) => ({ ...d, [id]: value }));
    // Clear any prior error/success state for this row when HR edits the date.
    setRowState((s) => ({ ...s, [id]: { saving: false, error: '', savedAt: null } }));
  };

  const onSave = async (rec) => {
    const date = drafts[rec.id];
    if (!date) {
      setRowState((s) => ({
        ...s,
        [rec.id]: { saving: false, error: 'Pick a date first.', savedAt: null },
      }));
      return;
    }
    // Client-side check (store.setTerminationDate also re-validates).
    if (date < minDate) {
      setRowState((s) => ({
        ...s,
        [rec.id]: {
          saving: false,
          error: 'Termination date must be in the future.',
          savedAt: null,
        },
      }));
      return;
    }
    setRowState((s) => ({
      ...s,
      [rec.id]: { saving: true, error: '', savedAt: null },
    }));
    try {
      await setTerminationDate(rec.id, date);
      // Update the local copy so the "current" line reflects the new value.
      setRecords((rs) =>
        rs.map((r) => (r.id === rec.id ? { ...r, terminationDate: date } : r)),
      );
      setRowState((s) => ({
        ...s,
        [rec.id]: { saving: false, error: '', savedAt: new Date().toISOString() },
      }));
    } catch (err) {
      setRowState((s) => ({
        ...s,
        [rec.id]: {
          saving: false,
          error: err.message || 'Could not save termination date.',
          savedAt: null,
        },
      }));
    }
  };

  const onClear = async (rec) => {
    setRowState((s) => ({
      ...s,
      [rec.id]: { saving: true, error: '', savedAt: null },
    }));
    try {
      await setTerminationDate(rec.id, null);
      setRecords((rs) =>
        rs.map((r) => (r.id === rec.id ? { ...r, terminationDate: null } : r)),
      );
      setDrafts((d) => {
        const copy = { ...d };
        delete copy[rec.id];
        return copy;
      });
      setRowState((s) => ({
        ...s,
        [rec.id]: { saving: false, error: '', savedAt: new Date().toISOString() },
      }));
    } catch (err) {
      setRowState((s) => ({
        ...s,
        [rec.id]: {
          saving: false,
          error: err.message || 'Could not clear termination date.',
          savedAt: null,
        },
      }));
    }
  };

  return (
    <HRLayout>
      <Breadcrumb
        items={[{ label: 'Home', href: '#' }, { label: 'Set Termination Date' }]}
      />
      <PageHeader
        title="Set Termination Date"
        subtitle="Find an employee by name or email, then set the date their identity should be terminated. Termination dates must be in the future."
      />

      {!hasSupabase && (
        <Alert kind="warn">
          Running in <strong>prototype mode</strong> (localStorage only). Termination
          dates will save to your local browser session only.
        </Alert>
      )}
      {loadError && <Alert kind="error">Could not load identities: {loadError}</Alert>}

      <div className="gov-card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3 flex-wrap">
          <SearchIcon />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="flex-1 min-w-[260px] bg-transparent border-0 outline-none text-[14px] placeholder:text-ink-soft"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-[11px] uppercase tracking-[0.4px] text-ink-soft hover:text-ink"
            >
              Clear
            </button>
          )}
          <div className="text-[12px] text-ink-soft">
            {query.trim() === ''
              ? `${records.length} identities indexed`
              : `${matches.length} match${matches.length === 1 ? '' : 'es'}`}
          </div>
        </div>

        <div>
          {loading && (
            <div className="px-6 py-8 text-center text-ink-soft">Loading identities…</div>
          )}

          {!loading && query.trim() === '' && (
            <div className="px-6 py-10 text-center text-ink-soft">
              Start typing a name or email above to find an employee.
            </div>
          )}

          {!loading && query.trim() !== '' && matches.length === 0 && (
            <div className="px-6 py-10 text-center text-ink-soft">
              No employees match <strong className="text-ink">“{query}”</strong>.
            </div>
          )}

          {!loading && matches.map((rec) => {
            const draft = drafts[rec.id] || '';
            const state = rowState[rec.id] || {};
            return (
              <div
                key={rec.id}
                className="px-6 py-5 border-b border-border last:border-b-0 grid grid-cols-[1fr_auto] gap-4 items-start max-md:grid-cols-1"
              >
                <div>
                  <div className="font-semibold text-[15px] text-ink">
                    {rec.givenName} {rec.familyName}
                    {rec.preferredName && rec.preferredName !== rec.givenName && (
                      <span className="text-ink-soft font-normal"> ({rec.preferredName})</span>
                    )}
                  </div>
                  <div className="text-[12px] text-ink-soft mt-0.5">
                    {rec.email}
                    {rec.position && <> · {rec.position}</>}
                    {rec.level && <> · {rec.level}</>}
                    {rec.division && <> · {rec.division}</>}
                  </div>
                  <div className="text-[12px] text-ink-soft mt-1">
                    Current termination date:{' '}
                    {rec.terminationDate ? (
                      <strong className="text-ink">{formatDate(rec.terminationDate)}</strong>
                    ) : (
                      <span className="italic">none set</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 max-md:items-stretch">
                  <div className="flex gap-2 items-center max-md:flex-wrap">
                    <input
                      type="date"
                      value={draft}
                      min={minDate}
                      onChange={(e) => onChangeDraft(rec.id, e.target.value)}
                      className="border border-border rounded-sm px-3 py-2 text-[13px]
                                 focus:outline-none focus:border-navy"
                    />
                    <button
                      type="button"
                      onClick={() => onSave(rec)}
                      disabled={state.saving}
                      className="gov-btn gov-btn-primary gov-btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {state.saving ? 'Saving…' : 'Set Termination Date'}
                    </button>
                    {rec.terminationDate && (
                      <button
                        type="button"
                        onClick={() => onClear(rec)}
                        disabled={state.saving}
                        title="Remove the termination date for this employee"
                        className="gov-btn gov-btn-secondary gov-btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {state.error && (
                    <div className="text-[12px] text-red-600 max-w-[320px] text-right max-md:text-left">
                      {state.error}
                    </div>
                  )}
                  {state.savedAt && !state.error && (
                    <div className="text-[12px] text-green-700 max-md:text-left">
                      Saved.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </HRLayout>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-ink-soft"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
