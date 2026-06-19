import axiosInstance from './axiosInstance'

const exportApi = {
  downloadCsv: async (from, to) => {
    const response = await axiosInstance.get('/export/csv', {
      params: { from, to },
      responseType: 'blob',
    })
    triggerDownload(response, `transactions_${from}_${to}.csv`)
  },

  downloadExcel: async (from, to) => {
    const response = await axiosInstance.get('/export/excel', {
      params: { from, to },
      responseType: 'blob',
    })
    triggerDownload(response, `transactions_${from}_${to}.xlsx`)
  },
}

function triggerDownload(response, filename) {
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export default exportApi
