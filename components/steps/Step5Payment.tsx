"use client";

import { useMemo, useState } from "react";
import { Calendar, CheckCircle2, Clock, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PRIX_TEST_ADMISSION,
  TEST_TIME_SLOTS,
  type FormStepProps,
} from "@/types";

const inputClassName =
  "w-full rounded-2xl border border-transparent bg-[#f0f4f8] px-4 py-3 text-sm text-[#0a2342] outline-none transition-colors placeholder:text-gray-400 focus:border-[#0a2342]/30 focus:bg-white";

const labelClassName = "mb-1.5 block text-sm font-medium text-[#0a2342]";

function getMinDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTestDate(dateValue: string) {
  if (!dateValue) return "";
  const [year, month, day] = dateValue.split("-");
  return `${day}/${month}/${year}`;
}

export function Step5Payment({ formData, setFormData, prevStep }: FormStepProps) {
  const [cardHolder, setCardHolder] = useState(
    `${formData.prenom} ${formData.nom}`.trim()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const minDate = useMemo(() => getMinDate(), []);

  const prixTotal =
    formData.reservation_type === "test"
      ? formData.prix_total || PRIX_TEST_ADMISSION
      : formData.prix_total || formData.prix_reservation;

  const handlePayment = async () => {
    if (!formData.test_date || !formData.test_time) {
      setScheduleError("Veuillez choisir une date et une heure pour le test.");
      return;
    }

    setLoading(true);
    setError(null);
    setScheduleError(null);

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
          note: `Test d'admission London Academy - ${formData.test_date} ${formData.test_time} - ${formData.niveau_nom || "Test"}`,
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
          reservation_type: "test",
          test_date: formData.test_date,
          test_time: formData.test_time,
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
          <p className="mt-2 text-gray-600">Test d&apos;admission</p>
          {formData.test_date && formData.test_time && (
            <p className="mt-1 text-gray-600">
              Rendez-vous: {formatTestDate(formData.test_date)} à{" "}
              {formData.test_time}
            </p>
          )}
          <p className="mt-2 font-bold text-[#0a2342]">Total payé: {prixTotal} MAD</p>
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
          {formData.niveau_nom || "Inscription"}
          {formData.classe_nom ? ` — ${formData.classe_nom}` : ""}
        </p>
        <p className="mt-1 text-gray-600">Campus: {formData.campus_nom}</p>
        {formData.seat_number != null && (
          <p className="mt-1 text-gray-600">
            Siège N°{formData.seat_number} sélectionné
          </p>
        )}
        <div className="mt-3 space-y-1 border-t border-gray-200 pt-3">
          <div className="flex justify-between text-gray-600">
            <span>Test d&apos;admission</span>
            <span>{prixTotal} MAD</span>
          </div>
          <p className="flex justify-between font-bold text-[#0a2342]">
            <span>Total à payer</span>
            <span>{prixTotal} MAD</span>
          </p>
        </div>
      </div>

      {/* Test appointment */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#0a2342]" strokeWidth={2} />
          <h3 className="text-sm font-semibold text-[#0a2342]">
            Date et heure du test d&apos;admission
          </h3>
        </div>

        <div className="mb-4">
          <label htmlFor="testDate" className={labelClassName}>
            Date <span className="text-red-500">*</span>
          </label>
          <input
            id="testDate"
            type="date"
            min={minDate}
            value={formData.test_date}
            onChange={(e) => {
              setScheduleError(null);
              setFormData((prev) => ({ ...prev, test_date: e.target.value }));
            }}
            className={inputClassName}
          />
        </div>

        <div>
          <p className={labelClassName}>
            Heure <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {TEST_TIME_SLOTS.map((slot) => {
              const isSelected = formData.test_time === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => {
                    setScheduleError(null);
                    setFormData((prev) => ({ ...prev, test_time: slot }));
                  }}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-2xl border py-2.5 text-sm font-medium transition-colors",
                    isSelected
                      ? "border-[#0a2342] bg-[#0a2342] text-white"
                      : "border-transparent bg-[#f0f4f8] text-[#0a2342] hover:bg-[#e4ebf3]"
                  )}
                >
                  <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                  {slot}
                </button>
              );
            })}
          </div>
        </div>

        {scheduleError && (
          <p className="mt-3 text-sm text-red-500">{scheduleError}</p>
        )}
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
        disabled={loading || !formData.test_date || !formData.test_time}
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
