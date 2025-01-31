import React, { useState } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';

const EnhancedFileUpload = ({ onFileUpload, onFileRemove, currentFile, disabled }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = async (file) => {
    setIsProcessing(true);
    setUploadProgress(0);
    
    const totalSize = file.size;
    let processedSize = 0;
    
    try {
      const reader = new FileReader();
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
          processedSize = event.loaded;
        }
      };
      
      const content = await new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            if (file.type === 'application/pdf') {
              const arrayBuffer = reader.result;
              const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
              let fullText = '';
              
              // Update progress as we process each page
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const pageText = content.items
                  .map((item) => item.str)
                  .join(' ');
                fullText += `[Page ${i}]\n${pageText}\n\n`;
                
                setUploadProgress((i / pdf.numPages) * 100);
              }
              
              resolve(fullText.trim());
            } else {
              resolve(reader.result);
            }
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
      });
      
      setUploadProgress(100);
      
      return {
        name: file.name,
        content,
        type: file.type,
        size: totalSize
      };
      
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error processing file. Please try again.');
      return null;
    } finally {
      setIsProcessing(false);
      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const processedFile = await processFile(file);
    if (processedFile) {
      onFileUpload(processedFile);
      toast.success(`File "${file.name}" processed successfully!`);
    }

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
        disabled={disabled || isProcessing}
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
            disabled={disabled || isProcessing}
            className="relative"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>
          
          {uploadProgress > 0 && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12">
              <Progress value={uploadProgress} className="h-1" />
            </div>
          )}
          
          <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
            Upload file (.txt, .csv, .json, .pdf)
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedFileUpload;