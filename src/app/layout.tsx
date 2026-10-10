import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ADVOCATE JUDGMENT RESEARCH — Supreme Court of India | High Court of Karnataka",
  description:
    "Professional Digital Law Library and Judgment Research System designed exclusively for practicing advocates and legal professionals in India. Supreme Court of India and High Court of Karnataka jurisprudence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900">
        {children}
      </body>
    </html>
  );
}
