import api from './axiosConfig'

export const createDepartment = (data) => api.post('/api/admin/departments', data)
export const getAllDepartments = () => api.get('/api/admin/departments')
export const getActiveDepartments = () => api.get('/api/public/departments')