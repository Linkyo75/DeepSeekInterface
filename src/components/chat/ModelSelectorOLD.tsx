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
import { ArrowRight, Clock, ChevronRight, CheckCircle2, Download, Search, Filter, Trash2 } from "lucide-react";
// Import the JSON directly
import modelData from '../../config/ollama_models.json';

// Define the order of categories
const CATEGORY_ORDER = [
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

    // Size ranges for filtering
    const SIZE_RANGES = {
      small: { max: 7 }, // Up to 7B
      medium: { min: 7, max: 20 }, // 7B to 20B
      large: { min: 20 }, // 20B+
    };

    const getModelSize = (sizeStr: string) => {
      if (!sizeStr) return 0;
      // Handle different size formats (e.g., "7b", "13B", "1.5b")
      const match = sizeStr ? sizeStr.toString().toLowerCase().match(/(\d+\.?\d*)b/) : null;
      if (match) {
        return parseFloat(match[1]);
      }
      return 0;
    };

const ModelSelector = ({ 
  selectedModel, 
  onModelChange, 
  open, 
  onOpenChange,
  installedModels = [],
  onUninstall
}) => {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ORDER[0]);
  const [selectedModelInfo, setSelectedModelInfo] = useState(null);
  const [models, setModels] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sizeFilter, setSizeFilter] = useState('all'); // 'all', 'small', 'medium', 'large'
  const [updateFilter, setUpdateFilter] = useState('all'); // 'all', 'week', 'month', 'year'



  const filterModels = (models) => {
    if (!models || !Array.isArray(models)) return [];
    
    return models.filter(model => {
      // Search filter
      const name = model?.name || '';
      const description = model?.description || '';
      const searchMatch = 
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase());
  
      // Size filter
      let sizeMatch = true;
      if (sizeFilter !== 'all') {
        const modelSizes = Array.isArray(model?.sizes) ? model.sizes : [];
        const maxSize = Math.max(...modelSizes.map(size => getModelSize(size)), 0);
        
        switch (sizeFilter) {
          case 'small':
            sizeMatch = maxSize <= SIZE_RANGES.small.max;
            break;
          case 'medium':
            sizeMatch = maxSize >= SIZE_RANGES.medium.min && maxSize <= SIZE_RANGES.medium.max;
            break;
          case 'large':
            sizeMatch = maxSize >= SIZE_RANGES.large.min;
            break;
        }
      }
  
      // Update filter
      let updateMatch = true;
      if (updateFilter !== 'all') {
        const updateDate = parseDateString(model?.stats?.updated || '0 days');
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
  
  // Add a new function to filter submodels
  const filterSubmodels = (submodels, modelName) => {
    if (!submodels) return [];
    
    return submodels.filter(tag => {
      // Size filter
      let sizeMatch = true;
      if (sizeFilter !== 'all') {
        const size = getModelSize(tag.tag);
        
        switch (sizeFilter) {
          case 'small':
            sizeMatch = size <= SIZE_RANGES.small.max;
            break;
          case 'medium':
            sizeMatch = size >= SIZE_RANGES.medium.min && size <= SIZE_RANGES.medium.max;
            break;
          case 'large':
            sizeMatch = size >= SIZE_RANGES.large.min;
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
  
      return sizeMatch && updateMatch;
    });
  };


  useEffect(() => {
    // Sort models by last update date
    const sortedData = {
      ...modelData,
      categories: Object.fromEntries(
        Object.entries(modelData.categories).map(([category, models]) => [
          category,
          [...models].sort((a, b) => {
            const dateA = parseDateString(a.stats?.updated || '0 days');
            const dateB = parseDateString(b.stats?.updated || '0 days');
            return dateB - dateA;
          })
        ])
      )
    };
    setModels(sortedData);
  }, []);

  // Sort submodels by last update date & installation status
  const sortSubmodelsByInstallationAndDate = (submodels, modelName) => {
    return [...submodels].sort((a, b) => {
      // First, sort by installation status
      const isInstalledA = installedModels.includes(`${modelName}:${a.tag}`);
      const isInstalledB = installedModels.includes(`${modelName}:${b.tag}`);
      
      if (isInstalledA !== isInstalledB) {
        return isInstalledA ? -1 : 1;
      }
      
      // Then sort by date
      const dateA = parseDateString(a.last_update);
      const dateB = parseDateString(b.last_update);
      return dateB - dateA;
    });
  };

  if (!models) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select a Model</DialogTitle>
          <DialogDescription>
            Choose a model to use for your chat. You can search or filter by size and update time.
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
            <SelectTrigger className="w-[150px] !bg-white border-input">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sizes</SelectItem>
              <SelectItem value="small">Small (&lt;7B)</SelectItem>
              <SelectItem value="medium">Medium (7B-20B)</SelectItem>
              <SelectItem value="large">Large (&gt;20B)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={updateFilter} onValueChange={setUpdateFilter}>
            <SelectTrigger className="w-[150px] !bg-white border-input">
              <Clock className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Updated" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any time</SelectItem>
              <SelectItem value="week">Past week</SelectItem>
              <SelectItem value="month">Past month</SelectItem>
              <SelectItem value="year">Past year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-4 h-[600px]">
          {/* Categories List */}
          <div className="w-48 border-r">
            <ScrollArea className="h-full pr-4">
              {CATEGORY_ORDER.map((category) => (
                models.categories[category] && (
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
                )
              ))}
            </ScrollArea>
          </div>

          {/* Models List */}
          <div className="flex-1">
            <ScrollArea className="h-full">
              {!selectedModelInfo ? (
                <div className="space-y-4 pr-4">
                  {filterModels(models?.categories?.[selectedCategory] || []).map((model) => (
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
          {sortSubmodelsByInstallationAndDate(filterSubmodels(selectedModelInfo?.tags || [], selectedModelInfo?.name || ''), selectedModelInfo?.name || '').map((tag) => {      
            
             
              const modelId = `${selectedModelInfo.name}:${tag.tag}`;
              const isInstalled = installedModels.includes(modelId);
              
              return (
                <Card
                  key={`${selectedModelInfo.name}-${tag.tag}-${tag.model_id}`}
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
                        <div className="flex gap-2 text-xs text-muted-foreground items-center">
                          <Clock className="h-3 w-3" />
                          {tag.last_update}
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
                            <span className="ml-1 text-xs text-muted-foreground">({tag.size})</span>
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