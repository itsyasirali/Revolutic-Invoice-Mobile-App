// Dev default points at the Next.js backend's default port (3000) on this
// machine's LAN IP. Override via EXPO_PUBLIC_API_URL in .env for a different
// network, device, or a tunnel (`expo start --tunnel`).
const LOCAL_IP = "http://192.168.1.9:3000";
const LIVE_URL = "https://your-live-api-url.com";

export const IP = process.env.EXPO_PUBLIC_API_URL ?? (__DEV__ ? LOCAL_IP : LIVE_URL);
