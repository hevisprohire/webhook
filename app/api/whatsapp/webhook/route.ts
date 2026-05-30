import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    console.log("WhatsApp Webhook:", payload);

    // Yahan database operations kar sakte ho
    // Candidate create kar sakte ho
    // ATS stage update kar sakte ho

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}