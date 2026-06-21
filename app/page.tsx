"use client";

import { useState } from "react";
import { FormWrapper } from "@/components/FormWrapper";
import { StepIndicator } from "@/components/StepIndicator";
import { Step1Personal } from "@/components/steps/Step1Personal";
import { Step2Level } from "@/components/steps/Step2Level";
import { Step3Seats } from "@/components/steps/Step3Seats";
import { Step4Summary } from "@/components/steps/Step4Summary";
import { Step5Payment } from "@/components/steps/Step5Payment";
import { INITIAL_FORM_DATA, type FormData } from "@/types";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  const nextStep = () => setCurrentStep((step) => Math.min(step + 1, 5));
  const prevStep = () => setCurrentStep((step) => Math.max(step - 1, 1));
  const goToStep = (step: number) =>
    setCurrentStep(Math.min(Math.max(step, 1), 5));

  const stepProps = { formData, setFormData, nextStep, prevStep, goToStep };

  let stepContent = null;
  if (currentStep === 1) stepContent = <Step1Personal {...stepProps} />;
  else if (currentStep === 2) stepContent = <Step2Level {...stepProps} />;
  else if (currentStep === 3) stepContent = <Step3Seats {...stepProps} />;
  else if (currentStep === 4) stepContent = <Step4Summary {...stepProps} />;
  else if (currentStep === 5) stepContent = <Step5Payment {...stepProps} />;

  return (
    <main>
      <FormWrapper header={<StepIndicator currentStep={currentStep} />}>
        {stepContent}
      </FormWrapper>
    </main>
  );
}
