import api from './axiosConfig'

export const getAuditLogs = () => api.get('/api/admin/audit-logs')