"use client";

import type { ReactNode } from "react";
import {
  User,
  GraduationCap,
  Armchair,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PRIX_SIEGE, type FormStepProps } from "@/types";

type SummarySectionProps = {
  icon: LucideIcon;
  title: string;
  onEdit: () => void;
  children: ReactNode;
};

function SummarySection({
  icon: Icon,
  title,
  onEdit,
  children,
}: SummarySectionProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[#0a2342]" strokeWidth={2} />
          <h3 className="text-sm font-semibold text-[#0a2342]">{title}</h3>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-medium text-[#0a2342]/70 transition-colors hover:text-[#0a2342] hover:underline"
        >
          Modifier ✏️
        </button>
      </div>
      <div className="space-y-2 rounded-xl bg-[#f0f4f8] p-3 text-sm">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-[#0a2342]">{value}</span>
    </div>
  );
}

export function Step4Summary({
  formData,
  nextStep,
  prevStep,
  goToStep,
}: FormStepProps) {
  const prixTotal =
    formData.prix_total ||
    formData.prix_reservation + (formData.prix_siege || 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="mb-2 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-7 w-7 text-green-600" strokeWidth={2} />
        </div>
        <h2 className="text-xl font-semibold text-[#0a2342]">
          Récapitulatif de votre inscription
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Vérifiez vos informations avant de payer — Étape 4 sur 5
        </p>
      </div>

      {/* Informations personnelles */}
      <SummarySection
        icon={User}
        title="Informations personnelles"
        onEdit={() => goToStep(1)}
      >
        <SummaryRow
          label="Nom complet"
          value={`${formData.prenom} ${formData.nom}`.trim() || "—"}
        />
        <SummaryRow
          label="Téléphone"
          value={
            formData.telephone ? `+212 ${formData.telephone}` : "—"
          }
        />
        <SummaryRow label="Email" value={formData.email || "—"} />
        <SummaryRow label="Ville" value={formData.ville || "—"} />
        <SummaryRow
          label="Âge de l'enfant"
          value={
            formData.child_age != null ? `${formData.child_age} ans` : "—"
          }
        />
        <SummaryRow
          label="École actuelle"
          value={formData.current_school || "—"}
        />
      </SummarySection>

      {/* Inscription scolaire */}
      <SummarySection
        icon={GraduationCap}
        title="Inscription scolaire"
        onEdit={() => goToStep(2)}
      >
        <SummaryRow label="Campus" value={formData.campus_nom || "—"} />
        <SummaryRow label="Niveau" value={formData.niveau_nom || "—"} />
        <SummaryRow label="Classe" value={formData.classe_nom || "—"} />
        <SummaryRow
          label="Frais d'inscription"
          value={`${formData.prix_reservation} MAD`}
        />
      </SummarySection>

      {/* Siège */}
      <SummarySection
        icon={Armchair}
        title="Siège"
        onEdit={() => goToStep(3)}
      >
        {formData.seat_number != null ? (
          <>
            <SummaryRow
              label="Réservation"
              value={`Siège N°${formData.seat_number} réservé ✓`}
            />
            <SummaryRow
              label="Prix siège"
              value={`${formData.prix_siege || PRIX_SIEGE} MAD`}
            />
          </>
        ) : (
          <>
            <SummaryRow label="Réservation" value="Aucun siège sélectionné" />
            <SummaryRow label="Prix siège" value="0 MAD" />
          </>
        )}
      </SummarySection>

      {/* Total price box */}
      <div className="rounded-2xl bg-[#0a2342] p-6 text-white">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/80">Frais d&apos;inscription</span>
            <span>{formData.prix_reservation} MAD</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/80">Siège</span>
            <span>
              {formData.prix_siege > 0
                ? `+ ${formData.prix_siege} MAD`
                : "Inclus"}
            </span>
          </div>
        </div>
        <div className="my-4 border-t border-white/20" />
        <div className="flex items-end justify-between">
          <span className="text-lg font-semibold">TOTAL</span>
          <span className="text-2xl font-bold">{prixTotal} MAD</span>
        </div>
        <p className="mt-3 text-center text-xs text-white/60">
          Paiement sécurisé via Paymee
        </p>
      </div>

      {/* Navigation */}
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={prevStep}
          className={cn(
            "flex-1 rounded-2xl border-2 border-[#0a2342]/20 bg-white py-3.5 text-sm font-semibold text-[#0a2342] transition-colors hover:bg-[#f0f4f8]"
          )}
        >
          ← Retour
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="flex-1 rounded-2xl bg-[#0a2342] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a2342]/90"
        >
          Procéder au paiement →
        </button>
      </div>
    </div>
  );
}
