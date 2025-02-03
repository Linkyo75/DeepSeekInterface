import React, { useState, useEffect } from 'react';
import { ScrollArea } from "../ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { ArrowRight, Clock, ChevronRight, CheckCircle2, Download, Search, Filter, Trash2, Plus } from "lucide-react";
import modelData from '../../config/ollama_models.json';

// Define the order of categories with new additions
const CATEGORY_ORDER = [
  'Installed Models',
  'Custom Models',
  'Llama Family',
  'Mistral Family',
  'DeepSeek Models',
  'CodeLLM Models',
  'Vision Models',
  'Embedding Models',
  'Small Models',
  'Other Models'
];

const parseDateString = (dateStr: string) => {
  if (!dateStr) return new Date(0);
  const now = new Date();
  const parts = dateStr.split(' ');
  const number = parseInt(parts[0]);
  const unit = parts[1] ? parts[1].toLowerCase() : '';
  
  if (isNaN(number)) return new Date(0);
  
  switch (unit) {
    case 'day':
    case 'days':
      return new Date(now.getTime() - number * 24 * 60 * 60 * 1000);
    case 'week':
    case 'weeks':
      return new Date(now.getTime() - number * 7 * 24 * 60 * 60 * 1000);
    case 'month':
    case 'months':
      const date = new Date(now);
      date.setMonth(date.getMonth() - number);
      return date;
    default:
      return new Date(0);
  }
};

// Function to parse size string to GB number
const parseSize = (sizeStr: string) => {
  if (!sizeStr) return 0;
  const match = sizeStr.match(/(\d+\.?\d*)\s*(GB|MB|KB)/i);
  if (!match) return 0;
  
  const [, size, unit] = match;
  const numSize = parseFloat(size);
  
  switch (unit.toUpperCase()) {
    case 'GB':
      return numSize;
    case 'MB':
      return numSize / 1024;
    case 'KB':
      return numSize / (1024 * 1024);
    default:
      return 0;
  }
};

const ModelSelector = ({ 
  selectedModel, 
  onModelChange, 
  open, 
  onOpenChange,
  installedModels = [],
  onUninstall
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Installed Models');
  const [selectedModelInfo, setSelectedModelInfo] = useState(null);
  const [models, setModels] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sizeFilter, setSizeFilter] = useState('all'); // 'all', 'tiny', 'small', 'medium', 'large'
  const [updateFilter, setUpdateFilter] = useState('all');
  const [customModelInput, setCustomModelInput] = useState('');

  // Filter submodels based on criteria
  const filterSubmodels = (submodels, modelName) => {
    if (!submodels) return [];
    
    return submodels.filter(tag => {
      // Search filter
      const searchMatch = 
        modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.tag.toLowerCase().includes(searchQuery.toLowerCase());

      // Size filter
      let sizeMatch = true;
      if (sizeFilter !== 'all') {
        const sizeGB = parseSize(tag.size);
        switch (sizeFilter) {
          case 'tiny': // < 2GB
            sizeMatch = sizeGB < 2;
            break;
          case 'small': // 2-5GB
            sizeMatch = sizeGB >= 2 && sizeGB < 5;
            break;
          case 'medium': // 5-10GB
            sizeMatch = sizeGB >= 5 && sizeGB < 10;
            break;
          case 'large': // >= 10GB
            sizeMatch = sizeGB >= 10;
            break;
        }
      }

      // Update filter
      let updateMatch = true;
      if (updateFilter !== 'all') {
        const updateDate = parseDateString(tag.last_update || '0 days');
        const now = new Date();
        const timeAgo = now.getTime() - updateDate.getTime();
        
        switch (updateFilter) {
          case 'week':
            updateMatch = timeAgo <= 7 * 24 * 60 * 60 * 1000;
            break;
          case 'month':
            updateMatch = timeAgo <= 30 * 24 * 60 * 60 * 1000;
            break;
          case 'year':
            updateMatch = timeAgo <= 365 * 24 * 60 * 60 * 1000;
            break;
        }
      }

      return searchMatch && sizeMatch && updateMatch;
    });
  };

  // Get all installed submodels
  const getInstalledModels = () => {
    const installed = [];
    Object.entries(models?.categories || {}).forEach(([category, categoryModels]) => {
      categoryModels.forEach(model => {
        model.tags?.forEach(tag => {
          const modelId = `${model.name}:${tag.tag}`;
          if (installedModels.includes(modelId)) {
            installed.push({
              ...tag,
              modelName: model.name,
              category,
              modelId
            });
          }
        });
      });
    });
    return installed;
  };

  // Sort submodels by installation status and date
  const sortSubmodels = (submodels, modelName) => {
    return [...submodels].sort((a, b) => {
      const isInstalledA = installedModels.includes(`${modelName}:${a.tag}`);
      const isInstalledB = installedModels.includes(`${modelName}:${b.tag}`);
      
      if (isInstalledA !== isInstalledB) {
        return isInstalledA ? -1 : 1;
      }
      
      const dateA = parseDateString(a.last_update);
      const dateB = parseDateString(b.last_update);
      return dateB - dateA;
    });
  };

  useEffect(() => {
    setModels(modelData);
  }, []);

  const handleCustomModelAdd = () => {
    if (customModelInput.trim()) {
      onModelChange(customModelInput.trim());
      setCustomModelInput('');
    }
  };

  if (!models) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select a Model</DialogTitle>
          <DialogDescription>
            Choose a model to use for your chat. You can search and filter by size and update time.
          </DialogDescription>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={sizeFilter} onValueChange={setSizeFilter}>
            <SelectTrigger className="w-[150px] bg-white-100 border-input">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="bg-white hover:bg-gray-100">All sizes</SelectItem>
              <SelectItem value="tiny" className="bg-white hover:bg-gray-100">Tiny (&lt;2GB)</SelectItem>
              <SelectItem value="small" className="bg-white hover:bg-gray-100">Small (2-5GB)</SelectItem>
              <SelectItem value="medium" className="bg-white hover:bg-gray-100">Medium (5-10GB)</SelectItem>
              <SelectItem value="large" className="bg-white hover:bg-gray-100">Large (10GB+)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={updateFilter} onValueChange={setUpdateFilter}>
            <SelectTrigger className="w-[150px] bg-white border-input">
              <Clock className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Updated" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="bg-white hover:bg-gray-100">Any time</SelectItem>
              <SelectItem value="week" className="bg-white hover:bg-gray-100">Past week</SelectItem>
              <SelectItem value="month" className="bg-white hover:bg-gray-100">Past month</SelectItem>
              <SelectItem value="year" className="bg-white hover:bg-gray-100">Past year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-4 h-[600px]">
          {/* Categories List */}
          <div className="w-48 border-r">
            <ScrollArea className="h-full pr-4">
              {CATEGORY_ORDER.map((category) => {
                if (category === 'Installed Models') {
                  const count = installedModels.length;
                  if (count === 0) return null;
                  return (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "secondary" : "ghost"}
                      className="w-full justify-start gap-2 mb-1"
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedModelInfo(null);
                      }}
                    >
                      <span className="truncate">{category}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        ({count})
                      </span>
                    </Button>
                  );
                }
                
                if (category === 'Custom Models') {
                  return (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "secondary" : "ghost"}
                      className="w-full justify-start gap-2 mb-1"
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedModelInfo(null);
                      }}
                    >
                      <span className="truncate">{category}</span>
                    </Button>
                  );
                }

                if (models.categories[category]) {
                  return (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "secondary" : "ghost"}
                      className="w-full justify-start gap-2 mb-1"
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedModelInfo(null);
                      }}
                    >
                      <span className="truncate">{category}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        ({models.categories[category].length})
                      </span>
                    </Button>
                  );
                }
                return null;
              })}
            </ScrollArea>
          </div>

          {/* Models Content */}
          <div className="flex-1">
            <ScrollArea className="h-full">
              {selectedCategory === 'Installed Models' ? (
                <div className="space-y-2 pr-4">
                  {getInstalledModels().map((model) => (
                    <Card
                      key={model.modelId}
                      className={`bg-green-50 ${
                        selectedModel === model.modelId ? 'border-primary ring-2 ring-primary ring-offset-2' : ''
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{model.modelId}</span>
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Installed
                              </span>
                            </div>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              <span>{model.size}</span>
                              <span>•</span>
                              <span>{model.last_update}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onUninstall(model.modelId)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => onModelChange(model.modelId)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Select Model
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : selectedCategory === 'Custom Models' ? (
                <div className="space-y-4 pr-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter custom model name..."
                      value={customModelInput}
                      onChange={(e) => setCustomModelInput(e.target.value)}
                    />
                    <Button onClick={handleCustomModelAdd}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add a custom model that isn't listed in the categories.
                    Format: modelname:tag (e.g., llama2:13b)
                  </p>
                </div>
              ) : !selectedModelInfo ? (
                <div className="space-y-4 pr-4">
                  {(models?.categories?.[selectedCategory] || []).map((model) => (
                    <Card
                      key={model.name}
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => setSelectedModelInfo(model)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">{model.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {model.description}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                // Show submodels for selected model
                <div className="pr-4">
                  <Button
                    variant="ghost"
                    className="mb-4"
                    onClick={() => setSelectedModelInfo(null)}
                  >
                    ← Back to {selectedCategory}
                  </Button>
                  
                  <div className="mb-4">
                    <h2 className="text-xl font-bold">{selectedModelInfo.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedModelInfo.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {sortSubmodels(
                      filterSubmodels(selectedModelInfo?.tags || [], selectedModelInfo?.name || ''),
                      selectedModelInfo?.name || ''
                    ).map((tag) => {
                      const modelId = `${selectedModelInfo.name}:${tag.tag}`;
                      const isInstalled = installedModels.includes(modelId);
                      
                      return (
                        <Card
                          key={`${selectedModelInfo.name}-${tag.tag}`}
                          className={`${
                            isInstalled ? 'bg-green-50' : ''
                          } ${
                            selectedModel === modelId ? 'border-primary ring-2 ring-primary ring-offset-2' : ''
                          } hover:bg-accent/50 transition-all`}
                        >
                          <CardContent className="p-3">
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{tag.tag}</span>
                                  {isInstalled && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Installed
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-2 text-xs text-muted-foreground items-center mt-1">
                                  <span>{tag.size}</span>
                                  <span>•</span>
                                  <span>{tag.last_update}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isInstalled ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => onUninstall(modelId)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => onModelChange(modelId)}
                                      className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
                                    >
                                      Select Model
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onModelChange(modelId)}
                                    className="min-w-[100px] border-blue-200 hover:bg-blue-50"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    <span>Install</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModelSelector;