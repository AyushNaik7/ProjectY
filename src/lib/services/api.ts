import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050/api";

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("creator_dashboard_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface DashboardStats {
  totalEarnings: number;
  activeCampaigns: number;
  newFollowers: number;
  engagementRate: number;
}

export async function fetchDashboard() {
  const { data } = await api.get<{ stats: DashboardStats }>("/dashboard");
  return data;
}

export async function fetchCampaigns() {
  const { data } = await api.get<{ campaigns: unknown[] }>("/campaigns");
  return data;
}

export async function applyCampaign(campaignId: string) {
  const { data } = await api.post<{ success: boolean }>("/campaigns/apply", { campaignId });
  return data;
}

export async function patchCampaignStatus(campaignId: string, status: string) {
  const { data } = await api.patch<{ success: boolean }>(`/campaigns/${campaignId}`, { status });
  return data;
}

export async function uploadContent(formData: FormData) {
  const { data } = await api.post("/content/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function sendMessage(payload: { campaignId: string; receiverId: string; content: string }) {
  const { data } = await api.post("/messages", payload);
  return data;
}

export async function fetchMessages(campaignId: string) {
  const { data } = await api.get(`/messages/${campaignId}`);
  return data;
}

export async function fetchPayments() {
  const { data } = await api.get("/payments");
  return data;
}

export async function withdrawPayment(amount: number) {
  const { data } = await api.post("/payments/withdraw", { amount });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get("/users/me");
  return data;
}

export async function updateMe(payload: Record<string, unknown>) {
  const { data } = await api.put("/users/update", payload);
  return data;
}
