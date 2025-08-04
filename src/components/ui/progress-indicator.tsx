import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";

interface ProgressIndicatorProps {
  progress: number;
  isAutoSaving?: boolean;
  lastSaved?: Date | null;
  showStatus?: boolean;
  className?: string;
}

export function ProgressIndicator({
  progress,
  isAutoSaving = false,
  lastSaved = null,
  showStatus = true,
  className = ""
}: ProgressIndicatorProps) {
  const getProgressVariant = (progress: number) => {
    if (progress >= 100) return "default";
    if (progress >= 75) return "secondary";
    return "outline";
  };

  const getProgressText = (progress: number) => {
    if (progress >= 100) return "Complete";
    if (progress >= 75) return "Almost Done";
    if (progress >= 50) return "Halfway There";
    if (progress >= 25) return "Getting Started";
    return "In Progress";
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Form Completion</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={getProgressVariant(progress)}>
            {getProgressText(progress)}
          </Badge>
        </div>
      </div>

      {/* Auto-save Status */}
      {showStatus && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isAutoSaving && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
          {lastSaved && !isAutoSaving && (
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 