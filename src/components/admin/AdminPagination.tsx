import Link from "next/link";

/**
 * Server-rendered pagination. Builds links that preserve the current
 * query params (status/q filters) while changing only the page.
 */
export default function AdminPagination({
  basePath,
  page,
  totalPages,
  total,
  limit = 10,
  params = {},
}: {
  basePath: string;
  page: number;
  totalPages: number;
  total: number;
  limit?: number;
  params?: Record<string, string | undefined>;
}) {
  if (total === 0) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v) sp.set(k, v);
    }
    sp.set("page", String(p));
    return `${basePath}?${sp.toString()}`;
  };

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // Compact window of page numbers around the current page
  const pages: number[] = [];
  const start = Math.max(1, page - 1);
  const end = Math.min(totalPages, start + 2);
  for (let p = Math.max(1, end - 2); p <= end; p++) pages.push(p);

  return (
    <div className="flex items-center justify-between gap-4 pt-5 mt-2 border-t border-outline-variant/20">
      <p className="text-xs text-on-surface-variant font-sans">
        Hiển thị {from}–{to} trong tổng số {total} mục
      </p>
      <div className="flex items-center gap-1.5">
        <PageLink href={href(page - 1)} disabled={page <= 1} icon="chevron_left" />
        {pages.map((p) => (
          <Link
            key={p}
            href={href(p)}
            className={`flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-semibold font-sans transition-colors ${
              p === page
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {p}
          </Link>
        ))}
        <PageLink href={href(page + 1)} disabled={page >= totalPages} icon="chevron_right" />
      </div>
    </div>
  );
}

function PageLink({ href, disabled, icon }: { href: string; disabled: boolean; icon: string }) {
  if (disabled) {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full text-outline-variant">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </Link>
  );
}
