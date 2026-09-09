import type { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Foganholi Records",
  description: "Gerenciador de coleção de discos",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="overflow-x-hidden">
      <body className="bg-walnut-950 text-parchment min-h-screen overflow-x-hidden antialiased">
        <AuthProvider>
          <Navbar />
          <main className="w-full max-w-full overflow-x-hidden">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}