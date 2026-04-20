export default function ProgressSteps({ steps, current }) {
  return (
    <div className="gov-progress-bar">
      {steps.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : '';
        const isLast = i === steps.length - 1;
        return (
          <div
            key={label}
            className={`gov-prog-step ${state}`}
          >
            {!isLast && (
              <div
                className="absolute top-3 left-1/2 w-full h-0.5 z-0"
                style={{ background: i < current ? '#1A5E42' : '#C8C5BC' }}
              />
            )}
            <div className="gov-prog-dot">
              {i < current ? '✓' : i + 1}
            </div>
            <div>{label}</div>
          </div>
        );
      })}
    </div>
  );
}
