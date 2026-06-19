import axiosInstance from './axiosInstance'

const transactionApi = {
  getAll: (params) =>
    axiosInstance.get('/transactions', { params }).then((r) => r.data.data),

  getById: (id) =>
    axiosInstance.get(`/transactions/${id}`).then((r) => r.data.data),

  create: (data) =>
    axiosInstance.post('/transactions', data).then((r) => r.data.data),

  update: (id, data) =>
    axiosInstance.put(`/transactions/${id}`, data).then((r) => r.data.data),

  delete: (id) =>
    axiosInstance.delete(`/transactions/${id}`).then((r) => r.data),
}

export default transactionApi
