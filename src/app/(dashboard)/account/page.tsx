"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  api,
  type Payment,
  type NotificationPreferences,
  type Project,
  type Collaborator,
} from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ExternalLink, Trash2 } from "lucide-react";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

/* ── Payment History ── */
function PaymentHistorySection() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getPayments()
      .then((data) => setPayments(data.payments))
      .catch(() => toast.error("Failed to load payment history"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-4 w-20 ds-skeleton" />
            <div className="h-4 w-32 flex-1 ds-skeleton" />
            <div className="h-4 w-16 ds-skeleton" />
          </div>
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <p className="py-6 text-sm text-muted-foreground">
        No payments yet. Payments will appear here once invoiced.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60">
            <th className="pb-3 text-left text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
              Date
            </th>
            <th className="pb-3 text-left text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
              Description
            </th>
            <th className="pb-3 text-left text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
              Amount
            </th>
            <th className="pb-3 text-left text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
              Status
            </th>
            <th className="w-10 pb-3" />
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr
              key={payment.id}
              className="border-b border-border/30 last:border-0"
            >
              <td className="py-3 text-muted-foreground">
                {new Date(payment.created_at).toLocaleDateString()}
              </td>
              <td className="py-3">{payment.description}</td>
              <td className="py-3 font-medium">
                {formatCurrency(payment.amount, payment.currency)}
              </td>
              <td className="py-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    payment.status === "succeeded"
                      ? "status-emerald"
                      : payment.status === "pending"
                        ? "status-neutral"
                        : "status-red"
                  }`}
                >
                  <span
                    className={`h-1 w-1 rounded-full ${
                      payment.status === "succeeded"
                        ? "bg-emerald-500"
                        : payment.status === "pending"
                          ? "bg-muted-foreground/60"
                          : "bg-red-500"
                    }`}
                  />
                  {payment.status}
                </span>
              </td>
              <td className="py-3">
                {payment.receipt_url && (
                  <a
                    href={payment.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Notification Preferences ── */
function NotificationPreferencesSection() {
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    stage_changes: true,
    messages: true,
    weekly_summary: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .getPreferences()
      .then((data) => setPrefs(data.preferences))
      .catch(() => toast.error("Failed to load preferences"))
      .finally(() => setLoading(false));
  }, []);

  const toggle = useCallback(
    async (key: keyof NotificationPreferences) => {
      const newVal = !prefs[key];
      const prev = { ...prefs };
      setPrefs((p) => ({ ...p, [key]: newVal }));
      setSaving(true);
      try {
        const result = await api.updatePreferences({ [key]: newVal });
        setPrefs(result.preferences);
        toast.success("Preferences updated");
      } catch {
        setPrefs(prev);
        toast.error("Failed to update preferences");
      } finally {
        setSaving(false);
      }
    },
    [prefs]
  );

  const items: {
    key: keyof NotificationPreferences;
    label: string;
    description: string;
  }[] = [
    {
      key: "stage_changes",
      label: "Stage changes",
      description: "Get notified when your project moves to a new stage",
    },
    {
      key: "messages",
      label: "New messages",
      description: "Get notified when Kaizen sends you a message",
    },
    {
      key: "weekly_summary",
      label: "Weekly summary",
      description: "Receive a weekly email with project status overview",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-4 w-28 ds-skeleton" />
              <div className="h-3 w-48 ds-skeleton" />
            </div>
            <div className="h-5 w-9 rounded-full ds-skeleton" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {items.map((item) => (
        <div
          key={item.key}
          className="flex items-center justify-between gap-4"
        >
          <div className="space-y-0.5">
            <p className="text-sm font-light">{item.label}</p>
            <p className="text-xs text-muted-foreground">
              {item.description}
            </p>
          </div>
          <Switch
            checked={prefs[item.key]}
            onCheckedChange={() => toggle(item.key)}
            disabled={saving}
          />
        </div>
      ))}
    </div>
  );
}

/* ── Team Access ── */
function TeamAccessSection() {
  const { email } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [collabs, setCollabs] = useState<Record<string, Collaborator[]>>({});
  const [loading, setLoading] = useState(true);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    api
      .getMyProjects()
      .then(async (data) => {
        setProjects(data.projects);
        const collabMap: Record<string, Collaborator[]> = {};
        await Promise.all(
          data.projects.map(async (p) => {
            try {
              const res = await api.getCollaborators(p.token);
              collabMap[p.token] = res.collaborators;
            } catch {
              collabMap[p.token] = [];
            }
          })
        );
        setCollabs(collabMap);
      })
      .catch(() => toast.error("Failed to load team access"))
      .finally(() => setLoading(false));
  }, []);

  const handleInvite = async () => {
    if (!inviteToken || !inviteEmail.trim()) return;
    setInviting(true);
    try {
      await api.inviteCollaborator(inviteToken, inviteEmail.trim(), "viewer");
      toast.success(`Invite sent to ${inviteEmail}`);
      const res = await api.getCollaborators(inviteToken);
      setCollabs((prev) => ({ ...prev, [inviteToken]: res.collaborators }));
      setInviteEmail("");
      setInviteToken(null);
    } catch {
      toast.error("Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (token: string, collabEmail: string) => {
    try {
      await api.removeCollaborator(token, collabEmail);
      setCollabs((prev) => ({
        ...prev,
        [token]: (prev[token] || []).filter((c) => c.email !== collabEmail),
      }));
      toast.success(`Removed ${collabEmail}`);
    } catch {
      toast.error("Failed to remove collaborator");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 ds-skeleton" />
            <div className="h-4 w-48 ds-skeleton" />
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) return null;

  return (
    <div className="space-y-5">
      {projects.map((project) => {
        const projectCollabs = collabs[project.token] || [];
        const isOwner = project.contact_email === email;
        return (
          <div key={project.token} className="space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-light">{project.company_name}</p>
              {isOwner && (
                <Dialog
                  open={inviteToken === project.token}
                  onOpenChange={(open) => {
                    if (!open) {
                      setInviteToken(null);
                      setInviteEmail("");
                    }
                  }}
                >
                  <DialogTrigger
                    render={
                      <button
                        onClick={() => setInviteToken(project.token)}
                        className="group inline-flex items-center text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      />
                    }
                  >
                    <span className="relative">
                      Invite
                      <span className="absolute inset-x-0 -bottom-px h-px bg-primary/40 transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100" />
                    </span>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-light tracking-[-0.02em]">
                        Invite to {project.company_name}
                      </DialogTitle>
                      <DialogDescription>
                        Send a magic link to a collaborator. They will get
                        read-only access to this project.
                      </DialogDescription>
                    </DialogHeader>
                    <input
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleInvite();
                      }}
                      className="w-full border-0 border-b border-border/60 bg-transparent px-0 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-colors duration-300 focus:border-primary/60"
                      style={{ fontFamily: "var(--font-aspekta)" }}
                    />
                    <DialogFooter>
                      <button
                        onClick={handleInvite}
                        disabled={!inviteEmail.trim() || inviting}
                        className="group inline-flex items-center gap-2 text-sm text-foreground transition-all duration-200 disabled:opacity-30"
                      >
                        <span className="relative">
                          {inviting ? "Sending..." : "Send invite"}
                          <span className="absolute inset-x-0 -bottom-0.5 h-px bg-primary" />
                        </span>
                      </button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            {projectCollabs.length > 0 ? (
              <div className="space-y-1.5">
                {projectCollabs.map((c) => (
                  <div
                    key={c.email}
                    className="flex items-center justify-between rounded-lg border border-border/40 px-4 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">{c.email}</span>
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium status-neutral">
                        {c.role}
                      </span>
                    </div>
                    {isOwner && c.role !== "owner" && (
                      <button
                        onClick={() =>
                          handleRemove(project.token, c.email)
                        }
                        className="text-muted-foreground/60 transition-colors duration-200 hover:text-foreground"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No collaborators yet
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Section wrapper ── */
function Section({
  label,
  title,
  children,
  delay = 0,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div className="ds-section" style={{ animationDelay: `${delay}ms` }}>
      <div className="ds-rule mb-6" />
      <p className="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
        {label}
      </p>
      <h2 className="mt-1 mb-5 text-lg font-light tracking-[-0.02em]">{title}</h2>
      {children}
    </div>
  );
}

/* ── Main Page ── */
export default function AccountPage() {
  const { email, logout } = useAuth();

  const initials = email
    ? email
        .split("@")[0]
        .split(/[._-]/)
        .map((s) => s[0]?.toUpperCase() || "")
        .join("")
        .slice(0, 2)
    : "?";

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 sm:px-8 sm:py-14">
      {/* Page header */}
      <div className="kaizen-enter-1 space-y-4">
        <div>
          <p
            className="text-[0.6rem] font-medium uppercase text-muted-foreground/60"
            style={{ letterSpacing: "0.08em" }}
          >
            Settings
          </p>
          <h1
            className="mt-1 text-[clamp(1.75rem,1.14vw+1.5rem,2.5rem)] font-light tracking-tight text-foreground"
            style={{ letterSpacing: "-0.03em", lineHeight: "1.1" }}
          >
            Account
          </h1>
        </div>
        <div className="kaizen-line h-px bg-border" />
      </div>

      {/* Content */}
      <div className="mt-10 space-y-10">
        {/* Profile */}
        <div className="ds-section">
          <div className="ds-rule mb-6" />
          <p className="text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
            Profile
          </p>
          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              {initials}
            </div>
            <div>
              <p className="text-sm font-light">{email?.split("@")[0]}</p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
        </div>

        <Section label="Billing" title="Payment History" delay={80}>
          <PaymentHistorySection />
        </Section>

        <Section label="Preferences" title="Notifications" delay={160}>
          <NotificationPreferencesSection />
        </Section>

        <Section label="Collaboration" title="Team Access" delay={240}>
          <TeamAccessSection />
        </Section>

        <Section label="Help" title="Support" delay={320}>
          <p className="text-sm leading-[1.7] text-muted-foreground">
            Need help? Reach out to us at{" "}
            <a
              href="mailto:hello@hi-kaizen.com"
              className="group inline-flex items-center text-foreground transition-colors duration-200"
            >
              <span className="relative">
                hello@hi-kaizen.com
                <span className="absolute inset-x-0 -bottom-px h-px bg-primary/40 transition-transform duration-300 origin-left scale-x-100 group-hover:scale-x-0" />
              </span>
            </a>
          </p>
        </Section>

        {/* Logout */}
        <div className="ds-section border-t border-border/40 pt-8" style={{ animationDelay: "400ms" }}>
          <button
            onClick={logout}
            className="group inline-flex items-center text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <span className="relative">
              Log out
              <span className="absolute inset-x-0 -bottom-px h-px bg-muted-foreground/30 transition-colors duration-200 group-hover:bg-primary" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
