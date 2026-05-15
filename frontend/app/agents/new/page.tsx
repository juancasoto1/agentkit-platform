"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { agentsAPI } from "@/lib/agents-api";
import { useAuthStore } from "@/lib/auth-store";

export default function NewAgentPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [step, setStep] = useState(1); // 1: Info, 2: Provider, 3: Config
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(
    "Eres un asistente amable y útil. Responde en español."
  );

  // Step 2: Provider
  const [provider, setProvider] = useState<"twilio" | "meta">("twilio");

  // Step 3: Config
  const [agentId, setAgentId] = useState<number | null>(null);
  const [twilioConfig, setTwilioConfig] = useState({
    account_sid: "",
    auth_token: "",
    phone_number: "",
  });
  const [metaConfig, setMetaConfig] = useState({
    access_token: "",
    phone_number_id: "",
    verify_token: "",
  });
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);

  // Step 1: Create Agent
  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !systemPrompt) {
      setError("Por favor completa todos los campos");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const agent = await agentsAPI.create({
        name,
        description,
        system_prompt: systemPrompt,
        whatsapp_provider: "twilio", // Temporal, cambiar en paso 2
      });
      setAgentId(agent.id);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error creando agente");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Update Provider
  const handleSelectProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (agentId) {
      await agentsAPI.update(agentId, {
        whatsapp_provider: provider,
      });
      setStep(3);
    }
  };

  // Step 3: Configure Provider
  const handleConfigureProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentId) return;

    try {
      setLoading(true);
      setError(null);

      if (provider === "twilio") {
        if (!twilioConfig.account_sid || !twilioConfig.auth_token || !twilioConfig.phone_number) {
          setError("Por favor completa todos los campos de Twilio");
          return;
        }
        const result = await agentsAPI.configureTwilio(agentId, twilioConfig);
        setWebhookUrl(result.webhook_url);
      } else {
        if (!metaConfig.access_token || !metaConfig.phone_number_id || !metaConfig.verify_token) {
          setError("Por favor completa todos los campos de Meta");
          return;
        }
        const result = await agentsAPI.configureMeta(agentId, metaConfig);
        setWebhookUrl(result.webhook_url);
      }

      setTimeout(() => {
        router.push(`/agents/${agentId}`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error configurando proveedor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Crear Agente</h1>
          <p className="text-gray-600 mt-2">
            Paso {step} de 3: {step === 1 ? "Información" : step === 2 ? "Proveedor" : "Configuración"}
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition ${
                s <= step ? "bg-blue-600" : "bg-gray-200"
              }`}
            ></div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Agent Info */}
        {step === 1 && (
          <form onSubmit={handleCreateAgent} className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Información del Agente
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del agente *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Soporte 24/7, Vendedor de productos..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nombre que identificará este agente en tu panel
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Agente para responder preguntas frecuentes..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instrucciones del agente (System Prompt) *
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Define cómo debe comportarse el agente..."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Dale instrucciones específicas sobre cómo responder a los clientes
                </p>
              </div>

              <div className="flex gap-4">
                <Link
                  href="/agents"
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-center font-medium"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                >
                  {loading ? "Creando..." : "Continuar"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Step 2: Provider Selection */}
        {step === 2 && agentId && (
          <form onSubmit={handleSelectProvider} className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Selecciona tu proveedor de WhatsApp
            </h2>
            <p className="text-gray-600 mb-8">
              Elige cómo conectar tu agente a WhatsApp
            </p>

            <div className="space-y-4 mb-8">
              {/* Twilio Option */}
              <div
                onClick={() => setProvider("twilio")}
                className={`border-2 rounded-lg p-6 cursor-pointer transition ${
                  provider === "twilio"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <input
                      type="radio"
                      checked={provider === "twilio"}
                      onChange={() => setProvider("twilio")}
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">Twilio</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Sandbox gratis para probar sin verificación
                    </p>
                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <p>✓ Fácil de configurar</p>
                      <p>✓ Ideal para desarrollo y pruebas</p>
                      <p>✓ Pago por mensaje en producción</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta Option */}
              <div
                onClick={() => setProvider("meta")}
                className={`border-2 rounded-lg p-6 cursor-pointer transition ${
                  provider === "meta"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <input
                      type="radio"
                      checked={provider === "meta"}
                      onChange={() => setProvider("meta")}
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">
                      Meta Cloud API
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      API oficial de WhatsApp - Mejor para producción
                    </p>
                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <p>✓ API oficial de Facebook</p>
                      <p>✓ Gratis por conversación</p>
                      <p>⊘ Requiere verificación de cuenta</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-blue-900">
                <span className="font-bold">💡 Recomendación:</span> Si es tu primera vez,
                comienza con <strong>Twilio</strong> para pruebas. Luego puedes migrar a Meta
                para producción.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-center font-medium"
              >
                Atrás
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Continuar
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Provider Configuration */}
        {step === 3 && agentId && (
          <form onSubmit={handleConfigureProvider} className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Configurar {provider === "twilio" ? "Twilio" : "Meta Cloud API"}
            </h2>

            {provider === "twilio" ? (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-900">
                    <span className="font-bold">📱 Instrucciones para Twilio:</span>
                    <br />
                    1. Ve a{" "}
                    <a
                      href="https://www.twilio.com"
                      target="_blank"
                      rel="noopener"
                      className="underline"
                    >
                      twilio.com
                    </a>
                    <br />
                    2. Crea una cuenta (gratis para probar)<br />
                    3. En Console, copia tu Account SID y Auth Token<br />
                    4. Ve a Messaging → WhatsApp Sandbox y actívalo
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account SID *
                    </label>
                    <input
                      type="text"
                      value={twilioConfig.account_sid}
                      onChange={(e) =>
                        setTwilioConfig({
                          ...twilioConfig,
                          account_sid: e.target.value,
                        })
                      }
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auth Token *
                    </label>
                    <input
                      type="password"
                      value={twilioConfig.auth_token}
                      onChange={(e) =>
                        setTwilioConfig({
                          ...twilioConfig,
                          auth_token: e.target.value,
                        })
                      }
                      placeholder="Tu Auth Token"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de WhatsApp *
                    </label>
                    <input
                      type="text"
                      value={twilioConfig.phone_number}
                      onChange={(e) =>
                        setTwilioConfig({
                          ...twilioConfig,
                          phone_number: e.target.value,
                        })
                      }
                      placeholder="+1234567890"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Formato: +codigopais numero (ej: +5712345678)
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-900">
                    <span className="font-bold">🔐 Instrucciones para Meta:</span>
                    <br />
                    1. Ve a{" "}
                    <a
                      href="https://developers.facebook.com"
                      target="_blank"
                      rel="noopener"
                      className="underline"
                    >
                      developers.facebook.com
                    </a>
                    <br />
                    2. Crea una app Business y agrega WhatsApp<br />
                    3. En API Setup, obtén tu Phone Number ID y Access Token<br />
                    4. Crea un Verify Token (cualquier texto secreto)
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Token *
                    </label>
                    <input
                      type="password"
                      value={metaConfig.access_token}
                      onChange={(e) =>
                        setMetaConfig({
                          ...metaConfig,
                          access_token: e.target.value,
                        })
                      }
                      placeholder="Tu Access Token"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number ID *
                    </label>
                    <input
                      type="text"
                      value={metaConfig.phone_number_id}
                      onChange={(e) =>
                        setMetaConfig({
                          ...metaConfig,
                          phone_number_id: e.target.value,
                        })
                      }
                      placeholder="Tu Phone Number ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verify Token *
                    </label>
                    <input
                      type="text"
                      value={metaConfig.verify_token}
                      onChange={(e) =>
                        setMetaConfig({
                          ...metaConfig,
                          verify_token: e.target.value,
                        })
                      }
                      placeholder="Crea un token secreto (ej: mi-agente-2024)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Texto secreto que usarás en la configuración del webhook
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-center font-medium"
              >
                Atrás
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
              >
                {loading ? "Configurando..." : "Completar"}
              </button>
            </div>
          </form>
        )}

        {/* Success */}
        {webhookUrl && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Agente configurado!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu agente está listo para recibir mensajes de WhatsApp
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-mono text-gray-700 break-all">
                Webhook URL: {webhookUrl}
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Redirigiendo al panel del agente...
            </p>

            <Link
              href="/agents"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Ver mis agentes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
