"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormStepProps } from "@/types";

const inputClassName =
  "w-full rounded-2xl border border-transparent bg-[#f0f4f8] px-4 py-3 text-sm text-[#0a2342] outline-none transition-colors placeholder:text-gray-400 focus:border-[#0a2342]/30 focus:bg-white";

const labelClassName = "mb-1.5 block text-sm font-medium text-[#0a2342]";

export function Step5Payment({ formData, prevStep }: FormStepProps) {
  const [cardHolder, setCardHolder] = useState(
    `${formData.prenom} ${formData.nom}`.trim()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const prixTotal =
    formData.prix_total || formData.prix_reservation;

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const paymentRes = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: prixTotal,
          email: formData.email,
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone,
          note: `Inscription London Academy - ${formData.niveau_nom || "Test"}`,
        }),
      });

      const paymentData = await paymentRes.json();

      if (!paymentRes.ok || paymentData.error || paymentData.errors) {
        throw new Error(
          paymentData.message ||
            paymentData.error ||
            "Le paiement a échoué. Veuillez réessayer."
        );
      }

      const registerRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campus_id: formData.campus_id,
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone,
          email: formData.email,
          ville: formData.ville || undefined,
          child_age: formData.child_age ?? undefined,
          current_school: formData.current_school,
          additional_info: formData.additional_info || undefined,
          niveau_id: formData.niveau_id,
          classe_id: formData.classe_id,
          seat_number: formData.seat_number ?? undefined,
          prix_total: prixTotal,
          payment_id: paymentData.token || paymentData.id || null,
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        throw new Error(
          registerData.message ||
            registerData.error ||
            "Erreur lors de l'enregistrement."
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="animate-bounce">
          <CheckCircle2 className="h-20 w-20 text-green-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-[#0a2342]">
          🎉 Inscription confirmée!
        </h2>
        <p className="text-sm text-gray-600">
          Merci {formData.prenom}, votre inscription est bien enregistrée.
        </p>
        <p className="text-sm text-gray-500">
          Un email de confirmation sera envoyé à {formData.email}
        </p>

        <div className="mt-2 w-full rounded-2xl border border-gray-100 bg-[#f0f4f8] p-4 text-left text-sm">
          <p className="font-medium text-[#0a2342]">
            {formData.prenom} {formData.nom}
          </p>
          <p className="mt-1 text-gray-600">{formData.email}</p>
          <p className="mt-2 text-gray-600">
            {formData.classe_nom} — {formData.niveau_nom}
          </p>
          <p className="text-gray-600">{formData.campus_nom}</p>
          {formData.seat_number != null && (
            <p className="mt-1 text-gray-600">
              Siège N°{formData.seat_number}
            </p>
          )}
          <p className="mt-2 font-bold text-[#0a2342]">Total: {prixTotal} MAD</p>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 w-full rounded-2xl bg-[#0a2342] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a2342]/90"
        >
          Retour à l&apos;accueil
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="mb-2 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#0a2342]/10">
          <Lock className="h-6 w-6 text-[#0a2342]" strokeWidth={2} />
        </div>
        <h2 className="text-xl font-semibold text-[#0a2342]">Paiement</h2>
        <p className="mt-1 text-sm text-gray-500">
          Finalisez votre inscription — Étape 4 sur 4
        </p>
      </div>

      {/* Order summary */}
      <div className="rounded-2xl border border-gray-100 bg-[#f0f4f8] p-4 text-sm">
        <p className="font-medium text-[#0a2342]">
          Inscription: {formData.classe_nom} — {formData.niveau_nom}
        </p>
        <p className="mt-1 text-gray-600">Campus: {formData.campus_nom}</p>
        {formData.seat_number != null && (
          <p className="mt-1 text-gray-600">
            Siège N°{formData.seat_number} sélectionné
          </p>
        )}
        <p className="mt-2 font-bold text-[#0a2342]">
          Total: {prixTotal} MAD
        </p>
      </div>

      {/* Payment form (display only) */}
      <div>
        <label htmlFor="cardHolder" className={labelClassName}>
          Nom sur la carte (Card holder name)
        </label>
        <input
          id="cardHolder"
          type="text"
          value={cardHolder}
          onChange={(e) => setCardHolder(e.target.value)}
          className={inputClassName}
        />
        <p className="mt-1 text-xs text-gray-400">
          Le paiement sécurisé est traité via Paymee
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={prevStep}
          disabled={loading}
          className="flex-1 rounded-2xl border-2 border-[#0a2342]/20 bg-white py-3.5 text-sm font-semibold text-[#0a2342] transition-colors hover:bg-[#f0f4f8] disabled:opacity-50"
        >
          ← Retour
        </button>
      </div>

      {/* Pay button */}
      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0a2342] py-4 text-base font-semibold text-white transition-colors hover:bg-[#0a2342]/90 disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            💳 Payer {prixTotal} MAD maintenant
          </>
        )}
      </button>
    </div>
  );
}
