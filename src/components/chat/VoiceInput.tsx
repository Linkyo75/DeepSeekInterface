import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// Common languages with their codes
const LANGUAGES = [
  { code: 'auto', name: '🌎 Auto Detect' },
  { code: 'en-US', name: '🇺🇸 English (US)' },
  { code: 'en-GB', name: '🇬🇧 English (UK)' },
  { code: 'es-ES', name: '🇪🇸 Spanish' },
  { code: 'fr-FR', name: '🇫🇷 French' },
  { code: 'de-DE', name: '🇩🇪 German' },
  { code: 'it-IT', name: '🇮🇹 Italian' },
  { code: 'pt-PT', name: '🇵🇹 Portuguese' },
  { code: 'nl-NL', name: '🇳🇱 Dutch' },
  { code: 'pl-PL', name: '🇵🇱 Polish' },
  { code: 'ru-RU', name: '🇷🇺 Russian' },
  { code: 'zh-CN', name: '🇨🇳 Chinese (Simplified)' },
  { code: 'ja-JP', name: '🇯🇵 Japanese' },
  { code: 'ko-KR', name: '🇰🇷 Korean' },
  { code: 'ar-SA', name: '🇸🇦 Arabic' },
  { code: 'hi-IN', name: '🇮🇳 Hindi' },
  { code: 'tr-TR', name: '🇹🇷 Turkish' }
];

const VoiceInput = ({ onTranscript, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [permissionState, setPermissionState] = useState('prompt');
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const saved = localStorage.getItem('preferredLanguage');
    return saved || 'auto';
  });
  const [detectedLanguage, setDetectedLanguage] = useState(null);

  const initializeRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      
      if (selectedLanguage === 'auto') {
        recognitionInstance.lang = '';
      } else {
        recognitionInstance.lang = selectedLanguage;
      }

      recognitionInstance.maxAlternatives = 5;

      recognitionInstance.onresult = (event) => {
        const result = event.results[0];
        const transcript = result[0].transcript;

        if (result.length > 0 && 'lang' in result) {
          const detected = result.lang;
          const detectedLanguageName = LANGUAGES.find(lang => lang.code === detected)?.name || detected;
          setDetectedLanguage(detected);
          
          if (selectedLanguage === 'auto') {
            toast.success(`Detected language: ${detectedLanguageName}`);
          }
        }

        if (event.results[0].isFinal) {
          onTranscript(transcript + ' ');
          setIsListening(false);
          toast.success('Voice input captured!');
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          setPermissionState('denied');
          toast.error('Microphone access denied. Click the microphone icon to enable access.');
        } else if (event.error === 'language-not-supported') {
          toast.error('Selected language is not supported. Switching to auto-detect mode.');
          setSelectedLanguage('auto');
        } else {
          toast.error('Error occurred during voice input. Please try again.');
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        setDetectedLanguage(null);
      };

      setRecognition(recognitionInstance);
    }
  };

  useEffect(() => {
    localStorage.setItem('preferredLanguage', selectedLanguage);
    
    if (recognition) {
      recognition.abort();
      initializeRecognition();
    }
  }, [selectedLanguage]);

  useEffect(() => {
    initializeRecognition();

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' })
        .then((permissionStatus) => {
          setPermissionState(permissionStatus.state);
          
          permissionStatus.onchange = () => {
            setPermissionState(permissionStatus.state);
            
            if (permissionStatus.state === 'granted') {
              toast.success('Microphone access granted!');
            } else if (permissionStatus.state === 'denied') {
              setIsListening(false);
              toast.error('Microphone access denied. Click the microphone icon to enable access.');
            }
          };
        })
        .catch(error => {
          console.error('Error checking permission:', error);
        });
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [onTranscript]);

  const requestPermissionAndListen = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionState('granted');
      toggleListening();
    } catch (error) {
      console.error('Permission error:', error);
      setPermissionState('denied');
      toast.error('Please allow microphone access in your browser settings to use voice input.');
    }
  };

  const toggleListening = () => {
    if (!recognition) {
      toast.error('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      setDetectedLanguage(null);
    } else {
      if (permissionState === 'granted') {
        setIsListening(true);
        recognition.start();
        const message = selectedLanguage === 'auto' 
          ? 'Listening (auto-detect)... Speak now'
          : `Listening in ${LANGUAGES.find(lang => lang.code === selectedLanguage)?.name}... Speak now`;
        toast.info(message);
      } else {
        requestPermissionAndListen();
      }
    }
  };

  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedLanguage}
        onValueChange={setSelectedLanguage}
      >
        <SelectTrigger className="w-[200px] h-9">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((language) => (
            <SelectItem 
              key={language.code} 
              value={language.code}
              className="flex items-center"
            >
              {language.name}
              {detectedLanguage === language.code && " (Detected)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        className={`relative transition-colors ${isListening ? 'bg-red-50 hover:bg-red-100 text-red-500' : ''}`}
        title={isListening ? 'Stop recording' : 'Start voice input'}
      >
        {isListening ? (
          <>
            <MicOff className="h-4 w-4" />
            <span className="absolute -top-1 -right-1">
              <Loader2 className="h-3 w-3 animate-spin" />
            </span>
          </>
        ) : (
          <Mic className={`h-4 w-4 ${permissionState === 'denied' ? 'text-red-500' : ''}`} />
        )}
      </Button>
    </div>
  );
};

export default VoiceInput;