// Main application constants
export const APP_CONFIG = {
  name: "Proto AI",
  version: "1.0.0",
  description: "AI-powered image management platform",
} as const;

export const API_ENDPOINTS = {
  images: "/api/images",
  upload: "/api/images/upload",
  chunkedUpload: "/api/images/chunked-upload",
} as const;

export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  images: "/images",
} as const;
