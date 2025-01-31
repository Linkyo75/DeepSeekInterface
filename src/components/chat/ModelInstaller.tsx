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

const ModelInstaller = ({ modelId }) => {
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const terminalInstructions = {
    mac: "Open Terminal (press Cmd + Space, type 'Terminal')",
    linux: "Open your terminal (usually Ctrl + Alt + T)",
    windows: "Open Command Prompt or PowerShell as Administrator"
  };

  const ollamaInstallCommands = {
    mac: "curl https://ollama.ai/install.sh | sh",
    linux: "curl https://ollama.ai/install.sh | sh",
    windows: "winget install ollama"
  };

  const ollamaStartCommands = {
    mac: "# Ollama starts automatically after installation\n# If needed, restart using:\nollama serve",
    linux: "# Start Ollama server:\nollama serve",
    windows: "# Option 1: Start from Windows Start Menu\n# Option 2: Run in terminal:\nollama serve"
  };

  const ollamaDownloadLinks = {
    mac: "https://ollama.ai/download/mac",
    linux: "https://ollama.ai/download/linux",
    windows: "https://ollama.ai/download/windows"
  };

  const modelCommand = `ollama pull ${modelId}`;
  const runCommand = `ollama run ${modelId}`;

  const copyToClipboard = async (command) => {
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

  const CommandBlock = ({ command }) => (
    <div className="bg-muted p-4 rounded-md font-mono text-sm flex justify-between items-center">
      <code className="whitespace-pre">{command}</code>
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
            Follow these steps to install and run the model. All commands must be executed in your terminal.
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
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Terminal Access</h3>
                  <p className="text-sm text-muted-foreground">
                    {terminalInstructions[os]}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    All commands below need to be executed in your terminal.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">1. Install Ollama</h3>
                  {os === 'windows' ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-4">
                        Option 1: Download and run the installer from{" "}
                        <a 
                          href={ollamaDownloadLinks[os]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center"
                        >
                          ollama.ai
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Option 2: Install using winget:
                      </p>
                      <CommandBlock command={command} />
                    </>
                  ) : (
                    <>
                      <CommandBlock command={command} />
                      <p className="text-sm text-muted-foreground mt-2">
                        Alternatively, download the installer from{" "}
                        <a 
                          href={ollamaDownloadLinks[os]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center"
                        >
                          ollama.ai
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </p>
                    </>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">2. Start Ollama Server</h3>
                  <CommandBlock command={ollamaStartCommands[os]} />
                  <p className="text-sm text-muted-foreground mt-2">
                    {os === 'mac' ? (
                      "Ollama starts automatically after installation. You only need to run this command if you've stopped the server."
                    ) : os === 'windows' ? (
                      "You can start Ollama from the Windows Start Menu or use the command above in a new terminal window."
                    ) : (
                      "Run this command in a terminal window and keep it open. The Ollama server needs to be running to use the models."
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">3. Install the Model</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Open a new terminal window and run:
                  </p>
                  <CommandBlock command={modelCommand} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">4. Test the Model (Optional)</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    To test the model directly in the terminal, run:
                  </p>
                  <CommandBlock command={runCommand} />
                  <p className="text-sm text-muted-foreground mt-2">
                    This will start an interactive chat session. Press Ctrl+C to exit.
                  </p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex flex-col gap-2 mt-4 bg-muted/50 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
            <span>
              Important Notes:
              <ul className="list-disc ml-4 mt-1">
                <li>The Ollama server must be running before using this interface</li>
                <li>Keep the terminal window with 'ollama serve' running</li>
                <li>Model downloads can take several minutes depending on your internet connection</li>
              </ul>
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