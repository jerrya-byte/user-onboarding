import { NavLink, useLocation } from 'react-router-dom';

// Gov bar + app header + screen nav (HR side only)
export default function GovChrome({ variant = 'hr' }) {
  return (
    <>
      <GovBar />
      <AppHeader variant={variant} />
      {variant === 'hr' && <HRNav />}
    </>
  );
}

function GovBar() {
  return (
    <div className="bg-navy-dark px-8 py-1.5 flex items-center gap-2.5">
      <div
        className="w-7 h-7 border-2 border-gold-light rounded-full flex items-center justify-center
                   text-[11px] font-bold text-gold-light tracking-[0.5px]"
      >
        AU
      </div>
      <span className="text-slate1 text-[12px] tracking-[0.3px]">
        Australian Government &nbsp;|&nbsp; Department of Human Services
      </span>
    </div>
  );
}

function AppHeader({ variant }) {
  return (
    <div
      className="bg-navy px-8 flex items-stretch justify-between border-b-[3px] border-gold-light"
    >
      <div className="flex items-center gap-3.5 py-[18px]">
        <div
          className="w-[38px] h-[38px] bg-gold-light rounded-md flex items-center justify-center
                     font-serif text-lg font-bold text-navy-dark"
        >
          ID
        </div>
        <div>
          <h1 className="font-serif text-[17px] font-bold text-white tracking-[0.2px]">
            Identity Onboarding Portal
          </h1>
          <p className="text-[11px] text-slate2 tracking-[0.4px] uppercase">
            {variant === 'hr'
              ? 'HR Administration System'
              : 'Department of Human Services — Australian Government'}
          </p>
        </div>
      </div>
      {variant === 'hr' && (
        <div className="flex items-center gap-2.5 py-[18px]">
          <div
            className="w-8 h-8 rounded-full bg-navy-light border-[1.5px] border-slate2
                       flex items-center justify-center text-xs font-semibold text-slate1"
          >
            SC
          </div>
          <div>
            <div className="text-[13px] text-slate1 leading-tight">Sarah Chen</div>
            <div className="text-[11px] text-slate2 leading-tight">HR Onboarding Coordinator</div>
          </div>
        </div>
      )}
    </div>
  );
}

function HRNav() {
  const navClass = ({ isActive }) =>
    `bg-transparent border-0 cursor-pointer py-2.5 px-4 text-[12px] font-semibold
     tracking-[0.3px] border-b-[3px] whitespace-nowrap transition-colors no-underline ${
       isActive
         ? 'text-gold-light border-gold-light'
         : 'text-slate2 border-transparent hover:text-slate1'
     }`;
  return (
    <div className="bg-navy-light px-8 flex gap-0.5 overflow-x-auto">
      <NavLink to="/hr/new" className={navClass}>HR · Submit Email</NavLink>
      <NavLink to="/hr/dashboard" className={navClass}>HR · Dashboard</NavLink>
      <ReissueLink />
      <div className="w-px bg-[#2E4A6A] mx-2 my-1.5" />
      <NavLink to="/candidate/auth" className={navClass}>
        Candidate · Auth Landing
      </NavLink>
      <NavLink to="/candidate/form" className={navClass}>
        Candidate · Onboarding Form
      </NavLink>
      <NavLink to="/candidate/done" className={navClass}>
        Candidate · Confirmation
      </NavLink>
    </div>
  );
}

function ReissueLink() {
  const loc = useLocation();
  const isActive = loc.pathname.startsWith('/hr/reissue');
  return (
    <NavLink
      to="/hr/reissue"
      className={
        `bg-transparent border-0 cursor-pointer py-2.5 px-4 text-[12px] font-semibold
         tracking-[0.3px] border-b-[3px] whitespace-nowrap transition-colors no-underline ${
           isActive
             ? 'text-gold-light border-gold-light'
             : 'text-slate2 border-transparent hover:text-slate1'
         }`
      }
    >
      HR · Reissue Link
    </NavLink>
  );
}
