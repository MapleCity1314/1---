import { listWatchlist } from "@/lib/briefs";
import { PageHeader } from "@/components/page-header";
import { ChevronLeft } from "@/components/icons";
import Link from "next/link";
import { WatchlistManager } from "./watchlist-manager";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const items = await listWatchlist();

  return (
    <div>
      <PageHeader
        title="关注清单"
        actions={
          <Link
            href="/briefs"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-hairline bg-card px-4 text-sm font-medium text-ink hover:bg-surface-card"
          >
            <ChevronLeft size={15} />
            返回研报
          </Link>
        }
      />
      <div className="mx-auto max-w-4xl px-6 py-7">
        <WatchlistManager items={items} />
      </div>
    </div>
  );
}
