import type { Metadata } from "next";
import "./styles/globals.css";
import localFont from "next/font/local";
import StyledComponentsRegistry from "@/lib/registry";

const msSansSerif = localFont({
  src: [
    { path: "../../public/fonts/ms_sans_serif.woff2", weight: "400" },
    { path: "../../public/fonts/ms_sans_serif_bold.woff2", weight: "700" },
  ],
  variable: "--font-ms-sans",
});

export const metadata: Metadata = {
  title: "MS Maas95",
  description:
    "The best operating system out there with a 32-bit preemptive multitasking architecture,",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={msSansSerif.className}>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
