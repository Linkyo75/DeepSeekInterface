import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const filterThinkingContent = (text: string): string => {
    return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  };

  const copyToClipboard = async () => {
    const filteredText = filterThinkingContent(text);
    
    try {
      await navigator.clipboard.writeText(filteredText);
      setCopied(true);
      toast.success('Content copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy content');
    }
  };

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="icon"
        onClick={copyToClipboard}
        className="h-8 w-8"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
      <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
        Copy content
      </div>
    </div>
  );
};

export default CopyButton;