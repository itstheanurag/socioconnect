"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Calendar,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Heart,
  MessageCircle,
  Repeat2,
  ExternalLink,
  Bot,
  Radio,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDashboard } from "../context/dashboard-context";
import { PlatformIcon, getPlatformBrandColor } from "../ui/platform-icon";
import { PlatformId, PostItem, TelegramBot, ConnectorAccount } from "../types";
import {
  analyzePlatformCompatibility,
  getPlatformDisplayName,
} from "../utils/compatibility-engine";

export function ContextualPanel() {
  const { contextualPanel, closeContextualPanel, reschedulePost, deletePost, navigateToCompose } =
    useDashboard();
  const [activePreviewPlatform, setActivePreviewPlatform] = useState<PlatformId>("instagram");

  if (!contextualPanel.isOpen || !contextualPanel.type) return null;

  const data = contextualPanel.data;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="fixed top-16 right-0 bottom-0 w-full sm:w-96 md:w-[420px] bg-[#080811]/95 border-l border-white/[0.08] backdrop-blur-2xl z-30 flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Panel Header */}
        <div className="h-14 border-b border-white/[0.08] px-5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              {contextualPanel.type === "post_preview" && "Live Platform Preview"}
              {contextualPanel.type === "post_details" && "Post Inspection"}
              {contextualPanel.type === "compatibility_breakdown" && "Format Intelligence"}
              {contextualPanel.type === "bot_info" && "Telegram Bot Diagnostics"}
              {contextualPanel.type === "connector_info" && "Connector Specifications"}
              {contextualPanel.type === "activity_feed" && "Dispatch Activity Stream"}
              {contextualPanel.type === "schedule_slot" && "Schedule Slot Inspector"}
            </h3>
          </div>
          <button
            type="button"
            onClick={closeContextualPanel}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {/* 1. POST PREVIEW / POST DETAILS */}
          {(contextualPanel.type === "post_preview" || contextualPanel.type === "post_details") && (
            <PostPreviewRenderer
              post={data}
              activePlatform={activePreviewPlatform}
              onSelectPlatform={setActivePreviewPlatform}
              onReschedule={(id, date) => reschedulePost(id, date)}
              onDelete={(id) => deletePost(id)}
              onEdit={(post) => {
                closeContextualPanel();
                navigateToCompose(post);
              }}
            />
          )}

          {/* 2. COMPATIBILITY BREAKDOWN */}
          {contextualPanel.type === "compatibility_breakdown" && (
            <CompatibilityInspector content={data} />
          )}

          {/* 3. BOT INFO */}
          {contextualPanel.type === "bot_info" && <BotInspector bot={data} />}

          {/* 4. CONNECTOR INFO */}
          {contextualPanel.type === "connector_info" && <ConnectorInspector connector={data} />}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Sub-component: Post Preview with faithful native approximations
function PostPreviewRenderer({
  post,
  activePlatform,
  onSelectPlatform,
  onEdit,
  onDelete,
}: {
  post: PostItem;
  activePlatform: PlatformId;
  onSelectPlatform: (p: PlatformId) => void;
  onReschedule: (id: string, date: string) => void;
  onDelete: (id: string) => void;
  onEdit: (post: PostItem) => void;
}) {
  const targetPlatforms = post.targetPlatforms || ["instagram", "twitter", "linkedin"];
  const currentPlatform = targetPlatforms.includes(activePlatform)
    ? activePlatform
    : targetPlatforms[0] || "instagram";

  const override = post.platformOverrides?.[currentPlatform];
  const displayContent = override?.caption || post.baseContent;
  const displayTitle = override?.title || post.title;

  return (
    <div className="space-y-5">
      {/* Platform Selector Tabs */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
          Preview Destination
        </div>
        <div className="flex flex-wrap gap-1.5">
          {targetPlatforms.map((p) => {
            const isActive = currentPlatform === p;
            const brand = getPlatformBrandColor(p);
            return (
              <button
                key={p}
                type="button"
                onClick={() => onSelectPlatform(p)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? `${brand.bg} ${brand.text} ${brand.border} border font-semibold`
                    : "bg-white/[0.03] text-neutral-400 hover:text-white border border-white/5"
                }`}
              >
                <PlatformIcon platformId={p} className="w-3.5 h-3.5" />
                <span>{getPlatformDisplayName(p)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulated Destination UI Card */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0d18] p-4 shadow-xl space-y-3">
        {/* Instagram Simulated Preview */}
        {currentPlatform === "instagram" && (
          <div className="space-y-3 font-sans">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-linear-to-tr from-yellow-500 via-pink-500 to-purple-600 p-[1.5px]">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-white">
                    SC
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white leading-tight">
                    socioconnect.hq
                  </div>
                  <div className="text-[10px] text-neutral-400 leading-none">
                    Sponsored / Official
                  </div>
                </div>
              </div>
              <span className="text-xs text-neutral-500">•••</span>
            </div>

            {post.media.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.media[0].url}
                alt="Preview"
                className="w-full aspect-square rounded-xl object-cover border border-white/10"
              />
            ) : (
              <div className="w-full aspect-4/3 rounded-xl bg-linear-to-br from-rose-950/40 via-[#121222] to-black border border-white/10 flex items-center justify-center text-xs text-neutral-400 p-4 text-center">
                &ldquo;{displayContent}&rdquo;
              </div>
            )}

            <div className="flex items-center justify-between text-neutral-300 pt-1">
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 hover:text-rose-500 cursor-pointer transition-colors" />
                <MessageCircle className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
                <Send className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
              </div>
              <span className="text-[11px] font-mono text-neutral-500">1/1</span>
            </div>

            <div className="text-xs text-neutral-300 space-y-1">
              <p>
                <span className="font-semibold text-white mr-1.5">socioconnect.hq</span>
                {displayContent}
              </p>
              {post.hasAudio && (
                <div className="text-[10px] text-pink-400 font-mono flex items-center gap-1">
                  ♫ Original Audio • SocioConnect Soundscape
                </div>
              )}
            </div>
          </div>
        )}

        {/* X / Twitter Simulated Preview */}
        {currentPlatform === "twitter" && (
          <div className="space-y-3 font-sans">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                SC
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-1 text-xs">
                  <span className="font-bold text-white">SocioConnect</span>
                  <span className="text-neutral-500 font-mono">@SocioConnectApp</span>
                  <span className="text-neutral-500 font-mono">· 1m</span>
                </div>
                <p className="text-xs text-neutral-200 whitespace-pre-line leading-relaxed">
                  {displayContent}
                </p>
                {post.media.length > 0 && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.media[0].url}
                    alt="Preview"
                    className="w-full h-44 rounded-xl object-cover border border-white/10 mt-2"
                  />
                )}
                <div className="flex items-center justify-between text-neutral-500 text-xs pt-2">
                  <span className="flex items-center gap-1 hover:text-sky-400 cursor-pointer">
                    <MessageCircle className="w-3.5 h-3.5" /> 24
                  </span>
                  <span className="flex items-center gap-1 hover:text-emerald-400 cursor-pointer">
                    <Repeat2 className="w-3.5 h-3.5" /> 88
                  </span>
                  <span className="flex items-center gap-1 hover:text-rose-400 cursor-pointer">
                    <Heart className="w-3.5 h-3.5" /> 412
                  </span>
                  <Share2 className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reddit Simulated Preview */}
        {currentPlatform === "reddit" && (
          <div className="space-y-2.5 font-sans">
            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center text-[10px] font-bold text-white">
                r/
              </div>
              <span className="font-bold text-white">{override?.subreddit || "r/programming"}</span>
              <span>• Posted by u/socioconnect_hq</span>
            </div>

            <h4 className="text-xs font-bold text-white leading-snug">{displayTitle}</h4>

            <p className="text-xs text-neutral-300 leading-relaxed line-clamp-4">
              {displayContent}
            </p>

            {post.media.length > 0 && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.media[0].url}
                alt="Preview"
                className="w-full h-40 rounded-xl object-cover border border-white/10"
              />
            )}

            <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-neutral-400">
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                ▲ 342 Upvotes
              </span>
              <span>48 Comments</span>
            </div>
          </div>
        )}

        {/* Telegram Simulated Preview */}
        {currentPlatform === "telegram" && (
          <div className="space-y-2 font-sans">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <div className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center text-xs font-bold text-white">
                ✈
              </div>
              <div>
                <div className="text-xs font-semibold text-white">SocioDispatch Feed</div>
                <div className="text-[10px] text-neutral-400">@socioconnect_bot</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 space-y-2">
              {post.media.length > 0 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.media[0].url}
                  alt="Preview"
                  className="w-full h-36 rounded-lg object-cover"
                />
              )}
              <p className="text-xs text-neutral-200 whitespace-pre-line leading-relaxed">
                {displayContent}
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400/80 pt-1">
                <span>12.4k views</span>
                <span>10:30 AM ✓✓</span>
              </div>
            </div>
          </div>
        )}

        {/* LinkedIn Simulated Preview */}
        {currentPlatform === "linkedin" && (
          <div className="space-y-2.5 font-sans">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-sky-700 flex items-center justify-center text-xs font-bold text-white">
                in
              </div>
              <div>
                <div className="text-xs font-bold text-white">SocioConnect Technologies</div>
                <div className="text-[10px] text-neutral-400">32,600 followers • 2h</div>
              </div>
            </div>

            <p className="text-xs text-neutral-200 line-clamp-4 leading-relaxed">
              {displayContent}
            </p>

            {post.media.length > 0 && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.media[0].url}
                alt="Preview"
                className="w-full h-40 rounded-lg object-cover border border-white/10"
              />
            )}

            <div className="flex items-center justify-between text-neutral-400 text-xs pt-2 border-t border-white/5">
              <span>👍 148 Reactions</span>
              <span>22 Comments</span>
            </div>
          </div>
        )}
      </div>

      {/* Post Metadata & Quick Actions */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
          <span className="text-neutral-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            Status
          </span>
          <span
            className={`font-mono text-[11px] uppercase font-semibold px-2 py-0.5 rounded-full ${
              post.status === "scheduled"
                ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                : post.status === "published"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-neutral-800 text-neutral-400"
            }`}
          >
            {post.status}
          </span>
        </div>

        {post.scheduledFor && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              Scheduled Time
            </span>
            <span className="font-mono text-neutral-300 text-[11px]">
              {new Date(post.scheduledFor).toLocaleString()}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={() => onEdit(post)}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
            <span>Edit in Composer</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(post.id)}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium border border-rose-500/20 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Remove Post</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-component: Compatibility breakdown inspector
function CompatibilityInspector({ content }: { content: any }) {
  const targetPlatforms: PlatformId[] = [
    "instagram",
    "twitter",
    "linkedin",
    "reddit",
    "telegram",
    "threads",
  ];

  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-2xl bg-linear-to-br from-rose-950/20 to-[#0d0d18] border border-rose-500/20 space-y-1.5">
        <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
          <Sparkles className="w-4 h-4" />
          <span>Intelligent Format Analysis</span>
        </div>
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          Socioconnect inspects your media attachments, character count, and layout, and applies
          zero-destructive format transformations for each destination.
        </p>
      </div>

      <div className="space-y-2.5">
        {targetPlatforms.map((pid) => {
          const analysis = analyzePlatformCompatibility(pid, {
            text: content?.text || "",
            media: content?.media || [],
            hasAudio: content?.hasAudio || false,
          });

          return (
            <div
              key={pid}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/6 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlatformIcon platformId={pid} className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-semibold text-white">
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
                <div className="text-[11px] text-amber-300/90 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                  {analysis.modificationsSummary[0]}
                </div>
              )}

              {analysis.reasons && analysis.reasons.length > 0 && (
                <div className="text-[11px] text-rose-300/90 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
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
          <h4 className="text-sm font-bold text-white">{bot.name}</h4>
          <span className="text-xs font-mono text-cyan-400">{bot.username}</span>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-neutral-400">Webhook Status</span>
          <span className="text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Healthy (200 OK)
          </span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-neutral-400">Encrypted Token</span>
          <span className="text-neutral-300 font-mono text-[11px]">{bot.tokenMasked}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-neutral-400">Queued Messages</span>
          <span className="text-white font-bold">{bot.scheduledQueueCount}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-neutral-400">Last Telemetry</span>
          <span className="text-neutral-400 font-mono">{bot.lastActive}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => toggleBotStatus(bot.id)}
        className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
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
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          <PlatformIcon platformId={connector.platformId} className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">{connector.platformName}</h4>
          <span className="text-xs font-mono text-neutral-400">{connector.accountHandle}</span>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-neutral-400">Connection State</span>
          <span className="text-emerald-400 font-mono">Connected ✓</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-neutral-400">Last Synced</span>
          <span className="text-neutral-300 font-mono">{connector.lastSyncAt}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-neutral-400">Max Text Limit</span>
          <span className="text-white font-mono">{connector.capabilities.maxTextLength} chars</span>
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
