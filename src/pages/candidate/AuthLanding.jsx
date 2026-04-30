import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import CandidateChrome from '../../components/CandidateChrome';
import { Card } from '../../components/Card';
import { Field, TextInput } from '../../components/Field';
import Alert from '../../components/Alert';
import { parseMagicLinkToken, getRequest, getRequestByEmail } from '../../lib/store';
import { hasSupabase, supabase } from '../../lib/supabase';

export default function AuthLanding() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const token = search.get('token');
  const requestIdParam = search.get('request_id');
  const isPreview = search.get('preview') === '1';

  // ─── Path 1: Supabase real magic-link flow ──────────────
  // Used when Supabase is configured. The candidate clicks the magic
  // link in their email and is redirected to:
  //   /candidate/auth?request_id=UUID#access_token=...&type=magiclink&...
  // The Supabase client auto-parses the URL hash and establishes a
  // session. We listen for it via onAuthStateChange.
  const [supaSession, setSupaSession] = useState(null);
  // When Supabase isn't configured, we're "checked" immediately.
  const [supaChecked, setSupaChecked] = useState(!hasSupabase);
  // Supabase puts auth errors in the URL hash too (e.g.
  // #error=access_denied&error_description=...). Extract at mount.
  const [supaError] = useState(() => {
    if (typeof window === 'undefined') return '';
    const hash = window.location.hash || '';
    const errMatch = hash.match(/error_description=([^&]+)/);
    return errMatch ? decodeURIComponent(errMatch[1].replace(/\+/g, ' ')) : '';
  });
  const [req, setReq] = useState(null);

  useEffect(() => {
    if (!hasSupabase) return;

    let unsub = null;

    // 1. Read current session if any (also picks up freshly parsed
    //    sessions from the URL hash). setState here is inside the
    //    async callback — not synchronous in the effect body.
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) setSupaSession(data.session);
      setSupaChecked(true);
    });

    // 2. Subscribe to auth events so we react when the URL hash is
    //    converted into a session a tick after mount.
    const sub = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
        setSupaSession(session);
        setSupaChecked(true);
      }
    });
    unsub = sub.data.subscription;

    return () => {
      if (unsub) unsub.unsubscribe();
    };
  }, []);

  // Resolve the matching onboarding request once we have either a
  // request_id from the URL or an authenticated email from Supabase.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let resolved = null;
      if (requestIdParam) {
        resolved = await getRequest(requestIdParam);
      } else if (supaSession?.user?.email) {
        resolved = await getRequestByEmail(supaSession.user.email);
      } else if (token) {
        const parsed = parseMagicLinkToken(token);
        if (parsed.ok) resolved = await getRequest(parsed.payload.rid);
      }
      if (!cancelled) setReq(resolved);
    })();
    return () => {
      cancelled = true;
    };
  }, [requestIdParam, supaSession, token]);

  // ─── Path 2: Mock-mode token flow (fallback when no Supabase) ───
  const parsed = useMemo(() => (token ? parseMagicLinkToken(token) : null), [token]);
  const expired = parsed && !parsed.ok && parsed.reason === 'expired';
  const invalid = parsed && !parsed.ok && parsed.reason === 'invalid';
  const noToken = !token && !requestIdParam;

  // ─── Render branches ────────────────────────────────────

  // Supabase is checking (and the page has a request_id or we have nothing
  // to fall back to) — show a brief loading state instead of flashing
  // InvalidView.
  if (hasSupabase && !supaChecked && !token) {
    return (
      <div className="min-h-screen py-10 px-4">
        <div className="gov-breadcrumb max-w-[960px] mx-auto">
          <span>Candidate-facing screen (external view)</span>
        </div>
        <CandidateChrome>
          <div className="text-center py-10 px-8">
            <p className="text-sm text-ink-soft">Verifying your magic link…</p>
          </div>
        </CandidateChrome>
      </div>
    );
  }

  // Supabase mode + user has a real session → "verified" view + continue button
  if (hasSupabase && supaSession && !isPreview) {
    return (
      <Verified
        email={supaSession.user.email}
        req={req}
        onContinue={() => {
          if (req) {
            sessionStorage.setItem('onboarding.activeRequest', req.id);
            navigate(`/candidate/form?request_id=${req.id}`);
          } else {
            navigate('/candidate/form');
          }
        }}
      />
    );
  }

  // Supabase mode but session check failed (expired link, error in hash, etc.)
  if (hasSupabase && supaChecked && !supaSession && supaError) {
    return (
      <ExpiredView req={req} message={supaError} />
    );
  }

  // Supabase mode + HR clicked "Preview Link" from dashboard
  if (hasSupabase && isPreview && req) {
    return (
      <Verified
        email={req.email}
        req={req}
        previewMode
        onContinue={() => {
          sessionStorage.setItem('onboarding.activeRequest', req.id);
          navigate(`/candidate/form?request_id=${req.id}&preview=1`);
        }}
      />
    );
  }

  // Supabase mode + the candidate hit /candidate/auth?request_id=…
  // but hasn't actually clicked their magic link yet (no session, no
  // hash, no error). Show "check your email".
  if (hasSupabase && supaChecked && !supaSession && requestIdParam) {
    return (
      <CheckYourEmailView req={req} />
    );
  }

  // Mock-mode token flow (existing prototype behaviour)
  if (!hasSupabase || token) {
    return <MockAuthFlow
      req={req}
      noToken={noToken}
      expired={expired}
      invalid={invalid}
      parsed={parsed}
      token={token}
    />;
  }

  // Default: nothing in the URL, show the demo landing
  return (
    <div className="min-h-screen py-10 px-4">
      <div className="gov-breadcrumb max-w-[960px] mx-auto">
        <span>Candidate-facing screen (external view)</span>
      </div>
      <CandidateChrome>
        <InvalidView noToken={true} />
      </CandidateChrome>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Sub-views
// ────────────────────────────────────────────────────────────

function Verified({ email, req, onContinue, previewMode }) {
  return (
    <div className="min-h-screen py-10 px-4">
      <div className="gov-breadcrumb max-w-[960px] mx-auto">
        <span>Candidate-facing screen (external view)</span>
      </div>
      <CandidateChrome>
        <div className="text-center py-9 px-8 pb-7">
          <div
            className="w-16 h-16 bg-success-bg border-2 border-success rounded-full
                       flex items-center justify-center text-[26px] mx-auto mb-[18px]"
          >
            ✓
          </div>
          <h2 className="font-serif text-[22px] font-bold text-success mb-2">
            Identity verified
          </h2>
          <p className="text-sm text-ink-soft max-w-[440px] mx-auto">
            {previewMode ? (
              <>This is a <strong>preview</strong> of the candidate experience for {email}. Authentication has been bypassed for HR review.</>
            ) : (
              <>Welcome, {email}. Your magic link has been verified by Supabase Auth. Click below to begin your onboarding form.</>
            )}
          </p>
        </div>

        <div className="max-w-[480px] mx-auto">
          {req && (
            <Alert kind="info" className="mb-5">
              You've been invited to onboard as <strong>{req.position}</strong> in <strong>{req.division}</strong>, commencing {req.commencement}.
            </Alert>
          )}
          <button
            type="button"
            className="gov-btn gov-btn-primary w-full justify-center"
            onClick={onContinue}
          >
            Begin Onboarding Form →
          </button>
          <StatutoryFooter />
        </div>
      </CandidateChrome>
    </div>
  );
}

function CheckYourEmailView({ req }) {
  return (
    <div className="min-h-screen py-10 px-4">
      <div className="gov-breadcrumb max-w-[960px] mx-auto">
        <span>Candidate-facing screen (external view)</span>
      </div>
      <CandidateChrome>
        <div className="text-center py-9 px-8 pb-7">
          <div
            className="w-16 h-16 bg-teal-light border-2 border-teal rounded-full
                       flex items-center justify-center text-[26px] mx-auto mb-[18px]"
          >
            ✉
          </div>
          <h2 className="font-serif text-[22px] font-bold text-navy-dark mb-2">
            Check your email
          </h2>
          <p className="text-sm text-ink-soft max-w-[440px] mx-auto">
            {req
              ? <>An onboarding magic link has been sent to <strong>{req.email}</strong>. Open the email and click the link to verify your identity and begin onboarding.</>
              : 'An onboarding magic link has been sent to your email address. Open it and click the link to begin.'}
          </p>
        </div>
        <div className="max-w-[480px] mx-auto">
          <Alert kind="info" className="mb-5">
            Magic-link emails are sent from <code>no-reply@mail.supabase.io</code>. Check your spam folder if you don't see it within a couple of minutes.
          </Alert>
          <StatutoryFooter />
        </div>
      </CandidateChrome>
    </div>
  );
}

function MockAuthFlow({ req, noToken, expired, invalid, parsed, token }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState(parsed?.payload?.email || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

function ExpiredView({ req, message }) {
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
          {message
            ? message
            : req
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
        This portal is operated by the Department of Superheroes under the{' '}
        <em>Public Service Act 1999</em>.
        <br />
        Your information is protected under the <em>Privacy Act 1988</em>.
      </div>
    </div>
  );
}
