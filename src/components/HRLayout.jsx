import GovChrome from './GovChrome';

export default function HRLayout({ children }) {
  return (
    <div className="min-h-screen">
      <GovChrome variant="hr" />
      <div className="px-8 py-8 max-w-[960px] mx-auto">
        {children}
      </div>
    </div>
  );
}
