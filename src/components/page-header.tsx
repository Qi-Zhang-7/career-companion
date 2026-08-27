export function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <header className="mb-8 flex items-end justify-between gap-5 max-[700px]:items-start max-[700px]:flex-col">
      <div><div className="eyebrow">{eyebrow}</div><h1 className="page-title">{title}</h1><p className="page-subtitle">{subtitle}</p></div>
      {action}
    </header>
  );
}
