import Link from "next/link";

export interface BreadcrumbItem {
  readonly label: string;
  readonly href?: string;
}

export function CatalogueBreadcrumbs({
  items,
}: {
  readonly items: readonly BreadcrumbItem[];
}) {
  return (
    <nav aria-label="Fil d’Ariane" className="text-navy-500 text-sm">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-2"
            >
              {item.href && !isLast ? (
                <Link
                  className="hover:text-brand-700 transition-colors"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? "text-navy-900 font-semibold" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? <span aria-hidden="true">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
