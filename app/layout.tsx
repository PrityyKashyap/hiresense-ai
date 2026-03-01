import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/AuthContext";

export const metadata: Metadata = {
  title: "HireSense AI — AI-Powered Resume Intelligence Platform",
  description:
    "Get your ATS score, skill gap analysis, and personalized resume improvement tips powered by AI. Made for India's internship and entry-level hiring market.",
  keywords: "ATS score, resume analysis, skill gap, AI hiring, internship, job screening",
  openGraph: {
    title: "HireSense AI",
    description: "AI-Powered Resume Screening & Skill Gap Intelligence Platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="mesh-bg" aria-hidden="true" />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              color: "#0f172a",
              border: "1px solid rgba(59,130,246,0.25)",
              borderRadius: "12px",
              fontSize: "14px",
              boxShadow: "0 4px 20px rgba(59,130,246,0.12)",
            },
          }}
        />
      </body>
    </html>
  );
}
