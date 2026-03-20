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
  const { title, name, type, year, tmdbId, mediaType } = await request.json();
  const tmdbUrl = tmdbId
    ? `https://www.themoviedb.org/${mediaType === "tv" ? "tv" : "movie"}/${tmdbId}`
    : null;

  try {
    const result = await pool.query(
      "INSERT INTO requests (title, name, type) VALUES ($1, $2, $3) RETURNING id",
      [title, name, type]
    );

    try {
      const displayTitle = year ? `${title} (${year})` : title;
      const tmdbLine = tmdbUrl ? `\nTMDB: ${tmdbUrl}` : "";
      const tmdbHtml = tmdbUrl
        ? `<p><strong>TMDB:</strong> <a href="${tmdbUrl}">${tmdbUrl}</a></p>`
        : "";

      await sendEmail(
        process.env.EMAIL_USER ?? "",
        `New Request: ${displayTitle}`,
        `A new request has been submitted:\nTitle: ${displayTitle}\nName: ${name}\nType: ${type}${tmdbLine}`,
        `<h1>New Request Submitted</h1>
        <p><strong>Title:</strong> ${displayTitle}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Type:</strong> ${type}</p>
        ${tmdbHtml}`
      );
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      await logEmailFailure({
        title,
        name,
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
