"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-[#111110] px-6"
      style={{ fontFamily: "var(--font-aspekta)" }}
    >
      <div className="flex w-full max-w-[480px] flex-col items-start">
        {/* Kaizen wordmark */}
        <div className="kaizen-enter-1 mb-16">
          <span className="text-sm font-medium tracking-[0.08em] uppercase text-[#e85325]">
            Kaizen
          </span>
        </div>

        {sent ? (
          /* ── Email sent confirmation ── */
          <>
            <h1 className="kaizen-enter-2 text-[clamp(2rem,1.14vw+1.72rem,3rem)] font-light leading-[1.1] tracking-[-0.03em] text-[#faf9f7]">
              Check your inbox
            </h1>

            <div className="kaizen-enter-fade mt-8 mb-6 h-px w-full overflow-hidden">
              <div className="kaizen-line h-full bg-[#e85325]/30" />
            </div>

            <p className="kaizen-enter-3 text-[clamp(1rem,0.07vw+0.98rem,1.0625rem)] leading-[1.7] text-[#faf9f7]/55">
              We sent a login link to{" "}
              <span className="text-[#faf9f7]/80">{email}</span>.
              {" "}Click it to access your project portal. The link expires in 15 minutes.
            </p>

            <button
              onClick={() => setSent(false)}
              className="kaizen-enter-4 group mt-10 inline-flex items-center gap-3 text-[clamp(1rem,0.07vw+0.98rem,1.0625rem)] text-[#faf9f7] transition-colors duration-200"
            >
              <svg
                className="h-4 w-4 text-[#e85325] transition-transform duration-300 group-hover:-translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <span className="relative">
                Use a different email
                <span className="absolute inset-x-0 -bottom-0.5 h-px bg-[#e85325] transition-transform duration-300 origin-right scale-x-100 group-hover:scale-x-0" />
              </span>
            </button>
          </>
        ) : (
          /* ── Login form ── */
          <>
            <h1 className="kaizen-enter-2 text-[clamp(2rem,1.14vw+1.72rem,3rem)] font-light leading-[1.1] tracking-[-0.03em] text-[#faf9f7]">
              Welcome back
            </h1>

            <div className="kaizen-enter-fade mt-8 mb-6 h-px w-full overflow-hidden">
              <div className="kaizen-line h-full bg-[#e85325]/30" />
            </div>

            <p className="kaizen-enter-3 mb-10 text-[clamp(1rem,0.07vw+0.98rem,1.0625rem)] leading-[1.7] text-[#faf9f7]/55">
              Sign in to view your project status and deliverables.
            </p>

            <form onSubmit={handleSubmit} className="kaizen-enter-4 w-full">
              <div className="relative">
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full border-0 border-b border-[#faf9f7]/15 bg-transparent px-0 py-3 text-[clamp(1rem,0.07vw+0.98rem,1.0625rem)] text-[#faf9f7] placeholder-[#faf9f7]/25 outline-none transition-colors duration-300 focus:border-[#e85325]/60"
                  style={{ fontFamily: "var(--font-aspekta)" }}
                />
              </div>

              {error && (
                <p className="mt-4 text-sm text-[#e85325]/80">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="mt-8 inline-flex items-center gap-3 text-[clamp(1rem,0.07vw+0.98rem,1.0625rem)] text-[#faf9f7] transition-all duration-200 disabled:opacity-30"
              >
                <span className="relative">
                  {loading ? "Sending..." : "Send login link"}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px bg-[#e85325] transition-transform duration-300 origin-left scale-x-100 group-hover:scale-x-0" />
                </span>
                {!loading && (
                  <svg
                    className="h-4 w-4 text-[#e85325]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                )}
              </button>
            </form>
          </>
        )}

        {/* Footer contact */}
        <p className="kaizen-enter-fade mt-24 text-[clamp(0.8125rem,0.07vw+0.80rem,0.875rem)] leading-[1.5] text-[#faf9f7]/30">
          First time here? Ask your project lead to invite you, or email{" "}
          <a
            href="mailto:hello@hi-kaizen.com"
            className="text-[#faf9f7]/40 transition-colors duration-200 hover:text-[#e85325]"
          >
            hello@hi-kaizen.com
          </a>
        </p>
      </div>
    </div>
  );
}
