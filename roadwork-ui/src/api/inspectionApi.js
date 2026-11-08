import api from './axiosConfig'

// Admin
export const getInspectors = () => api.get('/api/admin/inspectors')
export const assignInspector = (requestId, inspectorId) =>
    api.put(`/api/admin/requests/${requestId}/assign-inspector`, { inspectorId })
export const getInspectionReports = () => api.get('/api/admin/inspection-reports')

// Inspector
export const getMyAssignments = () => api.get('/api/inspector/assignments')
export const getMyReports = () => api.get('/api/inspector/reports')
export const submitInspectionReport = (data) => api.post('/api/inspector/reports', data)