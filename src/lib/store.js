// Mock backend: persists onboarding requests + notifications in localStorage.
// Simulates the App Backend described in the HLD.

const KEY_REQUESTS = 'onboarding.requests.v1';
const KEY_NOTIFS   = 'onboarding.notifications.v1';

// ─── Helpers ───
const now = () => new Date().toISOString();

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Magic link tokens ───
// Base64-url encodes a signed-ish payload. This is a mock — a real backend
// would HMAC this. Fine for prototype: it's readable + reversible.
function b64urlEncode(obj) {
  const json = JSON.stringify(obj);
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(token) {
  try {
    const b64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function buildMagicLinkToken(requestId, email, expiresAt) {
  return b64urlEncode({ rid: requestId, email, exp: expiresAt, iat: Date.now() });
}

export function parseMagicLinkToken(token) {
  const payload = b64urlDecode(token);
  if (!payload || !payload.rid) return { ok: false, reason: 'invalid' };
  if (Date.now() > payload.exp) return { ok: false, reason: 'expired', payload };
  return { ok: true, payload };
}

// Random-ish invitation code: OB-YYYY-XXXX
function generateInviteCode() {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `OB-${year}-${s}`;
}

// ─── Requests ───
export function listRequests() {
  return read(KEY_REQUESTS, []);
}

export function getRequest(id) {
  return listRequests().find((r) => r.id === id) || null;
}

export function createRequest(input, { validityHours = 72 } = {}) {
  const id = uuid();
  const createdAt = now();
  const expiresAtMs = Date.now() + validityHours * 60 * 60 * 1000;
  const request = {
    id,
    status: 'link_sent', // link_sent | pending | completed | expired
    createdAt,
    linkSentAt: createdAt,
    expiresAt: new Date(expiresAtMs).toISOString(),
    inviteCode: generateInviteCode(),
    magicToken: null, // set below
    submission: null,
    reissueHistory: [],
    ...input, // { givenName, familyName, email, position, level, division, commencement, managerName, managerEmail, managerPosition, location }
  };
  request.magicToken = buildMagicLinkToken(id, input.email, expiresAtMs);

  const all = listRequests();
  all.unshift(request);
  write(KEY_REQUESTS, all);

  addNotification({
    kind: 'link_sent',
    title: `Link sent — ${input.givenName} ${input.familyName}`,
    body: 'Onboarding email delivered to candidate.',
    requestId: id,
  });
  return request;
}

export function updateRequest(id, patch) {
  const all = listRequests();
  const idx = all.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...patch };
  write(KEY_REQUESTS, all);
  return all[idx];
}

export function reissueRequest(id, { validityHours = 72, reason, note, updatedEmail } = {}) {
  const req = getRequest(id);
  if (!req) return null;

  const expiresAtMs = Date.now() + validityHours * 60 * 60 * 1000;
  const email = updatedEmail || req.email;
  const token = buildMagicLinkToken(id, email, expiresAtMs);
  const inviteCode = generateInviteCode();

  const entry = {
    issued: now(),
    expiry: new Date(expiresAtMs).toISOString(),
    reason: reason || 'Link expired',
    note: note || '',
    previousExpiry: req.expiresAt,
  };

  const updated = updateRequest(id, {
    email,
    magicToken: token,
    inviteCode,
    expiresAt: entry.expiry,
    linkSentAt: entry.issued,
    status: 'link_sent',
    reissueHistory: [...(req.reissueHistory || []), entry],
  });

  addNotification({
    kind: 'link_sent',
    title: `Link reissued — ${req.givenName} ${req.familyName}`,
    body: `New magic link issued (${validityHours}h validity).`,
    requestId: id,
  });
  return updated;
}

export function submitCandidateForm(id, formData) {
  const req = getRequest(id);
  if (!req) return null;

  const reference = `OB-${new Date().getFullYear()}-${String(
    Math.floor(Math.random() * 90000) + 10000
  )}`;

  const updated = updateRequest(id, {
    status: 'completed',
    submission: {
      ...formData,
      submittedAt: now(),
      reference,
    },
  });

  addNotification({
    kind: 'completed',
    title: `Form completed — ${req.givenName} ${req.familyName}`,
    body: 'Onboarding form submitted. Identity record written to IAM DB.',
    requestId: id,
  });
  return updated;
}

// Refresh derived status for expired links. Call from dashboard load.
export function refreshStatuses() {
  const all = listRequests();
  let changed = false;
  for (const r of all) {
    if (r.status === 'link_sent' && Date.now() > new Date(r.expiresAt).getTime()) {
      r.status = 'expired';
      changed = true;
      addNotification({
        kind: 'expired',
        title: `Link expired — ${r.givenName} ${r.familyName}`,
        body: 'Magic link expired without completion. Action required.',
        requestId: r.id,
      });
    }
  }
  if (changed) write(KEY_REQUESTS, all);
  return all;
}

// ─── Notifications ───
export function listNotifications() {
  return read(KEY_NOTIFS, []);
}

export function addNotification(n) {
  const all = listNotifications();
  all.unshift({
    id: uuid(),
    createdAt: now(),
    read: false,
    ...n,
  });
  // keep last 40
  write(KEY_NOTIFS, all.slice(0, 40));
}

export function markAllNotificationsRead() {
  const all = listNotifications().map((n) => ({ ...n, read: true }));
  write(KEY_NOTIFS, all);
}

// ─── Seed (for empty dashboard demo) ───
export function seedIfEmpty() {
  if (listRequests().length > 0) return;

  const sample = [
    {
      givenName: 'Priya',    familyName: 'Sharma',
      email: 'p.sharma@agency.gov.au', position: 'Data Analyst', level: 'APS 5',
      division: 'Data & Analytics', commencement: '2026-04-02',
      managerName: 'Ashwin Raj', managerEmail: 'a.raj@agency.gov.au',
      managerPosition: 'Director, Data Analytics', location: 'Sydney NSW',
      status: 'completed',
    },
    {
      givenName: 'James',    familyName: 'Nguyen',
      email: 'james.nguyen@agency.gov.au', position: 'Senior Policy Adviser', level: 'APS 6',
      division: 'Digital Transformation', commencement: '2026-04-14',
      managerName: 'Dr. Michelle Park', managerEmail: 'm.park@agency.gov.au',
      managerPosition: 'Director, Digital Policy', location: 'Canberra ACT',
      status: 'link_sent',
    },
    {
      givenName: 'Aisha',    familyName: 'Okonkwo',
      email: 'a.okonkwo@agency.gov.au', position: 'Communications Officer', level: 'APS 4',
      division: 'Communications', commencement: '2026-04-21',
      managerName: 'Rebecca Liu', managerEmail: 'r.liu@agency.gov.au',
      managerPosition: 'Director, Public Affairs', location: 'Melbourne VIC',
      status: 'link_sent',
    },
    {
      givenName: 'Michael',  familyName: 'Torres',
      email: 'm.torres@agency.gov.au', position: 'ICT Security Analyst', level: 'APS 6',
      division: 'Cyber Security Operations', commencement: '2026-04-07',
      managerName: 'Brendan Walsh', managerEmail: 'b.walsh@agency.gov.au',
      managerPosition: 'Director, Cyber Operations', location: 'Canberra ACT',
      // created in the past so link is already expired
      status: 'expired',
      __backdate: 1000 * 60 * 60 * 24 * 7, // 7 days ago
    },
  ];

  for (const s of sample) {
    const req = createRequest(s, { validityHours: 72 });
    if (s.__backdate) {
      const ts = Date.now() - s.__backdate;
      updateRequest(req.id, {
        createdAt: new Date(ts).toISOString(),
        linkSentAt: new Date(ts).toISOString(),
        expiresAt: new Date(ts + 72 * 3600 * 1000).toISOString(),
        status: 'expired',
      });
    } else if (s.status) {
      updateRequest(req.id, { status: s.status });
    }
    if (s.status === 'completed') {
      updateRequest(req.id, {
        submission: {
          submittedAt: now(),
          reference: `OB-2026-${10000 + Math.floor(Math.random() * 89999)}`,
        },
      });
    }
  }
}
