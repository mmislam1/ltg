"use client";

import {
  Check,
  ChefHat,
  ClipboardList,
  FileClock,
  MailCheck,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import api, { getApiError } from "../store/api";
import { approveFood, deleteFood, type Food } from "../store/features/foodSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

interface Member {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  purchased: boolean;
  purchasedAt: string | null;
  joinedAt: string;
}

interface DashboardData {
  summary: {
    totalMembers: number;
    purchasedMembers: number;
    pendingPdfRequests: number;
    pendingFoods: number;
    pendingRecipes: number;
  };
  members: Member[];
  newMembersByMonth: Array<{ month: string; label: string; count: number }>;
}

interface PendingPdfRequest {
  id: string;
  date: string;
  status: "pending";
  requestedAt: string;
  user: { id: string; name: string; email: string };
}

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value))
    : "-";

export default function AdminPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, initialized } = useAppSelector((state) => state.auth);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [submissions, setSubmissions] = useState<Food[]>([]);
  const [pdfRequests, setPdfRequests] = useState<PendingPdfRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState("");

  useEffect(() => {
    if (!initialized) return;
    if (!user) router.replace("/auth/signin");
    else if (user.role !== "admin") router.replace("/");
  }, [initialized, router, user]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardResponse, submissionsResponse, pdfResponse] = await Promise.all([
        api.get<DashboardData>("/admin/dashboard"),
        api.get<Food[]>("/foods/pending"),
        api.get<PendingPdfRequest[]>("/diet-chart-exports/requests"),
      ]);
      setDashboard(dashboardResponse.data);
      setSubmissions(submissionsResponse.data);
      setPdfRequests(pdfResponse.data);
    } catch (requestError) {
      const message = getApiError(requestError, "Unable to load the admin dashboard.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialized && user?.role === "admin") void loadDashboard();
  }, [initialized, loadDashboard, user?.role]);

  const setBusy = (id: string, busy: boolean) => {
    setBusyIds((current) => busy ? [...current, id] : current.filter((item) => item !== id));
  };

  const approveSubmission = async (submission: Food) => {
    setBusy(submission.id, true);
    try {
      const approved = await dispatch(approveFood(submission.id)).unwrap();
      setSubmissions((current) => current.filter((item) => item.id !== submission.id));
      setDashboard((current) => current ? {
        ...current,
        summary: {
          ...current.summary,
          [submission.kind === "recipe" ? "pendingRecipes" : "pendingFoods"]:
            Math.max(0, current.summary[submission.kind === "recipe" ? "pendingRecipes" : "pendingFoods"] - 1),
        },
      } : current);
      toast.success(`${approved.name} has been approved and is available to all members.`);
    } catch (requestError) {
      toast.error(typeof requestError === "string" ? requestError : getApiError(requestError, "Unable to approve this submission."));
    } finally {
      setBusy(submission.id, false);
    }
  };

  const approvePdf = async (request: PendingPdfRequest) => {
    setBusy(request.id, true);
    try {
      const { data } = await api.patch<{ message: string; sentTo?: string }>(`/diet-chart-exports/requests/${request.id}/approve`);
      setPdfRequests((current) => current.filter((item) => item.id !== request.id));
      setDashboard((current) => current ? {
        ...current,
        summary: { ...current.summary, pendingPdfRequests: Math.max(0, current.summary.pendingPdfRequests - 1) },
      } : current);
      toast.success(data.sentTo ? `${data.message} Sent to ${data.sentTo}.` : data.message || `PDF sent to ${request.user.email}.`);
    } catch (requestError) {
      toast.error(getApiError(requestError, "Unable to approve and send this PDF."));
    } finally {
      setBusy(request.id, false);
    }
  };

  const deletePdfRequest = async (request: PendingPdfRequest) => {
    setBusy(request.id, true);
    try {
      await api.delete(`/diet-chart-exports/requests/${request.id}`);
      setPdfRequests((current) => current.filter((item) => item.id !== request.id));
      setDashboard((current) => current ? {
        ...current,
        summary: { ...current.summary, pendingPdfRequests: Math.max(0, current.summary.pendingPdfRequests - 1) },
      } : current);
      toast.success(`PDF request from ${request.user.name} was deleted.`);
    } catch (requestError) {
      toast.error(getApiError(requestError, "Unable to delete this PDF request."));
    } finally {
      setBusy(request.id, false);
    }
  };

  const deleteSubmission = async (submission: Food) => {
    setBusy(submission.id, true);
    try {
      await dispatch(deleteFood(submission.id)).unwrap();
      setSubmissions((current) => current.filter((item) => item.id !== submission.id));
      setDashboard((current) => current ? {
        ...current,
        summary: {
          ...current.summary,
          [submission.kind === "recipe" ? "pendingRecipes" : "pendingFoods"]:
            Math.max(0, current.summary[submission.kind === "recipe" ? "pendingRecipes" : "pendingFoods"] - 1),
        },
      } : current);
      toast.success(`${submission.name} approval request was deleted.`);
    } catch (requestError) {
      toast.error(typeof requestError === "string" ? requestError : getApiError(requestError, "Unable to delete this submission."));
    } finally {
      setBusy(submission.id, false);
    }
  };

  const togglePurchased = async (member: Member) => {
    setBusy(member.id, true);
    try {
      const { data } = await api.patch<Member>(`/admin/members/${member.id}/purchase`, {
        purchased: !member.purchased,
      });
      setDashboard((current) => current ? {
        ...current,
        summary: {
          ...current.summary,
          purchasedMembers: Math.max(0, current.summary.purchasedMembers + (data.purchased ? 1 : -1)),
        },
        members: current.members.map((item) => item.id === data.id ? data : item),
      } : current);
      toast.success(data.purchased ? `${data.name} was marked as purchased.` : `${data.name}'s purchase tag was removed.`);
    } catch (requestError) {
      toast.error(getApiError(requestError, "Unable to update the purchase tag."));
    } finally {
      setBusy(member.id, false);
    }
  };

  const membersById = useMemo(
    () => new Map(dashboard?.members.map((member) => [member.id, member]) ?? []),
    [dashboard?.members],
  );
  const filteredMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();
    if (!query) return dashboard?.members ?? [];
    return dashboard?.members.filter((member) =>
      `${member.name} ${member.email}`.toLowerCase().includes(query),
    ) ?? [];
  }, [dashboard?.members, memberSearch]);

  if (!initialized || !user || user.role !== "admin") {
    return <div className="flex min-h-[55vh] items-center justify-center text-sm text-muted">Checking admin access...</div>;
  }

  return (
    <div className="w-full bg-canvas pb-12">
      <div className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-6 sm:py-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Operations</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Admin control center</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Approve member requests, track purchases, and keep an eye on community growth.</p>
          </div>
          <button type="button" className="btn btn-secondary self-start" onClick={() => void loadDashboard()} disabled={loading}>
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </header>

        {loading && !dashboard ? (
          <div className="card flex min-h-72 items-center justify-center text-sm text-muted">Loading admin data...</div>
        ) : dashboard ? (
          <>
            <section aria-label="Admin summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <SummaryCard icon={Users} label="Members" value={dashboard.summary.totalMembers} />
              <SummaryCard icon={ShoppingBag} label="Purchased" value={dashboard.summary.purchasedMembers} />
              <SummaryCard icon={FileClock} label="PDF requests" value={dashboard.summary.pendingPdfRequests} attention={dashboard.summary.pendingPdfRequests > 0} />
              <SummaryCard icon={Sparkles} label="Meal additions" value={dashboard.summary.pendingFoods} attention={dashboard.summary.pendingFoods > 0} />
              <SummaryCard icon={ChefHat} label="Recipes" value={dashboard.summary.pendingRecipes} attention={dashboard.summary.pendingRecipes > 0} />
            </section>

            <section className="card mt-6 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-active">
                    <ClipboardList size={21} />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Library</p>
                    <h2 className="mt-1 text-xl font-bold text-ink">Manage foods</h2>
                    <p className="mt-1 text-sm text-muted">Edit, delete, approve, or cancel approval for foods and recipes.</p>
                  </div>
                </div>
                <button type="button" className="btn btn-primary self-start sm:self-center" onClick={() => router.push("/foodList/manage")}>
                  <ChefHat size={17} /> Open food list
                </button>
              </div>
            </section>

            <section className="card mt-6 p-4 sm:p-6">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Growth</p>
                <h2 className="mt-1 text-xl font-bold text-ink">New members subscribed each month</h2>
                <p className="mt-1 text-sm text-muted">New accounts created during the last 12 months.</p>
              </div>
              <div className="h-72 w-full" aria-label="Monthly new member chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboard.newMembersByMonth} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="memberGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--theme-primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--theme-primary)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--theme-border)" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: "var(--theme-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: "var(--theme-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ border: "1px solid var(--theme-border)", borderRadius: 10, fontSize: 12 }} formatter={(value) => [Number(value), "New members"]} />
                    <Area type="monotone" dataKey="count" stroke="var(--theme-primary)" strokeWidth={3} fill="url(#memberGrowth)" activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <ApprovalSection title="PDF email requests" subtitle="Approval generates the PDF and emails it to the member." count={pdfRequests.length}>
                {pdfRequests.map((request) => (
                  <div key={request.id} className="flex flex-col gap-3 border-t border-line px-4 py-4 first:border-t-0 sm:px-5">
                    <div className="min-w-0">
                      <p className="font-bold text-ink">{request.user.name}</p>
                      <p className="mt-1 truncate text-xs text-muted">{request.user.email}</p>
                      <p className="mt-1 text-xs text-muted">Chart date: {formatDate(request.date)} · Requested {formatDate(request.requestedAt)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="btn btn-primary btn-sm self-start" disabled={busyIds.includes(request.id)} onClick={() => void approvePdf(request)}>
                        <MailCheck size={16} /> {busyIds.includes(request.id) ? "Sending..." : "Approve and email"}
                      </button>
                      <button type="button" className="btn btn-danger btn-sm self-start" disabled={busyIds.includes(request.id)} onClick={() => void deletePdfRequest(request)}>
                        <Trash2 size={16} /> Delete request
                      </button>
                    </div>
                  </div>
                ))}
                {pdfRequests.length === 0 && <EmptyState text="No PDF requests are waiting." />}
              </ApprovalSection>

              <ApprovalSection title="Meal and recipe additions" subtitle="Approved items become available to all members." count={submissions.length}>
                {submissions.map((submission) => {
                  const submitter = membersById.get(submission.addedBy);
                  return (
                    <div key={submission.id} className="flex flex-col gap-3 border-t border-line px-4 py-4 first:border-t-0 sm:px-5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-brand-soft px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-brand-active">{submission.kind === "recipe" ? "Recipe" : "Meal"}</span>
                          <p className="truncate font-bold text-ink">{submission.name}</p>
                        </div>
                        <p className="mt-2 text-xs text-muted">{Math.round(submission.nutrition.calories)} kcal · {submission.nutrition.protein.toFixed(1)} g protein · per {submission.nutritionPer} {submission.unit}</p>
                        <p className="mt-1 truncate text-xs text-muted">Submitted by {submitter ? `${submitter.name} (${submitter.email})` : submission.addedBy}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="btn btn-primary btn-sm self-start" disabled={busyIds.includes(submission.id)} onClick={() => void approveSubmission(submission)}>
                          <Check size={16} /> {busyIds.includes(submission.id) ? "Approving..." : "Approve"}
                        </button>
                        <button type="button" className="btn btn-danger btn-sm self-start" disabled={busyIds.includes(submission.id)} onClick={() => void deleteSubmission(submission)}>
                          <Trash2 size={16} /> Delete request
                        </button>
                      </div>
                    </div>
                  );
                })}
                {submissions.length === 0 && <EmptyState text="No meal or recipe additions are waiting." />}
              </ApprovalSection>
            </div>

            <section className="card mt-6 overflow-hidden">
              <div className="flex flex-col gap-4 border-b border-line p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Members</p>
                  <h2 className="mt-1 text-xl font-bold text-ink">Manual purchase tracking</h2>
                  <p className="mt-1 text-sm text-muted">Tag purchases here after handling payment outside the app.</p>
                </div>
                <label className="relative w-full sm:w-72">
                  <span className="sr-only">Search members</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
                  <input className="form-control !pl-10" placeholder="Search name or email" value={memberSearch} onChange={(event) => setMemberSearch(event.target.value)} />
                </label>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-canvas text-xs uppercase tracking-wide text-muted">
                    <tr><th className="px-5 py-3">Member</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Purchase</th></tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredMembers.map((member) => (
                      <tr key={member.id}>
                        <td className="px-5 py-4"><p className="font-bold text-ink">{member.name}</p><p className="mt-1 text-xs text-muted">{member.email}</p></td>
                        <td className="px-5 py-4 text-muted">{formatDate(member.joinedAt)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${member.purchased ? "bg-brand-soft text-brand-active" : "bg-canvas text-muted"}`}>
                            {member.purchased ? `Purchased ${formatDate(member.purchasedAt)}` : "Not purchased"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button type="button" className={`btn btn-sm ${member.purchased ? "btn-secondary" : "btn-primary"}`} disabled={busyIds.includes(member.id)} onClick={() => void togglePurchased(member)}>
                            <ShoppingBag size={15} /> {busyIds.includes(member.id) ? "Saving..." : member.purchased ? "Remove tag" : "Mark purchased"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredMembers.length === 0 && <EmptyState text="No members match your search." />}
              </div>
            </section>
          </>
        ) : (
          <div className="card flex min-h-72 items-center justify-center px-5 text-center text-sm text-muted">
            {error || "Unable to load admin data."}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, attention = false }: { icon: typeof Users; label: string; value: number; attention?: boolean }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${attention ? "bg-amber-100 text-amber-700" : "bg-brand-soft text-brand-active"}`}><Icon size={19} /></span>
      <div><p className="text-2xl font-bold text-ink">{value}</p><p className="text-xs text-muted">{label}</p></div>
    </div>
  );
}

function ApprovalSection({ title, subtitle, count, children }: { title: string; subtitle: string; count: number; children: React.ReactNode }) {
  return (
    <section className="card overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-line p-4 sm:p-5">
        <div><h2 className="text-lg font-bold text-ink">{title}</h2><p className="mt-1 text-xs leading-5 text-muted">{subtitle}</p></div>
        <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand-active">{count}</span>
      </div>
      <div className="max-h-[28rem] overflow-y-auto">{children}</div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="px-5 py-10 text-center text-sm text-muted">{text}</p>;
}
