const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

const EXCLUDED_PATHS = ["/auth/login", "/auth/register"];

function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

function redirectToLogin() {
  const currentUrl = window.location.href;
  window.location.href = `/login?redirect_url=${encodeURIComponent(
    currentUrl
  )}`;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const data = await response.json();

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("menus");

      if (!EXCLUDED_PATHS.some((path) => endpoint.startsWith(path))) {
        redirectToLogin();
      }
      throw new Error(data.message || "登录已过期，请重新登录");
    }

    throw new Error(data.message || data.error?.message || "请求失败");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export default request;

export const userApi = {
  getList: (params) =>
    request(
      `/users?page=${params.page}&pageSize=${params.pageSize}&search=${
        params.keyword || ""
      }`
    ),
  getById: (id) => request(`/users/${id}`),
  create: (data) =>
    request("/users", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/users/${id}`, { method: "DELETE" }),
  assignRoles: (id, roleIds) => {
    // Use the bulk assignRoles method from user service
    return request(`/users/${id}/assign-roles`, {
      method: "POST",
      body: JSON.stringify({ roleIds }),
    });
  },
  removeRoles: (id, roleIds) => {
    // Use the bulk removeRoles method from user service
    return request(`/users/${id}/remove-roles`, {
      method: "POST",
      body: JSON.stringify({ roleIds }),
    });
  },
};

export const roleApi = {
  getList: (params) =>
    request(
      `/roles?page=${params.page}&pageSize=${params.pageSize}&search=${
        params.keyword || ""
      }`
    ),
  getById: (id) => request(`/roles/${id}`),
  create: (data) =>
    request("/roles", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/roles/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/roles/${id}`, { method: "DELETE" }),
  getMenus: (id) => request(`/roles/${id}/menus`),
  assignMenus: (id, menuIds) =>
    request(`/roles/${id}/menus`, {
      method: "POST",
      body: JSON.stringify({ menuIds }),
    }),
};

export const menuApi = {
  getList: () => request("/menus"),
  getTree: () => request("/menus/tree"),
  getByRole: (roleId) => request(`/menus/by-role?roleId=${roleId}`),
  getById: (id) => request(`/menus/${id}`),
  create: (data) =>
    request("/menus", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/menus/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/menus/${id}`, { method: "DELETE" }),
};

export const articleApi = {
  getList: (params) =>
    request(
      `/articles?page=${params.page}&pageSize=${params.pageSize}&keyword=${
        params.keyword || ""
      }`
    ),
  getById: (id) => request(`/articles/${id}`),
  create: (data) =>
    request("/articles", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/articles/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/articles/${id}`, { method: "DELETE" }),
};

export const videoApi = {
  getList: (params) =>
    request(
      `/videos?page=${params.page}&pageSize=${params.pageSize}&keyword=${
        params.keyword || ""
      }`
    ),
  getById: (id) => request(`/videos/${id}`),
  create: (data) =>
    request("/videos", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/videos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/videos/${id}`, { method: "DELETE" }),
};

export const caseApi = {
  getList: (params) =>
    request(
      `/cases?page=${params.page}&pageSize=${params.pageSize}&keyword=${
        params.keyword || ""
      }`
    ),
  getById: (id) => request(`/cases/${id}`),
  create: (data) =>
    request("/cases", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/cases/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/cases/${id}`, { method: "DELETE" }),
};

export const authApi = {
  getProfile: () => request("/auth/me"),
  changePassword: (data) =>
    request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// 上传文件请求（不设置 Content-Type，让浏览器自动设置）
function uploadRequest(endpoint, formData) {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem("token");

  return fetch(url, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  }).then(async (response) => {
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || data.error?.message || "上传失败");
    }
    return response.json();
  });
}

export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return uploadRequest("/upload/image", formData);
  },
  uploadVideo: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return uploadRequest("/upload/video", formData);
  },
};

export const profileApi = {
  getProfile: () => request("/auth/me"),
  updateProfile: (data) =>
    request("/auth/profile", { method: "PUT", body: JSON.stringify(data) }),
  changePassword: (data) =>
    request("/auth/change-password", { method: "POST", body: JSON.stringify(data) }),
};
