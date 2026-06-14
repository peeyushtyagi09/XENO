import api from './client';

// Campaign analytics fetch karna — funnel stats
export const getCampaignStats = async (id) => {
  const { data } = await api.get(`/api/campaigns/${id}/stats`);
  return data;
};
