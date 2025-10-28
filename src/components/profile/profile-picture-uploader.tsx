'use client';

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Camera, Upload, X, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfilePictureUploaderProps {
  currentImage?: string;
  userName: string;
  onImageUpdate: (imageUrl: string | null) => void;
  isUploading?: boolean;
}

export function ProfilePictureUploader({ 
  currentImage, 
  userName, 
  onImageUpdate, 
  isUploading = false 
}: ProfilePictureUploaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', 'profile');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Upload failed');
      }

  const url = data.url as string;
  const cacheBusted = `${url}?v=${Date.now()}`;
  onImageUpdate(cacheBusted);
      setIsDialogOpen(false);
      setPreviewUrl(null);
      setSelectedFile(null);
      
      toast({
        title: 'Success',
        description: 'Profile picture updated successfully.',
      });
  } catch (error: any) {
      toast({
        title: 'Upload Failed',
    description: error?.message || 'Could not upload the image. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveImage = () => {
    onImageUpdate(null);
    setIsDialogOpen(false);
    toast({
      title: 'Success',
      description: 'Profile picture removed.',
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage
            key={currentImage || 'no-image'}
            src={currentImage || ''}
            alt={userName}
          />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-0 right-0 rounded-full bg-background border-2 border-background shadow-lg"
          onClick={() => setIsDialogOpen(true)}
          disabled={isUploading}
        >
          <Camera className="h-4 w-4" />
          <span className="sr-only">Change picture</span>
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
            <DialogDescription>
              Choose a new profile picture or remove the current one.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {(previewUrl || currentImage) && (
              <div className="flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    key={(previewUrl || currentImage) || 'no-image'}
                    src={(previewUrl || currentImage) || ''}
                    alt={userName}
                  />
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex flex-col gap-2 h-20"
              >
                <Upload className="h-5 w-5" />
                <span className="text-sm">Upload Photo</span>
              </Button>

              {currentImage && (
                <Button
                  variant="outline"
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                  className="flex flex-col gap-2 h-20 text-destructive hover:text-destructive"
                >
                  <X className="h-5 w-5" />
                  <span className="text-sm">Remove Photo</span>
                </Button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            {selectedFile && (
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Save Photo'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
