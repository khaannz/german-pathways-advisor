import { useState, useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface UseFormManagerOptions {
  autoSaveDelay?: number;
  onAutoSave?: (data: any) => Promise<void>;
  onProgressChange?: (progress: number) => void;
}

interface UseFormManagerReturn {
  isAutoSaving: boolean;
  lastSaved: Date | null;
  progress: number;
  calculateProgress: () => void;
  triggerAutoSave: () => Promise<void>;
}

export function useFormManager<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  options: UseFormManagerOptions = {}
): UseFormManagerReturn {
  const {
    autoSaveDelay = 3000,
    onAutoSave,
    onProgressChange
  } = options;

  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [progress, setProgress] = useState(0);

  // Calculate form completion progress based on actual field completion
  const calculateProgress = useCallback(() => {
    const values = form.getValues();
    const allFields = Object.keys(values);
    let completedFields = 0;

    allFields.forEach((key) => {
      const value = values[key];
      
      // Check for meaningful completion, not just character count
      if (typeof value === 'string') {
        // Consider a string field complete if it has meaningful content (more than whitespace)
        if (value.trim().length > 0) {
          completedFields++;
        }
      } else if (typeof value === 'boolean') {
        // Boolean fields are complete if they're explicitly set to true
        if (value === true) {
          completedFields++;
        }
      } else if (Array.isArray(value)) {
        // Array fields are complete if they have at least one valid entry
        const hasValidEntry = value.some(item => {
          if (typeof item === 'string') {
            return item.trim().length > 0;
          } else if (typeof item === 'object' && item !== null) {
            // For objects, check if at least one required field is filled
            return Object.values(item).some(val => 
              typeof val === 'string' ? val.trim().length > 0 : val != null
            );
          }
          return item != null;
        });
        if (hasValidEntry) {
          completedFields++;
        }
      } else if (value && typeof value === 'object' && value !== null) {
        // For date objects and other objects, consider them complete if they exist
        completedFields++;
      } else if (value != null && value !== '') {
        // For other types, complete if not null/undefined/empty
        completedFields++;
      }
    });

    // Cap progress at 100% to prevent bugs like "106%"
    const newProgress = allFields.length > 0 ? Math.min((completedFields / allFields.length) * 100, 100) : 0;
    setProgress(Math.round(newProgress)); // Round to avoid decimal issues
    onProgressChange?.(Math.round(newProgress));
  }, [form, onProgressChange]);

  // Auto-save functionality
  const triggerAutoSave = useCallback(async () => {
    if (!onAutoSave || isAutoSaving) return;

    setIsAutoSaving(true);
    try {
      const values = form.getValues();
      await onAutoSave(values);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [form, onAutoSave, isAutoSaving]);

  // Auto-save when form values change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (form.formState.isDirty && !form.formState.isSubmitting) {
        triggerAutoSave();
      }
    }, autoSaveDelay);

    return () => clearTimeout(timeoutId);
  }, [form.watch(), form.formState.isDirty, form.formState.isSubmitting, triggerAutoSave, autoSaveDelay]);

  // Update progress when form changes
  useEffect(() => {
    calculateProgress();
  }, [form.watch(), calculateProgress]);

  return {
    isAutoSaving,
    lastSaved,
    progress,
    calculateProgress,
    triggerAutoSave,
  };
} 