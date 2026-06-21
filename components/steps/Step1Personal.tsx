"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getCampuses } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Campus, FormStepProps } from "@/types";

const FALLBACK_CAMPUSES: Campus[] = [
  { id: "bouskoura", nom: "Bouskoura", ville: "Casablanca" },
  { id: "dar-bouazza", nom: "Dar Bouazza", ville: "Casablanca" },
  { id: "souissi", nom: "Souissi", ville: "Rabat" },
];

const schema = z.object({
  campus_id: z.string().min(1, "Veuillez sélectionner un campus"),
  nom: z.string().min(2, "Minimum 2 caractères"),
  prenom: z.string().min(2, "Minimum 2 caractères"),
  telephone: z.string().regex(/^[0-9]{9,10}$/, "Numéro invalide"),
  email: z.string().email("Email invalide"),
  ville: z.string().optional(),
});

type Step1Values = z.infer<typeof schema>;

const inputClassName =
  "w-full rounded-2xl border border-transparent bg-[#f0f4f8] px-4 py-3 text-sm text-[#0a2342] outline-none placeholder:text-gray-400 focus:border-[#0a2342]/30 focus:bg-white";

const labelClassName = "mb-1.5 block text-sm font-medium text-[#0a2342]";

const errorClassName = "mt-1 text-sm text-red-500";

export function Step1Personal({
  formData,
  setFormData,
  nextStep,
  prevStep,
  goToStep,
}: FormStepProps) {
  void prevStep;
  void goToStep;

  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loadingCampuses, setLoadingCampuses] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Step1Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      campus_id: formData.campus_id,
      nom: formData.nom,
      prenom: formData.prenom,
      telephone: formData.telephone,
      email: formData.email,
      ville: formData.ville,
    },
  });

  const selectedCampusId = watch("campus_id");

  useEffect(() => {
    let mounted = true;

    async function loadCampuses() {
      try {
        setLoadingCampuses(true);
        const data = await getCampuses();
        if (!mounted) return;

        if (data && data.length > 0) {
          setCampuses(data as Campus[]);
        } else {
          setCampuses(FALLBACK_CAMPUSES);
        }
      } catch {
        if (mounted) {
          setCampuses(FALLBACK_CAMPUSES);
        }
      } finally {
        if (mounted) {
          setLoadingCampuses(false);
        }
      }
    }

    loadCampuses();

    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = (data: Step1Values) => {
    setFormData({
      ...formData,
      campus_id: data.campus_id,
      campus_nom:
        campuses.find((c) => c.id === data.campus_id)?.nom || "",
      nom: data.nom,
      prenom: data.prenom,
      telephone: data.telephone,
      email: data.email,
      ville: data.ville || "",
    });
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="mb-2">
        <h2 className="text-xl font-semibold text-[#0a2342]">
          Informations personnelles
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Personal Information — Étape 1 sur 5
        </p>
      </div>

      {/* 1. Campus */}
      <div>
        <span className={labelClassName}>
          Campus <span className="text-red-500">*</span>
        </span>

        {loadingCampuses ? (
          <div className="rounded-2xl bg-[#f0f4f8] py-10 text-center text-sm text-gray-500">
            Chargement des campus...
          </div>
        ) : (
          <div className="grid gap-3">
            {campuses.map((campus) => {
              const isSelected = selectedCampusId === campus.id;

              return (
                <label
                  key={campus.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3",
                    isSelected
                      ? "border-[#0a2342] bg-[#0a2342]/5"
                      : "border-transparent bg-[#f0f4f8] hover:border-[#0a2342]/20"
                  )}
                >
                  <input
                    type="radio"
                    value={campus.id}
                    className="sr-only"
                    {...register("campus_id")}
                  />
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                      isSelected
                        ? "border-[#0a2342] bg-[#0a2342]"
                        : "border-gray-300 bg-white"
                    )}
                  >
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[#0a2342]">{campus.nom}</p>
                    <p className="text-sm text-gray-500">{campus.ville}</p>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {errors.campus_id && (
          <p className={errorClassName}>{errors.campus_id.message}</p>
        )}
      </div>

      {/* 2 & 3. Nom + Prénom */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nom" className={labelClassName}>
            Nom (Last Name) <span className="text-red-500">*</span>
          </label>
          <input
            id="nom"
            type="text"
            className={inputClassName}
            {...register("nom")}
          />
          {errors.nom && (
            <p className={errorClassName}>{errors.nom.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="prenom" className={labelClassName}>
            Prénom (First Name) <span className="text-red-500">*</span>
          </label>
          <input
            id="prenom"
            type="text"
            className={inputClassName}
            {...register("prenom")}
          />
          {errors.prenom && (
            <p className={errorClassName}>{errors.prenom.message}</p>
          )}
        </div>
      </div>

      {/* 4. Téléphone */}
      <div>
        <label htmlFor="telephone" className={labelClassName}>
          Téléphone (Phone number) <span className="text-red-500">*</span>
        </label>
        <div className="flex overflow-hidden rounded-2xl bg-[#f0f4f8] focus-within:border focus-within:border-[#0a2342]/30 focus-within:bg-white">
          <span className="flex items-center border-r border-gray-200 px-4 py-3 text-sm font-medium text-[#0a2342]">
            +212
          </span>
          <input
            id="telephone"
            type="tel"
            className="flex-1 bg-transparent px-4 py-3 text-sm text-[#0a2342] outline-none placeholder:text-gray-400"
            placeholder="612345678"
            {...register("telephone")}
          />
        </div>
        {errors.telephone && (
          <p className={errorClassName}>{errors.telephone.message}</p>
        )}
      </div>

      {/* 5. Email */}
      <div>
        <label htmlFor="email" className={labelClassName}>
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          className={inputClassName}
          {...register("email")}
        />
        {errors.email && (
          <p className={errorClassName}>{errors.email.message}</p>
        )}
      </div>

      {/* 6. Ville */}
      <div>
        <label htmlFor="ville" className={labelClassName}>
          Ville (City)
        </label>
        <input
          id="ville"
          type="text"
          className={inputClassName}
          {...register("ville")}
        />
      </div>

      <button
        type="submit"
        disabled={loadingCampuses || isSubmitting}
        className="w-full rounded-2xl bg-[#0a2342] py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Suivant →
      </button>
    </form>
  );
}
