import api from './axiosConfig'

export const getDepartmentPerformance = () => api.get('/api/admin/performance/departments')
export const getMonthlyTrend = () => api.get('/api/admin/performance/monthly')