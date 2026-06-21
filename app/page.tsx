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

  const stepProps = { formData, setFormData, nextStep, prevStep };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Personal {...stepProps} />;
      case 2:
        return <Step2Level {...stepProps} />;
      case 3:
        return <Step3Seats {...stepProps} />;
      case 4:
        return <Step4Summary {...stepProps} />;
      case 5:
        return <Step5Payment {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <main>
      <FormWrapper header={<StepIndicator currentStep={currentStep} />}>
        {renderStep()}
      </FormWrapper>
    </main>
  );
}
