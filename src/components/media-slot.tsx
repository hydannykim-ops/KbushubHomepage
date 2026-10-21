export function LogoSlot({ label }: { label: string }) {
  return <span className="logo-slot">{label}</span>;
}

export function MediaSlot({ label, hint, className = "" }: { label: string; hint?: string; className?: string }) {
  return (
    <div className={`media-slot ${className}`}>
      <span className="media-kicker">MEDIA</span>
      <span className="media-label">{label}</span>
      {hint ? <span className="media-hint">{hint}</span> : null}
    </div>
  );
}
