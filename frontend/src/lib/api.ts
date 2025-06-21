import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000', // your backend URL
  withCredentials: true, // if using cookies or sessions
})

// Interceptors can be added here if needed
api.interceptors.response.use(
  res => res,
  err => {
    console.error('API error:', err.response?.data || err.message)
    return Promise.reject(err)
  }
)

export default api
