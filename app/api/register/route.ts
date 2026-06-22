import { NextResponse } from "next/server";
import { createRegistration, incrementPlaces } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const registration = await createRegistration({
      campus_id: body.campus_id,
      nom: body.nom,
      prenom: body.prenom,
      telephone: body.telephone,
      email: body.email,
      ville: body.ville,
      child_age: body.child_age,
      current_school: body.current_school,
      additional_info: body.additional_info,
      niveau_id: body.niveau_id,
      classe_id: body.classe_id,
      seat_number: body.seat_number,
      prix_total: body.prix_total ?? 0,
    });

    if (body.classe_id) {
      await incrementPlaces(body.classe_id);
    }

    return NextResponse.json(registration);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Registration failed",
      },
      { status: 500 }
    );
  }
}
