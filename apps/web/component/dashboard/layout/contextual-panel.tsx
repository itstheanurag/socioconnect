"use client";

import React from "react";
import {
  X,
  FileText,
  Bot,
  Radio,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDashboard } from "@/component/dashboard/context/dashboard-context";
import {
  PlatformIcon,
  getPlatformBrandColor,
  getPlatformDisplayName,
} from "@/component/dashboard/ui/platform-icon";
import { PostItem, TelegramBot, ConnectorAccount, PlatformId } from "@/component/dashboard/types";

export function ContextualPanel() {
  const { contextualPanel, closeContextualPanel, navigateToCompose } = useDashboard();

  const isOpen = contextualPanel.isOpen && Boolean(contextualPanel.type);
  const panelType = contextualPanel.type;
  const panelData = contextualPanel.data;

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment key="contextual-panel-wrapper">
          <motion.div
            key="contextual-panel-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeContextualPanel}
            className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs z-40 lg:hidden"
          />

          <motion.aside
            key="contextual-panel-aside"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 md:w-[420px] bg-neutral-900 border-l border-neutral-800 z-50 flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Panel Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
                {panelType === "post_details" && (
                  <>
                    <FileText className="w-4 h-4 text-rose-400" />
                    <span className="font-semibold text-neutral-200">Post Inspection</span>
                  </>
                )}
                {panelType === "post_preview" && (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-neutral-200">
                      Live Destination Previews
                    </span>
                  </>
                )}
                {panelType === "compatibility_breakdown" && (
                  <>
                    <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-neutral-200">
                      Compatibility Diagnostics
                    </span>
                  </>
                )}
                {panelType === "bot_info" && (
                  <>
                    <Bot className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-neutral-200">Telegram Bot State</span>
                  </>
                )}
                {panelType === "connector_info" && (
                  <>
                    <Radio className="w-4 h-4 text-rose-400" />
                    <span className="font-semibold text-neutral-200">Account Credentials</span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={closeContextualPanel}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Panel Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {panelType === "post_details" && (
                <PostDetailsInspector
                  post={panelData as PostItem}
                  onEdit={() => {
                    navigateToCompose({
                      initialText: (panelData as PostItem)?.baseContent,
                      targetPlatforms: (panelData as PostItem)?.targetPlatforms,
                      communityIds: (panelData as PostItem)?.communityIds,
                      scheduledFor: (panelData as PostItem)?.scheduledFor,
                    });
                    closeContextualPanel();
                  }}
                />
              )}

              {panelType === "post_preview" && <PostPreviewGallery post={panelData as PostItem} />}

              {panelType === "compatibility_breakdown" && (
                <CompatibilityReportView
                  compatibilityMap={
                    panelData as Record<
                      PlatformId,
                      import("@/component/dashboard/types").CompatibilityAnalysis
                    >
                  }
                />
              )}

              {panelType === "bot_info" && <BotInspector bot={panelData as TelegramBot} />}

              {panelType === "connector_info" && (
                <ConnectorInspector connector={panelData as ConnectorAccount} />
              )}
            </div>
          </motion.aside>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}

// Sub-component: Post Details
function PostDetailsInspector({ post, onEdit }: { post: PostItem; onEdit: () => void }) {
  if (!post) return null;

  return (
    <div className="space-y-5 text-neutral-300 text-xs">
      {/* Title and Status */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className={`text-[10px] font-mono uppercase font-semibold px-2.5 py-0.5 rounded-full border ${
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
            <span className="text-neutral-400 font-mono text-[11px]">
              {new Date(post.scheduledFor).toLocaleString()}
            </span>
          )}
        </div>
        <h3 className="font-display text-base font-bold text-neutral-100">{post.title}</h3>
      </div>

      {/* Target Networks */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono text-neutral-400 uppercase">Target Networks</label>
        <div className="flex flex-wrap gap-1.5">
          {post.targetPlatforms.map((p) => {
            const brand = getPlatformBrandColor(p);
            return (
              <span
                key={p}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${brand.bg} ${brand.border} ${brand.text}`}
              >
                <PlatformIcon platformId={p} className="w-3.5 h-3.5" />
                <span className="capitalize">{p}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Base Content */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono text-neutral-400 uppercase">Master Content</label>
        <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-200 whitespace-pre-wrap leading-relaxed font-sans text-xs">
          {post.baseContent}
        </div>
      </div>

      {/* Media Attachments */}
      {post.media.length > 0 && (
        <div className="space-y-2">
          <label className="text-[11px] font-mono text-neutral-400 uppercase">
            Attached Media ({post.media.length})
          </label>
          <div className="grid grid-cols-2 gap-2">
            {post.media.map((m) => (
              <div
                key={m.id}
                className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 aspect-video"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt="Attachment" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="pt-4 border-t border-neutral-800">
        <button
          type="button"
          onClick={onEdit}
          className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-neutral-100 font-semibold text-xs shadow-md transition-all cursor-pointer"
        >
          Edit in Composer
        </button>
      </div>
    </div>
  );
}

// Sub-component: Live Previews
function PostPreviewGallery({ post }: { post: PostItem }) {
  if (!post) return null;

  return (
    <div className="space-y-6">
      {post.targetPlatforms.map((pid) => {
        const brand = getPlatformBrandColor(pid);
        const overrideText = post.platformOverrides?.[pid]?.caption || post.baseContent;

        return (
          <div
            key={pid}
            className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 space-y-3 shadow-lg"
          >
            {/* Platform Mock Header */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center ${brand.bg} ${brand.border} ${brand.text}`}
                >
                  <PlatformIcon platformId={pid} className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-neutral-200">
                  {getPlatformDisplayName(pid)}
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500 uppercase">
                Native Preview
              </span>
            </div>

            {/* Platform Native Content Feed Card Simulation */}
            <div className="space-y-2.5">
              {/* Author Meta */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-linear-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-[10px] font-bold text-neutral-100">
                  SC
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-100">
                    SocioConnect Official
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono">Just now • 🌐</div>
                </div>
              </div>

              {/* Body Text */}
              <p className="text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed">
                {overrideText}
              </p>

              {/* Media attached */}
              {post.media.length > 0 && (
                <div className="rounded-xl overflow-hidden border border-neutral-800 aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.media[0].url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Sub-component: Compatibility Report
function CompatibilityReportView({
  compatibilityMap,
}: {
  compatibilityMap: Record<PlatformId, import("@/component/dashboard/types").CompatibilityAnalysis>;
}) {
  if (!compatibilityMap) return null;

  return (
    <div className="space-y-4">
      <div className="text-xs text-neutral-400">
        Review validation diagnostics and native parameter compliance across selected destination
        channels:
      </div>

      <div className="space-y-3">
        {Object.entries(compatibilityMap).map(([platformId, analysis]) => {
          const pid = platformId as PlatformId;

          return (
            <div
              key={pid}
              className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlatformIcon platformId={pid} className="w-3.5 h-3.5 text-neutral-100" />
                  <span className="text-xs font-semibold text-neutral-100">
                    {getPlatformDisplayName(pid)}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    analysis.status === "fully_compatible"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : analysis.status === "compatible_with_modifications"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}
                >
                  {analysis.status === "fully_compatible"
                    ? "Pass"
                    : analysis.status === "compatible_with_modifications"
                      ? "Needs Adjustments"
                      : "Rejected"}
                </span>
              </div>

              {analysis.reasons.length > 0 && (
                <ul className="text-[11px] text-neutral-400 space-y-1 pl-1 list-disc list-inside">
                  {analysis.reasons.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Sub-component: Bot State Inspector
function BotInspector({ bot }: { bot: TelegramBot }) {
  if (!bot) return null;

  return (
    <div className="space-y-4 text-xs text-neutral-300">
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-neutral-100 text-sm">{bot.name}</h4>
          <p className="text-[11px] text-neutral-400 font-mono">@{bot.username}</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-mono text-neutral-400 uppercase">
          Operational Status
        </label>
        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
          <span className="capitalize">{bot.status}</span>
          <span
            className={`w-2 h-2 rounded-full ${
              bot.status === "active"
                ? "bg-emerald-400"
                : bot.status === "paused"
                  ? "bg-amber-400"
                  : "bg-rose-400"
            }`}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-mono text-neutral-400 uppercase">Webhook & Queues</label>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 font-mono block">Webhook</span>
            <span className="text-sm font-bold text-neutral-100 capitalize">
              {bot.webhookStatus}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 font-mono block">Queue Count</span>
            <span className="text-sm font-bold text-neutral-100">
              {bot.scheduledQueueCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component: Connector Credentials Inspector
function ConnectorInspector({ connector }: { connector: ConnectorAccount }) {
  if (!connector) return null;

  return (
    <div className="space-y-4 text-xs text-neutral-300">
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
        <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
          <PlatformIcon platformId={connector.platformId} className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-neutral-100 text-sm">{connector.accountHandle}</h4>
          <p className="text-[11px] text-neutral-400 font-mono capitalize">
            {connector.platformName} Connector
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-mono text-neutral-400 uppercase">Sync State</label>
        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Last Sync:</span>
            <span className="font-mono text-neutral-200">
              {new Date(connector.lastSyncAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Health State:</span>
            <span className="font-mono text-emerald-400 capitalize">{connector.status}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-mono text-neutral-400 uppercase">Capabilities</label>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(connector.capabilities)
            .filter(([_, val]) => Boolean(val))
            .map(([cap]) => (
              <span
                key={cap}
                className="px-2 py-0.5 rounded-md bg-neutral-950 border border-neutral-800 font-mono text-[10px] text-neutral-400"
              >
                {cap}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}
