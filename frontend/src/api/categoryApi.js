import axiosInstance from './axiosInstance'

const categoryApi = {
  getAll: () =>
    axiosInstance.get('/categories').then((r) => r.data.data),
}

export default categoryApi
