import api from './axiosConfig'

export const predictDelay = (workType, plannedDurationDays, priority) => {
  return api.post('/api/ai/predict-delay', {
    workType,
    plannedDurationDays,
    priority,
  })
}

export const recommendSchedule = (roadSegmentId, earliestStart) => {
  return api.get('/api/ai/recommend-schedule', {
    params: { roadSegmentId, earliestStart },
  })
}

export const categorizeComplaint = (description) => {
  return api.post('/api/ai/categorize-complaint', { description })
}