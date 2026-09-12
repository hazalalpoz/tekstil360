export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-lg font-bold text-white shadow-md shadow-teal-900/20">
        360
      </span>
      <div className="leading-tight">
        <span className="block text-lg font-semibold tracking-tight text-slate-900">
          Tekstil<span className="text-teal-600">360</span>
        </span>
        <span className="text-xs text-slate-500">Atölye &amp; firma platformu</span>
      </div>
    </div>
  );
}
