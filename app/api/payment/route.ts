import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const response = await fetch("https://app.paymee.tn/api/v2/payments/create", {
      method: "POST",
      headers: {
        Authorization: "Token " + process.env.PAYMEE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: body.amount,
        note: body.note,
        first_name: body.prenom,
        last_name: body.nom,
        email: body.email,
        phone: body.telephone,
        webhook_url: appUrl + "/api/payment/webhook",
        success_url: appUrl + "?payment=success",
        fail_url: appUrl + "?payment=failed",
        currency: "TND",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Payment initiation failed", ...data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Payment initiation failed",
      },
      { status: 500 }
    );
  }
}
