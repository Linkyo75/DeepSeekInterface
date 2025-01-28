import React, { useState, useRef, useEffect } from 'react';
import { Send, Settings, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: input,
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
              <div className="text-sm font-medium mb-1">
                {message.role === 'user' ? 'You' : 'Deepseek'}
              </div>
              <div className="text-card-foreground whitespace-pre-wrap">
                {message.content}
              </div>
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
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;