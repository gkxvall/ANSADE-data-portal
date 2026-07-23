import Link from "next/link";

export function CatalogueCard({
  href,
  title,
  description,
  eyebrow,
  footer,
}: {
  readonly href: string;
  readonly title: string;
  readonly description: string;
  readonly eyebrow?: string;
  readonly footer?: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-card border-navy-100 shadow-card group block border bg-white p-5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl"
    >
      {eyebrow ? (
        <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="text-navy-900 mt-2 text-lg font-semibold tracking-[-0.02em]">
        {title}
      </h3>
      <p className="text-navy-500 mt-2 line-clamp-3 text-sm leading-6">
        {description}
      </p>
      {footer ? <p className="text-navy-400 mt-4 text-xs">{footer}</p> : null}
    </Link>
  );
}
