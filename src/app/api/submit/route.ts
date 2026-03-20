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

      const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#008080;font-family:'Courier New',monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;">
    <tr><td align="center" valign="middle" style="padding:40px 16px;">

      <!-- Window -->
      <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#c0c0c0;border-top:2px solid #ffffff;border-left:2px solid #ffffff;border-right:2px solid #808080;border-bottom:2px solid #808080;box-shadow:2px 2px 0 #000;">

        <!-- Title bar -->
        <tr>
          <td style="background:#000080;padding:4px 8px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#ffffff;font-size:12px;font-weight:bold;font-family:'Courier New',monospace;">MS Maas — New Request</td>
                <td align="right" style="color:#ffffff;font-size:11px;font-family:'Courier New',monospace;">[ ? ] [ X ]</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding:20px 16px 16px 16px;">

            <!-- Info rows -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="font-size:11px;font-family:'Courier New',monospace;color:#000;padding:4px 0;width:80px;"><strong>Title</strong></td>
                <td style="font-size:11px;font-family:'Courier New',monospace;color:#000;padding:4px 8px;background:#fff;border-top:1px solid #808080;border-left:1px solid #808080;border-right:1px solid #fff;border-bottom:1px solid #fff;">${displayTitle}</td>
              </tr>
              <tr><td colspan="2" style="height:6px;"></td></tr>
              <tr>
                <td style="font-size:11px;font-family:'Courier New',monospace;color:#000;padding:4px 0;"><strong>Name</strong></td>
                <td style="font-size:11px;font-family:'Courier New',monospace;color:#000;padding:4px 8px;background:#fff;border-top:1px solid #808080;border-left:1px solid #808080;border-right:1px solid #fff;border-bottom:1px solid #fff;">${name}</td>
              </tr>
              <tr><td colspan="2" style="height:6px;"></td></tr>
              <tr>
                <td style="font-size:11px;font-family:'Courier New',monospace;color:#000;padding:4px 0;"><strong>Type</strong></td>
                <td style="font-size:11px;font-family:'Courier New',monospace;color:#000;padding:4px 8px;background:#fff;border-top:1px solid #808080;border-left:1px solid #808080;border-right:1px solid #fff;border-bottom:1px solid #fff;">${type}</td>
              </tr>
            </table>

            <!-- Divider -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="border-top:1px solid #808080;border-bottom:1px solid #fff;height:2px;"></td>
              </tr>
            </table>

            <!-- TMDB button or plain text -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="right">
                  ${tmdbUrl
                    ? `<a href="${tmdbUrl}" style="display:inline-block;background:#c0c0c0;color:#000;font-size:11px;font-family:'Courier New',monospace;text-decoration:none;padding:4px 12px;border-top:2px solid #fff;border-left:2px solid #fff;border-right:2px solid #808080;border-bottom:2px solid #808080;">View on TMDB</a>`
                    : `<span style="font-size:11px;font-family:'Courier New',monospace;color:#808080;">No TMDB link</span>`
                  }
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>

    </td></tr>
  </table>
</body>
</html>`;

      await sendEmail(
        process.env.EMAIL_USER ?? "",
        `New Request: ${displayTitle}`,
        `New request:\nTitle: ${displayTitle}\nName: ${name}\nType: ${type}${tmdbLine}`,
        html
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
