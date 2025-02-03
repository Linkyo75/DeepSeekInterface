import React from 'react';
import { AlertCircle, Trash2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';
import { useSettingsStore } from '../../stores/useSettingsStore';

const ModelUninstall = ({ 
  modelId, 
  isOpen, 
  onClose,
  onUninstallComplete,
  currentModel 
}) => {
  const { ollamaUrl } = useSettingsStore();
  const [isUninstalling, setIsUninstalling] = React.useState(false);

  const handleUninstall = async () => {
    if (!modelId) return;
    
    setIsUninstalling(true);
    try {
      const response = await fetch(`${ollamaUrl}/api/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelId }),
      });

      if (!response.ok) {
        throw new Error('Failed to uninstall model');
      }

      toast.success(`Model ${modelId} uninstalled successfully`);
      onUninstallComplete?.();
      onClose();
    } catch (error) {
      console.error('Uninstallation error:', error);
      toast.error(`Failed to uninstall model: ${error.message}`);
    } finally {
      setIsUninstalling(false);
    }
  };

  const isCurrentModel = currentModel === modelId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Uninstall Model: {modelId}</DialogTitle>
          <DialogDescription>
            This will remove the model from your local system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isCurrentModel && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This model is currently in use. Uninstalling it will require selecting a different model.
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The model can be reinstalled later if needed. This action only removes the local copy.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUninstalling}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleUninstall}
            disabled={isUninstalling}
            className="gap-2"
          >
            {isUninstalling ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uninstalling...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Uninstall
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModelUninstall;