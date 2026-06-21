"use client";

import {
  User,
  GraduationCap,
  Armchair,
  FileText,
  CreditCard,
  Check,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS: { icon: LucideIcon; label: string }[] = [
  { icon: User, label: "Informations" },
  { icon: GraduationCap, label: "Niveau" },
  { icon: Armchair, label: "Siège" },
  { icon: FileText, label: "Résumé" },
  { icon: CreditCard, label: "Paiement" },
];

type StepIndicatorProps = {
  currentStep: number;
};

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Étapes du formulaire" className="w-full px-1">
      <ol className="flex items-start">
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isFuture = stepNumber > currentStep;
          const Icon = step.icon;

          return (
            <li
              key={step.label}
              className={cn(
                "flex items-center",
                index < STEPS.length - 1 ? "flex-1" : "flex-none"
              )}
            >
              <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors sm:h-10 sm:w-10",
                    isCompleted &&
                      "border-[#16a34a] bg-[#16a34a] text-white",
                    isCurrent &&
                      "border-[#0a2342] bg-[#0a2342] text-white",
                    isFuture &&
                      "border-[#d1d5db] bg-white text-[#d1d5db]"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                  ) : (
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
                  )}
                </div>
                <span
                  className={cn(
                    "max-w-[3.5rem] text-center text-[10px] leading-tight sm:max-w-none sm:text-xs",
                    isCurrent && "font-bold text-[#0a2342]",
                    isCompleted && "font-medium text-[#16a34a]",
                    isFuture && "text-gray-400"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-1 mb-5 h-0.5 flex-1 self-start sm:mx-2 sm:mb-6",
                    stepNumber < currentStep ? "bg-[#16a34a]" : "bg-[#d1d5db]"
                  )}
                  style={{ marginTop: "1.125rem" }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
