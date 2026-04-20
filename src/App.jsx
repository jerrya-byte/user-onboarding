import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NewRequest from './pages/hr/NewRequest';
import Dashboard from './pages/hr/Dashboard';
import ReissueLink from './pages/hr/ReissueLink';
import AuthLanding from './pages/candidate/AuthLanding';
import OnboardingForm from './pages/candidate/OnboardingForm';
import Confirmation from './pages/candidate/Confirmation';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/hr/dashboard" replace />} />
        <Route path="/hr/new" element={<NewRequest />} />
        <Route path="/hr/dashboard" element={<Dashboard />} />
        <Route path="/hr/reissue" element={<ReissueLink />} />
        <Route path="/hr/reissue/:id" element={<ReissueLink />} />
        <Route path="/candidate/auth" element={<AuthLanding />} />
        <Route path="/candidate/form" element={<OnboardingForm />} />
        <Route path="/candidate/done" element={<Confirmation />} />
        <Route path="*" element={<Navigate to="/hr/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
