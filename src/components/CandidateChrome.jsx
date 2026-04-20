export default function CandidateChrome({ children }) {
  return (
    <div className="candidate-wrap min-h-[400px] bg-bg border border-border rounded overflow-hidden max-w-[960px] mx-auto">
      <div className="bg-navy px-8 py-5 border-b-[3px] border-gold-light flex items-center gap-3.5">
        <div
          className="w-9 h-9 bg-gold-light rounded-[5px] flex items-center justify-center
                     font-serif text-base font-bold text-navy-dark"
        >
          ID
        </div>
        <div>
          <h1 className="font-serif text-[15px] font-bold text-white">
            Identity Onboarding Portal
          </h1>
          <p className="text-[11px] text-slate2">
            Department of Human Services — Australian Government
          </p>
        </div>
      </div>
      <div className="p-8">{children}</div>
    </div>
  );
}
