"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WizardData, INITIAL_WIZARD_DATA, INDUSTRY_PAGE_PRESETS } from "@/components/wizard/types";
import { WizardShell } from "@/components/wizard/wizard-shell";
import { StepCompany } from "@/components/wizard/step-company";
import { StepStyle } from "@/components/wizard/step-style";
import { StepPages } from "@/components/wizard/step-pages";
import { StepContent } from "@/components/wizard/step-content";
import { StepReview } from "@/components/wizard/step-review";

const BUILDER_URL = "https://kaizen-builder.fehellstrom.workers.dev/build";

function validateStep(step: number, data: WizardData): boolean {
  switch (step) {
    case 1:
      return (
        data.company.name.trim().length > 0 &&
        data.company.industry.length > 0 &&
        data.company.description.trim().length > 0
      );
    case 2:
      return data.style.mood.length > 0;
    case 3:
      return data.pages.length > 0;
    case 4:
      return (
        data.content.differentiators.trim().length > 0 &&
        data.content.primaryCta.trim().length > 0
      );
    case 5:
      return true;
    default:
      return false;
  }
}

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(INITIAL_WIZARD_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleDataChange(updated: WizardData) {
    // When industry changes, apply the preset pages
    if (
      updated.company.industry !== data.company.industry &&
      updated.company.industry
    ) {
      const preset = INDUSTRY_PAGE_PRESETS[updated.company.industry] ?? ["home"];
      updated = { ...updated, pages: preset };
    }
    setData(updated);
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  async function handleNext() {
    if (step < 5) {
      setStep((s) => s + 1);
      return;
    }

    // Step 5: submit
    setSubmitting(true);
    setError("");
    try {
      await fetch(BUILDER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      // Builder may not respond with CORS headers; treat as fired-and-forgotten
    } finally {
      setSubmitting(false);
    }
    router.push("/projects");
  }

  function goToStep(target: number) {
    setStep(target);
  }

  const canNext = validateStep(step, data);

  return (
    <WizardShell
      currentStep={step}
      onBack={handleBack}
      onNext={handleNext}
      canNext={canNext}
      isLastStep={step === 5}
      isSubmitting={submitting}
    >
      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      <div
        key={step}
        className="wizard-step-enter"
        style={{
          animation: "wizardEnter 0.25s ease-out both",
        }}
      >
        {step === 1 && <StepCompany data={data} onChange={handleDataChange} />}
        {step === 2 && <StepStyle data={data} onChange={handleDataChange} />}
        {step === 3 && <StepPages data={data} onChange={handleDataChange} />}
        {step === 4 && <StepContent data={data} onChange={handleDataChange} />}
        {step === 5 && <StepReview data={data} onGoToStep={goToStep} />}
      </div>

      <style>{`
        @keyframes wizardEnter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </WizardShell>
  );
}
