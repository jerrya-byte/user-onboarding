import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CandidateChrome from '../../components/CandidateChrome';
import { Card } from '../../components/Card';
import Alert from '../../components/Alert';
import { getRequest } from '../../lib/store';
import { formatDate, formatDateTime } from '../../lib/format';

export default function Confirmation() {
  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const id = sessionStorage.getItem('onboarding.activeRequest');
      const resolved = id ? await getRequest(id) : null;
      if (!cancelled) {
        setReq(resolved);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const submission = req?.submission;

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="gov-breadcrumb max-w-[960px] mx-auto">
        <span>Candidate-facing screen (external view)</span>
      </div>
      <CandidateChrome>
        <div className="text-center py-10 px-8 pb-8">
          <div
            className="w-[72px] h-[72px] bg-success-bg border-2 border-success rounded-full
                       flex items-center justify-center text-[30px] mx-auto mb-5"
          >
            ✓
          </div>
          <h2 className="font-serif text-2xl font-bold text-success mb-2">
            Onboarding form submitted
          </h2>
          <p className="text-sm text-ink-soft max-w-[440px] mx-auto mb-6">
            {req
              ? `Thank you, ${req.givenName}. Your onboarding information has been received and your identity record has been securely created. Your HR coordinator has been notified.`
              : loading
              ? 'Loading confirmation…'
              : 'Your onboarding information has been received.'}
          </p>
        </div>

        <div className="max-w-[560px] mx-auto">
          {submission && (
            <Alert kind="success" className="mb-6">
              <strong>Reference number: {submission.reference}</strong> — Please
              keep this reference number for your records. Your HR coordinator
              may use it when following up.
            </Alert>
          )}

          {req && (
            <Card
              title="Submission summary"
              subtitle="The following information has been recorded."
              className="mb-4"
            >
              <div className="gov-cand-summary mb-0">
                <div className="gov-summary-row">
                  <dt>Name</dt>
                  <dd>{req.givenName} {req.familyName}</dd>
                </div>
                <div className="gov-summary-row">
                  <dt>Position</dt>
                  <dd>{req.position} — {req.level}</dd>
                </div>
                <div className="gov-summary-row">
                  <dt>Division</dt>
                  <dd>{req.division}</dd>
                </div>
                <div className="gov-summary-row">
                  <dt>Commencement</dt>
                  <dd>{formatDate(req.commencement)}</dd>
                </div>
                <div className="gov-summary-row">
                  <dt>Reporting Manager</dt>
                  <dd>{req.managerName}</dd>
                </div>
                <div className="gov-summary-row">
                  <dt>Work Location</dt>
                  <dd>{req.location}</dd>
                </div>
                {submission?.submittedAt && (
                  <div className="gov-summary-row">
                    <dt>Submitted</dt>
                    <dd>{formatDateTime(submission.submittedAt)}</dd>
                  </div>
                )}
              </div>
            </Card>
          )}

          <div className="text-left max-w-[500px] mx-auto">
            <h3 className="text-[13px] font-bold text-ink-mid uppercase tracking-[0.5px] mb-3">
              What happens next
            </h3>
            {[
              "Your identity record has been created in the department's IAM system.",
              req?.commencement
                ? <>Your accounts and system access will be provisioned before your commencement date of <strong>{formatDate(req.commencement)}</strong>.</>
                : 'Your accounts and system access will be provisioned before your commencement date.',
              req?.managerName
                ? <>Your manager, <strong>{req.managerName}</strong>, will contact you with your first-day instructions.</>
                : 'Your manager will contact you with your first-day instructions.',
              submission?.reference
                ? <>If you have any questions, contact <span className="text-teal">onboarding@agency.gov.au</span> quoting reference <strong>{submission.reference}</strong>.</>
                : <>If you have any questions, contact <span className="text-teal">onboarding@agency.gov.au</span>.</>,
            ].map((t, i) => (
              <div key={i} className="gov-step-item">
                <div className="gov-step-num">{i + 1}</div>
                <div className="gov-step-text">{t}</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-7 pt-5 border-t border-border">
            <div className="text-[11px] text-ink-soft leading-[1.8]">
              This portal is operated by the Department of Human Services under the{' '}
              <em>Public Service Act 1999</em>.
              <br />
              Your information is protected under the <em>Privacy Act 1988</em>.
            </div>
            <div className="mt-4">
              <Link to="/hr/dashboard" className="gov-btn gov-btn-secondary gov-btn-sm">
                Back to HR Dashboard (demo)
              </Link>
            </div>
          </div>
        </div>
      </CandidateChrome>
    </div>
  );
}
