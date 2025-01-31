import React, { useState } from 'react';
import { Copy, Check, AlertCircle, Terminal, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";

const ModelInstaller = ({ modelId }: { modelId: string }) => {
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const ollamaInstallCommands = {
    mac: "curl https://ollama.ai/install.sh | sh",
    linux: "curl https://ollama.ai/install.sh | sh",
    windows: "winget install ollama" 
  };

  const modelCommand = `ollama pull ${modelId}`;

  const copyToClipboard = async (command: string) => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    toast.success('Command copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const checkModelStatus = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      const data = await response.json();
      const isInstalled = data.models?.some(model => model.name === modelId);
      
      if (isInstalled) {
        toast.success('Model is already installed!');
      } else {
        toast.error('Model is not installed. Please run the installation command.');
      }
    } catch (error) {
      toast.error('Could not connect to Ollama. Please make sure it\'s installed and running.');
    }
    setIsChecking(false);
  };

  const CommandBlock = ({ command }: { command: string }) => (
    <div className="bg-muted p-4 rounded-md font-mono text-sm flex justify-between items-center">
      <code>{command}</code>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => copyToClipboard(command)}
        className="ml-2"
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Terminal className="h-4 w-4 mr-2" />
          Install Model
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Install {modelId}</DialogTitle>
          <DialogDescription>
            Follow these steps to install and run the model
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="mac" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mac">macOS</TabsTrigger>
            <TabsTrigger value="linux">Linux</TabsTrigger>
            <TabsTrigger value="windows">Windows</TabsTrigger>
          </TabsList>
          {Object.entries(ollamaInstallCommands).map(([os, command]) => (
            <TabsContent key={os} value={os}>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">1. Install Ollama</h3>
                  <CommandBlock command={command} />
                
                    <p className="text-sm text-muted-foreground mt-2">
                      Alternatively, download the installer from{" "}
                      <a 
                        href="https://ollama.ai/download/windows" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center"
                      >
                        ollama.ai
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </p>
                
                </div>

                <div>
                  <h3 className="font-semibold mb-2">2. Start Ollama</h3>
                  {os === "windows" ? (
                    <p className="text-sm text-muted-foreground">
                      Start Ollama from the Windows Start Menu
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Ollama will start automatically after installation
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">3. Install the Model</h3>
                  <CommandBlock command={modelCommand} />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex flex-col gap-2 mt-4 bg-muted/50 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
            <span>
              First time? Make sure to install Ollama before pulling the model.
              Model downloads can take several minutes depending on your internet connection.
            </span>
          </div>
          
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={checkModelStatus}
            disabled={isChecking}
            className="w-fit"
          >
            Check Installation Status
          </Button>
        </div>

        <DialogFooter className="mt-4">
          <div className="text-xs text-muted-foreground">
            For more information, visit{" "}
            <a 
              href="https://ollama.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center"
            >
              ollama.ai
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModelInstaller;