import api from './client';

// Campaign API functions — CRUD operations

// Saare campaigns fetch karna — status filter + pagination
export const getCampaigns = async (params = {}) => {
  const { data } = await api.get('/api/campaigns', { params });
  return data;
};

// Single campaign by ID
export const getCampaignById = async (id) => {
  const { data } = await api.get(`/api/campaigns/${id}`);
  return data;
};

// Naya campaign create karna
export const createCampaign = async (payload) => {
  const { data } = await api.post('/api/campaigns', payload);
  return data;
};

// Campaign update karna (name, channel, message, status)
export const updateCampaign = async ({ id, ...updates }) => {
  const { data } = await api.put(`/api/campaigns/${id}`, updates);
  return data;
};

// Campaign delete karna (soft delete)
export const deleteCampaign = async (id) => {
  const { data } = await api.delete(`/api/campaigns/${id}`);
  return data;
};
