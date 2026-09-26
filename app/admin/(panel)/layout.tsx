import { requireAdmin } from "@/lib/session";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getPendingReviewCount } from "@/lib/reviews";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const pendingReviews = await getPendingReviewCount().catch(() => 0);

  return (
    <div className="flex min-h-screen bg-cream-deep text-espresso">
      <AdminSidebar pendingReviews={pendingReviews} />
      <main className="min-w-0 flex-1 overflow-x-clip">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
