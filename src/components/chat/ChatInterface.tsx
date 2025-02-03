import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, FileText, Eye, EyeOff, Trash2, ChevronLeft, Settings } from 'lucide-react';
import ModelSelector from './ModelSelector';
import ModelInstallation from './ModelInstallation';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectTrigger, SelectValue } from '../ui/select';
import VoiceInput from './VoiceInput';
import { Toaster, toast } from 'sonner';
import TextToSpeechButton from './TextToSpeech';
import { Textarea } from '../ui/textarea';
import FileUpload, { processFile } from './FileUpload';
import CopyButton from './CopyButton';
import ExportButton from './ExportButton';
import { useOllama } from '../../hooks/useOllama';
import { Link, useNavigate } from 'react-router-dom';
import ConnectionSettings from './ConnectionSettings';
import { useSettingsStore } from '../../stores/useSettingsStore';



const ChatInterface = () => {
  const { ollamaUrl, setOllamaUrl } = useSettingsStore();
  const { isConnected, isChecking, sendMessage, checkConnection } = useOllama();
  const navigate = useNavigate();
  
  // State for messages and input
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [showThinking, setShowThinking] = useState(true);
  
  // Model selection state
  const [selectedModel, setSelectedModel] = useState(null);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(true);
  const [isInstallationOpen, setIsInstallationOpen] = useState(false);
  const [installedModels, setInstalledModels] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check installed models on mount and after installation
    fetchInstalledModels();
  }, []);

  useEffect(() => {
    if (!isChecking && !isConnected) {
      navigate('/');
    }
  }, [isChecking, isConnected]);

  useEffect(() => {
    if (!isChecking && !isConnected) {
      setTimeout(() => {
        toast.error('Cannot connect to Ollama');
      }, 0);
    }
  }, [isChecking, isConnected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isInstallationOpen && selectedModel) {
      const timer = setTimeout(() => {
        toast.success(`Model ${selectedModel} is ready to use!`);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isInstallationOpen, selectedModel]);

  const fetchInstalledModels = async () => {
    try {
      const response = await fetch(`${ollamaUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const data = await response.json();
      setInstalledModels(data.models?.map(model => model.name) || []);
    } catch (error) {
      console.error('Error fetching installed models:', error);
      toast.error('Failed to fetch installed models. Please check if Ollama is running.');
      return [];
    }
  };

  const handleModelSelect = async (modelId) => {
    if (installedModels.includes(modelId)) {
      setSelectedModel(modelId);
      setIsModelSelectorOpen(false);
    } else {
      // Keep the selector open and don't set the model until it's installed
      const tempModel = modelId;
      setSelectedModel(null); // Clear current selection until installation is complete
      setIsInstallationOpen(true);
      
      // Only update the selected model after successful installation
      const onComplete = async () => {
        await fetchInstalledModels();
        setIsInstallationOpen(false);
        setSelectedModel(tempModel);
        setIsModelSelectorOpen(false);
      };
      
      return onComplete;
    }
  };

  const handleInstallationComplete = React.useCallback(async () => {
    await fetchInstalledModels();
    setIsInstallationOpen(false);
    setIsModelSelectorOpen(false);
  }, [fetchInstalledModels]);

  const processContent = (content) => {
    if (!content) return '';
    if (showThinking) return content;
    return content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  };

  const handleUninstallModel = async (modelId) => {
    try {
      const response = await fetch(`${ollamaUrl}/api/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to uninstall model: ${response.statusText}`);
      }

      await fetchInstalledModels(); // Refresh the list
      toast.success(`Successfully uninstalled ${modelId}`);
    } catch (error) {
      console.error('Error uninstalling model:', error);
      toast.error(`Failed to uninstall ${modelId}`);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !currentFile) return;
    if (!selectedModel) {
      toast.error('Please select a model first');
      setIsModelSelectorOpen(true);
      return;
    }

    const userMessage = {
      role: 'user',
      content: input,
      attachedFile: currentFile?.name
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setCurrentFile(null);
    setIsLoading(true);

    const response = await sendMessage(selectedModel, input);
    if (response.success) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.response 
      }]);
    }
    
    setIsLoading(false);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
    

 

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>

          <h1 className="text-4xl ml-4 font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Your locally running chat
          </h1>

          <div className="ml-auto flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setModelSelectorOpen(true)}
              className="w-[260px]"
            >
              {selectedModel || "Please select a model"} 
            </Button>

            {/* Model selector dialog */}
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={handleModelSelect}
              open={modelSelectorOpen}
              onOpenChange={setModelSelectorOpen}
              installedModels={installedModels}
              onUninstall={handleUninstallModel}

            />


            <ConnectionSettings
              currentUrl={ollamaUrl}
              onUrlChange={setOllamaUrl}
              onTest={checkConnection}
            />
            <ExportButton messages={messages} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <Card 
            key={index} 
            className={message.role === 'user' ? 'max-w-3xl ml-auto bg-primary/10' : 'max-w-3xl mr-auto bg-blue-50'}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="text-sm font-medium mb-1">
                  {message.role === 'user' ? 'You' : 'Deepseek'}
                </div>
                {message.role === 'assistant' && (
                  
                  <div className="flex gap-1">
                    <CopyButton text={message.content} />
                    <TextToSpeechButton text={message.content} />
                  </div>                )}
              </div>
              <div className="text-card-foreground whitespace-pre-wrap">
                {processContent(message.content)}
              </div>
              {message.attachedFile && (
                <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                  <FileText className="h-3 w-3" />
                  <span>Attached: {message.attachedFile}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

    {/* Chat input area */}
    <div className="sticky bottom-0 border-t border-border bg-background p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-2">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedModel ? "Type your message..." : "Please select a model to start chatting"}
              className="min-h-[120px] p-3 text-base resize-y transition-colors"
              disabled={isLoading || !selectedModel}
            />
          </div>

          <div className="flex justify-end gap-2 items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Chat
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowThinking(!showThinking)}
              className="flex items-center gap-2"
            >
              {showThinking ? (
                <>
                  <Eye className="h-4 w-4" />
                  Show Thinking
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4" />
                  Hide Thinking
                </>
              )}
            </Button>

            <FileUpload 
              onFileUpload={setCurrentFile}
              onFileRemove={() => setCurrentFile(null)}
              currentFile={currentFile}
              disabled={isLoading || !selectedModel}
            />

            <VoiceInput 
              onTranscript={(text) => setInput(prev => prev + text)}
              disabled={isLoading || !selectedModel}
            />
            
            <Button 
              type="submit" 
              disabled={isLoading || !selectedModel || !input.trim()}
              className="px-4 py-2"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </form>
      </div>

      {/* Model Selection and Installation Modals */}

      <ModelInstallation
        modelId={selectedModel}
        isOpen={isInstallationOpen}
        onClose={() => setIsInstallationOpen(false)}
        onInstallComplete={handleInstallationComplete}
      />

      <Toaster position="top-center" />
    </div>
  );
};

export default ChatInterface;