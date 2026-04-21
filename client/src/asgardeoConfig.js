export const asgardeoConfig = {
  afterSignInUrl: import.meta.env.VITE_SIGN_IN_REDIRECT_URL || "http://localhost:5173",
  clientId: import.meta.env.VITE_ASGARDEO_CLIENT_ID,
  baseUrl: `https://api.asgardeo.io/t/${import.meta.env.VITE_ASGARDEO_ORG_NAME}`,
};
