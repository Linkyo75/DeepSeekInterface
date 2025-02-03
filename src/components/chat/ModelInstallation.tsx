import React, { useState, useEffect } from 'react';
import { Terminal, Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import { useSettingsStore } from '../../stores/useSettingsStore';

const ModelInstallation = ({ 
  modelId, 
  isOpen, 
  onClose,
  onInstallComplete 
}) => {
  const { ollamaUrl } = useSettingsStore();
  const [installationProgress, setInstallationProgress] = useState(0);
  const [installationStatus, setInstallationStatus] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installationLog, setInstallationLog] = useState([]);

  const startInstallation = async () => {
    if (!modelId) return;
    
    setIsInstalling(true);
    setInstallationProgress(0);
    setInstallationStatus('Starting installation...');
    setInstallationLog([]);

    try {
      const response = await fetch(`${ollamaUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelId }),
      });

      if (!response.ok) {
        throw new Error('Installation failed - server returned ' + response.status);
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            if (data.status) {
              setInstallationStatus(data.status);
              setInstallationLog(prev => [...prev, data.status]);
            }
            
            if (data.completed && data.total) {
              const progress = (data.completed / data.total) * 100;
              setInstallationProgress(progress);
            }

            // Check for completion
            if (data.status === 'success' || data.status?.includes('complete')) {
              setInstallationProgress(100);
              return;
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }

      // If we get here normally, also consider it a success
      setInstallationProgress(100);
      setIsInstalling(false);
      toast.success(`Model ${modelId} installed successfully!`);
      onInstallComplete?.();
    } catch (error) {
      console.error('Installation error:', error);
      toast.error(`Failed to install model: ${error.message}`);
      setIsInstalling(false);
    }
  };

  const handleInstallationSuccess = React.useCallback(() => {
    setInstallationProgress(100);
    setIsInstalling(false);
    toast.success(`Model ${modelId} installed successfully!`);
    onInstallComplete?.();
  }, [modelId, onInstallComplete]);

  // Handle installation completion
  useEffect(() => {
    if (installationProgress === 100 && isInstalling) {
      const timer = setTimeout(() => {
        handleInstallationSuccess();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [installationProgress, isInstalling, handleInstallationSuccess]);

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open && !isInstalling) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Install Model: {modelId}</DialogTitle>
          <DialogDescription>
            The model will be downloaded and installed locally on your machine.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!isInstalling ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted">
                <Terminal className="h-5 w-5 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium">Installation Requirements:</p>
                  <ul className="text-sm space-y-1">
                    <li>• Stable internet connection</li>
                    <li>• Sufficient disk space</li>
                    <li>• Running Ollama instance</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg border">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium">Please Note:</p>
                  <p className="text-sm text-muted-foreground">
                    The installation may take several minutes depending on your internet 
                    speed and the model size. Please keep this window open during the installation.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Installation Progress</span>
                  <span>{Math.round(installationProgress)}%</span>
                </div>
                <Progress value={installationProgress} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {installationStatus}
                </p>
              </div>

              <ScrollArea className="h-[200px] rounded-md border p-4">
                <div className="space-y-1">
                  {installationLog.map((log, index) => (
                    <div key={index} className="text-sm font-mono">
                      {log}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          {!isInstalling ? (
            <>
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                onClick={startInstallation}
                className="gap-2"
              >
                <Terminal className="h-4 w-4" />
                Start Installation
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              disabled
              className="gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Installing...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModelInstallation;