"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { getCampuses } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Campus, FormStepProps } from "@/types";

const step1Schema = z.object({
  campus_id: z.string().min(1, "Veuillez sélectionner un campus"),
  nom: z.string().min(2, "Minimum 2 caractères"),
  prenom: z.string().min(2, "Minimum 2 caractères"),
  telephone: z
    .string()
    .min(1, "Le téléphone est requis")
    .regex(/^[0-9]{9,10}$/, "Numéro invalide (9 ou 10 chiffres)"),
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  ville: z.string().optional(),
  child_age: z
    .number({ message: "L'âge est requis" })
    .refine((value) => !Number.isNaN(value), { message: "L'âge est requis" })
    .min(3, "Minimum 3 ans")
    .max(25, "Maximum 25 ans"),
  current_school: z.string().min(2, "Minimum 2 caractères"),
  additional_info: z.string().optional(),
});

type Step1FormValues = z.infer<typeof step1Schema>;

const inputClassName =
  "w-full rounded-2xl border border-transparent bg-[#f0f4f8] px-4 py-3 text-sm text-[#0a2342] outline-none transition-colors placeholder:text-gray-400 focus:border-[#0a2342]/30 focus:bg-white";

const labelClassName = "mb-1.5 block text-sm font-medium text-[#0a2342]";

const errorClassName = "mt-1 text-xs text-red-500";

export function Step1Personal({
  formData,
  setFormData,
  nextStep,
}: FormStepProps) {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loadingCampuses, setLoadingCampuses] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      campus_id: formData.campus_id,
      nom: formData.nom,
      prenom: formData.prenom,
      telephone: formData.telephone,
      email: formData.email,
      ville: formData.ville,
      child_age: formData.child_age ?? undefined,
      current_school: formData.current_school,
      additional_info: formData.additional_info,
    },
  });

  const selectedCampusId = watch("campus_id");

  useEffect(() => {
    let mounted = true;

    async function loadCampuses() {
      try {
        setLoadingCampuses(true);
        setFetchError(null);
        const data = await getCampuses();
        if (mounted) {
          setCampuses(data as Campus[]);
        }
      } catch {
        if (mounted) {
          setFetchError("Impossible de charger les campus. Veuillez réessayer.");
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

  const onSubmit = (data: Step1FormValues) => {
    const campus = campuses.find((c) => c.id === data.campus_id);

    setFormData((prev) => ({
      ...prev,
      campus_id: data.campus_id,
      campus_nom: campus ? `${campus.nom} - ${campus.ville}` : "",
      nom: data.nom,
      prenom: data.prenom,
      telephone: data.telephone,
      email: data.email,
      ville: data.ville ?? "",
      child_age: data.child_age,
      current_school: data.current_school,
      additional_info: data.additional_info ?? "",
    }));

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

      {/* Campus */}
      <div>
        <span className={labelClassName}>
          Campus <span className="text-red-500">*</span>
        </span>

        {loadingCampuses ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-[#f0f4f8] py-10 text-sm text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin text-[#0a2342]" />
            Chargement des campus...
          </div>
        ) : fetchError ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {fetchError}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-1">
            {campuses.map((campus) => {
              const isSelected = selectedCampusId === campus.id;

              return (
                <label
                  key={campus.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-all",
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
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
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

      {/* Nom / Prénom */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nom" className={labelClassName}>
            Nom (Last Name) <span className="text-red-500">*</span>
          </label>
          <input
            id="nom"
            type="text"
            className={inputClassName}
            placeholder="Dupont"
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
            placeholder="Jean"
            {...register("prenom")}
          />
          {errors.prenom && (
            <p className={errorClassName}>{errors.prenom.message}</p>
          )}
        </div>
      </div>

      {/* Téléphone */}
      <div>
        <label htmlFor="telephone" className={labelClassName}>
          Téléphone (Phone) <span className="text-red-500">*</span>
        </label>
        <div className="flex overflow-hidden rounded-2xl border border-transparent bg-[#f0f4f8] focus-within:border-[#0a2342]/30 focus-within:bg-white">
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

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClassName}>
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          className={inputClassName}
          placeholder="exemple@email.com"
          {...register("email")}
        />
        {errors.email && (
          <p className={errorClassName}>{errors.email.message}</p>
        )}
      </div>

      {/* Ville */}
      <div>
        <label htmlFor="ville" className={labelClassName}>
          Ville (City)
        </label>
        <input
          id="ville"
          type="text"
          className={inputClassName}
          placeholder="Casablanca"
          {...register("ville")}
        />
      </div>

      {/* Âge enfant */}
      <div>
        <label htmlFor="child_age" className={labelClassName}>
          L&apos;âge de votre enfant (Child&apos;s Age){" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          id="child_age"
          type="number"
          min={3}
          max={25}
          className={inputClassName}
          placeholder="10"
          {...register("child_age", { valueAsNumber: true })}
        />
        {errors.child_age && (
          <p className={errorClassName}>{errors.child_age.message}</p>
        )}
      </div>

      {/* École actuelle */}
      <div>
        <label htmlFor="current_school" className={labelClassName}>
          L&apos;école actuelle de votre enfant (Current School){" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          id="current_school"
          type="text"
          className={inputClassName}
          placeholder="Nom de l'école"
          {...register("current_school")}
        />
        {errors.current_school && (
          <p className={errorClassName}>{errors.current_school.message}</p>
        )}
      </div>

      {/* Informations complémentaires */}
      <div>
        <label htmlFor="additional_info" className={labelClassName}>
          Informations complémentaires (Additional Information)
        </label>
        <textarea
          id="additional_info"
          rows={4}
          className={cn(inputClassName, "resize-none")}
          placeholder="Informations supplémentaires..."
          {...register("additional_info")}
        />
      </div>

      <button
        type="submit"
        disabled={loadingCampuses || isSubmitting || !!fetchError}
        className="mt-2 w-full rounded-2xl bg-[#0a2342] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a2342]/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Suivant →
      </button>
    </form>
  );
}
