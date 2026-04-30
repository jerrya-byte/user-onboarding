import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import HRLayout from '../../components/HRLayout';
import { Card, Breadcrumb, PageHeader } from '../../components/Card';
import { Field, TextInput, SelectInput, TextArea } from '../../components/Field';
import Alert from '../../components/Alert';
import Tag from '../../components/Tag';
import { getRequest, listRequests, reissueRequest } from '../../lib/store';
import { hasSupabase } from '../../lib/supabase';
import { formatDate } from '../../lib/format';

const REASONS = [
  'Link expired — candidate did not action',
  'Authentication failure',
  'Email delivery issue',
  'Candidate requested new link',
  'Other',
];
const VALIDITIES = [
  { hours: 24, label: '24 hours' },
  { hours: 72, label: '72 hours (recommended)' },
  { hours: 168, label: '7 days' },
];

export default function ReissueLink() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validity, setValidity] = useState(72);
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState('');
  const [updatedEmail, setUpdatedEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let resolved = null;
      if (id) {
        resolved = await getRequest(id);
      } else {
        const all = await listRequests();
        resolved = all.find((r) => r.status === 'expired') || null;
      }
      if (!cancelled) {
        setReq(resolved);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <HRLayout pageTitle="Reissue Magic Link">
        <Breadcrumb
          items={[
            { label: 'Home', href: '#' },
            { label: 'Dashboard', href: '#' },
            { label: 'Reissue Magic Link' },
          ]}
        />
        <PageHeader title="Reissue Magic Link" subtitle="Loading…" />
      </HRLayout>
    );
  }

  if (!req) {
    return (
      <HRLayout pageTitle="Reissue Magic Link">
        <Breadcrumb
          items={[
            { label: 'Home', href: '#' },
            { label: 'Dashboard', href: '#' },
            { label: 'Reissue Magic Link' },
          ]}
        />
        <PageHeader
          title="Reissue Magic Link"
          subtitle="No expired requests to reissue right now."
        />
        <Alert kind="info">
          There are no expired links awaiting reissue. Head back to the{' '}
          <Link to="/hr/dashboard" className="underline">
            dashboard
          </Link>
          .
        </Alert>
      </HRLayout>
    );
  }

  const onReissue = async () => {
    setSubmitting(true);
    setError('');
    try {
      const updated = await reissueRequest(req.id, {
        validityHours: validity,
        reason,
        note,
        updatedEmail: updatedEmail || undefined,
      });
      const params = new URLSearchParams({ justCreated: updated.id });
      if (hasSupabase) params.set('emailSent', '1');
      navigate(`/hr/dashboard?${params.toString()}`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to reissue link.');
      setSubmitting(false);
    }
  };

  return (
    <HRLayout pageTitle="Reissue Magic Link">
      <Breadcrumb
        items={[
          { label: 'Home', href: '#' },
          { label: 'Dashboard', href: '#' },
          { label: 'Reissue Magic Link' },
        ]}
      />
      <PageHeader
        title="Reissue Magic Link"
        subtitle="The candidate's previous magic link has expired. Review the details below and issue a new link."
      />

      {error && <Alert kind="error">{error}</Alert>}

      <Alert kind="error">
        <strong>Magic link expired</strong> — The link sent to {req.givenName}{' '}
        {req.familyName} on {formatDate(req.linkSentAt)} expired on{' '}
        {formatDate(req.expiresAt)} without being used. A new link must be issued
        to continue the onboarding process.
      </Alert>

      <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
        <Card title="Candidate Record" subtitle="Verify these details are still correct before reissuing.">
          <div className="gov-cand-summary">
            <h3>Candidate Information</h3>
            <div className="gov-summary-row"><dt>Full Name</dt><dd>{req.givenName} {req.familyName}</dd></div>
            <div className="gov-summary-row"><dt>Email Address</dt><dd>{req.email}</dd></div>
            <div className="gov-summary-row"><dt>Position</dt><dd>{req.position}</dd></div>
            <div className="gov-summary-row"><dt>Level</dt><dd>{req.level}</dd></div>
            <div className="gov-summary-row"><dt>Division</dt><dd>{req.division}</dd></div>
            <div className="gov-summary-row"><dt>Commencement</dt><dd>{formatDate(req.commencement)}</dd></div>
          </div>
          <div className="gov-cand-summary">
            <h3>Manager Information</h3>
            <div className="gov-summary-row"><dt>Manager</dt><dd>{req.managerName}</dd></div>
            <div className="gov-summary-row"><dt>Manager Email</dt><dd>{req.managerEmail}</dd></div>
            <div className="gov-summary-row"><dt>Manager Position</dt><dd>{req.managerPosition || '—'}</dd></div>
            <div className="gov-summary-row"><dt>Location</dt><dd>{req.location}</dd></div>
          </div>
          <Field
            label="Update Email Address"
            hint="Only update if the candidate's email has changed."
          >
            <TextInput
              type="email"
              placeholder={req.email}
              value={updatedEmail}
              onChange={(e) => setUpdatedEmail(e.target.value)}
            />
          </Field>
        </Card>

        <div>
          <Card title="Reissue Settings" subtitle="Configure the new magic link before sending.">
            <Field label="Link Validity Period">
              <SelectInput
                value={validity}
                onChange={(e) => setValidity(Number(e.target.value))}
              >
                {VALIDITIES.map((v) => (
                  <option key={v.hours} value={v.hours}>
                    {v.label}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Reason for Reissue">
              <SelectInput value={reason} onChange={(e) => setReason(e.target.value)}>
                {REASONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Internal Note (optional)">
              <TextArea
                style={{ height: 80 }}
                placeholder="e.g. Candidate was on leave during the original link window."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Field>
          </Card>

          <Card accent="#8B1A1A">
            <div className="text-[13px] font-bold text-error mb-2">
              Previous Link History
            </div>
            <table className="gov-table text-[12px]">
              <thead>
                <tr>
                  <th>Issued</th>
                  <th>Expiry</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{formatDate(req.linkSentAt)}</td>
                  <td>{formatDate(req.expiresAt)}</td>
                  <td><Tag status="expired" /></td>
                </tr>
                {(req.reissueHistory || []).map((h, i) => (
                  <tr key={i}>
                    <td>{formatDate(h.issued)}</td>
                    <td>{formatDate(h.expiry)}</td>
                    <td>{h.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="flex gap-3 mt-6">
            <button className="gov-btn gov-btn-danger" onClick={onReissue} disabled={submitting}>
              {submitting ? 'Sending…' : 'Reissue Magic Link'}
            </button>
            <button
              className="gov-btn gov-btn-secondary"
              onClick={() => navigate('/hr/dashboard')}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </HRLayout>
  );
}
