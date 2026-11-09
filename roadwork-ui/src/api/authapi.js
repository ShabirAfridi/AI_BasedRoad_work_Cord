//all auth related api call in one place
import api from './axiosConfig'
//post/api/auth/login
export const loginApi = (email,password) => {
return api.post('/api/auth/login',{email,password})
}
//post/api/auth/register
export const registerApi = (data) =>{
return api.post('/api/auth/register',data)
}