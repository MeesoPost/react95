import { pool } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendEmail } from "../../utils/email";

async function logEmailFailure(details: object) {
  try {
    await pool.query("INSERT INTO email_failures (details) VALUES ($1)", [
      JSON.stringify(details),
    ]);
  } catch (error) {
    console.error("Failed to log email failure:", error);
  }
}

export async function POST(request: Request) {
  const { title, email, type } = await request.json();

  try {
    const result = await pool.query(
      "INSERT INTO requests (title, email, type) VALUES ($1, $2, $3) RETURNING id",
      [title, email, type]
    );

    try {
      await sendEmail(
        process.env.EMAIL_USER ?? "",
        "New Request Submitted",
        `A new request has been submitted:\nTitle: ${title}\nEmail: ${email}\nType: ${type}`,
        `<h1>New Request Submitted</h1>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Type:</strong> ${type}</p>`
      );
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      await logEmailFailure({
        title,
        email,
        type,
        error: emailError instanceof Error ? emailError.message : String(emailError),
      });
    }

    return NextResponse.json({ id: result.rows[0].id }, { status: 201 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
