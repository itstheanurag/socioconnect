"use client";

import React, { useState } from "react";
import {
  FileText,
  Search,
  Plus,
  Filter,
  Calendar,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileEdit,
  Trash2,
  Copy,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDashboard } from "../context/dashboard-context";
import { PlatformIcon, getPlatformBrandColor } from "../ui/platform-icon";
import { PostItem, PostStatus, PlatformId } from "../types";

export function PostsView() {
  const { posts, openContextualPanel, navigateToCompose, deletePost, duplicatePost } =
    useDashboard();

  const [activeTab, setActiveTab] = useState<"all" | PostStatus>("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState<PlatformId | "all">("all");
  const [actionMenuPostId, setActionMenuPostId] = useState<string | null>(null);

  const statusCounts = {
    all: posts.length,
    draft: posts.filter((p) => p.status === "draft").length,
    scheduled: posts.filter((p) => p.status === "scheduled").length,
    published: posts.filter((p) => p.status === "published").length,
    failed: posts.filter((p) => p.status === "failed").length,
  };

  const filteredPosts = posts.filter((post) => {
    if (activeTab !== "all" && post.status !== activeTab) return false;
    if (platformFilter !== "all" && !post.targetPlatforms.includes(platformFilter)) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return post.title.toLowerCase().includes(q) || post.baseContent.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
            Content Library &amp; Posts
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Manage your drafts, review scheduled dispatches, and inspect analytics for published
            posts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigateToCompose()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-neutral-100 text-xs font-semibold shadow-lg shadow-red-600/25 transition-all cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Compose Post</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-900 border border-neutral-800 overflow-x-auto scrollbar-none">
          {(
            [
              { id: "all", label: "All Posts" },
              { id: "scheduled", label: "Scheduled" },
              { id: "published", label: "Published" },
              { id: "draft", label: "Drafts" },
              { id: "failed", label: "Failed" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-rose-500/20 text-neutral-100 font-semibold border border-rose-500/30"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
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

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Networks</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">X (Twitter)</option>
            <option value="linkedin">LinkedIn</option>
            <option value="reddit">Reddit</option>
            <option value="telegram">Telegram</option>
            <option value="threads">Threads</option>
          </select>
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
              whileHover={{ y: -1 }}
              className="group rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl hover:border-neutral-700 transition-all"
            >
              {/* Left: Thumbnail & Title & Excerpt */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {post.media.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.media[0].url}
                    alt={post.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-neutral-800 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-500 shrink-0">
                    <FileText className="w-6 h-6 text-neutral-400" />
                  </div>
                )}

                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
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
                        <Clock className="w-3 h-3 text-neutral-500" />
                        {new Date(post.scheduledFor).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}

                    {post.publishedAt && (
                      <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Published {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <h3
                    onClick={() => openContextualPanel("post_details", post)}
                    className="font-display text-sm sm:text-base font-bold text-neutral-100 hover:text-rose-300 transition-colors cursor-pointer truncate"
                  >
                    {post.title}
                  </h3>

                  <p className="text-xs text-neutral-400 line-clamp-1 leading-relaxed">
                    {post.baseContent}
                  </p>

                  {post.failureReason && (
                    <div className="text-[11px] text-rose-400 flex items-center gap-1 font-mono pt-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{post.failureReason}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Platform Badges & Actions */}
              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-800">
                {/* Platform Icons */}
                <div className="flex items-center gap-1">
                  {post.targetPlatforms.map((p) => {
                    const brand = getPlatformBrandColor(p);
                    return (
                      <div
                        key={p}
                        className={`p-1.5 rounded-lg border ${brand.bg} ${brand.border} ${brand.text}`}
                        title={p}
                      >
                        <PlatformIcon platformId={p} className="w-3 h-3" />
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openContextualPanel("post_preview", post)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-neutral-100 bg-neutral-950/40 hover:bg-neutral-800 border border-neutral-800 transition-colors cursor-pointer"
                    title="Live Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateToCompose(post)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-neutral-100 bg-neutral-950/40 hover:bg-neutral-800 border border-neutral-800 transition-colors cursor-pointer"
                    title="Edit in Composer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => duplicatePost(post.id)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-neutral-100 bg-neutral-950/40 hover:bg-neutral-800 border border-neutral-800 transition-colors cursor-pointer"
                    title="Duplicate Post"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => deletePost(post.id)}
                    className="p-2 rounded-xl text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
                    title="Delete Post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
