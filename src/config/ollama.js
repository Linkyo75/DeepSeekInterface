export const OLLAMA_CONFIG = {
    BASE_URL: import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434',
    CONNECTION_TIMEOUT: 5000, // 5 seconds timeout
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second between retries
  };