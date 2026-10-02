"use client";

import { useState } from "react";
import { FileText, Clock, Plus, Search, ChevronRight, Eye } from "lucide-react";
import { motion } from "motion/react";
import { useDashboard } from "@/component/dashboard/context/dashboard-context";
import {
  PlatformIcon,
  getPlatformBrandColor,
  getPlatformDisplayName,
} from "@/component/dashboard/ui/platform-icon";
import { CustomSelect, CustomSelectOption } from "@/component/dashboard/ui/custom-select";
import { PlatformId } from "@/component/dashboard/types";

type ViewTabId = "all" | "draft" | "scheduled" | "published" | "failed";

export function PostsView() {
  const { posts, openContextualPanel, navigateToCompose } = useDashboard();
  const [activeTab, setActiveTab] = useState<ViewTabId>("all");
  const [platformFilter, setPlatformFilter] = useState<PlatformId | "all">("all");
  const [searchFilter, setSearchFilter] = useState("");

  const platformOptions: CustomSelectOption[] = [
    { value: "all", label: "All Networks" },
    {
      value: "instagram",
      label: "Instagram",
      icon: <PlatformIcon platformId="instagram" className="w-3.5 h-3.5" />,
    },
    {
      value: "twitter",
      label: "X (Twitter)",
      icon: <PlatformIcon platformId="twitter" className="w-3.5 h-3.5" />,
    },
    {
      value: "linkedin",
      label: "LinkedIn",
      icon: <PlatformIcon platformId="linkedin" className="w-3.5 h-3.5" />,
    },
    {
      value: "reddit",
      label: "Reddit",
      icon: <PlatformIcon platformId="reddit" className="w-3.5 h-3.5" />,
    },
    {
      value: "telegram",
      label: "Telegram",
      icon: <PlatformIcon platformId="telegram" className="w-3.5 h-3.5" />,
    },
    {
      value: "threads",
      label: "Threads",
      icon: <PlatformIcon platformId="threads" className="w-3.5 h-3.5" />,
    },
  ];

  // Filtering
  const filteredPosts = posts.filter((p) => {
    if (activeTab !== "all" && p.status !== activeTab) return false;
    if (platformFilter !== "all" && !p.targetPlatforms.includes(platformFilter)) return false;
    if (
      searchFilter &&
      !p.title.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !p.baseContent.toLowerCase().includes(searchFilter.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const statusCounts: Record<ViewTabId, number> = {
    all: posts.length,
    draft: posts.filter((p) => p.status === "draft").length,
    scheduled: posts.filter((p) => p.status === "scheduled").length,
    published: posts.filter((p) => p.status === "published").length,
    failed: posts.filter((p) => p.status === "failed").length,
  };

  const tabs: { id: ViewTabId; label: string }[] = [
    { id: "all", label: "All Posts" },
    { id: "draft", label: "Drafts" },
    { id: "scheduled", label: "Scheduled" },
    { id: "published", label: "Published" },
    { id: "failed", label: "Failed" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-100">Broadcasts & Posts</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Omnichannel content delivery log, schedules, and native channel previews.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigateToCompose()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-neutral-100 font-semibold text-xs shadow-lg shadow-red-600/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Omnichannel Post</span>
        </button>
      </div>

      {/* Filter and Tab Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-neutral-800">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300">
                {statusCounts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Platform Filter */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter posts..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-hidden"
            />
          </div>

          <CustomSelect
            value={platformFilter}
            onChange={(val) => setPlatformFilter(val as any)}
            options={platformOptions}
            buttonClassName="py-1.5 text-xs"
          />
        </div>
      </div>

      {/* Post List */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-12 text-center space-y-3">
            <FileText className="w-8 h-8 text-neutral-600 mx-auto" />
            <div className="text-sm font-semibold text-neutral-400">
              No posts found in this filter
            </div>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Create a new post in the composer or adjust your filter parameters above.
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="group p-4 sm:p-5 rounded-2xl bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Post Details */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded-full border ${
                      post.status === "scheduled"
                        ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                        : post.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : post.status === "draft"
                            ? "bg-neutral-800 text-neutral-400 border-neutral-700"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {post.status}
                  </span>

                  {post.scheduledFor && (
                    <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-400" />
                      {new Date(post.scheduledFor).toLocaleString()}
                    </span>
                  )}
                </div>

                <h3 className="font-display font-bold text-sm text-neutral-100 truncate">
                  {post.title}
                </h3>

                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {post.baseContent}
                </p>

                {/* Platforms */}
                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  {post.targetPlatforms.map((pid) => {
                    const brand = getPlatformBrandColor(pid);
                    return (
                      <span
                        key={pid}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] ${brand.bg} ${brand.border} ${brand.text}`}
                      >
                        <PlatformIcon platformId={pid} className="w-3.5 h-3.5" />
                        <span className="capitalize">{getPlatformDisplayName(pid)}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-800">
                <button
                  type="button"
                  onClick={() => openContextualPanel("post_preview", post)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-neutral-100 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => openContextualPanel("post_details", post)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Inspect</span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
