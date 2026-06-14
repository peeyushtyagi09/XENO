import api from './client';

// Customer API functions — TanStack Query hooks me use honge

// Customers list fetch karna — pagination, search, city filter support
export const getCustomers = async (params = {}) => {
  const { data } = await api.get('/customers', { params });
  return data;
};

// Ek customer ki detail by ID
export const getCustomerById = async (id) => {
  const { data } = await api.get(`/customers/${id}`);
  return data;
};

// Naya customer create karna
export const createCustomer = async (payload) => {
  const { data } = await api.post('/customers', payload);
  return data;
};
