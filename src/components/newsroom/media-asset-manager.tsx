// components/newsroom/media-asset-manager.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Image, 
  Video, 
  FileText, 
  Trash2,
  Download,
  Loader2,
  Plus
} from "lucide-react";
import { Newsroom, MediaAsset } from "@/lib/types";
import { newsroomApi } from "@/lib/api";
import { toast } from "sonner";

interface MediaAssetManagerProps {
  newsroom: Newsroom;
  onUpdate: () => void;
}

export function MediaAssetManager({ newsroom, onUpdate }: MediaAssetManagerProps) {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");

  useEffect(() => {
    loadMediaAssets();
  }, []);

  const loadMediaAssets = async () => {
    try {
      const response = await newsroomApi.listMedia();
      setMediaAssets(response.data.media_assets);
    } catch (error) {
      console.error("Failed to load media assets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 10MB.");
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("File type not supported. Please use JPEG, PNG, GIF, WebP, MP4, or PDF.");
        return;
      }

      setSelectedFile(file);
      setUploadTitle(file.name.split('.')[0]); // Remove extension for default title
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadTitle.trim()) {
      toast.error("Please select a file and provide a title.");
      return;
    }

    setUploading(true);

    try {
      await newsroomApi.uploadMedia(selectedFile, uploadTitle.trim(), uploadDescription.trim());
      
      toast.success("Media asset uploaded successfully!");
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadTitle("");
      setUploadDescription("");
      loadMediaAssets();
      onUpdate();
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to upload media asset";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (index: number, asset: MediaAsset) => {
    if (!confirm(`Are you sure you want to delete "${asset.title}"?`)) return;

    try {
      await newsroomApi.deleteMedia(index);
      toast.success("Media asset deleted successfully!");
      loadMediaAssets();
      onUpdate();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to delete media asset";
      toast.error(errorMessage);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / 1048576) + ' MB';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Media Assets</h2>
          <p className="text-muted-foreground">
            Manage images, videos, and documents for your newsroom
          </p>
        </div>
        
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Upload Asset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Media Asset</DialogTitle>
              <DialogDescription>
                Upload images, videos, or documents to your newsroom. Max file size: 10MB.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*,video/mp4,application/pdf"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g., Company Logo"
                  disabled={uploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={3}
                  disabled={uploading}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setUploadDialogOpen(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading || !selectedFile || !uploadTitle.trim()}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {uploading ? "Uploading..." : "Upload Asset"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {mediaAssets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No media assets yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Upload images, videos, and documents to share with journalists
            </p>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Upload First Asset
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mediaAssets.map((asset, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getFileIcon(asset.type)}
                    <Badge variant="outline" className="text-xs">
                      {asset.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(asset.file_url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(index, asset)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">{asset.title}</h3>
                  {asset.description && (
                    <p className="text-xs text-muted-foreground">{asset.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatFileSize(asset.file_size)}</span>
                    <span>{new Date(asset.uploaded_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {/* Preview for images */}
                {asset.type === 'image' && (
                  <div className="mt-3">
                    <img
                      src={asset.file_url}
                      alt={asset.title}
                      className="w-full h-32 object-cover rounded-md bg-muted"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
