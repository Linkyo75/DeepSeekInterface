import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ExternalLink, Terminal, FileText, MessageCircle, Bot } from 'lucide-react';
import { Button } from './ui/button';

const DocumentationPage = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100">
        <div className="relative">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          </div>
  
          <div className="relative max-w-6xl mx-auto px-4 py-8 space-y-12">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Documentation</h1>
            </div>
  
            <p className="text-xl text-gray-600">Everything you need to know about using the Local AI Chat Interface</p>
  
            <div className="grid md:grid-cols-2 gap-8">
              {sections.map((section, index) => (
                <div key={index} className="relative group h-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                  <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg h-full">
                    <div className="bg-blue-50 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                      {section.icon}
                    </div>
                    <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
                    <div className="space-y-3 text-gray-600">
                      {section.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
  
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-semibold mb-6">Troubleshooting</h2>
              <div className="space-y-6">
                {troubleshooting.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.solution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

const sections = [
  {
    title: "Getting Started",
    icon: <Terminal className="h-6 w-6 text-blue-600" />,
    content: (
      <ul className="list-disc pl-4 space-y-2">
        <li>Download and install Ollama from ollama.ai</li>
        <li>Launch the Ollama application</li>
        <li>Choose and install your preferred model</li>
        <li>Start chatting through the interface</li>
      </ul>
    ),
  },
  {
    title: "Features",
    icon: <Bot className="h-6 w-6 text-blue-600" />,
    content: (
      <ul className="list-disc pl-4 space-y-2">
        <li>Multiple model support with easy switching</li>
        <li>File upload support (.txt, .csv, .json, .pdf)</li>
        <li>Voice input with multiple language support</li>
        <li>Text-to-speech capabilities</li>
        <li>Chat history export options</li>
      </ul>
    ),
  },
  {
    title: "File Handling",
    icon: <FileText className="h-6 w-6 text-blue-600" />,
    content: (
      <ul className="list-disc pl-4 space-y-2">
        <li>Supported formats: .txt, .csv, .json, .pdf</li>
        <li>Drag and drop file upload</li>
        <li>Automatic file content processing</li>
        <li>Context-aware responses based on file content</li>
      </ul>
    ),
  },
  {
    title: "Chat Features",
    icon: <MessageCircle className="h-6 w-6 text-blue-600" />,
    content: (
      <ul className="list-disc pl-4 space-y-2">
        <li>Real-time responses</li>
        <li>Copy message content</li>
        <li>Clear chat history</li>
        <li>Export conversations</li>
        <li>Voice input/output options</li>
      </ul>
    ),
  },
];

const troubleshooting = [
  {
    title: "Cannot Connect to Ollama",
    solution: "Ensure Ollama is installed and running. Check if the service is accessible at localhost:11434. If not, you can change the port in the settings section",
  },
  {
    title: "Model Installation Issues",
    solution: "Verify your internet connection and available disk space. Try running the installation command manually through Ollama.",
  },
  {
    title: "Voice Input Not Working",
    solution: "Check browser microphone permissions and ensure your device has a working microphone.",
  },
  {
    title: "File Upload Problems",
    solution: "Verify file format and size. Currently supported formats are .txt, .csv, .json, and .pdf. All files are limtied to 10Mo except for .pdf which can be up to 20Mo",
  },
];

export default DocumentationPage;