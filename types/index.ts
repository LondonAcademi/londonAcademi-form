import type { Dispatch, SetStateAction } from "react";

export type Campus = {
  id: string
  nom: string
  ville: string
}

export type Niveau = {
  id: string
  nom: string
  ordre: number
}

export type Classe = {
  id: string
  nom: string
  niveau_id: string
  campus_id: string
  places_total: number
  places_reservees: number
  prix_reservation: number
}

export type FormData = {
  // Step 1
  campus_id: string
  campus_nom: string
  nom: string
  prenom: string
  telephone: string
  email: string
  ville: string
  child_age: number | null
  current_school: string
  additional_info: string

  // Step 2
  niveau_id: string
  niveau_nom: string
  classe_id: string
  classe_nom: string

  // Step 3
  seat_number: number | null
  reservation_type: 'test' | 'visite' | ''
  current_school_price: number | null

  // Step 4 & 5
  prix_reservation: number
  prix_siege: number
  prix_total: number
}

export type FormStepProps = {
  formData: FormData
  setFormData: Dispatch<SetStateAction<FormData>>
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
}

export const PRIX_SIEGE = 200
export const PRIX_TEST_ADMISSION = 500

export const INITIAL_FORM_DATA: FormData = {
  campus_id: '',
  campus_nom: '',
  nom: '',
  prenom: '',
  telephone: '',
  email: '',
  ville: '',
  child_age: null,
  current_school: '',
  additional_info: '',
  niveau_id: '',
  niveau_nom: '',
  classe_id: '',
  classe_nom: '',
  seat_number: null,
  reservation_type: '',
  current_school_price: null,
  prix_reservation: 0,
  prix_siege: 0,
  prix_total: 0,
}
