import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 1. Get all campuses
export async function getCampuses() {
  const { data, error } = await supabase
    .from('campuses')
    .select('*')
    .order('nom')
  if (error) throw error
  return data
}

// 2. Get all niveaux
export async function getNiveaux() {
  const { data, error } = await supabase
    .from('niveaux')
    .select('*')
    .order('ordre')
  if (error) throw error
  return data
}

// 3. Get classes by niveau and campus
export async function getClassesByNiveauAndCampus(
  niveau_id: string,
  campus_id: string
) {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('niveau_id', niveau_id)
    .eq('campus_id', campus_id)
    .order('nom')
  if (error) throw error
  return data
}

// 4. Get places disponibles — random between 2 and real available
export async function getPlacesDisponibles(classe_id: string) {
  const { data, error } = await supabase
    .from('classes')
    .select('places_total, places_reservees')
    .eq('id', classe_id)
    .single()
  if (error) throw error

  const realAvailable = data.places_total - data.places_reservees
  if (realAvailable <= 0) return 0

  const min = Math.min(2, realAvailable)
  const max = realAvailable
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 5. Create registration
export async function createRegistration(formData: {
  campus_id: string
  nom: string
  prenom: string
  telephone: string
  email: string
  ville?: string
  child_age?: number
  current_school?: string
  additional_info?: string
  niveau_id: string
  classe_id?: string
  seat_number?: number
  prix_total: number
}) {
  const { data, error } = await supabase
    .from('registrations')
    .insert([{
      ...formData,
      classe_id: formData.classe_id || null,
      status: formData.prix_total > 0 ? 'incomplete' : 'complete',
      payment_status: formData.prix_total > 0 ? 'pending' : 'visite',
    }])
    .select()
    .single()
  if (error) throw error
  return data
}

// 6. Update registration after payment
export async function updateRegistrationPayment(
  registration_id: string,
  payment_id: string,
  status: 'paid' | 'failed'
) {
  const { error } = await supabase
    .from('registrations')
    .update({
      payment_id,
      payment_status: status,
      status: status === 'paid' ? 'complete' : 'incomplete'
    })
    .eq('id', registration_id)
  if (error) throw error
}

// 7. Increment places reservees after successful payment
export async function incrementPlaces(classe_id: string) {
  const { error } = await supabase
    .rpc('increment_places_reservees', { classe_uuid: classe_id })
  if (error) throw error
}
