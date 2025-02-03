import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Settings, X, Check } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "../ui/dialog";
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';

interface ConnectionSettingsProps {
  currentUrl: string;
  onUrlChange: (url: string) => void;
  onTest?: () => Promise<void>;
  buttonVariant?: string;
  buttonLabel?: string;
  buttonIcon?: React.ReactNode;
}

const ConnectionSettings: React.FC<ConnectionSettingsProps> = ({ 
  currentUrl, 
  onUrlChange, 
  onTest,
  buttonVariant = "ghost",
  buttonLabel,
  buttonIcon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState(currentUrl);
  const [isValidating, setIsValidating] = useState(false);
  const testTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (testTimeoutRef.current) {
        clearTimeout(testTimeoutRef.current);
      }
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      setInputUrl(currentUrl);
    }
    setIsOpen(open);
  }, [currentUrl]);

  const handleTest = useCallback(async (): Promise<boolean> => {
    if (!inputUrl.trim()) {
      toastTimeoutRef.current = setTimeout(() => {
        toast.error('Please enter a valid URL');
      }, 0);
      return false;
    }

    setIsValidating(true);
    try {
      const response = await fetch(`${inputUrl}/api/tags`);
      if (response.ok) {
        toastTimeoutRef.current = setTimeout(() => {
          toast.success('Successfully connected to Ollama!');
        }, 0);
        return true;
      }
      throw new Error('Failed to connect');
    } catch (error) {
      toastTimeoutRef.current = setTimeout(() => {
        toast.error('Could not connect to Ollama at this URL');
      }, 0);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [inputUrl]);

  const handleSave = useCallback(async () => {
    const isValid = await handleTest();
    if (isValid) {
      onUrlChange(inputUrl);
      setIsOpen(false);
      testTimeoutRef.current = setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }, [inputUrl, handleTest, onUrlChange]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ollama Connection Settings</DialogTitle>
          <DialogDescription>
            Configure the connection to your local Ollama instance
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Ollama URL</Label>
            <div className="flex gap-2">
              <Input
                placeholder="http://localhost:11434"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                disabled={isValidating}
              />
              <Button
                size="sm"
                onClick={() => handleTest()}
                disabled={isValidating}
              >
                Test
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Enter the URL where Ollama is running. Default is http://localhost:11434
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isValidating}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isValidating || !inputUrl.trim()}
          >
            <Check className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectionSettings;