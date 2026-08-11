export function PageHeader({
  title,
  description,
  actions,
}: {
  title: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between min-w-0">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl break-words">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground break-words">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
