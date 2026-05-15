import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AgentKit Platform",
  description: "Plataforma para agentes WhatsApp con IA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
