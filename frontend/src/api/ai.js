import api from './client';

// Campaign recommendation generate karne ke liye endpoint call
export const generateAICampaign = async (goal) => {
  // Campaign generator API ko request bhej rahe hain
  const { data } = await api.post('/api/ai/generate-campaign', { goal });
  return data;
};

// Campaign analytics ka performance report analyze karne ke liye call
export const analyzeCampaignPerformance = async (campaignId) => {
  // Campaign insights API ko fetch attempt de rahe hain
  const { data } = await api.post('/api/ai/analyze-campaign', { campaignId });
  return data;
};

// Natural language se MongoDB criteria filters generator API
export const createAISegment = async (query) => {
  // Segment builder key validation aur payload post request
  const { data } = await api.post('/api/ai/create-segment', { query });
  return data;
};

// Copilot router core endpoint calls
export const callCopilotChat = async (message) => {
  // Copilot model orchestration start kar rahe hain
  const { data } = await api.post('/api/ai/copilot', { message });
  return data;
};

// Gemini integration status key connectivity check endpoints
export const testGeminiConnection = async (prompt = 'Ping test connection') => {
  // Central Gemini wrapper connectivity validation execute kar rahe hain
  const { data } = await api.post('/api/ai/test', { prompt });
  return data;
};
