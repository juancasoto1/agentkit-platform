"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { agentsAPI } from "@/lib/agents-api";
import { useAuthStore } from "@/lib/auth-store";

interface Agent {
  id: number;
  name: string;
  description?: string;
  whatsapp_provider: "twilio" | "meta";
  is_active: boolean;
  created_at: string;
  webhook_url?: string;
}

export default function AgentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchAgents();
  }, [user, router]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await agentsAPI.list();
      setAgents(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error cargando agentes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (agentId: number) => {
    if (!confirm("¿Eliminar este agente? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      await agentsAPI.delete(agentId);
      setAgents(agents.filter((a) => a.id !== agentId));
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error eliminando agente");
    }
  };

  const getProviderLabel = (provider: string) => {
    return provider === "twilio" ? "Twilio" : "Meta Cloud API";
  };

  const getProviderColor = (provider: string) => {
    return provider === "twilio"
      ? "bg-red-100 text-red-800"
      : "bg-blue-100 text-blue-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Mis Agentes</h1>
            <Link
              href="/agents/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Crear Agente
            </Link>
          </div>
          <p className="text-gray-600">
            Crea y gestiona tus agentes de WhatsApp con IA
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando agentes...</p>
          </div>
        )}

        {/* Agents Grid */}
        {!loading && agents.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    {agent.name}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getProviderColor(
                      agent.whatsapp_provider
                    )}`}
                  >
                    {getProviderLabel(agent.whatsapp_provider)}
                  </span>
                </div>

                {agent.description && (
                  <p className="text-gray-600 text-sm mb-4">
                    {agent.description}
                  </p>
                )}

                <div className="space-y-2 text-sm mb-4">
                  <p className="text-gray-500">
                    Creado:{" "}
                    {new Date(agent.created_at).toLocaleDateString("es-ES")}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      agent.is_active
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {agent.is_active ? "✓ Activo" : "⊗ Inactivo"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/agents/${agent.id}`}
                    className="flex-1 bg-gray-100 text-gray-900 px-3 py-2 rounded text-center text-sm hover:bg-gray-200 transition"
                  >
                    Ver detalles
                  </Link>
                  <button
                    onClick={() => handleDelete(agent.id)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded text-sm transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && agents.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-5xl mb-4">🤖</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Sin agentes aún
            </h2>
            <p className="text-gray-600 mb-6">
              Crea tu primer agente de WhatsApp para empezar a automatizar
              conversaciones.
            </p>
            <Link
              href="/agents/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
            >
              Crear mi primer agente
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
