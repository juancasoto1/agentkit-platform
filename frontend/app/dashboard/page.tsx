"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return <div>Redirigiendo...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            🤖 AgentKit Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700">
              <p className="font-semibold">{user.full_name || user.email}</p>
              <p className="text-gray-600">Rol: {user.role}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-semibold">
              Conversaciones
            </h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-semibold">Agentes</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-semibold">
              Mensajes hoy
            </h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Bienvenido a AgentKit!
          </h2>
          <p className="text-gray-600 mb-4">
            Tu plataforma para crear y gestionar agentes de WhatsApp con IA.
          </p>
          <p className="text-gray-600">
            En las próximas fases, podrás:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
            <li>Crear y configurar agentes personalizados</li>
            <li>Ver conversaciones en vivo</li>
            <li>Intervenir en chats cuando sea necesario</li>
            <li>Integrar con Shopify y otras plataformas</li>
            <li>Ver analytics y reportes</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
