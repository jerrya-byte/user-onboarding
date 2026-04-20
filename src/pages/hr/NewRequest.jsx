import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HRLayout from '../../components/HRLayout';
import { Card, Breadcrumb, PageHeader } from '../../components/Card';
import { Field, TextInput, SelectInput } from '../../components/Field';
import Alert from '../../components/Alert';
import { createRequest } from '../../lib/store';

const LEVELS = ['APS 3', 'APS 4', 'APS 5', 'APS 6', 'EL 1', 'EL 2', 'SES Band 1'];
const LOCATIONS = ['Canberra ACT', 'Sydney NSW', 'Melbourne VIC', 'Brisbane QLD', 'Perth WA'];

const EMPTY = {
  givenName: '',
  familyName: '',
  email: '',
  position: '',
  level: 'APS 6',
  division: '',
  commencement: '',
  managerName: '',
  managerEmail: '',
  managerPosition: '',
  location: 'Canberra ACT',
};

export default function NewRequest() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };
  const onBlur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  const validate = () => {
    const e = {};
    if (!form.givenName.trim()) e.givenName = 'Required';
    if (!form.familyName.trim()) e.familyName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Not a valid email';
    if (!form.position.trim()) e.position = 'Required';
    if (!form.division.trim()) e.division = 'Required';
    if (!form.commencement) e.commencement = 'Required';
    if (!form.managerName.trim()) e.managerName = 'Required';
    if (!form.managerEmail.trim()) e.managerEmail = 'Required';
    else if (!/^\S+@\S+\.\S+$/.test(form.managerEmail))
      e.managerEmail = 'Not a valid email';
    return e;
  };

  const onSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    // mark all touched for visual feedback
    setTouched(
      Object.keys(EMPTY).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    );
    if (Object.keys(e).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const req = createRequest(form);
    navigate(`/hr/dashboard?justCreated=${req.id}`);
  };

  const errVisible = (k) => touched[k] && errors[k];

  return (
    <HRLayout>
      <Breadcrumb
        items={[
          { label: 'Home', href: '#' },
          { label: 'New Onboarding Request' },
        ]}
      />
      <PageHeader
        title="New Onboarding Request"
        subtitle="Enter the candidate's details to begin the onboarding process. A secure magic link will be sent to the candidate's email address."
      />

      <Alert kind="info">
        The candidate must have a confirmed offer of employment before initiating
        onboarding. Ensure manager details are correct prior to submission.
      </Alert>

      <form
        onSubmit={onSubmit}
        className="grid grid-cols-[1fr_320px] gap-5 max-lg:grid-cols-1"
      >
        <div>
          <Card
            title="Candidate Details"
            subtitle="Personal and contact information for the new hire."
          >
            <div className="gov-field-row">
              <Field label="Given Name" required error={errVisible('givenName') ? errors.givenName : null}>
                <TextInput
                  placeholder="e.g. James"
                  value={form.givenName}
                  onChange={set('givenName')}
                  onBlur={onBlur('givenName')}
                  error={errVisible('givenName')}
                />
              </Field>
              <Field label="Family Name" required error={errVisible('familyName') ? errors.familyName : null}>
                <TextInput
                  placeholder="e.g. Nguyen"
                  value={form.familyName}
                  onChange={set('familyName')}
                  onBlur={onBlur('familyName')}
                  error={errVisible('familyName')}
                />
              </Field>
            </div>
            <Field
              label="Work Email Address"
              required
              hint="Enter the candidate's official work email. The magic link will be sent to this address."
              error={errVisible('email') ? errors.email : null}
            >
              <TextInput
                type="email"
                placeholder="james.nguyen@agency.gov.au"
                value={form.email}
                onChange={set('email')}
                onBlur={onBlur('email')}
                error={errVisible('email')}
              />
            </Field>
            <div className="gov-field-row">
              <Field label="Position Title" required error={errVisible('position') ? errors.position : null}>
                <TextInput
                  placeholder="e.g. Senior Policy Adviser"
                  value={form.position}
                  onChange={set('position')}
                  onBlur={onBlur('position')}
                  error={errVisible('position')}
                />
              </Field>
              <Field label="Employment Level">
                <SelectInput value={form.level} onChange={set('level')}>
                  {LEVELS.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </SelectInput>
              </Field>
            </div>
            <div className="gov-field-row">
              <Field label="Division / Business Unit" required error={errVisible('division') ? errors.division : null}>
                <TextInput
                  placeholder="e.g. Digital Transformation"
                  value={form.division}
                  onChange={set('division')}
                  onBlur={onBlur('division')}
                  error={errVisible('division')}
                />
              </Field>
              <Field label="Commencement Date" required error={errVisible('commencement') ? errors.commencement : null}>
                <TextInput
                  type="date"
                  value={form.commencement}
                  onChange={set('commencement')}
                  onBlur={onBlur('commencement')}
                  error={errVisible('commencement')}
                />
              </Field>
            </div>
          </Card>

          <Card
            title="Manager Details"
            subtitle="These details will be embedded in the magic link and pre-populate the onboarding form."
          >
            <div className="gov-field-row">
              <Field label="Manager Full Name" required error={errVisible('managerName') ? errors.managerName : null}>
                <TextInput
                  placeholder="e.g. Dr. Michelle Park"
                  value={form.managerName}
                  onChange={set('managerName')}
                  onBlur={onBlur('managerName')}
                  error={errVisible('managerName')}
                />
              </Field>
              <Field label="Manager Email" required error={errVisible('managerEmail') ? errors.managerEmail : null}>
                <TextInput
                  type="email"
                  placeholder="m.park@agency.gov.au"
                  value={form.managerEmail}
                  onChange={set('managerEmail')}
                  onBlur={onBlur('managerEmail')}
                  error={errVisible('managerEmail')}
                />
              </Field>
            </div>
            <div className="gov-field-row">
              <Field label="Manager Position">
                <TextInput
                  placeholder="e.g. Director, Digital Policy"
                  value={form.managerPosition}
                  onChange={set('managerPosition')}
                />
              </Field>
              <Field label="Work Location">
                <SelectInput value={form.location} onChange={set('location')}>
                  {LOCATIONS.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </SelectInput>
              </Field>
            </div>
          </Card>

          <div className="flex gap-3 mt-6 items-center">
            <button type="submit" className="gov-btn gov-btn-primary">
              Generate & Send Magic Link
            </button>
            <button
              type="button"
              className="gov-btn gov-btn-secondary"
              onClick={() => setForm(EMPTY)}
            >
              Clear Form
            </button>
            <span className="text-[12px] text-ink-soft ml-auto">* Required fields</span>
          </div>
        </div>

        <div>
          <Card accent="#1B2E4B">
            <div className="text-[13px] font-bold text-navy mb-3">
              What happens next?
            </div>
            {[
              "A secure magic link is generated and embedded with the candidate's details.",
              'The candidate receives an onboarding email with the link and form access.',
              'The candidate authenticates and completes the pre-populated onboarding form.',
              'You receive a notification and the identity record is submitted to the IAM system.',
            ].map((t, i) => (
              <div className="gov-step-item" key={i}>
                <div className="gov-step-num">{i + 1}</div>
                <div className="gov-step-text">{t}</div>
              </div>
            ))}
          </Card>
          <Card accent="#C9922A">
            <div className="text-[13px] font-bold text-warn mb-2">Security Notice</div>
            <div className="text-[12px] text-ink-soft leading-[1.7]">
              Magic links expire after <strong>72 hours</strong>. If the candidate does
              not complete onboarding within this window, you will be prompted to
              reissue a new link.
            </div>
          </Card>
        </div>
      </form>
    </HRLayout>
  );
}
