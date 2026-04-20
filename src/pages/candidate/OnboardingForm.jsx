import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import CandidateChrome from '../../components/CandidateChrome';
import { Card, SectionSep } from '../../components/Card';
import { Field, TextInput, SelectInput } from '../../components/Field';
import Alert from '../../components/Alert';
import ProgressSteps from '../../components/ProgressSteps';
import { getRequest, parseMagicLinkToken, submitCandidateForm } from '../../lib/store';

const RELATIONSHIPS = ['Spouse / Partner', 'Parent', 'Sibling', 'Friend', 'Other'];

export default function OnboardingForm() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const token = search.get('token');

  // Resolve the request. Prefer token; fall back to sessionStorage (refresh survival);
  // fall back to most recent pending request for preview navigation from chrome.
  const req = useMemo(() => {
    if (token) {
      const parsed = parseMagicLinkToken(token);
      if (parsed.ok) return getRequest(parsed.payload.rid);
    }
    const sid = sessionStorage.getItem('onboarding.activeRequest');
    if (sid) return getRequest(sid);
    return null;
  }, [token]);

  const [form, setForm] = useState(() => ({
    givenName: req?.givenName || '',
    familyName: req?.familyName || '',
    preferredName: '',
    dob: '',
    position: req?.position || '',
    level: req?.level || '',
    division: req?.division || '',
    commencement: req?.commencement || '',
    managerName: req?.managerName || '',
    location: req?.location || '',
    mobile: '',
    emergencyName: '',
    emergencyPhone: '',
    relationship: '',
    tfn: '',
    bank: '',
  }));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const onBlur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));
  const errVisible = (k) => touched[k] && errors[k];

  const validate = () => {
    const e = {};
    if (!form.dob) e.dob = 'Required';
    if (!form.mobile.trim()) e.mobile = 'Required';
    else if (!/^(\+?\d[\d\s-]{6,})$/.test(form.mobile))
      e.mobile = 'Enter a valid phone number';
    if (!form.emergencyName.trim()) e.emergencyName = 'Required';
    if (!form.emergencyPhone.trim()) e.emergencyPhone = 'Required';
    else if (!/^(\+?\d[\d\s-]{6,})$/.test(form.emergencyPhone))
      e.emergencyPhone = 'Enter a valid phone number';
    if (!form.tfn.trim()) e.tfn = 'Required';
    else if (!/^\d{3}\s?\d{3}\s?\d{3}$/.test(form.tfn.replace(/\s/g, '').replace(/(.{3})/g, '$1 ').trim()))
      e.tfn = 'TFN must be 9 digits';
    if (!form.bank.trim()) e.bank = 'Required';
    return e;
  };

  if (!req) {
    return (
      <div className="min-h-screen py-10 px-4">
        <div className="gov-breadcrumb max-w-[960px] mx-auto">
          <span>Candidate-facing screen (external view)</span>
        </div>
        <CandidateChrome>
          <Alert kind="warn">
            No active onboarding session. Please open your magic link from the
            invitation email, or start a new request from the HR portal.
          </Alert>
          <div className="text-center mt-4">
            <Link to="/hr/new" className="gov-btn gov-btn-primary">
              Go to HR portal (demo)
            </Link>
          </div>
        </CandidateChrome>
      </div>
    );
  }

  const onSubmit = (e) => {
    e.preventDefault();
    const es = validate();
    setErrors(es);
    setTouched(
      [
        'dob','mobile','emergencyName','emergencyPhone','tfn','bank',
      ].reduce((acc, k) => ({ ...acc, [k]: true }), {})
    );
    if (Object.keys(es).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    submitCandidateForm(req.id, form);
    sessionStorage.setItem('onboarding.activeRequest', req.id);
    navigate(`/candidate/done`);
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="gov-breadcrumb max-w-[960px] mx-auto">
        <span>Candidate-facing screen (external view)</span>
      </div>

      <CandidateChrome>
        <Alert kind="success" className="mb-5">
          Identity verified successfully. Some fields below have been pre-filled
          from your employment record. Please review all information before submitting.
        </Alert>

        <ProgressSteps
          steps={['Verify', 'Your Details', 'Review', 'Submit']}
          current={1}
        />

        <form onSubmit={onSubmit}>
          <Card
            title="Personal Information"
            subtitle="Pre-filled fields are marked. Please verify all information is correct and complete any blank fields."
          >
            <div className="gov-field-row">
              <Field label="Given Name" required prefilled>
                <TextInput prefilled value={form.givenName} readOnly />
              </Field>
              <Field label="Family Name" required prefilled>
                <TextInput prefilled value={form.familyName} readOnly />
              </Field>
            </div>
            <div className="gov-field-row">
              <Field label="Preferred Name">
                <TextInput
                  placeholder="If different from given name"
                  value={form.preferredName}
                  onChange={set('preferredName')}
                />
              </Field>
              <Field
                label="Date of Birth"
                required
                error={errVisible('dob') ? errors.dob : null}
              >
                <TextInput
                  type="date"
                  value={form.dob}
                  onChange={set('dob')}
                  onBlur={onBlur('dob')}
                  error={errVisible('dob')}
                />
              </Field>
            </div>

            <SectionSep>Employment Details</SectionSep>

            <div className="gov-field-row">
              <Field label="Position Title" prefilled>
                <TextInput prefilled value={form.position} readOnly />
              </Field>
              <Field label="Employment Level" prefilled>
                <TextInput prefilled value={form.level} readOnly />
              </Field>
            </div>
            <div className="gov-field-row">
              <Field label="Division / Business Unit" prefilled>
                <TextInput prefilled value={form.division} readOnly />
              </Field>
              <Field label="Commencement Date" prefilled>
                <TextInput type="date" prefilled value={form.commencement} readOnly />
              </Field>
            </div>

            <SectionSep>Manager & Location</SectionSep>

            <div className="gov-field-row">
              <Field label="Reporting Manager" prefilled>
                <TextInput prefilled value={form.managerName} readOnly />
              </Field>
              <Field label="Work Location" prefilled>
                <TextInput prefilled value={form.location} readOnly />
              </Field>
            </div>

            <SectionSep>Additional Information (Candidate to complete)</SectionSep>

            <div className="gov-field-row">
              <Field label="Personal Mobile Number" required error={errVisible('mobile') ? errors.mobile : null}>
                <TextInput
                  type="tel"
                  placeholder="04XX XXX XXX"
                  value={form.mobile}
                  onChange={set('mobile')}
                  onBlur={onBlur('mobile')}
                  error={errVisible('mobile')}
                />
              </Field>
              <Field label="Emergency Contact Name" required error={errVisible('emergencyName') ? errors.emergencyName : null}>
                <TextInput
                  placeholder="Full name"
                  value={form.emergencyName}
                  onChange={set('emergencyName')}
                  onBlur={onBlur('emergencyName')}
                  error={errVisible('emergencyName')}
                />
              </Field>
            </div>
            <div className="gov-field-row">
              <Field label="Emergency Contact Phone" required error={errVisible('emergencyPhone') ? errors.emergencyPhone : null}>
                <TextInput
                  type="tel"
                  placeholder="04XX XXX XXX"
                  value={form.emergencyPhone}
                  onChange={set('emergencyPhone')}
                  onBlur={onBlur('emergencyPhone')}
                  error={errVisible('emergencyPhone')}
                />
              </Field>
              <Field label="Relationship">
                <SelectInput value={form.relationship} onChange={set('relationship')}>
                  <option value="">— Select —</option>
                  {RELATIONSHIPS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </SelectInput>
              </Field>
            </div>
            <Field
              label="Tax File Number (TFN)"
              required
              hint="Your TFN is protected under the Privacy Act 1988 and will only be used for payroll purposes."
              error={errVisible('tfn') ? errors.tfn : null}
            >
              <TextInput
                placeholder="XXX XXX XXX"
                value={form.tfn}
                onChange={set('tfn')}
                onBlur={onBlur('tfn')}
                error={errVisible('tfn')}
              />
            </Field>
            <Field
              label="Bank Account for Salary Payment"
              required
              error={errVisible('bank') ? errors.bank : null}
            >
              <TextInput
                placeholder="BSB — Account Number"
                value={form.bank}
                onChange={set('bank')}
                onBlur={onBlur('bank')}
                error={errVisible('bank')}
              />
            </Field>
          </Card>

          <div className="flex gap-3 mt-6">
            <button type="submit" className="gov-btn gov-btn-primary">
              Continue to Review
            </button>
            <button
              type="button"
              className="gov-btn gov-btn-secondary"
              onClick={() => alert('Saved (demo — in-memory only).')}
            >
              Save and return later
            </button>
          </div>
        </form>
      </CandidateChrome>
    </div>
  );
}
