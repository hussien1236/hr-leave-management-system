import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Check for required environment variables
const requiredEnvVars = {
  VITE_REVERB_APP_KEY: import.meta.env.VITE_REVERB_APP_KEY,
  VITE_API_URL: import.meta.env.VITE_API_URL
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([ value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
}

window.Pusher = Pusher;

let echoInstance = null;

// Function to get or create Echo instance
export const getEcho = () => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    console.error('No auth token found for Echo initialization');
    return null;
  }

  // If we already have an instance and the token is the same, return it
  if (echoInstance && echoInstance.options.auth.headers.Authorization === `Bearer ${token}`) {
    return echoInstance;
  }

  // Create new instance
  const reverbHost = import.meta.env.VITE_REVERB_HOST || "127.0.0.1";
  const reverbPort = import.meta.env.VITE_REVERB_PORT ? 
    parseInt(import.meta.env.VITE_REVERB_PORT, 10) : 8080;
  const apiUrl = "http://localhost:8000/api";

  console.log('Initializing Echo with:', {
    host: reverbHost,
    port: reverbPort,
    apiUrl: apiUrl,
    hasToken: !!token
  });

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: reverbHost,
    wsPort: reverbPort,
    wssPort: reverbPort,
    forceTLS: false,
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${apiUrl}/broadcasting/auth`,
    auth: {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    },
  });

  window.Echo = echoInstance;
  return echoInstance;
};

// Function to disconnect Echo
export const disconnectEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    window.Echo = null;
  }
};

export default getEcho;