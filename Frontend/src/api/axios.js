import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.message || '操作失败';
    // 这里可以集成你的消息提示组件
    console.error(message);
    return Promise.reject(error);
  }
);

export default api;
