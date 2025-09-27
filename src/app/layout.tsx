import type { Metadata } from "next";
import { Montserrat } from "next/font/google"; // Import Montserrat
import "./globals.css";

// Configure the Montserrat font
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat", // Set up the CSS variable
});

export const metadata: Metadata = {
  title: "TalentScript",
  description: "Generate professional job descriptions and interview questions with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Apply the font variable to the html tag
    <html lang="en" className={`${montserrat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
