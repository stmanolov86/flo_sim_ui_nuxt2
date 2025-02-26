const auth = "/api/v1/auth";

const authenticate = (value) => $nuxt.$axios.$post(`${auth}/authenticate`, value);

const refresh = (refreshToken) => $nuxt.$axios.$post(`${auth}/refresh`, { refreshToken });

const logout = (refreshToken) => $nuxt.$axios.$post(`${auth}/logout`, { refreshToken });

const getPermissions = () => $nuxt.$axios.$post(`${auth}/get_permissions`);

const getWho = () => $nuxt.$axios.$get(process.env.whoURL);

export { authenticate, refresh, logout, getPermissions, getWho };
