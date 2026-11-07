// src/api/roadSegmentApi.js
import api from './axiosConfig'

// GET /api/public/road-segments — used to populate dropdown in submit form
export const getRoadSegments = () => {
  return api.get('/api/public/road-segments')
}

export const createRoadSegment = (data) => api.post('/api/admin/road-segments', data)
export const getAllRoadSegments = () => api.get('/api/admin/road-segments')








