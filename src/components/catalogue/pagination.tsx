import Link from "next/link";

function buildHref(
  basePath: string,
  searchParams: Readonly<Record<string, string | string[] | undefined>>,
  nextPage: number,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
    } else {
      params.set(key, value);
    }
  }

  params.set("page", String(nextPage));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function PaginationControls({
  basePath,
  page,
  hasMore,
  searchParams,
}: {
  readonly basePath: string;
  readonly page: number;
  readonly hasMore: boolean;
  readonly searchParams: Readonly<
    Record<string, string | string[] | undefined>
  >;
}) {
  if (page <= 1 && !hasMore) {
    return null;
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-3"
    >
      <div className="text-navy-500 text-sm">Page {page}</div>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(basePath, searchParams, page - 1)}
            className="border-sand-200 text-navy-800 rounded-full border bg-white px-4 py-2 text-sm font-semibold"
          >
            Précédent
          </Link>
        ) : null}
        {hasMore ? (
          <Link
            href={buildHref(basePath, searchParams, page + 1)}
            className="bg-brand-600 text-navy-950 rounded-full px-4 py-2 text-sm font-semibold"
          >
            Suivant
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
