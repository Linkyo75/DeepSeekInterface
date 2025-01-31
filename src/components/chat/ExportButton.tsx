import React from 'react';
import { Download, FileJson, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const ExportButton = ({ messages }) => {
  const exportMarkdown = () => {
    const content = messages.map(msg => {
      const role = msg.role === 'user' ? 'You' : 'Assistant';
      const content = msg.content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      return `### ${role}:\n${content}\n`;
    }).join('\n');
    
    downloadFile(content, 'chat-export.md', 'text/markdown');
  };
  
  const exportJSON = () => {
    const data = {
      timestamp: new Date().toISOString(),
      messages: messages.map(msg => ({
        ...msg,
        content: msg.content.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
      }))
    };
    
    downloadFile(
      JSON.stringify(data, null, 2),
      'chat-export.json',
      'application/json'
    );
  };
  
  const exportTXT = () => {
    const content = messages.map(msg => {
      const role = msg.role === 'user' ? 'You' : 'Assistant';
      const content = msg.content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      return `[${role}]:\n${content}\n`;
    }).join('\n---\n\n');
    
    downloadFile(content, 'chat-export.txt', 'text/plain');
  };
  
  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Chat
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportMarkdown}>
          <FileText className="h-4 w-4 mr-2" />
          Export as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportJSON}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportTXT}>
          <FileText className="h-4 w-4 mr-2" />
          Export as Text
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;