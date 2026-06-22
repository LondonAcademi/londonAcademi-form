"use client";

import { useState } from "react";
import { FormWrapper } from "@/components/FormWrapper";
import { StepIndicator } from "@/components/StepIndicator";
import { Step1Personal } from "@/components/steps/Step1Personal";
import { Step2Level } from "@/components/steps/Step2Level";
import { Step3Seats } from "@/components/steps/Step3Seats";
import { Step4Visite } from "@/components/steps/Step4Visite";
import { Step5Payment } from "@/components/steps/Step5Payment";
import { INITIAL_FORM_DATA, type FormData } from "@/types";

const TOTAL_STEPS = 4;

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  const nextStep = () =>
    setCurrentStep((step) => Math.min(step + 1, TOTAL_STEPS));
  const prevStep = () => setCurrentStep((step) => Math.max(step - 1, 1));
  const goToStep = (step: number) =>
    setCurrentStep(Math.min(Math.max(step, 1), TOTAL_STEPS));

  const stepProps = { formData, setFormData, nextStep, prevStep, goToStep };

  let stepContent = null;
  if (currentStep === 1) stepContent = <Step1Personal {...stepProps} />;
  else if (currentStep === 2) stepContent = <Step2Level {...stepProps} />;
  else if (currentStep === 3) stepContent = <Step3Seats {...stepProps} />;
  else if (currentStep === 4) {
    stepContent =
      formData.reservation_type === "visite" ? (
        <Step4Visite {...stepProps} />
      ) : (
        <Step5Payment {...stepProps} />
      );
  }

  return (
    <main>
      <FormWrapper
        header={
          <StepIndicator
            currentStep={currentStep}
            reservationType={formData.reservation_type}
          />
        }
      >
        {stepContent}
      </FormWrapper>
    </main>
  );
}
