import axiosInstance from './axiosInstance'

const analyticsApi = {
  getCategoryBreakdown: (from, to) =>
    axiosInstance
      .get('/analytics/categories', { params: { from, to } })
      .then((r) => r.data.data),

  getMonthlyTrend: (months = 12) =>
    axiosInstance
      .get('/analytics/trend', { params: { months } })
      .then((r) => r.data.data),
}

export default analyticsApi
