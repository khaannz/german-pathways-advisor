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

  // Calculate form completion progress
  const calculateProgress = useCallback(() => {
    const values = form.getValues();
    const totalFields = Object.keys(values).length;
    let completedFields = 0;

    Object.entries(values).forEach(([key, value]) => {
      if (typeof value === 'string' && value.length > 0) {
        completedFields++;
      } else if (typeof value === 'boolean' && value) {
        completedFields++;
      } else if (Array.isArray(value) && value.length > 0) {
        completedFields++;
      } else if (value && typeof value === 'object') {
        completedFields++;
      }
    });

    const newProgress = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
    setProgress(newProgress);
    onProgressChange?.(newProgress);
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