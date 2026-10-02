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
import { useDashboard } from "../context/dashboard-context";
import { PlatformIcon, getPlatformBrandColor, getPlatformDisplayName } from "../ui/platform-icon";
import { PostItem, TelegramBot, ConnectorAccount, PlatformId } from "../types";

export function ContextualPanel() {
  const { contextualPanel, closeContextualPanel, navigateToCompose } = useDashboard();

  if (!contextualPanel.isOpen || !contextualPanel.type) return null;

  const panelType = contextualPanel.type;
  const panelData = contextualPanel.data;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeContextualPanel}
        className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs z-40 lg:hidden"
      />

      <motion.aside
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
                <span className="font-semibold text-neutral-200">Live Destination Previews</span>
              </>
            )}
            {panelType === "compatibility_breakdown" && (
              <>
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-neutral-200">Compatibility Diagnostics</span>
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
                panelData as Record<PlatformId, import("../types").CompatibilityAnalysis>
              }
            />
          )}

          {panelType === "bot_info" && <BotInspector bot={panelData as TelegramBot} />}

          {panelType === "connector_info" && (
            <ConnectorInspector connector={panelData as ConnectorAccount} />
          )}
        </div>
      </motion.aside>
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
  compatibilityMap: Record<PlatformId, import("../types").CompatibilityAnalysis>;
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
                {analysis.status === "fully_compatible" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Compatible
                  </span>
                )}
                {analysis.status === "compatible_with_modifications" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <AlertTriangle className="w-3 h-3" /> Auto-Adapted
                  </span>
                )}
                {analysis.status === "incompatible" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    <X className="w-3 h-3" /> Incompatible
                  </span>
                )}
              </div>

              {analysis.modificationsSummary && analysis.modificationsSummary.length > 0 && (
                <div className="text-[11px] text-amber-300/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  {analysis.modificationsSummary[0]}
                </div>
              )}

              {analysis.reasons && analysis.reasons.length > 0 && (
                <div className="text-[11px] text-rose-300/90 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  {analysis.reasons[0]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Sub-component: Bot Inspector
function BotInspector({ bot }: { bot: TelegramBot }) {
  const { toggleBotStatus } = useDashboard();
  if (!bot) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-neutral-100">{bot.name}</h4>
          <span className="text-xs font-mono text-cyan-400">{bot.username}</span>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-neutral-400">Webhook Status</span>
          <span className="text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Healthy (200 OK)
          </span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-neutral-400">Encrypted Token</span>
          <span className="text-neutral-300 font-mono text-[11px]">{bot.tokenMasked}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-neutral-400">Queued Messages</span>
          <span className="text-neutral-100 font-bold">{bot.scheduledQueueCount}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-neutral-400">Last Telemetry</span>
          <span className="text-neutral-400 font-mono">{bot.lastActive}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => toggleBotStatus(bot.id)}
        className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xs font-semibold border border-neutral-700 transition-colors cursor-pointer"
      >
        {bot.status === "active" ? "Pause Bot Dispatch" : "Resume Bot Dispatch"}
      </button>
    </div>
  );
}

// Sub-component: Connector Inspector
function ConnectorInspector({ connector }: { connector: ConnectorAccount }) {
  const { toggleConnectorSync } = useDashboard();
  if (!connector) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">
          <PlatformIcon platformId={connector.platformId} className="w-5 h-5 text-neutral-100" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-neutral-100">{connector.platformName}</h4>
          <span className="text-xs font-mono text-neutral-400">{connector.accountHandle}</span>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-neutral-400">Connection State</span>
          <span className="text-emerald-400 font-mono">Connected ✓</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-neutral-400">Last Synced</span>
          <span className="text-neutral-300 font-mono">{connector.lastSyncAt}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-neutral-400">Max Text Limit</span>
          <span className="text-neutral-100 font-mono">
            {connector.capabilities.maxTextLength} chars
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => toggleConnectorSync(connector.id)}
        className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/20 transition-colors cursor-pointer"
      >
        Trigger Force Sync
      </button>
    </div>
  );
}
