import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import CandidateChrome from '../../components/CandidateChrome';
import { Card } from '../../components/Card';
import { Field, TextInput } from '../../components/Field';
import Alert from '../../components/Alert';
import { parseMagicLinkToken, getRequest } from '../../lib/store';

export default function AuthLanding() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const token = search.get('token');

  // Parse the magic link token to seed the email field.
  const parsed = useMemo(() => (token ? parseMagicLinkToken(token) : null), [token]);

  // If expired, look up request to find HR contact info
  const req = parsed?.payload?.rid ? getRequest(parsed.payload.rid) : null;

  const [email, setEmail] = useState(parsed?.payload?.email || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If accessed with no token, show a demo landing so /candidate/auth alone still renders.
  const noToken = !token;
  const expired = parsed && !parsed.ok && parsed.reason === 'expired';
  const invalid = parsed && !parsed.ok && parsed.reason === 'invalid';

  const onVerify = (e) => {
    e.preventDefault();
    setError('');

    if (!parsed || !parsed.ok) {
      setError('This link is invalid or has expired.');
      return;
    }
    if (!req) {
      setError('Request not found.');
      return;
    }
    if (email.trim().toLowerCase() !== req.email.toLowerCase()) {
      setError('Email does not match the one this invitation was sent to.');
      return;
    }
    if (code.trim().toUpperCase() !== req.inviteCode.toUpperCase()) {
      setError('Invitation code is incorrect. Check your email.');
      return;
    }
    setSubmitting(true);
    // simulate token exchange
    sessionStorage.setItem('onboarding.activeRequest', req.id);
    setTimeout(() => {
      navigate(`/candidate/form?token=${encodeURIComponent(token)}`);
    }, 300);
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="gov-breadcrumb max-w-[960px] mx-auto">
        <span>Candidate-facing screen (external view)</span>
      </div>

      <CandidateChrome>
        {expired ? (
          <ExpiredView req={req} />
        ) : invalid || noToken ? (
          <InvalidView noToken={noToken} />
        ) : (
          <>
            <div className="text-center py-9 px-8 pb-7">
              <div
                className="w-16 h-16 bg-teal-light border-2 border-teal rounded-full
                           flex items-center justify-center text-[26px] mx-auto mb-[18px]"
              >
                ✉
              </div>
              <h2 className="font-serif text-[22px] font-bold text-navy-dark mb-2">
                Welcome — you've been invited to onboard
              </h2>
              <p className="text-sm text-ink-soft max-w-[420px] mx-auto">
                You are about to begin the identity onboarding process for your new
                role. This link will securely verify your identity and pre-fill
                your onboarding form.
              </p>
            </div>

            <div className="max-w-[480px] mx-auto">
              <Alert kind="info" className="mb-5">
                This link is uniquely tied to your email address and can only be
                used once. Do not share this link with anyone.
              </Alert>

              <form onSubmit={onVerify}>
                <Card className="mb-4">
                  <div className="gov-card-title text-base mb-3" style={{ paddingBottom: 0, borderBottom: 'none' }}>
                    Confirm your identity
                  </div>
                  <Field
                    label="Your Work Email Address"
                    hint="Confirm the email address this invitation was sent to."
                  >
                    <TextInput
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Invitation Code"
                    hint={req ? `Demo code (shown for prototype only): ${req.inviteCode}` : 'This code was included in your invitation email.'}
                  >
                    <TextInput
                      type="text"
                      placeholder="e.g. OB-2026-7X4K"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </Field>
                  {error && <Alert kind="error">{error}</Alert>}
                  <div className="mt-4">
                    <button
                      type="submit"
                      className="gov-btn gov-btn-primary w-full justify-center"
                      disabled={submitting}
                    >
                      {submitting ? 'Verifying…' : 'Verify & Continue'}
                    </button>
                  </div>
                </Card>
              </form>

              <div className="text-center text-[12px] text-ink-soft">
                Having trouble? Contact your HR coordinator or email{' '}
                <span className="text-teal">onboarding@agency.gov.au</span>
              </div>

              <StatutoryFooter />
            </div>
          </>
        )}
      </CandidateChrome>
    </div>
  );
}

function ExpiredView({ req }) {
  return (
    <div className="max-w-[480px] mx-auto py-4">
      <div className="text-center mb-6">
        <div
          className="w-16 h-16 bg-error-bg border-2 border-error rounded-full
                     flex items-center justify-center text-[26px] mx-auto mb-[18px]"
        >
          ⚠
        </div>
        <h2 className="font-serif text-[22px] font-bold text-error mb-2">
          This link has expired
        </h2>
        <p className="text-sm text-ink-soft">
          {req
            ? `The onboarding invitation sent to ${req.email} is no longer valid. Please contact your HR coordinator for a new link.`
            : 'The onboarding invitation is no longer valid. Please contact your HR coordinator for a new link.'}
        </p>
      </div>

      <Alert kind="error">
        <strong>Authentication failed.</strong> Your HR team has been notified
        automatically. You will receive a new invitation email once a link is reissued.
      </Alert>

      <div className="text-center text-[12px] text-ink-soft mt-6">
        Need help now? Contact{' '}
        <span className="text-teal">onboarding@agency.gov.au</span>
      </div>

      <div className="text-center mt-6">
        <Link to="/hr/dashboard" className="gov-btn gov-btn-secondary">
          Return to HR Dashboard (demo)
        </Link>
      </div>

      <StatutoryFooter />
    </div>
  );
}

function InvalidView({ noToken }) {
  return (
    <div className="max-w-[480px] mx-auto py-4">
      <div className="text-center mb-6">
        <div
          className="w-16 h-16 bg-warn-bg border-2 border-gold-light rounded-full
                     flex items-center justify-center text-[26px] mx-auto mb-[18px]"
        >
          ?
        </div>
        <h2 className="font-serif text-[22px] font-bold text-navy-dark mb-2">
          Link required
        </h2>
        <p className="text-sm text-ink-soft">
          {noToken
            ? 'To begin onboarding, open the secure link from your invitation email. This is a demo URL — you can generate one from the HR portal.'
            : 'This link is not valid. Please contact your HR coordinator for a new invitation.'}
        </p>
      </div>
      <div className="text-center">
        <Link to="/hr/new" className="gov-btn gov-btn-primary">
          Go to HR portal (demo)
        </Link>
      </div>
      <StatutoryFooter />
    </div>
  );
}

function StatutoryFooter() {
  return (
    <div className="mt-6 pt-4 border-t border-border text-center">
      <div className="text-[11px] text-ink-soft leading-[1.8]">
        This portal is operated by the Department of Human Services under the{' '}
        <em>Public Service Act 1999</em>.
        <br />
        Your information is protected under the <em>Privacy Act 1988</em>.
      </div>
    </div>
  );
}
