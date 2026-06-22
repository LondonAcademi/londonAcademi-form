"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { FormStepProps } from "@/types";

const schema = z.object({
  current_school_price: z
    .number({ message: "Montant requis" })
    .refine((value) => !Number.isNaN(value), { message: "Montant requis" })
    .min(1, "Minimum 1 MAD"),
});

type VisiteFormValues = z.infer<typeof schema>;

const inputClassName =
  "w-full rounded-2xl border border-transparent bg-[#f0f4f8] px-4 py-3 text-sm text-[#0a2342] outline-none placeholder:text-gray-400 focus:border-[#0a2342]/30 focus:bg-white";

const labelClassName = "mb-1.5 block text-sm font-medium text-[#0a2342]";

const errorClassName = "mt-1 text-sm text-red-500";

export function Step4Visite({
  formData,
  setFormData,
  prevStep,
}: FormStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VisiteFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      current_school_price: formData.current_school_price ?? undefined,
    },
  });

  const onSubmit = async (data: VisiteFormValues) => {
    setLoading(true);
    setError(null);

    try {
      setFormData((prev) => ({
        ...prev,
        current_school_price: data.current_school_price,
      }));

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
          additional_info: `Visite — Prix école actuelle: ${data.current_school_price} MAD`,
          niveau_id: formData.niveau_id,
          classe_id: formData.classe_id || undefined,
          seat_number: formData.seat_number ?? undefined,
          prix_total: 0,
          reservation_type: "visite",
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        throw new Error(
          registerData.error || "Erreur lors de l'enregistrement."
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
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <CheckCircle2 className="h-20 w-20 text-green-500" strokeWidth={1.5} />
        <h2 className="text-2xl font-bold text-[#0a2342]">
          Votre document a été envoyé
        </h2>
        <p className="max-w-sm text-base leading-relaxed text-gray-600">
          C&apos;est en liste d&apos;attente pour décider.
        </p>
        <p className="text-sm text-gray-500">
          Merci {formData.prenom}, nous vous contacterons à {formData.email}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 w-full rounded-2xl bg-[#0a2342] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a2342]/90"
        >
          Retour à l&apos;accueil
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="mb-2">
        <h2 className="text-xl font-semibold text-[#0a2342]">
          Réserver une visite
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Dernière étape — Étape 4 sur 4
        </p>
      </div>

      <div className="rounded-2xl bg-[#f0f4f8] px-4 py-3 text-sm text-gray-600">
        <p>
          École actuelle :{" "}
          <span className="font-medium text-[#0a2342]">
            {formData.current_school || "—"}
          </span>
        </p>
      </div>

      <div>
        <label htmlFor="current_school_price" className={labelClassName}>
          Combien payez-vous actuellement à l&apos;école de votre enfant ? (How
          much do you pay at your child&apos;s current school?){" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="current_school_price"
            type="number"
            min={1}
            step={1}
            className={inputClassName}
            placeholder="5000"
            {...register("current_school_price", { valueAsNumber: true })}
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            MAD
          </span>
        </div>
        {errors.current_school_price && (
          <p className={errorClassName}>{errors.current_school_price.message}</p>
        )}
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={prevStep}
          disabled={loading}
          className="flex-1 rounded-2xl border-2 border-[#0a2342]/20 bg-white py-3.5 text-sm font-semibold text-[#0a2342] transition-colors hover:bg-[#f0f4f8] disabled:opacity-50"
        >
          ← Retour
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0a2342] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a2342]/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Envoi...
            </>
          ) : (
            "Envoyer ma demande →"
          )}
        </button>
      </div>
    </form>
  );
}
