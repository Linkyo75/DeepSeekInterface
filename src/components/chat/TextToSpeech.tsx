import React, { useState } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

const TextToSpeechButton = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filterThinkingContent = (text) => {
    return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  };

  const speak = async () => {
    if (!text) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const filteredText = filterThinkingContent(text);
      const utterance = new SpeechSynthesisUtterance(filteredText);
      utterance.lang = 'en-US';
      
      utterance.onend = () => {
        setIsPlaying(false);
        setIsLoading(false);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        setIsLoading(false);
        toast.error('Failed to play speech. Please try again.');
      };

      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast.error('Text-to-speech is not supported in your browser');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="icon"
        onClick={speak}
        className={`h-8 w-8 ${isPlaying ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
      <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
        Text-to-speech (English only)
      </div>
    </div>
  );
};

export default TextToSpeechButton;