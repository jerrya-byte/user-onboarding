import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NewRequest from './pages/hr/NewRequest';
import Dashboard from './pages/hr/Dashboard';
import Identities from './pages/hr/Identities';
import Termination from './pages/hr/Termination';
import ReissueLink from './pages/hr/ReissueLink';
import AuthLanding from './pages/candidate/AuthLanding';
import OnboardingForm from './pages/candidate/OnboardingForm';
import Confirmation from './pages/candidate/Confirmation';
import ProtectedRoute from './components/ProtectedRoute';

// Wrap any HR-side route element in <ProtectedRoute> so that an
// authenticated Microsoft session is required to view it. Candidate
// routes stay public — the candidate is gated by their magic link.
const hr = (el) => <ProtectedRoute>{el}</ProtectedRoute>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/hr/dashboard" replace />} />
        <Route path="/hr/new" element={hr(<NewRequest />)} />
        <Route path="/hr/dashboard" element={hr(<Dashboard />)} />
        <Route path="/hr/identities" element={hr(<Identities />)} />
        <Route path="/hr/termination" element={hr(<Termination />)} />
        <Route path="/hr/reissue" element={hr(<ReissueLink />)} />
        <Route path="/hr/reissue/:id" element={hr(<ReissueLink />)} />
        <Route path="/candidate/auth" element={<AuthLanding />} />
        <Route path="/candidate/form" element={<OnboardingForm />} />
        <Route path="/candidate/done" element={<Confirmation />} />
        <Route path="*" element={<Navigate to="/hr/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
