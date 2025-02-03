import React, { useState } from 'react';
import { AlertCircle, Terminal, ExternalLink, CheckCircle2, XCircle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import ConnectionSettings from './ConnectionSettings';

const ConnectionError = ({ error, onRetry, currentUrl, onUrlChange }) => {
  const [showingCommandOutput, setShowingCommandOutput] = useState(false);

  const checkOllamaStatus = () => {
    // Platform-specific commands
    const commands = {
      macOS: 'ps aux | grep ollama',
      Linux: 'systemctl status ollama',
      Windows: 'Get-Process ollama',
    };

    setShowingCommandOutput(!showingCommandOutput);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg">
        <div className="p-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <XCircle className="h-12 w-12 text-red-500" />
            <h2 className="text-2xl font-semibold">Connection Error</h2>
          </div>

          <div className="space-y-6">
            {/* Current Status */}
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                <div>
                  <h3 className="font-medium">Unable to connect to Ollama</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Attempted to connect to: <code className="bg-white px-2 py-0.5 rounded">{currentUrl}</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Troubleshooting Steps */}
            <div className="space-y-4">
              <h3 className="font-medium">Troubleshooting Steps:</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 flex items-center justify-center bg-blue-50 rounded-full text-blue-600">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Check if Ollama is installed</p>
                    <p className="text-sm text-gray-600">
                      Download and install Ollama from{" "}
                      <a 
                        href="https://ollama.ai" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center"
                      >
                        ollama.ai
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 flex items-center justify-center bg-blue-50 rounded-full text-blue-600">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Verify Ollama is running</p>
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">Open your terminal and check Ollama's status:</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-sm mb-2">
                        <Terminal className="h-4 w-4 inline-block mr-2" />
                        <span>ollama serve</span>
                      </div>
                      <p>You should see "Ollama is running" message</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 flex items-center justify-center bg-blue-50 rounded-full text-blue-600">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Check connection settings</p>
                    <div className="text-sm text-gray-600">
                      <p>Verify you're using the correct URL and port:</p>
                      <div className="mt-2">
                        <ConnectionSettings
                          currentUrl={currentUrl}
                          onUrlChange={onUrlChange}
                          buttonVariant="outline"
                          buttonLabel="Configure Connection"
                          buttonIcon={<Settings className="h-4 w-4 mr-2" />}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <Link to="/">
                <Button variant="outline">
                  Back to Home
                </Button>
              </Link>
              <Button 
                onClick={onRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionError;