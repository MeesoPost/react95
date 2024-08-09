import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { sendEmail } from "../../utils/email";

async function logEmailFailure(details: any) {
  try {
    await sql`
      INSERT INTO email_failures (details)
      VALUES (${JSON.stringify(details)})
    `;
    console.log("Email failure logged to database");
  } catch (error) {
    console.error("Failed to log email failure:", error);
  }
}

export async function POST(request: Request) {
  const { title, email, type } = await request.json();

  try {
    // Insert into database
    const result = await sql`
      INSERT INTO requests (title, email, type)
      VALUES (${title}, ${email}, ${type})
      RETURNING id
    `;

    // Attempt to send email
    try {
      await sendEmail(
        "your@email.com",
        "New Request Submitted",
        `A new request has been submitted:
        Title: ${title}
        Email: ${email}
        Type: ${type}`,
        `<h1>New Request Submitted</h1>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Type:</strong> ${type}</p>`
      );
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Log the failure
      await logEmailFailure({
        title,
        email,
        type,
        error:
          emailError instanceof Error ? emailError.message : String(emailError),
      });
      // You could also implement an alternative notification method here
      // For example, sending a message to a Slack channel or SMS
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
