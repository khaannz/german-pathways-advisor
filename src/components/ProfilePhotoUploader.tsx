import React, { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';

interface ProfilePhotoUploaderProps {
  userId: string;
  currentUrl?: string | null;
  onUploaded?: (url: string) => void;
}

const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({ userId, currentUrl, onUploaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const onSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onSelectFile}
      />
      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" /> Change Photo
          </>
        )}
      </Button>
    </div>
  );
};

export default ProfilePhotoUploader;
