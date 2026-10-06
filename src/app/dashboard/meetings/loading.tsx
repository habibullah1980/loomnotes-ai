import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { ChevronRight, Video, Search, ArrowUpDown, Plus } from "lucide-react";
import Link from "next/link";

export default function MeetingsLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 animate-pulse">
        {/* Breadcrumb & Header */}
        <div className="space-y-3">
          <nav className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span>Dashboard</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-zinc-600">Meeting History</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-6 w-36 rounded-full bg-blue-100" />
              <div className="h-8 w-64 rounded-xl bg-zinc-200" />
              <div className="h-4 w-80 rounded-lg bg-zinc-200" />
            </div>
          </div>
        </div>

        {/* Controls Bar Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="h-10 w-full max-w-md rounded-2xl bg-zinc-200" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-32 rounded-2xl bg-zinc-200" />
            <div className="h-10 w-32 rounded-2xl bg-zinc-200" />
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs h-64"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 rounded-md bg-zinc-200" />
                  <div className="h-5 w-20 rounded-full bg-zinc-200" />
                </div>
                <div className="h-6 w-3/4 rounded-lg bg-zinc-200" />
                <div className="space-y-2">
                  <div className="h-3.5 w-full rounded-md bg-zinc-200" />
                  <div className="h-3.5 w-5/6 rounded-md bg-zinc-200" />
                  <div className="h-3.5 w-2/3 rounded-md bg-zinc-200" />
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                <div className="h-4 w-32 rounded-md bg-zinc-200" />
                <div className="h-4 w-4 rounded-full bg-zinc-200" />
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
