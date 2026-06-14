import api from './client';

// Segment preview — saved segment create nahi hota, sirf live preview
export const previewSegment = async (criteria) => {
  const { data } = await api.post('/api/segments/preview', criteria);
  return data;
};
