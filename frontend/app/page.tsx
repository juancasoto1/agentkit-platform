export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🤖 AgentKit Platform</h1>
        <p className="text-lg text-gray-600 mb-8">
          Plataforma para agentes de WhatsApp con IA
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Iniciando... Verifica que el backend esté levantado
          </p>
          <div className="animate-pulse">
            <div className="h-2 w-2 bg-green-500 rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
