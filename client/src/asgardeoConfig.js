export const asgardeoConfig = {
  afterSignInUrl: window.env?.VITE_SIGN_IN_REDIRECT_URL || import.meta.env.VITE_SIGN_IN_REDIRECT_URL || "http://localhost:5173",
  clientId: window.env?.VITE_ASGARDEO_CLIENT_ID || import.meta.env.VITE_ASGARDEO_CLIENT_ID,
  baseUrl: `https://api.asgardeo.io/t/${window.env?.VITE_ASGARDEO_ORG_NAME || import.meta.env.VITE_ASGARDEO_ORG_NAME}`,
};
