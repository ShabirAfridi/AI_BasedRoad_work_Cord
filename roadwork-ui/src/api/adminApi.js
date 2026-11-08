import api from './axiosConfig'
// ── WORK REQUESTS ────────────────────────────────────────────
export const getAllRequestsAdmin = () => {
  return api.get('/api/admin/requests')
}
export const approveRequest = (id, adminRemarks) => {
  return api.put(`/api/admin/requests/${id}/approve`, { adminRemarks })
}
export const rejectRequest = (id, adminRemarks) => {
  return api.put(`/api/admin/requests/${id}/reject`, { adminRemarks })
}
export const markInProgress = (id) => {
  return api.put(`/api/admin/requests/${id}/start`)
}
export const markCompleted = (id) => {
  return api.put(`/api/admin/requests/${id}/complete`)
}
// ── CONFLICTS ─────────────────────────────────────────────────
export const getAllConflicts = () => {
  return api.get('/api/admin/conflicts')
}
export const getPendingConflicts = () => {
  return api.get('/api/admin/conflicts/pending')
}
// resolution: 'MERGED' | 'ONE_REJECTED' | 'RESCHEDULED'
// rejectRequestId only required for ONE_REJECTED
export const resolveConflict = (id, resolution, adminRemarks, rejectRequestId) => {
  return api.put(`/api/admin/conflicts/${id}/resolve`, {
    resolution,
    adminRemarks,
    rejectRequestId,
  })
}
// ── COMPLAINTS ────────────────────────────────────────────────
export const getAllComplaints = () => api.get('/api/admin/complaints')
export const getSubmittedComplaints = () => api.get('/api/admin/complaints/submitted')
export const markComplaintUnderReview = (id) => api.put(`/api/admin/complaints/${id}/review`)
export const resolveComplaintAdmin = (id, adminResponse, dismiss) =>
<<<<<<< HEAD
  api.put(`/api/admin/complaints/${id}/resolve`, { adminResponse, dismiss })
=======
  api.put(`/api/admin/complaints/${id}/resolve`, { adminResponse, dismiss })
>>>>>>> 1184d18 (Add Liquibase migrations and application updates)
