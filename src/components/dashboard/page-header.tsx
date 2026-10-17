export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="anim-rise mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <span className="mb-1 block h-0.5 w-10 rounded-full bg-gradient-to-r from-primary to-accent" />
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children ? (
        <div
          className="anim-rise flex items-center gap-2"
          style={{ animationDelay: "80ms" }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
