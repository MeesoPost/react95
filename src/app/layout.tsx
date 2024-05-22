import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./styles/globals.css";
import localFont from "@next/font/local";
const myFont = localFont({
  src: "../../public/fonts/ms_sans_serif_bold.woff2",
});

const inter = Inter({ subsets: ["latin"] });

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
      <body style={myFont.style} className={inter.className}>
        {children}
      </body>
    </html>
  );
}
