import axiosInstance from './axiosInstance'

const authApi = {
  register: (data) =>
    axiosInstance.post('/auth/register', data).then((r) => r.data.data),

  login: (email, password) =>
    axiosInstance.post('/auth/login', { email, password }).then((r) => r.data.data),

  refresh: (refreshToken) =>
    axiosInstance.post('/auth/refresh', { refreshToken }).then((r) => r.data.data),
}

export default authApi
