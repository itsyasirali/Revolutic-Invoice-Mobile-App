const LOCAL_IP = "http://192.168.18.22:5000";
const LIVE_URL = "https://your-live-api-url.com";

export const IP = __DEV__ ? LOCAL_IP : LIVE_URL;
