"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { createClient } from "@/lib/supabase-browser";
import { callUpdateRequestStatus } from "@/lib/functions";
import DashboardShell from "@/components/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

interface RequestRow {
  id: string;
  brand_id: string;
  creator_id: string;
  campaign_id: string;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  created_at: string;
  // Joined
  campaign_title?: string;
  campaign_niche?: string;
  campaign_budget?: number;
  brand_name?: string;
  creator_name?: string;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    dot: "bg-yellow-500",
  },
  accepted: {
    label: "Accepted",
    icon: CheckCircle,
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    dot: "bg-green-500",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    dot: "bg-red-500",
  },
};

type TabFilter = "all" | "pending" | "accepted" | "rejected";

export default function RequestsPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useSupabaseAuth();
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch requests with joined data in a single query
      const col = role === "brand" ? "brand_id" : "creator_id";
      const supabase = createClient();
      const { data: reqs, error } = await supabase
        .from("collaboration_requests")
        .select("*, campaigns(title, budget), brands(name), creators(name)")
        .eq(col, user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const enriched: RequestRow[] = (reqs || []).map((req: any) => ({
        id: req.id,
        brand_id: req.brand_id,
        creator_id: req.creator_id,
        campaign_id: req.campaign_id,
        status: req.status,
        message: req.message,
        created_at: req.created_at,
        campaign_title: req.campaigns?.title || "",
        campaign_niche: "",
        campaign_budget: req.campaigns?.budget || 0,
        brand_name: req.brands?.name || "",
        creator_name: req.creators?.name || "",
      }));

      setRequests(enriched);
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!user || !role) return;
    fetchRequests();
  }, [user, role]);

  const handleUpdateStatus = async (
    requestId: string,
    status: "accepted" | "rejected"
  ) => {
    setUpdatingId(requestId);
    try {
      await callUpdateRequestStatus({ requestId, status });
      // Update local state
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status } : r))
      );
    } catch (err) {
      console.error("Failed to update request:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const tabs: { key: TabFilter; label: string; count: number }[] = [
    { key: "all", label: "All Requests", count: requests.length },
    {
      key: "pending",
      label: "Pending",
      count: requests.filter((r) => r.status === "pending").length,
    },
    {
      key: "accepted",
      label: "Accepted",
      count: requests.filter((r) => r.status === "accepted").length,
    },
    {
      key: "rejected",
      label: "Rejected",
      count: requests.filter((r) => r.status === "rejected").length,
    },
  ];

  const filtered =
    activeTab === "all"
      ? requests
      : requests.filter((r) => r.status === activeTab);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <DashboardShell role={role || "creator"}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {role === "brand" ? "Sent Requests" : "Collaboration Requests"}
        </h1>
        <p className="text-muted-foreground">
          {role === "brand"
            ? "Track the status of requests you&apos;ve sent to creators"
            : "Manage collaboration requests from brands"}
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-6 flex-wrap"
      >
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {tab.count}
            </span>
          </Button>
        ))}
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Send className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {activeTab === "all"
                  ? "No requests yet"
                  : `No ${activeTab} requests`}
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                {role === "brand"
                  ? "Start by browsing creators and sending collaboration requests."
                  : "When brands send you collaboration requests, they will appear here."}
              </p>
              {role === "brand" && (
                <Button
                  className="mt-6 gap-2"
                  onClick={() => router.push("/creators")}
                >
                  Browse Creators <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req, index) => {
            const statusConf = STATUS_CONFIG[req.status];
            const StatusIcon = statusConf.icon;
            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base font-semibold text-foreground truncate">
                            {req.campaign_title || "Campaign"}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusConf.color}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`}
                            />
                            {statusConf.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          {role === "creator" && req.brand_name && (
                            <span>
                              From:{" "}
                              <span className="font-medium text-foreground">
                                {req.brand_name}
                              </span>
                            </span>
                          )}
                          {role === "brand" && req.creator_name && (
                            <span>
                              To:{" "}
                              <span className="font-medium text-foreground">
                                {req.creator_name}
                              </span>
                            </span>
                          )}
                          {req.campaign_niche && (
                            <Badge variant="secondary" className="text-xs">
                              {req.campaign_niche}
                            </Badge>
                          )}
                          {(req.campaign_budget ?? 0) > 0 && (
                            <span className="text-xs">
                              Budget: ₹
                              {(req.campaign_budget ?? 0).toLocaleString()}
                            </span>
                          )}
                          <span className="text-xs">
                            {new Date(req.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        {req.message && (
                          <div className="mt-2 flex items-start gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {req.message}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {role === "creator" && req.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                              disabled={updatingId === req.id}
                              onClick={() =>
                                handleUpdateStatus(req.id, "accepted")
                              }
                            >
                              {updatingId === req.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5" />
                              )}
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
                              disabled={updatingId === req.id}
                              onClick={() =>
                                handleUpdateStatus(req.id, "rejected")
                              }
                            >
                              {updatingId === req.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              Reject
                            </Button>
                          </>
                        )}
                        {req.status === "accepted" && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" /> Accepted
                          </Badge>
                        )}
                        {req.status === "rejected" && (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            <XCircle className="w-3 h-3 mr-1" /> Rejected
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
