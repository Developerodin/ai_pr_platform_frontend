// components/newsroom/press-release-manager.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Plus,
  Trash2,
  Calendar,
  Building2,
  Loader2,
  Copy,
  Eye
} from "lucide-react";
import { Newsroom, PressRelease, Pitch } from "@/lib/types";
import { newsroomApi, pitchApi } from "@/lib/api";
import { toast } from "sonner";

interface PressReleaseManagerProps {
  newsroom: Newsroom;
  onUpdate: () => void;
}

export function PressReleaseManager({ newsroom, onUpdate }: PressReleaseManagerProps) {
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [availablePitches, setAvailablePitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPitches, setLoadingPitches] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedPitch, setSelectedPitch] = useState<Pitch | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadPressReleases();
  }, []);

  const loadPressReleases = async () => {
    try {
      const response = await newsroomApi.listPressReleases();
      setPressReleases(response.data.press_releases);
    } catch (error) {
      console.error("Failed to load press releases:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailablePitches = async () => {
    if (loadingPitches) return;
    
    setLoadingPitches(true);
    try {
      const response = await pitchApi.list({ limit: 50 });
      const pitches = response.data.pitches || [];
      
      // Filter out pitches that are already added to newsroom
      const existingPitchIds = pressReleases.map(pr => pr.pitch_id);
      const availablePitches = pitches.filter(pitch => !existingPitchIds.includes(pitch.id));
      
      setAvailablePitches(availablePitches);
    } catch (error) {
      console.error("Failed to load pitches:", error);
      toast.error("Failed to load available pitches");
    } finally {
      setLoadingPitches(false);
    }
  };

  const handleAddPressRelease = async () => {
    if (!selectedPitch) {
      toast.error("Please select a pitch to add");
      return;
    }

    setAdding(true);

    try {
      await newsroomApi.addPressRelease(selectedPitch.id);
      toast.success("Press release added to newsroom!");
      setAddDialogOpen(false);
      setSelectedPitch(null);
      loadPressReleases();
      onUpdate();
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to add press release";
      toast.error(errorMessage);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (index: number, release: PressRelease) => {
    if (!confirm(`Are you sure you want to remove "${release.title}" from your newsroom?`)) return;

    try {
      await newsroomApi.deletePressRelease(index);
      toast.success("Press release removed from newsroom!");
      loadPressReleases();
      onUpdate();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to remove press release";
      toast.error(errorMessage);
    }
  };

  const handleCopy = async (content: string, title: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(`"${title}" copied to clipboard!`);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
          <h2 className="text-2xl font-bold tracking-tight">Press Releases</h2>
          <p className="text-muted-foreground">
            Manage press releases published in your newsroom
          </p>
        </div>
        
        <Dialog open={addDialogOpen} onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (open) {
            loadAvailablePitches();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Press Release
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Press Release to Newsroom</DialogTitle>
              <DialogDescription>
                Select a pitch to publish as a press release in your newsroom
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {loadingPitches ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : availablePitches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  <p>No available pitches to add</p>
                  <p className="text-sm">All your pitches are already in the newsroom or you have no pitches yet.</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-3">
                    {availablePitches.map((pitch) => (
                      <Card 
                        key={pitch.id}
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedPitch?.id === pitch.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedPitch(pitch)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{pitch.headline}</CardTitle>
                            <Badge variant="outline">{pitch.status}</Badge>
                          </div>
                          <CardDescription className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {pitch.company_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(pitch.created_at)}
                            </span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {pitch.content.press_release.body.substring(0, 150)}...
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {pitch.content.press_release.word_count} words
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                Quality: {pitch.generation_info.quality_score}/10
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setAddDialogOpen(false)}
                disabled={adding}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddPressRelease} 
                disabled={adding || !selectedPitch}
              >
                {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {adding ? "Adding..." : "Add to Newsroom"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {pressReleases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No press releases yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add press releases from your generated pitches to share with journalists
            </p>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Press Release
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pressReleases.map((release, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg leading-tight">
                      {release.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {release.company_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(release.published_date)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {release.industry}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(release.content, release.title)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(index, release)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32 w-full rounded border p-3 bg-muted/50">
                  <div className="text-sm whitespace-pre-wrap">
                    {release.content}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
