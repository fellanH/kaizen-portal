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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  CreditCard,
  Bell,
  ExternalLink,
  Receipt,
  Mail,
  Users,
  UserPlus,
  Trash2,
} from "lucide-react";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function PaymentStatusBadge({ status }: { status: Payment["status"] }) {
  const variant =
    status === "succeeded"
      ? "default"
      : status === "pending"
        ? "secondary"
        : "destructive";
  return <Badge variant={variant}>{status}</Badge>;
}

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-4 w-4" />
          Payment History
        </CardTitle>
        <CardDescription>
          View your invoices and download receipts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Receipt className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No payments yet. Payments will appear here once invoiced.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-muted-foreground">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{payment.description}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(payment.amount, payment.currency)}
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell>
                    {payment.receipt_url && (
                      <a
                        href={payment.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

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
      .catch(() => {})
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-5 w-9 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose which email notifications you receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-4"
          >
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{item.label}</p>
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
      </CardContent>
    </Card>
  );
}

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
      .catch(() => {})
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Team Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (projects.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          Team Access
        </CardTitle>
        <CardDescription>
          Invite collaborators to view your projects
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.map((project) => {
          const projectCollabs = collabs[project.token] || [];
          const isOwner = project.contact_email === email;
          return (
            <div key={project.token} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{project.company_name}</p>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInviteToken(project.token)}
                        />
                      }
                    >
                      <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                      Invite
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Invite to {project.company_name}
                        </DialogTitle>
                        <DialogDescription>
                          Send a magic link to a collaborator. They will get
                          read-only access to this project.
                        </DialogDescription>
                      </DialogHeader>
                      <Input
                        type="email"
                        placeholder="colleague@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleInvite();
                        }}
                      />
                      <DialogFooter>
                        <Button
                          onClick={handleInvite}
                          disabled={!inviteEmail.trim() || inviting}
                        >
                          {inviting ? "Sending..." : "Send invite"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              {projectCollabs.length > 0 ? (
                <div className="space-y-1">
                  {projectCollabs.map((c) => (
                    <div
                      key={c.email}
                      className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{c.email}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {c.role}
                        </Badge>
                      </div>
                      {isOwner && c.role !== "owner" && (
                        <button
                          onClick={() =>
                            handleRemove(project.token, c.email)
                          }
                          className="text-muted-foreground transition-colors hover:text-destructive"
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
      </CardContent>
    </Card>
  );
}

export default function AccountPage() {
  const { email, logout } = useAuth();

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-bold">Account</h1>

      <div className="max-w-2xl space-y-6">
        <Card className="animate-stagger-up">
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">{email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="animate-stagger-up" style={{ animationDelay: "80ms" }}>
          <PaymentHistorySection />
        </div>

        <div className="animate-stagger-up" style={{ animationDelay: "160ms" }}>
          <NotificationPreferencesSection />
        </div>

        <div className="animate-stagger-up" style={{ animationDelay: "240ms" }}>
          <TeamAccessSection />
        </div>

        <Card className="animate-stagger-up" style={{ animationDelay: "320ms" }}>
          <CardHeader>
            <CardTitle className="text-base">Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Need help? Reach out to us at{" "}
              <a
                href="mailto:hello@hi-kaizen.com"
                className="text-primary hover:underline"
              >
                hello@hi-kaizen.com
              </a>
            </p>
          </CardContent>
        </Card>

        <Separator />

        <Button variant="destructive" onClick={logout}>
          Log out
        </Button>
      </div>
    </div>
  );
}
