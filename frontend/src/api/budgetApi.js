import axiosInstance from './axiosInstance'

const budgetApi = {
  getAll: () =>
    axiosInstance.get('/budgets').then((r) => r.data.data),

  create: (data) =>
    axiosInstance.post('/budgets', data).then((r) => r.data.data),

  delete: (id) =>
    axiosInstance.delete(`/budgets/${id}`).then((r) => r.data),
}

export default budgetApi
