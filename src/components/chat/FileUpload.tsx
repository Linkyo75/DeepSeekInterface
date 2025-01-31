import React from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const ALLOWED_TYPES = {
  'text/plain': 10,
  'text/csv': 10,
  'application/json': 10,
  'application/pdf': 20
};

export type FileData = {
  name: string;
  content: string;
  type: string;
};

// Export the file processing logic so it can be used by drag & drop
export const processFile = async (file: File): Promise<FileData | null> => {
  // Check file type
  if (!ALLOWED_TYPES[file.type]) {
    toast.error('Only text files and PDFs are supported (.txt, .csv, .json, .pdf)');
    return null;
  }

  // Check file size (MB)
  const maxSize = ALLOWED_TYPES[file.type];
  if (file.size > maxSize * 1024 * 1024) {
    toast.error(`File too large. Maximum size: ${maxSize}MB`);
    return null;
  }

  const loadingToast = toast.loading('Processing file...');

  try {
    let content: string;
    
    if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';
      
      // Get total number of pages
      const numPages = pdf.numPages;
      
      // Extract text from each page
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += `[Page ${i}]\n${pageText}\n\n`;
      }
      
      content = fullText.trim();
    } else {
      content = await file.text();
    }
    
    toast.dismiss(loadingToast);
    toast.success(`File "${file.name}" attached`);
    
    return {
      name: file.name,
      content: content,
      type: file.type
    };
  } catch (error) {
    console.error('Error reading file:', error);
    toast.dismiss(loadingToast);
    toast.error('Error reading file. Please try again.');
    return null;
  }
};

const FileUpload = ({ 
  onFileUpload, 
  onFileRemove,
  currentFile,
  disabled 
}: { 
  onFileUpload: (fileData: FileData | null) => void;
  onFileRemove: () => void;
  currentFile: FileData | null;
  disabled?: boolean;
}) => {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const processedFile = await processFile(file);
    if (processedFile) {
      onFileUpload(processedFile);
    }

    // Clear input
    event.target.value = '';
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileChange}
        accept=".txt,.csv,.json,.pdf"
        disabled={disabled}
      />
      {currentFile ? (
        <div className="flex items-center gap-1 bg-blue-50 rounded-full px-3 py-1 text-sm">
          <FileText className="h-3 w-3" />
          <span className="truncate max-w-[150px]">{currentFile.name}</span>
          <button
            onClick={onFileRemove}
            className="text-gray-500 hover:text-gray-700"
            title="Remove file"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="relative group">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={disabled}
            className="relative"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
            Upload file (.txt, .csv, .json, .pdf)
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;