import api from './axiosConfig'

// axiosConfig defaults to JSON, so multipart has to be set explicitly here
export const uploadPhoto = (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}