import React, { useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Camera, Image } from 'lucide-react';

interface ProfilePhotoUploaderProps {
  userId: string;
  currentUrl?: string | null;
  onUploaded?: (url: string) => void;
}

const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({ userId, currentUrl, onUploaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [captureMode, setCaptureMode] = useState<'camera' | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Camera functionality for profile photos
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } // Front camera for selfies
      });
      setStream(mediaStream);
      setCaptureMode('camera');
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to take a profile photo",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCaptureMode(null);
  };

  const capturePhoto = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `profile-${Date.now()}.jpg`, { type: 'image/jpeg' });
            await handleFileUpload(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  }, [stream, userId, onUploaded]);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max size is 5MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const path = `${userId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('cv_photos')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from('cv_photos')
        .getPublicUrl(path);

      const publicUrl = publicData.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      toast({ title: 'Profile photo updated' });
      onUploaded?.(publicUrl);
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast({ title: 'Upload failed', description: error.message || 'Please try again', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  // Cleanup camera when component unmounts
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onSelectFile}
      />
      
      {/* Camera capture interface */}
      {captureMode === 'camera' && (
        <div className="mb-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-48 object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
              <Button onClick={capturePhoto} size="sm">
                <Camera className="h-4 w-4 mr-1" />
                Capture
              </Button>
              <Button onClick={stopCamera} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fileInputRef.current?.click()} 
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Image className="h-4 w-4 mr-2" /> Choose Photo
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={startCamera} 
          disabled={uploading}
        >
          <Camera className="h-4 w-4 mr-2" /> Take Photo
        </Button>
      </div>
    </div>
  );
};

export default ProfilePhotoUploader;
