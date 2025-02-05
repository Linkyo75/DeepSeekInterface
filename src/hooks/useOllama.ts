// src/hooks/useOllama.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { OLLAMA_CONFIG } from '../config/ollama';

export const useOllama = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [installedModels, setInstalledModels] = useState([]);
  const timeoutRef = useRef(null);

  const checkConnection = useCallback(async (retryCount = 0) => {
    try {
      setIsChecking(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), OLLAMA_CONFIG.CONNECTION_TIMEOUT);

      const response = await fetch(`${OLLAMA_CONFIG.BASE_URL}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors', // Explicitly set CORS mode
        cache: 'no-cache', // Prevent caching issues
        credentials: 'omit', // Don't send credentials
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setInstalledModels(data.models || []);
      setIsConnected(true);
      return true;
    } catch (error) {
      setIsConnected(false);
      console.error('Connection error:', error);

      // Only show error toast on final retry
      if (retryCount >= OLLAMA_CONFIG.RETRY_ATTEMPTS - 1) {
        timeoutRef.current = setTimeout(() => {
          toast.error('Cannot connect to Ollama. Please check:', {
            description: 'Make sure Ollama is running and CORS Unblock is enabled',
            duration: 5000,
          });
        }, 0);
      }

      // Retry logic
      if (retryCount < OLLAMA_CONFIG.RETRY_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, OLLAMA_CONFIG.RETRY_DELAY));
        return checkConnection(retryCount + 1);
      }
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const sendMessage = async (model, prompt) => {
    if (!isConnected) {
      toast.error('Not connected to Ollama');
      return { success: false, error: 'Not connected' };
    }

    try {
      const response = await fetch(`${OLLAMA_CONFIG.BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        body: JSON.stringify({ model, prompt, stream: false }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from model');
      }
      
      const data = await response.json();
      return { success: true, response: data.response };
    } catch (error) {
      console.error('Message error:', error);
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(interval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [checkConnection]);

  return {
    isConnected,
    isChecking,
    installedModels,
    sendMessage,
    checkConnection,
  };
};