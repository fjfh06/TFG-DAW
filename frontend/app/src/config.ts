/**
 * Centralized API configuration.
 * Uses Vite environment variables with a fallback to /api (Standard proxy path).
 */
export const API_URL = import.meta.env.VITE_API_URL || "/api";
