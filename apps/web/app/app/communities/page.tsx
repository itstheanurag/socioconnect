"use client";

import { useState } from "react";
import {
  Users,
  Plus,
  Play,
  Pause,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Hash,
  RefreshCw,
  Zap,
} from "lucide-react";
import { platforms, type PlatformId } from "../../../lib/platform";

interface DestinationItem {
  id: string;
  name: string;
  type: string;
  flair?: string;
}

interface CommunityCluster {
  id: string;
  name: string;
  platform: PlatformId;
  description: string;
  destinations: DestinationItem[];
  staggerMinutes: number;
  isActive: boolean;
  automations: AutomationCampaign[];
}

interface AutomationCampaign {
  id: string;
  title: string;
  schedule: string;
  status: "active" | "paused";
  template: string;
  topicPool: string[];
  currentTopicIndex: number;
  lastRun?: string;
  nextRun: string;
  totalRuns: number;
}

const INITIAL_CLUSTERS: CommunityCluster[] = [
  {
    id: "cluster-1",
    name: "Dev & Frontend Subreddits",
    platform: "reddit",
    description: "Multi-subreddit distribution for developer tools and fullstack articles.",
    staggerMinutes: 6,
    isActive: true,
    destinations: [
      { id: "dest-1", name: "r/reactjs", type: "Subreddit", flair: "Resource" },
      { id: "dest-2", name: "r/nextjs", type: "Subreddit", flair: "Showcase" },
      { id: "dest-3", name: "r/webdev", type: "Subreddit", flair: "Tutorial" },
      { id: "dest-4", name: "r/typescript", type: "Subreddit", flair: "Discussion" },
    ],
    automations: [
      {
        id: "auto-1",
        title: "Weekly Frontend Engineering Deep-Dive",
        schedule: "Every Tuesday at 14:00 UTC",
        status: "active",
        template:
          "🚀 Weekly Dev Insight: {{topic}}\n\nWhat are your thoughts on this pattern? Full breakdown in comments!",
        topicPool: [
          "Zero-latency state synchronization with optimistic UI updates in React 19",
          "Preventing N+1 connection leaks with PgBouncer session pooling",
          "Automated OpenAPI schema generation and type-safe RPC clients in Next.js",
          "Self-healing outbox dispatch queue architectures for social publishers",
        ],
        currentTopicIndex: 1,
        lastRun: "2026-09-15T14:00:00Z",
        nextRun: "2026-09-22T14:00:00Z",
        totalRuns: 14,
      },
    ],
  },
  {
    id: "cluster-2",
    name: "Creator Discord Hubs",
    platform: "discord",
    description: "Broadcast announcements and changelogs across community guilds.",
    staggerMinutes: 2,
    isActive: true,
    destinations: [
      { id: "dest-5", name: "#general-announcements (Indie Founders)", type: "Guild Channel" },
      { id: "dest-6", name: "#product-updates (SaaS Builders)", type: "Guild Channel" },
      { id: "dest-7", name: "#show-and-tell (Creator Tech)", type: "Guild Channel" },
    ],
    automations: [
      {
        id: "auto-2",
        title: "Bi-Weekly Community Spotlight",
        schedule: "Every other Thursday at 17:00 UTC",
        status: "active",
        template:
          "📢 **Community Showcase & Builder Spotlight**\n\n{{topic}}\n\nDrop your questions or projects below!",
        topicPool: [
          "Showcasing top 3 community integrations built this fortnight!",
          "AMA session with our infrastructure architects on high-concurrency event queues",
          "Sneak preview of the new Cross-Platform Analytics dashboard",
        ],
        currentTopicIndex: 0,
        lastRun: "2026-09-10T17:00:00Z",
        nextRun: "2026-09-24T17:00:00Z",
        totalRuns: 6,
      },
    ],
  },
  {
    id: "cluster-3",
    name: "Tech Founders LinkedIn Network",
    platform: "linkedin",
    description: "Professional updates syndicated across team & company pages.",
    staggerMinutes: 10,
    isActive: true,
    destinations: [
      { id: "dest-8", name: "SocioConnect Engineering Page", type: "Company Page" },
      { id: "dest-9", name: "DevOps & Scale Group", type: "Professional Group" },
    ],
    automations: [
      {
        id: "auto-3",
        title: "Founder Playbook Series",
        schedule: "Every Monday at 09:30 UTC",
        status: "paused",
        template:
          "Lessons learned scaling multi-channel infrastructure:\n\n{{topic}}\n\n#buildinginpublic #startups #softwareengineering",
        topicPool: [
          "How we handled rate limits when broadcasting to 10+ social APIs concurrently",
          "The mathematics of exponential backoff with jitter in distributed task queues",
        ],
        currentTopicIndex: 0,
        lastRun: "2026-09-08T09:30:00Z",
        nextRun: "Paused",
        totalRuns: 4,
      },
    ],
  },
];

export default function CommunitiesPage() {
  const [clusters, setClusters] = useState<CommunityCluster[]>(INITIAL_CLUSTERS);
  const [selectedClusterId, setSelectedClusterId] = useState<string>(INITIAL_CLUSTERS[0].id);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isCreatingAutomation, setIsCreatingAutomation] = useState(false);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [triggerSuccessToast, setTriggerSuccessToast] = useState<string | null>(null);

  // New Group Form State
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupPlatform, setNewGroupPlatform] = useState<PlatformId>("reddit");
  const [newGroupStagger, setNewGroupStagger] = useState(5);
  const [newGroupDestinations, setNewGroupDestinations] = useState(
    "r/reactjs, r/nextjs, r/javascript",
  );

  // New Automation Form State
  const [newAutoTitle, setNewAutoTitle] = useState("");
  const [newAutoSchedule, setNewAutoSchedule] = useState("Every Wednesday at 15:00 UTC");
  const [newAutoTemplate, setNewAutoTemplate] = useState(
    "✨ Weekly Update: {{topic}}\n\nJoin the discussion below!",
  );
  const [newAutoTopics, setNewAutoTopics] = useState(
    "Topic 1: Modern Web Architecture\nTopic 2: Performance Profiling Tips\nTopic 3: Database Indexing Strategies",
  );

  const selectedCluster = clusters.find((c) => c.id === selectedClusterId) || clusters[0];

  const handleToggleAutomation = (automationId: string) => {
    setClusters((prev) =>
      prev.map((cluster) => ({
        ...cluster,
        automations: cluster.automations.map((auto) =>
          auto.id === automationId
            ? { ...auto, status: auto.status === "active" ? "paused" : "active" }
            : auto,
        ),
      })),
    );
  };

  const handleTriggerNow = (clusterId: string, auto: AutomationCampaign) => {
    setTriggeringId(auto.id);

    setTimeout(() => {
      const topic = auto.topicPool[auto.currentTopicIndex] || "Community Spotlight";
      const nextIdx = (auto.currentTopicIndex + 1) % auto.topicPool.length;

      setClusters((prev) =>
        prev.map((c) =>
          c.id === clusterId
            ? {
                ...c,
                automations: c.automations.map((a) =>
                  a.id === auto.id
                    ? {
                        ...a,
                        currentTopicIndex: nextIdx,
                        totalRuns: a.totalRuns + 1,
                        lastRun: new Date().toISOString(),
                      }
                    : a,
                ),
              }
            : c,
        ),
      );

      setTriggeringId(null);
      setTriggerSuccessToast(
        `Broadcast scheduled! Created ${selectedCluster.destinations.length} staggered posts with topic: "${topic.substring(0, 38)}..."`,
      );

      setTimeout(() => setTriggerSuccessToast(null), 6000);
    }, 900);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const parsedDestinations: DestinationItem[] = newGroupDestinations
      .split(",")
      .map((d, i) => ({
        id: `dest-${Date.now()}-${i}`,
        name: d.trim(),
        type:
          newGroupPlatform === "reddit"
            ? "Subreddit"
            : newGroupPlatform === "discord"
              ? "Guild Channel"
              : "Group / Page",
      }))
      .filter((d) => d.name.length > 0);

    const newCluster: CommunityCluster = {
      id: `cluster-${Date.now()}`,
      name: newGroupName.trim(),
      platform: newGroupPlatform,
      description: `Target community cluster on ${newGroupPlatform}.`,
      staggerMinutes: newGroupStagger,
      isActive: true,
      destinations: parsedDestinations,
      automations: [],
    };

    setClusters((prev) => [newCluster, ...prev]);
    setSelectedClusterId(newCluster.id);
    setIsCreatingGroup(false);
    setNewGroupName("");
    setNewGroupDestinations("");
  };

  const handleCreateAutomation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAutoTitle.trim() || !newAutoTemplate.trim()) return;

    const parsedTopics = newAutoTopics
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newAuto: AutomationCampaign = {
      id: `auto-${Date.now()}`,
      title: newAutoTitle.trim(),
      schedule: newAutoSchedule,
      status: "active",
      template: newAutoTemplate,
      topicPool: parsedTopics.length > 0 ? parsedTopics : ["Community Topic 1"],
      currentTopicIndex: 0,
      nextRun: "Tomorrow at 14:00 UTC",
      totalRuns: 0,
    };

    setClusters((prev) =>
      prev.map((c) =>
        c.id === selectedClusterId ? { ...c, automations: [newAuto, ...c.automations] } : c,
      ),
    );

    setIsCreatingAutomation(false);
    setNewAutoTitle("");
  };

  return (
    <div className="space-y-6">
      {/* Toast notification banner */}
      {triggerSuccessToast && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-emerald-300 bg-emerald-50 p-4 font-mono text-xs text-emerald-950 shadow-xs animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{triggerSuccessToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setTriggerSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Feature Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ede8df] pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-900 uppercase tracking-wider">
            <Users className="h-4 w-4 text-amber-700" />
            <span>community syndication engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-1">
            Community Hubs & Group Automation
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Cluster multiple subreddits, Discord channels, or LinkedIn groups under a single
            platform hub. Automate weekly rotations, prevent spam flags with anti-burst stagger
            delays, and adapt tones per target.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreatingGroup(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-[#dfc39a] bg-[#F4DCB4] px-3.5 py-2 font-mono text-xs font-bold text-stone-900 hover:bg-[#ebd0a3] transition-colors shadow-2xs cursor-pointer shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>create community hub</span>
        </button>
      </div>

      {/* Main Grid: Clusters List & Active Cluster Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Community Cluster Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="font-mono text-xs font-bold text-stone-400 uppercase tracking-wider px-1">
            your community clusters ({clusters.length})
          </div>

          <div className="space-y-2">
            {clusters.map((cluster) => {
              const meta = platforms[cluster.platform] || platforms.reddit;
              const isSelected = cluster.id === selectedCluster.id;
              const Icon = meta.icon;

              return (
                <div
                  key={cluster.id}
                  onClick={() => setSelectedClusterId(cluster.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white border-[#dfc39a] shadow-xs ring-1 ring-[#dfc39a]/60"
                      : "bg-[#fcfaf7] border-[#ede8df] hover:border-stone-300 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-sm text-white shrink-0"
                        style={{ backgroundColor: meta.color }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-stone-900 leading-tight">
                          {cluster.name}
                        </div>
                        <div className="font-mono text-[10px] text-stone-400 capitalize">
                          {cluster.platform} &middot; {cluster.destinations.length} targets
                        </div>
                      </div>
                    </div>

                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-xs bg-stone-100 text-stone-600 border border-stone-200">
                      {cluster.staggerMinutes}m stagger
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-500 mt-2.5 line-clamp-2">
                    {cluster.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-dashed border-[#ede8df] flex items-center justify-between font-mono text-[10px] text-stone-400">
                    <span>{cluster.automations.length} active schedule(s)</span>
                    <span className="text-amber-800 font-bold flex items-center gap-1">
                      <span>manage</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Cluster Details & Automation Engine (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Cluster Banner */}
          <div className="p-5 rounded-lg border border-[#ede8df] bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ede8df] pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-md text-white shadow-2xs shrink-0"
                  style={{
                    backgroundColor: (platforms[selectedCluster.platform] || platforms.reddit)
                      .color,
                  }}
                >
                  {(() => {
                    const Icon = (platforms[selectedCluster.platform] || platforms.reddit).icon;
                    return <Icon className="h-5 w-5" />;
                  })()}
                </div>
                <div>
                  <h2 className="font-bold text-base text-stone-900">{selectedCluster.name}</h2>
                  <div className="font-mono text-xs text-stone-500">
                    Platform:{" "}
                    <span className="capitalize font-bold">{selectedCluster.platform}</span>{" "}
                    &middot; Safe Interval:{" "}
                    <span className="font-bold text-stone-900">
                      {selectedCluster.staggerMinutes} mins
                    </span>{" "}
                    between posts
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreatingAutomation(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#dfc39a] bg-[#F4DCB4] px-3 py-1.5 font-mono text-xs font-bold text-stone-900 hover:bg-[#ebd0a3] transition-colors shadow-2xs cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>add automated schedule</span>
              </button>
            </div>

            {/* Sub-destinations list in this cluster */}
            <div className="space-y-2">
              <div className="font-mono text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                clustered targets in this hub ({selectedCluster.destinations.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCluster.destinations.map((dest) => (
                  <div
                    key={dest.id}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#ede8df] bg-[#fcfaf7] px-2.5 py-1 font-mono text-xs text-stone-700"
                  >
                    <Hash className="h-3 w-3 text-stone-400" />
                    <span className="font-bold text-stone-900">{dest.name}</span>
                    {dest.flair && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-xs bg-[#F4DCB4] text-stone-800 font-bold">
                        flair: {dest.flair}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Automations & Broadcast Campaigns Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs font-bold text-stone-400 uppercase tracking-wider">
                automated broadcast campaigns ({selectedCluster.automations.length})
              </div>
            </div>

            {selectedCluster.automations.length === 0 ? (
              <div className="p-8 rounded-lg border border-dashed border-[#ede8df] bg-[#fcfaf7] text-center space-y-3">
                <Clock className="h-8 w-8 text-stone-300 mx-auto" />
                <div className="font-mono text-xs font-bold text-stone-700">
                  no automated schedules for this cluster yet
                </div>
                <p className="text-xs text-stone-400 max-w-md mx-auto">
                  Create an automation rule to rotate topics, adapt copy, and broadcast periodically
                  to this community group.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCreatingAutomation(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#dfc39a] bg-[#F4DCB4] px-3.5 py-1.5 font-mono text-xs font-bold text-stone-900 hover:bg-[#ebd0a3] transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>create first campaign</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedCluster.automations.map((auto) => {
                  const currentTopic = auto.topicPool[auto.currentTopicIndex] || auto.topicPool[0];
                  const isTriggering = triggeringId === auto.id;

                  return (
                    <div
                      key={auto.id}
                      className="p-5 rounded-lg border border-[#ede8df] bg-white space-y-4 shadow-xs"
                    >
                      {/* Automation Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ede8df] pb-3.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-stone-900">{auto.title}</h3>
                            <span
                              className={`font-mono text-[9px] px-2 py-0.5 rounded-xs font-bold uppercase ${
                                auto.status === "active"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-stone-100 text-stone-600 border border-stone-200"
                              }`}
                            >
                              {auto.status}
                            </span>
                          </div>
                          <div className="font-mono text-[11px] text-stone-400 mt-0.5 flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>{auto.schedule}</span>
                            <span>&middot;</span>
                            <span>{auto.totalRuns} lifetime broadcasts</span>
                          </div>
                        </div>

                        {/* Actions: Broadcast Now & Pause/Resume */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isTriggering}
                            onClick={() => handleTriggerNow(selectedCluster.id, auto)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-stone-50 hover:bg-stone-100 px-3 py-1.5 font-mono text-xs font-bold text-stone-800 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                            title="Instantly generate and stagger dispatches across this group right now"
                          >
                            <Zap
                              className={`h-3.5 w-3.5 text-amber-600 ${isTriggering ? "animate-spin" : ""}`}
                            />
                            <span>
                              {isTriggering ? "broadcasting..." : "trigger broadcast now"}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleAutomation(auto.id)}
                            className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                              auto.status === "active"
                                ? "border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                                : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                            }`}
                            title={auto.status === "active" ? "Pause Campaign" : "Resume Campaign"}
                          >
                            {auto.status === "active" ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Content Preview & Rotational Topic */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Topic Pool & Active Index */}
                        <div className="space-y-2 rounded-md border border-[#ede8df] bg-[#fcfaf7] p-3.5">
                          <div className="flex items-center justify-between font-mono text-[10px] text-stone-400 uppercase tracking-wider">
                            <span>topic rotation pool ({auto.topicPool.length})</span>
                            <span className="text-amber-800 font-bold">
                              next topic #{auto.currentTopicIndex + 1}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-sm bg-white border border-[#ede8df] font-mono text-xs text-stone-800 font-medium">
                            &ldquo;{currentTopic}&rdquo;
                          </div>

                          <div className="text-[10px] text-stone-400 flex items-center gap-1">
                            <RefreshCw className="h-2.5 w-2.5" />
                            <span>Rotates sequentially each scheduled broadcast</span>
                          </div>
                        </div>

                        {/* Staggered Pipeline Visualizer */}
                        <div className="space-y-2 rounded-md border border-[#ede8df] bg-[#fcfaf7] p-3.5">
                          <div className="font-mono text-[10px] text-stone-400 uppercase tracking-wider">
                            anti-spam stagger timeline
                          </div>

                          <div className="space-y-1.5 pt-1">
                            {selectedCluster.destinations.slice(0, 3).map((dest, i) => (
                              <div
                                key={dest.id}
                                className="flex items-center justify-between font-mono text-[11px] text-stone-600 bg-white px-2 py-1 rounded-sm border border-[#ede8df]"
                              >
                                <span className="font-bold">{dest.name}</span>
                                <span className="text-stone-400 text-[10px]">
                                  +{i * selectedCluster.staggerMinutes} min delay
                                </span>
                              </div>
                            ))}
                            {selectedCluster.destinations.length > 3 && (
                              <div className="text-center font-mono text-[10px] text-stone-400">
                                +{selectedCluster.destinations.length - 3} more queued targets
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal / Drawer: Create Community Group */}
      {isCreatingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-lg border border-[#ede8df] bg-white p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#ede8df] pb-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-stone-900 uppercase">
                <Users className="h-4 w-4 text-amber-700" />
                <span>create community cluster hub</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingGroup(false)}
                className="text-stone-400 hover:text-stone-900 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  hub name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend & React Subreddits"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full rounded-md border border-[#ede8df] p-2 text-stone-900 focus:border-[#dfc39a] focus:outline-hidden bg-[#faf8f5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    platform *
                  </label>
                  <select
                    value={newGroupPlatform}
                    onChange={(e) => setNewGroupPlatform(e.target.value as PlatformId)}
                    className="w-full rounded-md border border-[#ede8df] p-2 text-stone-900 focus:border-[#dfc39a] focus:outline-hidden bg-[#faf8f5]"
                  >
                    <option value="reddit">Reddit</option>
                    <option value="discord">Discord</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    stagger interval (mins)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={newGroupStagger}
                    onChange={(e) => setNewGroupStagger(Number(e.target.value))}
                    className="w-full rounded-md border border-[#ede8df] p-2 text-stone-900 focus:border-[#dfc39a] focus:outline-hidden bg-[#faf8f5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  destinations / channels (comma separated) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="r/reactjs, r/nextjs, r/webdev, r/typescript"
                  value={newGroupDestinations}
                  onChange={(e) => setNewGroupDestinations(e.target.value)}
                  className="w-full rounded-md border border-[#ede8df] p-2 text-stone-900 focus:border-[#dfc39a] focus:outline-hidden bg-[#faf8f5]"
                />
                <span className="text-[10px] text-stone-400">
                  Each destination will receive custom copy with anti-burst delay.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ede8df]">
                <button
                  type="button"
                  onClick={() => setIsCreatingGroup(false)}
                  className="px-3.5 py-2 rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md border border-[#dfc39a] bg-[#F4DCB4] font-bold text-stone-900 hover:bg-[#ebd0a3] transition-colors cursor-pointer shadow-2xs"
                >
                  create hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Automation Rule */}
      {isCreatingAutomation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-lg border border-[#ede8df] bg-white p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#ede8df] pb-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-stone-900 uppercase">
                <Sparkles className="h-4 w-4 text-amber-700" />
                <span>create automated broadcast campaign</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingAutomation(false)}
                className="text-stone-400 hover:text-stone-900 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAutomation} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  campaign title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Ecosystem Spotlight"
                  value={newAutoTitle}
                  onChange={(e) => setNewAutoTitle(e.target.value)}
                  className="w-full rounded-md border border-[#ede8df] p-2 text-stone-900 focus:border-[#dfc39a] focus:outline-hidden bg-[#faf8f5]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  schedule cadence *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Every Tuesday at 14:00 UTC"
                  value={newAutoSchedule}
                  onChange={(e) => setNewAutoSchedule(e.target.value)}
                  className="w-full rounded-md border border-[#ede8df] p-2 text-stone-900 focus:border-[#dfc39a] focus:outline-hidden bg-[#faf8f5]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  post copy template (use {"{{topic}}"} token) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newAutoTemplate}
                  onChange={(e) => setNewAutoTemplate(e.target.value)}
                  className="w-full rounded-md border border-[#ede8df] p-2 text-stone-900 focus:border-[#dfc39a] focus:outline-hidden bg-[#faf8f5]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  rotational topic pool (one per line)
                </label>
                <textarea
                  rows={4}
                  value={newAutoTopics}
                  onChange={(e) => setNewAutoTopics(e.target.value)}
                  className="w-full rounded-md border border-[#ede8df] p-2 text-stone-900 focus:border-[#dfc39a] focus:outline-hidden bg-[#faf8f5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ede8df]">
                <button
                  type="button"
                  onClick={() => setIsCreatingAutomation(false)}
                  className="px-3.5 py-2 rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md border border-[#dfc39a] bg-[#F4DCB4] font-bold text-stone-900 hover:bg-[#ebd0a3] transition-colors cursor-pointer shadow-2xs"
                >
                  save & activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
