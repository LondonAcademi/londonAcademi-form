"use client";

import { useEffect, useMemo, useState } from "react";
import { Armchair, Check, Loader2 } from "lucide-react";
import { getPlacesDisponibles, supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { PRIX_SIEGE, type FormStepProps } from "@/types";

const TOTAL_SEATS = 20;

function createSeededRandom(seed: string) {
  let state = 0;
  for (let i = 0; i < seed.length; i++) {
    state = (state + seed.charCodeAt(i) * (i + 1)) >>> 0;
  }
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function getTakenSeats(classeId: string, placesReservees: number): Set<number> {
  const dateStr = new Date().toISOString().slice(0, 10);
  const random = createSeededRandom(`${classeId}-${dateStr}`);
  const seats = Array.from({ length: TOTAL_SEATS }, (_, i) => i + 1);

  for (let i = seats.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [seats[i], seats[j]] = [seats[j], seats[i]];
  }

  const takenCount = Math.min(Math.max(0, placesReservees), TOTAL_SEATS);
  return new Set(seats.slice(0, takenCount));
}

export function Step3Seats({
  formData,
  setFormData,
  nextStep,
  prevStep,
}: FormStepProps) {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [placesReservees, setPlacesReservees] = useState(0);
  const [placesDisponibles, setPlacesDisponibles] = useState(0);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(
    formData.seat_number
  );

  useEffect(() => {
    if (!formData.classe_id) {
      setLoading(false);
      setFetchError("Aucune classe sélectionnée.");
      return;
    }

    let mounted = true;

    async function loadSeatData() {
      try {
        setLoading(true);
        setFetchError(null);

        const [{ data, error }, disponibles] = await Promise.all([
          supabase
            .from("classes")
            .select("places_reservees")
            .eq("id", formData.classe_id)
            .single(),
          getPlacesDisponibles(formData.classe_id),
        ]);

        if (error) throw error;
        if (!mounted) return;

        setPlacesReservees(data.places_reservees ?? 0);
        setPlacesDisponibles(disponibles);
      } catch {
        if (mounted) {
          setFetchError("Impossible de charger le plan de salle.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSeatData();

    return () => {
      mounted = false;
    };
  }, [formData.classe_id]);

  const takenSeats = useMemo(
    () => getTakenSeats(formData.classe_id, placesReservees),
    [formData.classe_id, placesReservees]
  );

  const handleSeatClick = (seatNumber: number) => {
    if (takenSeats.has(seatNumber)) return;
    setSelectedSeat((current) =>
      current === seatNumber ? null : seatNumber
    );
  };

  const handleSkip = () => {
    setFormData((prev) => ({
      ...prev,
      seat_number: null,
      prix_siege: 0,
      prix_total: prev.prix_reservation,
    }));
    nextStep();
  };

  const handleConfirm = () => {
    if (!selectedSeat) return;

    setFormData((prev) => ({
      ...prev,
      seat_number: selectedSeat,
      prix_siege: PRIX_SIEGE,
      prix_total: prev.prix_reservation + PRIX_SIEGE,
    }));
    nextStep();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-2">
        <h2 className="text-xl font-semibold text-[#0a2342]">
          Choisissez votre siège
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Siège optionnel — Étape 3 sur 5
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-[#f0f4f8] py-16 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#0a2342]" />
          Chargement du plan de salle...
        </div>
      ) : fetchError ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {fetchError}
        </p>
      ) : (
        <>
          {/* Scarcity banner */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
            <p className="text-sm font-bold text-amber-800">
              ⚠️ Plus que {placesDisponibles} place
              {placesDisponibles > 1 ? "s" : ""} disponible
              {placesDisponibles > 1 ? "s" : ""}!
            </p>
          </div>

          {/* Pricing info */}
          <div className="rounded-2xl bg-[#f0f4f8] px-4 py-3">
            <p className="text-sm font-medium text-[#0a2342]">
              Choisir un siège: +{PRIX_SIEGE} MAD
            </p>
            {selectedSeat && (
              <p className="mt-1 text-sm font-semibold text-[#0a2342]">
                ✓ Siège N°{selectedSeat} sélectionné — +{PRIX_SIEGE} MAD ajouté
              </p>
            )}
          </div>

          {/* Classroom */}
          <div className="mx-auto w-full max-w-[400px]">
            <div className="mb-4 rounded-lg bg-[#0a2342] py-2 text-center text-xs font-bold tracking-widest text-white">
              TABLEAU
            </div>

            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: TOTAL_SEATS }, (_, i) => i + 1).map(
                (seatNumber) => {
                  const isTaken = takenSeats.has(seatNumber);
                  const isSelected = selectedSeat === seatNumber;

                  return (
                    <button
                      key={seatNumber}
                      type="button"
                      disabled={isTaken}
                      onClick={() => handleSeatClick(seatNumber)}
                      className={cn(
                        "relative flex flex-col items-center justify-center rounded-xl border p-2 transition-all",
                        isTaken &&
                          "cursor-not-allowed border-red-100 bg-red-100 text-red-300",
                        !isTaken &&
                          !isSelected &&
                          "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
                        isSelected &&
                          "border-[#0a2342] bg-[#0a2342] text-white"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-white">
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </div>
                      )}
                      <Armchair
                        className={cn(
                          "h-5 w-5",
                          isTaken && "text-red-300",
                          !isTaken && !isSelected && "text-green-600",
                          isSelected && "text-white"
                        )}
                        strokeWidth={1.5}
                      />
                      <span className="mt-1 text-[10px] font-medium">
                        {seatNumber}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Skip option */}
          <button
            type="button"
            onClick={handleSkip}
            className="mx-auto mt-2 text-sm text-gray-500 underline transition-colors hover:text-[#0a2342]"
          >
            Continuer sans choisir de siège →
          </button>
        </>
      )}

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
          type="button"
          onClick={handleConfirm}
          disabled={!selectedSeat || loading}
          className="flex-1 rounded-2xl bg-[#0a2342] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a2342]/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Confirmer mon siège →
        </button>
      </div>
    </div>
  );
}
