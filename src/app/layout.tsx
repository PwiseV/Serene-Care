import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { auth } from "@/auth";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["vietnamese", "latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["vietnamese", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Doctor Appointment System",
  description: "The Ethereal Clinic - A modern healthcare experience",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  // Admins operate entirely inside the dedicated admin shell (sidebar + topbar),
  // so the public marketing Header/Footer are skipped for them.
  const isAdmin = session?.user?.role === "admin";

  return (
    <html
      lang="vi"
      className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-surface">
        {!isAdmin && <Header session={session} />}
        {children}
        {!isAdmin && <Footer />}
      </body>
    </html>
  );
}
