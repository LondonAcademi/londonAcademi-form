"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Loader2 } from "lucide-react";
import {
  getClassesByNiveauAndCampus,
  getNiveaux,
  getPlacesDisponibles,
} from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Classe, FormStepProps, Niveau } from "@/types";

const NIVEAUX_DISPLAY = [
  { emoji: "🎒", nom: "Préscolaire", ageRange: "3-6 ans" },
  { emoji: "📚", nom: "Primaire", ageRange: "6-12 ans" },
  { emoji: "🏫", nom: "Collège", ageRange: "12-15 ans" },
  { emoji: "🎓", nom: "Lycée", ageRange: "15-18 ans" },
] as const;

const step2Schema = z.object({
  niveau_id: z.string().min(1, "Veuillez sélectionner un niveau"),
  classe_id: z.string().min(1, "Veuillez sélectionner une classe"),
  child_age: z
    .number({ message: "Âge requis" })
    .refine((value) => !Number.isNaN(value), { message: "Âge requis" })
    .min(3, "Minimum 3 ans")
    .max(25, "Maximum 25 ans"),
  current_school: z.string().min(2, "Minimum 2 caractères"),
  additional_info: z.string().optional(),
});

type Step2FormValues = z.infer<typeof step2Schema>;

const inputClassName =
  "w-full rounded-2xl border border-transparent bg-[#f0f4f8] px-4 py-3 text-sm text-[#0a2342] outline-none placeholder:text-gray-400 focus:border-[#0a2342]/30 focus:bg-white";

const labelClassName = "mb-1.5 block text-sm font-medium text-[#0a2342]";

const errorClassName = "mt-1 text-sm text-red-500";

export function Step2Level({
  formData,
  setFormData,
  nextStep,
  prevStep,
}: FormStepProps) {
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [placesMap, setPlacesMap] = useState<Record<string, number>>({});
  const [loadingNiveaux, setLoadingNiveaux] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classesError, setClassesError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      niveau_id: formData.niveau_id,
      classe_id: formData.classe_id,
      child_age: formData.child_age ?? undefined,
      current_school: formData.current_school,
      additional_info: formData.additional_info,
    },
  });

  const selectedNiveauId = watch("niveau_id");
  const selectedClasseId = watch("classe_id");

  useEffect(() => {
    let mounted = true;

    async function loadNiveaux() {
      try {
        setLoadingNiveaux(true);
        const data = await getNiveaux();
        if (mounted) {
          setNiveaux(data as Niveau[]);
        }
      } catch {
        if (mounted) {
          setNiveaux([]);
        }
      } finally {
        if (mounted) {
          setLoadingNiveaux(false);
        }
      }
    }

    loadNiveaux();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedNiveauId || !formData.campus_id) {
      setClasses([]);
      setPlacesMap({});
      return;
    }

    let mounted = true;

    async function loadClasses() {
      try {
        setLoadingClasses(true);
        setClassesError(null);
        setClasses([]);
        setPlacesMap({});

        const data = await getClassesByNiveauAndCampus(
          selectedNiveauId,
          formData.campus_id
        );

        if (!mounted) return;

        const fetchedClasses = data as Classe[];
        setClasses(fetchedClasses);

        const placesEntries = await Promise.all(
          fetchedClasses.map(async (classe) => {
            try {
              const places = await getPlacesDisponibles(classe.id);
              return [classe.id, places] as const;
            } catch {
              return [classe.id, 0] as const;
            }
          })
        );

        if (mounted) {
          setPlacesMap(Object.fromEntries(placesEntries));
        }
      } catch {
        if (mounted) {
          setClassesError("Impossible de charger les classes. Veuillez réessayer.");
          setClasses([]);
        }
      } finally {
        if (mounted) {
          setLoadingClasses(false);
        }
      }
    }

    loadClasses();

    return () => {
      mounted = false;
    };
  }, [selectedNiveauId, formData.campus_id]);

  const handleNiveauSelect = (niveauId: string) => {
    setValue("niveau_id", niveauId, { shouldValidate: true });
    setValue("classe_id", "", { shouldValidate: false });
  };

  const handleClasseSelect = (classeId: string) => {
    setValue("classe_id", classeId, { shouldValidate: true });
  };

  const onSubmit = (data: Step2FormValues) => {
    const niveau = niveaux.find((n) => n.id === data.niveau_id);
    const classe = classes.find((c) => c.id === data.classe_id);

    setFormData({
      ...formData,
      niveau_id: data.niveau_id,
      niveau_nom: niveau?.nom ?? "",
      classe_id: data.classe_id,
      classe_nom: classe?.nom ?? "",
      prix_reservation: classe?.prix_reservation ?? 0,
      child_age: data.child_age,
      current_school: data.current_school,
      additional_info: data.additional_info || "",
    });

    nextStep();
  };

  const getNiveauIdByNom = (nom: string) =>
    niveaux.find((n) => n.nom === nom)?.id ?? "";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="mb-2">
        <h2 className="text-xl font-semibold text-[#0a2342]">Niveau & Classe</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choisissez le niveau scolaire — Étape 2 sur 5
        </p>
      </div>

      {/* Part A — Niveau scolaire */}
      <div>
        <span className="mb-3 block text-sm font-medium text-[#0a2342]">
          Niveau scolaire <span className="text-red-500">*</span>
        </span>

        {loadingNiveaux ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-[#f0f4f8] py-10 text-sm text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin text-[#0a2342]" />
            Chargement des niveaux...
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {NIVEAUX_DISPLAY.map((item) => {
              const niveauId = getNiveauIdByNom(item.nom);
              const isSelected = selectedNiveauId === niveauId && niveauId !== "";
              const isDisabled = !niveauId;

              return (
                <button
                  key={item.nom}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => niveauId && handleNiveauSelect(niveauId)}
                  className={cn(
                    "relative flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-all",
                    isSelected
                      ? "border-[#0a2342] bg-[#0a2342]/5"
                      : "border-transparent bg-[#f0f4f8] hover:border-[#0a2342]/20",
                    isDisabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  {isSelected && (
                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#0a2342] text-white">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </div>
                  )}
                  <span className="text-2xl">{item.emoji}</span>
                  <p className="mt-2 font-medium text-[#0a2342]">{item.nom}</p>
                  <p className="text-xs text-gray-500">({item.ageRange})</p>
                </button>
              );
            })}
          </div>
        )}

        {errors.niveau_id && (
          <p className={errorClassName}>{errors.niveau_id.message}</p>
        )}
      </div>

      {/* Part B — Classe selection */}
      {selectedNiveauId && (
        <div>
          <span className="mb-3 block text-sm font-medium text-[#0a2342]">
            Classe <span className="text-red-500">*</span>
          </span>

          {loadingClasses ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-[#f0f4f8] py-10 text-sm text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin text-[#0a2342]" />
              Chargement des classes...
            </div>
          ) : classesError ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {classesError}
            </p>
          ) : classes.length === 0 ? (
            <p className="rounded-2xl bg-[#f0f4f8] px-4 py-6 text-center text-sm text-gray-500">
              Aucune classe disponible pour ce niveau et ce campus.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {classes.map((classe) => {
                const isSelected = selectedClasseId === classe.id;
                const places = placesMap[classe.id] ?? 0;
                const isUrgent = places <= 3;

                return (
                  <button
                    key={classe.id}
                    type="button"
                    onClick={() => handleClasseSelect(classe.id)}
                    className={cn(
                      "relative flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-all",
                      isSelected
                        ? "border-[#0a2342] bg-[#0a2342]/5"
                        : "border-transparent bg-[#f0f4f8] hover:border-[#0a2342]/20"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#0a2342] text-white">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </div>
                    )}
                    <p className="font-semibold text-[#0a2342]">{classe.nom}</p>
                    <p className="mt-1 text-sm font-medium text-[#0a2342]/80">
                      {classe.prix_reservation} MAD
                    </p>
                    <p
                      className={cn(
                        "mt-2 text-xs font-medium",
                        isUrgent ? "text-red-600" : "text-green-600"
                      )}
                    >
                      {isUrgent
                        ? `🔴 Plus que ${places} place${places > 1 ? "s" : ""}!`
                        : `🟢 ${places} place${places > 1 ? "s" : ""} disponible${places > 1 ? "s" : ""}`}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {errors.classe_id && (
            <p className={errorClassName}>{errors.classe_id.message}</p>
          )}
        </div>
      )}

      {/* Part C — Child info */}
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
          {...register("child_age", { valueAsNumber: true })}
        />
        {errors.child_age && (
          <p className={errorClassName}>{errors.child_age.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="current_school" className={labelClassName}>
          L&apos;école actuelle de votre enfant (Current School){" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          id="current_school"
          type="text"
          className={inputClassName}
          {...register("current_school")}
        />
        {errors.current_school && (
          <p className={errorClassName}>{errors.current_school.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="additional_info" className={labelClassName}>
          Informations complémentaires (Additional Information)
        </label>
        <textarea
          id="additional_info"
          rows={4}
          className={cn(inputClassName, "resize-none")}
          {...register("additional_info")}
        />
      </div>

      {/* Navigation */}
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={prevStep}
          className="flex-1 rounded-2xl border-2 border-[#0a2342]/20 bg-white py-3.5 text-sm font-semibold text-[#0a2342] transition-colors hover:bg-[#f0f4f8]"
        >
          ← Retour
        </button>
        <button
          type="submit"
          disabled={loadingClasses}
          className="flex-1 rounded-2xl bg-[#0a2342] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a2342]/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Suivant →
        </button>
      </div>
    </form>
  );
}
