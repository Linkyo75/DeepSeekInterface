import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, FileText } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import VoiceInput from './VoiceInput';
import { Toaster } from 'sonner';
import TextToSpeechButton from './TextToSpeech';
import { Textarea } from '../ui/textarea';
import ModelInstaller from './ModelInstaller';
import FileUpload, { processFile } from './FileUpload';
import CopyButton from './CopyButton';

const DEEPSEEK_MODELS = [
  { value: "deepseek-r1:1.5b", label: "DeepSeek-R1-Distill-Qwen-1.5B" },
  { value: "deepseek-r1:7b", label: "DeepSeek-R1-Distill-Qwen-7B" },
  { value: "deepseek-r1:8b", label: "DeepSeek-R1-Distill-Llama-8B" },
  { value: "deepseek-r1:14b", label: "DeepSeek-R1-Distill-Qwen-14B" },
  { value: "deepseek-r1:32b", label: "DeepSeek-R1-Distill-Qwen-32B" },
  { value: "deepseek-r1:70b", label: "DeepSeek-R1-Distill-Llama-70B" }
];

const ChatInterface = () => {
  const initialMessages = () => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  };

  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("deepseek-r1:7b");
  const messagesEndRef = useRef(null);
  const [currentFile, setCurrentFile] = useState(null);


  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !currentFile) return;

    let enhancedPrompt = input;
    if (currentFile) {
      enhancedPrompt = `${input || 'Please analyze this document:'}\n\n### File Content (${currentFile.name}):\n${currentFile.content}`;
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

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: enhancedPrompt,
          stream: false
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'error',
        content: 'Failed to get response. Please ensure Ollama is running with the Deepseek model.'
      }]);
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-xl font-semibold">Deepseek Chat</h1>
          <div className="ml-auto flex items-center space-x-4">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {DEEPSEEK_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ModelInstaller modelId={selectedModel} />
            <Button variant="ghost" onClick={clearChat}>
              Clear Chat
            </Button>
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
                {message.content}
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

      <div className="sticky bottom-0 border-t border-border bg-background p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-2">
        <div 
            className="relative"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.add('bg-blue-50');
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.remove('bg-blue-50');
            }}
            onDrop={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.remove('bg-blue-50');
              
              const file = e.dataTransfer.files[0];
              if (file) {
                const processedFile = await processFile(file);
                if (processedFile) {
                  setCurrentFile(processedFile);
                }
              }
            }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message or drop a file here... (Press Enter to send, Shift+Enter for new line)"
              className="min-h-[120px] p-3 text-base resize-y transition-colors"
              disabled={isLoading}
            />
            {!currentFile && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-blue-50/0 transition-colors">
                <div className="hidden text-blue-500 bg-white/80 px-4 py-2 rounded-md shadow-sm">
                  Drop your file here
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 items-center">
          <FileUpload 
              onFileUpload={setCurrentFile}
              onFileRemove={() => setCurrentFile(null)}
              currentFile={currentFile}
              disabled={isLoading}
            />
            <VoiceInput 
              onTranscript={(text) => setInput(prev => prev + text)}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="px-4 py-2"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </form>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default ChatInterface;