/**
 * Cliente API para agentes de WhatsApp
 */

import { api } from "./api";

export const agentsAPI = {
  /**
   * Crear nuevo agente
   */
  create: async (data: {
    name: string;
    description?: string;
    system_prompt: string;
    whatsapp_provider: "twilio" | "meta";
  }) => {
    const response = await api.post("/agents", data);
    return response.data;
  },

  /**
   * Listar agentes de la empresa
   */
  list: async () => {
    const response = await api.get("/agents");
    return response.data;
  },

  /**
   * Obtener detalles de un agente
   */
  getById: async (agentId: number) => {
    const response = await api.get(`/agents/${agentId}`);
    return response.data;
  },

  /**
   * Actualizar agente
   */
  update: async (agentId: number, data: any) => {
    const response = await api.patch(`/agents/${agentId}`, data);
    return response.data;
  },

  /**
   * Configurar Twilio
   */
  configureTwilio: async (
    agentId: number,
    data: {
      account_sid: string;
      auth_token: string;
      phone_number: string;
    }
  ) => {
    const response = await api.post(
      `/agents/${agentId}/configure/twilio`,
      data
    );
    return response.data;
  },

  /**
   * Configurar Meta
   */
  configureMeta: async (
    agentId: number,
    data: {
      access_token: string;
      phone_number_id: string;
      verify_token: string;
    }
  ) => {
    const response = await api.post(`/agents/${agentId}/configure/meta`, data);
    return response.data;
  },

  /**
   * Eliminar agente
   */
  delete: async (agentId: number) => {
    const response = await api.delete(`/agents/${agentId}`);
    return response.data;
  },
};
