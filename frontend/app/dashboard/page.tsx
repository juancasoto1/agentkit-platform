"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
          <p className="text-gray-600 mb-6">
            Tu plataforma para crear y gestionar agentes de WhatsApp con IA.
          </p>

          {/* CTA */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-2">Comienza ahora</h3>
            <p className="text-gray-700 mb-4">
              Crea tu primer agente de WhatsApp en 3 simples pasos
            </p>
            <Link
              href="/agents/new"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Crear mi primer agente
            </Link>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Link
              href="/agents"
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition"
            >
              <p className="font-bold text-gray-900">Ver Agentes</p>
              <p className="text-sm text-gray-600">Gestiona tus agentes creados</p>
            </Link>
          </div>

          <p className="text-gray-600 font-semibold mb-2">
            Próximas funcionalidades:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Ver conversaciones en vivo</li>
            <li>Intervenir en chats cuando sea necesario (Takeover mode)</li>
            <li>Integrar con Shopify y otras plataformas</li>
            <li>Ver analytics y reportes</li>
            <li>Gestionar múltiples agentes</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
