import { reactive, readonly } from "vue";
import { useRouter } from "vue-router";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const getStoredState = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const state = reactive({
  token: localStorage.getItem("token") || null,
  user: getStoredState("user", null),
  menus: getStoredState("menus", []),
});

export function useUserStore() {
  const router = useRouter();

  const setToken = (token) => {
    state.token = token;
    localStorage.setItem("token", token);
  };

  const setUser = (user) => {
    state.user = user;
    localStorage.setItem("user", JSON.stringify(user));
  };

  const setMenus = (menus) => {
    state.menus = menus;
    localStorage.setItem("menus", JSON.stringify(menus));
  };

  const fetchUserInfo = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
        setMenus(data.data.menus || []);
      }
    } catch (e) {
      console.error("Failed to fetch user info:", e);
    }
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "登录失败");
    }

    const data = await response.json();
    const token = data.data.tokens.accessToken;
    setToken(token);

    const userResponse = await fetch(`${API_BASE}/auth/me`, {
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      setUser(userData.data.user);
      setMenus(userData.data.menus || []);
    }

    return data.data;
  };

  const logout = () => {
    state.token = null;
    state.user = null;
    state.menus = [];
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("menus");
    router.push("/login");
  };

  const isAuthenticated = () => !!state.token;

  return {
    state: readonly(state),
    login,
    logout,
    isAuthenticated,
    setMenus,
    fetchUserInfo,
  };
}
