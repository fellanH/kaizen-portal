"use client";

import { useState } from "react";

interface DomainCheckProps {
  targetHost: string;
  projectToken: string;
}

type CheckState =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "connected" }
  | { kind: "wrong"; actual: string }
  | { kind: "not-found"; domain: string }
  | { kind: "error" };

function cleanDomain(input: string): string {
  let d = input.trim();
  d = d.replace(/^https?:\/\//, "");
  d = d.replace(/\/.*$/, "");
  return d.toLowerCase();
}

export function ProjectDomainCheck({ targetHost, projectToken }: DomainCheckProps) {
  const [domain, setDomain] = useState("");
  const [state, setState] = useState<CheckState>({ kind: "idle" });
  const [cooldown, setCooldown] = useState(false);

  async function checkDns() {
    const cleaned = cleanDomain(domain);
    if (!cleaned) return;

    setState({ kind: "checking" });
    setCooldown(true);
    setTimeout(() => setCooldown(false), 3000);

    // Check the domain itself, and if it starts with www also check without (and vice versa)
    const domains = [cleaned];
    if (cleaned.startsWith("www.")) {
      domains.push(cleaned.slice(4));
    } else {
      domains.push(`www.${cleaned}`);
    }

    try {
      for (const d of domains) {
        const res = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(d)}&type=CNAME`,
          { headers: { Accept: "application/dns-json" } }
        );
        const data = await res.json();

        if (data.Answer && Array.isArray(data.Answer)) {
          const cnameEntries = data.Answer.filter(
            (a: { type: number }) => a.type === 5
          );
          if (cnameEntries.length > 0) {
            // Check if any CNAME in the chain points to the target
            const target = targetHost.replace(/\.$/, "").toLowerCase();
            const match = cnameEntries.some((entry: { data: string }) => {
              const entryData = entry.data.replace(/\.$/, "").toLowerCase();
              return entryData === target || entryData.endsWith(`.${target}`);
            });

            if (match) {
              setState({ kind: "connected" });
              return;
            }

            // CNAME exists but points elsewhere
            const actual = cnameEntries[cnameEntries.length - 1].data.replace(/\.$/, "");
            setState({ kind: "wrong", actual });
            return;
          }
        }
      }

      // No CNAME found on any variant
      setState({ kind: "not-found", domain: cleaned });
    } catch {
      setState({ kind: "error" });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Enter your domain (e.g. example.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="flex-1 border-0 border-b border-border/60 bg-transparent px-0 py-2 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-colors duration-300 focus:border-primary/60"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (!cooldown && domain.trim()) checkDns();
            }
          }}
        />
        <button
          onClick={checkDns}
          disabled={cooldown || !domain.trim() || state.kind === "checking"}
          className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:border-primary/30 hover:bg-primary/[0.03] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {state.kind === "checking" ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
              Checking
            </>
          ) : (
            "Check DNS"
          )}
        </button>
      </div>

      {/* Result states */}
      {state.kind === "connected" && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Your domain is connected</p>
            <p className="text-xs text-muted-foreground">SSL certificate will be ready within minutes.</p>
          </div>
        </div>
      )}

      {state.kind === "wrong" && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.05] p-4">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">CNAME points to the wrong target</p>
            <p className="text-xs text-muted-foreground">
              Your domain has a CNAME record pointing to <code className="rounded bg-muted/50 px-1 py-0.5 text-foreground/80">{state.actual}</code>.
              Update it to point to <code className="rounded bg-muted/50 px-1 py-0.5 text-foreground/80">{targetHost}</code>.
            </p>
          </div>
        </div>
      )}

      {state.kind === "not-found" && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.05] p-4">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">No CNAME record found</p>
            <p className="text-xs text-muted-foreground">
              No CNAME record found for <code className="rounded bg-muted/50 px-1 py-0.5 text-foreground/80">{state.domain}</code> yet. DNS changes can take up to 48 hours to propagate.
            </p>
            <button
              onClick={checkDns}
              disabled={cooldown}
              className="text-xs text-primary transition-colors duration-200 hover:text-primary/80 disabled:opacity-40"
            >
              Check again
            </button>
          </div>
        </div>
      )}

      {state.kind === "error" && (
        <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-4">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Could not check DNS</p>
            <p className="text-xs text-muted-foreground">This might be a network issue. Try again or contact us.</p>
          </div>
        </div>
      )}
    </div>
  );
}
