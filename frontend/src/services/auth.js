const STORAGE_KEY = "hostel_admin_auth";

export const getStoredAuth = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const setStoredAuth = (authData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getToken = () => {
  const auth = getStoredAuth();
  return auth?.token || null;
};
