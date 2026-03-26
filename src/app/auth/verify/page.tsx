"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verify } = useAuth();
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const didVerify = useRef(false);

  useEffect(() => {
    if (didVerify.current) return;
    const token = searchParams.get("token");
    if (!token) {
      setError(true);
      setVerifying(false);
      return;
    }

    didVerify.current = true;
    verify(token).then((success) => {
      if (success) {
        router.push("/projects");
      } else {
        setError(true);
      }
      setVerifying(false);
    });
  }, [searchParams, verify, router]);

  if (verifying) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#111110]">
        <div className="flex flex-col items-center gap-8">
          {/* Spinner */}
          <div className="relative h-10 w-10">
            <div
              className="absolute inset-0 rounded-full border-2 border-[#e85325]/20"
            />
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#e85325]"
              style={{ animation: "kaizen-spinner 1s cubic-bezier(0.65, 0, 0.35, 1) infinite" }}
            />
          </div>
          <p
            className="text-sm tracking-[0.08em] uppercase text-[#faf9f7]/50"
            style={{ fontFamily: "var(--font-aspekta)" }}
          >
            Verifying your link
          </p>
        </div>
      </div>
    );
  }

  if (error) {
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

          {/* Heading: light weight, tight tracking, large */}
          <h1
            className="kaizen-enter-2 text-[clamp(2rem,1.14vw+1.72rem,3rem)] font-light leading-[1.1] tracking-[-0.03em] text-[#faf9f7]"
          >
            This link has expired
          </h1>

          {/* Decorative rule */}
          <div className="kaizen-enter-fade mt-8 mb-6 h-px w-full overflow-hidden">
            <div className="kaizen-line h-full bg-[#e85325]/30" />
          </div>

          {/* Body text */}
          <p className="kaizen-enter-3 text-[clamp(1rem,0.07vw+0.98rem,1.0625rem)] leading-[1.7] text-[#faf9f7]/55">
            Login links are single-use and expire after 15 minutes.
            Request a new one below to access your project portal.
          </p>

          {/* CTA */}
          <Link
            href="/login"
            className="kaizen-enter-4 group mt-10 inline-flex items-center gap-3 text-[clamp(1rem,0.07vw+0.98rem,1.0625rem)] text-[#faf9f7] transition-colors duration-200"
          >
            <span className="relative">
              Request a new link
              <span className="absolute inset-x-0 -bottom-0.5 h-px bg-[#e85325] transition-transform duration-300 origin-left scale-x-100 group-hover:scale-x-0" />
            </span>
            <svg
              className="h-4 w-4 text-[#e85325] transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          {/* Footer note */}
          <p className="kaizen-enter-fade mt-24 text-[clamp(0.8125rem,0.07vw+0.80rem,0.875rem)] leading-[1.5] text-[#faf9f7]/30">
            If this keeps happening, email{" "}
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

  // Success state (brief flash before redirect)
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#111110]">
      <div className="flex flex-col items-center gap-6">
        <svg
          className="h-8 w-8 text-[#e85325]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <p
          className="text-sm tracking-[0.08em] uppercase text-[#faf9f7]/50"
          style={{ fontFamily: "var(--font-aspekta)" }}
        >
          Verified
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#111110]">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-2 border-[#e85325]/20" />
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#e85325]"
              style={{ animation: "kaizen-spinner 1s cubic-bezier(0.65, 0, 0.35, 1) infinite" }}
            />
          </div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
