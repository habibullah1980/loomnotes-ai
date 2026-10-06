import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="h-6 w-32 rounded-full bg-blue-100" />
              <div className="h-9 w-64 rounded-xl bg-zinc-200" />
              <div className="h-4 w-96 rounded-lg bg-zinc-200" />
            </div>
            <div className="h-12 w-36 rounded-xl bg-zinc-200" />
          </div>
        </div>

        {/* 4 Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-zinc-200/80 bg-white p-6 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 rounded-md bg-zinc-200" />
                <div className="h-5 w-5 rounded-md bg-zinc-200" />
              </div>
              <div className="h-8 w-16 rounded-lg bg-zinc-200" />
              <div className="h-3.5 w-32 rounded-md bg-zinc-200" />
            </div>
          ))}
        </div>

        {/* Content Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Meetings (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-40 rounded-lg bg-zinc-200" />
              <div className="h-5 w-20 rounded-md bg-zinc-200" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-zinc-200/80 bg-white p-5 h-52 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="h-4 w-24 rounded bg-zinc-200" />
                    <div className="h-6 w-3/4 rounded bg-zinc-200" />
                    <div className="h-4 w-full rounded bg-zinc-200" />
                  </div>
                  <div className="h-4 w-24 rounded bg-zinc-200" />
                </div>
              ))}
            </div>
          </div>

          {/* Action Items (1 col) */}
          <div className="space-y-4">
            <div className="h-6 w-44 rounded-lg bg-zinc-200" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-zinc-200/80 bg-white p-4 h-24"
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
