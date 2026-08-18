import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

// Attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refreshToken")
    ) {
      originalRequest._retry = true;

      try {
        const refreshRes = await axios.post(
          "http://localhost:3000/auth/refresh-token",
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
            },
          }
        );

        localStorage.setItem("accessToken", refreshRes.data.accessToken);
        localStorage.setItem("refreshToken", refreshRes.data.refreshToken);

        originalRequest.headers.Authorization =
          `Bearer ${refreshRes.data.accessToken}`;

        return api(originalRequest);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;