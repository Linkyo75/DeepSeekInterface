// src/hooks/useOllama.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import React from 'react';
import { toast } from 'sonner';
import { OLLAMA_CONFIG } from '../config/ollama';

export const useOllama = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [installedModels, setInstalledModels] = useState([]);
  const [connectionError, setConnectionError] = useState(null);
  const errorShownRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const checkConnection = useCallback(async (retryCount = 0) => {
    try {
      setIsChecking(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), OLLAMA_CONFIG.CONNECTION_TIMEOUT);

      const response = await fetch(`${OLLAMA_CONFIG.BASE_URL}/api/tags`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setInstalledModels(data.models || []);
      setIsConnected(true);
      setConnectionError(null);
      errorShownRef.current = false;
      return true;
    } catch (error) {
      setIsConnected(false);
      let errorMessage = 'Failed to connect to Ollama';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Connection timeout. Ollama might be running on a different port.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to Ollama';
      }

      setConnectionError(errorMessage);

      // Show error toast only if it hasn't been shown yet
      if (!errorShownRef.current) {
        errorShownRef.current = true;
        timeoutRef.current = setTimeout(() => {
          toast.error('Cannot connect to Ollama. Please check if:', {
            description: React.createElement('ul',
              { className: 'list-disc pl-4 mt-2' },
              React.createElement('li', null, 'Ollama is installed and running'),
              React.createElement('li', null, 'The correct port is configured (default: 11434)'),
              React.createElement('li', null, 'No firewall is blocking the connection')
            ),
            duration: 5000,
          });
        }, 0);
      }

      // Retry logic
      if (retryCount < OLLAMA_CONFIG.RETRY_ATTEMPTS) {
        timeoutRef.current = setTimeout(() => {
          checkConnection(retryCount + 1);
        }, OLLAMA_CONFIG.RETRY_DELAY);
      }

      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const sendMessage = async (model, prompt) => {
    if (!isConnected) {
      timeoutRef.current = setTimeout(() => {
        toast.error('Not connected to Ollama');
      }, 0);
      return { success: false, error: 'Not connected' };
    }

    try {
      const response = await fetch(`${OLLAMA_CONFIG.BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, stream: false }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from model');
      }
      
      const data = await response.json();
      return { success: true, response: data.response };
    } catch (error) {
      timeoutRef.current = setTimeout(() => {
        toast.error(error.message);
      }, 0);
      return { success: false, error: error.message };
    }
  };

  const isModelInstalled = useCallback((modelId) => {
    return installedModels.some(model => model.name === modelId);
  }, [installedModels]);

  useEffect(() => {
    const check = async () => {
      await checkConnection();
    };
    check();

    const interval = setInterval(check, 30000);
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
    connectionError,
    installedModels,
    sendMessage,
    isModelInstalled,
    checkConnection,
    baseUrl: OLLAMA_CONFIG.BASE_URL,
  };
};