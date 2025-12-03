"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Eye, 
  FileText, 
  Mail, 
  BarChart3,
  Copy,
  Calendar,
  Wand2,
  Loader2,
  Edit,
  Check,
  X
} from "lucide-react";
import { Pitch, REWRITE_PRESETS, RewritePreset } from "@/lib/types";
import { toast } from "sonner";
import { pitchApi } from "@/lib/api";
import { ContentRewriter } from "./content-rewriter";

interface PitchDetailDialogProps {
  pitch: Pitch;
  trigger?: React.ReactNode;
  onPitchUpdated?: (updatedPitch: Pitch) => void;
}

// Add editing state interface
interface EditingState {
  press_release_headline: boolean;
  press_release_body: boolean;
  email_subject: boolean;
  email_body: boolean;
}

export function PitchDetailDialog({ pitch, trigger, onPitchUpdated }: PitchDetailDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentPitch, setCurrentPitch] = useState<Pitch>(pitch);
  const [showRewriter, setShowRewriter] = useState<{
    email: boolean;
    press_release: boolean;
  }>({
    email: false,
    press_release: false
  });

  // Add editing state
  const [editingState, setEditingState] = useState<EditingState>({
    press_release_headline: false,
    press_release_body: false,
    email_subject: false,
    email_body: false
  });

  const [editingContent, setEditingContent] = useState({
    press_release_headline: pitch.content.press_release.headline,
    press_release_body: pitch.content.press_release.body,
    email_subject: pitch.content.email_pitch.subject,
    email_body: pitch.content.email_pitch.body
  });

  const [savingEdit, setSavingEdit] = useState<string | null>(null);

  // Add loading states for quick rewrite buttons
  const [rewriteLoading, setRewriteLoading] = useState<{
    email: { [key: string]: boolean };
    press_release: { [key: string]: boolean };
  }>({
    email: {},
    press_release: {}
  });

  // Update local state when prop changes
  useEffect(() => {
    setCurrentPitch(pitch);
    setEditingContent({
      press_release_headline: pitch.content.press_release.headline,
      press_release_body: pitch.content.press_release.body,
      email_subject: pitch.content.email_pitch.subject,
      email_body: pitch.content.email_pitch.body
    });
  }, [pitch]);

  const getAnnouncementTypeLabel = (type: string) => {
    const labels = {
      product_launch: "Product Launch",
      funding: "Funding Round",
      partnership: "Partnership",
      executive_hire: "Executive Hire",
      award: "Award",
      research: "Research",
      other: "Other"
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleCopy = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(`${type} copied to clipboard!`);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Inline editing functions
  const startEditing = (field: keyof EditingState) => {
    setEditingState(prev => ({ ...prev, [field]: true }));
  };

  const cancelEditing = (field: keyof EditingState) => {
    setEditingState(prev => ({ ...prev, [field]: false }));
    // Reset content to current saved version
    const resetMap = {
      press_release_headline: currentPitch.content.press_release.headline,
      press_release_body: currentPitch.content.press_release.body,
      email_subject: currentPitch.content.email_pitch.subject,
      email_body: currentPitch.content.email_pitch.body
    };
    setEditingContent(prev => ({ ...prev, [field]: resetMap[field] }));
  };

  const saveEdit = async (field: keyof EditingState) => {
    setSavingEdit(field);
    
    try {
      const updatedPitch = { ...currentPitch };
      
      // Update the appropriate field
      switch (field) {
        case 'press_release_headline':
          updatedPitch.content.press_release.headline = editingContent.press_release_headline;
          break;
        case 'press_release_body':
          updatedPitch.content.press_release.body = editingContent.press_release_body;
          // Recalculate word count
          updatedPitch.content.press_release.word_count = editingContent.press_release_body.split(' ').filter(word => word.length > 0).length;
          break;
        case 'email_subject':
          updatedPitch.content.email_pitch.subject = editingContent.email_subject;
          break;
        case 'email_body':
          updatedPitch.content.email_pitch.body = editingContent.email_body;
          // Recalculate word count
          updatedPitch.content.email_pitch.word_count = editingContent.email_body.split(' ').filter(word => word.length > 0).length;
          break;
      }

      // Save to backend
      await pitchApi.update(currentPitch.id, {
        content: updatedPitch.content
      });

      setCurrentPitch(updatedPitch);
      setEditingState(prev => ({ ...prev, [field]: false }));
      onPitchUpdated?.(updatedPitch);
      
      const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      toast.success(`✅ ${fieldName} updated successfully!`);
      
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { detail?: string } } };
      toast.error(`❌ Failed to save changes: ${apiError.response?.data?.detail || 'Unknown error'}`);
    } finally {
      setSavingEdit(null);
    }
  };

  // Handle rewrite completion with loading management
  const handleRewriteComplete = (contentType: 'email' | 'press_release', rewrittenContent: string) => {
    const updatedPitch = { ...currentPitch };
    if (contentType === 'email') {
      updatedPitch.content.email_pitch.body = rewrittenContent;
      // Update editing content as well
      setEditingContent(prev => ({ ...prev, email_body: rewrittenContent }));
    } else {
      updatedPitch.content.press_release.body = rewrittenContent;
      setEditingContent(prev => ({ ...prev, press_release_body: rewrittenContent }));
    }
    
    setCurrentPitch(updatedPitch);
    setShowRewriter(prev => ({ ...prev, [contentType]: false }));
    onPitchUpdated?.(updatedPitch);
    
    // Show success toast
    toast.success(`✨ ${contentType === 'email' ? 'Email pitch' : 'Press release'} updated successfully!`);
  };

  // Enhanced quick rewrite function with loading states
  const handleQuickRewrite = async (contentType: 'email' | 'press_release', preset: RewritePreset) => {
    const loadingKey = preset.name;
    
    // Set loading state for this specific button
    setRewriteLoading(prev => ({
      ...prev,
      [contentType]: {
        ...prev[contentType],
        [loadingKey]: true
      }
    }));

    try {
      const response = await pitchApi.rewriteContent(currentPitch.id, {
        content_type: contentType,
        mood: preset.mood,
        length: preset.length,
        style: preset.style
      });
      
      handleRewriteComplete(contentType, response.data.rewritten_content);
      
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { detail?: string } } };
      const errorMessage = apiError.response?.data?.detail || "Failed to rewrite content";
      toast.error(`❌ ${errorMessage}`);
    } finally {
      // Clear loading state for this button
      setRewriteLoading(prev => ({
        ...prev,
        [contentType]: {
          ...prev[contentType],
          [loadingKey]: false
        }
      }));
    }
  };

  // Check if any rewrite is in progress
  const isAnyRewriteLoading = (contentType: 'email' | 'press_release') => {
    return Object.values(rewriteLoading[contentType]).some(loading => loading);
  };

  // Check if any editing is in progress
  const isAnyEditingInProgress = () => {
    return Object.values(editingState).some(editing => editing) || savingEdit !== null;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl leading-tight pr-8">
            {currentPitch.headline}
          </DialogTitle>
          <DialogDescription>
            {currentPitch.company_name} • {getAnnouncementTypeLabel(currentPitch.announcement_type)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {/* Overview - keep existing */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold">{currentPitch.generation_info.quality_score}/10</div>
                <div className="text-xs text-muted-foreground">Quality Score</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold">{currentPitch.status}</div>
                <div className="text-xs text-muted-foreground">Status</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold">{currentPitch.performance.emails_sent}</div>
                <div className="text-xs text-muted-foreground">Emails Sent</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold">{currentPitch.performance.responses_received}</div>
                <div className="text-xs text-muted-foreground">Responses</div>
              </div>
            </div>

            {/* Key Points - keep existing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Points</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentPitch.key_points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Enhanced Press Release with Inline Editing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Press Release
                    {(isAnyRewriteLoading('press_release') || savingEdit?.startsWith('press_release')) && (
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{currentPitch.content.press_release.word_count} words</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(currentPitch.content.press_release.body, "Press Release")}
                      disabled={isAnyRewriteLoading('press_release') || isAnyEditingInProgress()}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Quick Rewrite Buttons */}
                  <div className="flex flex-wrap gap-2 pb-2">
                    <span className="text-sm font-medium text-muted-foreground">Quick rewrite:</span>
                    {REWRITE_PRESETS.map((preset) => {
                      const isLoading = rewriteLoading.press_release[preset.name];
                      const isDisabled = isAnyRewriteLoading('press_release') || isAnyEditingInProgress();
                      
                      return (
                        <Button
                          key={preset.name}
                          size="sm"
                          variant="ghost"
                          className={`text-xs px-3 py-1 h-7 ${preset.className} ${isDisabled && !isLoading ? 'opacity-50' : ''}`}
                          onClick={() => handleQuickRewrite('press_release', preset)}
                          disabled={isDisabled}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Rewriting...
                            </>
                          ) : (
                            preset.name
                          )}
                        </Button>
                      );
                    })}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs px-3 py-1 h-7 border"
                      onClick={() => setShowRewriter(prev => ({ ...prev, press_release: !prev.press_release }))}
                      disabled={isAnyRewriteLoading('press_release') || isAnyEditingInProgress()}
                    >
                      <Wand2 className="h-3 w-3 mr-1" />
                      Custom
                    </Button>
                  </div>

                  {/* Custom Rewriter */}
                  {showRewriter.press_release && (
                    <div className="mb-4">
                      <ContentRewriter
                        pitchId={currentPitch.id}
                        contentType="press_release"
                        currentContent={currentPitch.content.press_release.body}
                        onRewriteComplete={(content) => handleRewriteComplete('press_release', content)}
                        onClose={() => setShowRewriter(prev => ({ ...prev, press_release: false }))}
                      />
                    </div>
                  )}

                  {/* Editable Headline */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Headline:</span>
                      {!editingState.press_release_headline ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2"
                          onClick={() => startEditing('press_release_headline')}
                          disabled={isAnyEditingInProgress() || isAnyRewriteLoading('press_release')}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-green-600"
                            onClick={() => saveEdit('press_release_headline')}
                            disabled={savingEdit === 'press_release_headline'}
                          >
                            {savingEdit === 'press_release_headline' ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-red-600"
                            onClick={() => cancelEditing('press_release_headline')}
                            disabled={savingEdit === 'press_release_headline'}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {editingState.press_release_headline ? (
                      <Input
                        value={editingContent.press_release_headline}
                        onChange={(e) => setEditingContent(prev => ({ 
                          ...prev, 
                          press_release_headline: e.target.value 
                        }))}
                        className="font-semibold text-base"
                        disabled={savingEdit === 'press_release_headline'}
                      />
                    ) : (
                      <h4 className="font-semibold text-base mb-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                          onClick={() => startEditing('press_release_headline')}>
                        {currentPitch.content.press_release.headline}
                      </h4>
                    )}
                  </div>

                  {/* Editable Press Release Body */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Body:</span>
                      {!editingState.press_release_body ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2"
                          onClick={() => startEditing('press_release_body')}
                          disabled={isAnyEditingInProgress() || isAnyRewriteLoading('press_release')}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-green-600"
                            onClick={() => saveEdit('press_release_body')}
                            disabled={savingEdit === 'press_release_body'}
                          >
                            {savingEdit === 'press_release_body' ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-red-600"
                            onClick={() => cancelEditing('press_release_body')}
                            disabled={savingEdit === 'press_release_body'}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {editingState.press_release_body ? (
                      <Textarea
                        value={editingContent.press_release_body}
                        onChange={(e) => setEditingContent(prev => ({ 
                          ...prev, 
                          press_release_body: e.target.value 
                        }))}
                        className="min-h-[200px] text-sm"
                        disabled={savingEdit === 'press_release_body'}
                      />
                    ) : (
                      <ScrollArea className="h-40 p-3 bg-muted/50 rounded cursor-pointer hover:bg-muted/70"
                                  onClick={() => startEditing('press_release_body')}>
                        <div className="text-sm whitespace-pre-wrap">
                          {currentPitch.content.press_release.body}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Email Pitch with Inline Editing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Pitch
                    {(isAnyRewriteLoading('email') || savingEdit?.startsWith('email')) && (
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{currentPitch.content.email_pitch.word_count} words</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(currentPitch.content.email_pitch.body, "Email Pitch")}
                      disabled={isAnyRewriteLoading('email') || isAnyEditingInProgress()}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Quick Rewrite Buttons */}
                  <div className="flex flex-wrap gap-2 pb-2">
                    <span className="text-sm font-medium text-muted-foreground">Quick rewrite:</span>
                    {REWRITE_PRESETS.map((preset) => {
                      const isLoading = rewriteLoading.email[preset.name];
                      const isDisabled = isAnyRewriteLoading('email') || isAnyEditingInProgress();
                      
                      return (
                        <Button
                          key={preset.name}
                          size="sm"
                          variant="ghost"
                          className={`text-xs px-3 py-1 h-7 ${preset.className} ${isDisabled && !isLoading ? 'opacity-50' : ''}`}
                          onClick={() => handleQuickRewrite('email', preset)}
                          disabled={isDisabled}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Rewriting...
                            </>
                          ) : (
                            preset.name
                          )}
                        </Button>
                      );
                    })}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs px-3 py-1 h-7 border"
                      onClick={() => setShowRewriter(prev => ({ ...prev, email: !prev.email }))}
                      disabled={isAnyRewriteLoading('email') || isAnyEditingInProgress()}
                    >
                      <Wand2 className="h-3 w-3 mr-1" />
                      Custom
                    </Button>
                  </div>

                  {/* Custom Rewriter */}
                  {showRewriter.email && (
                    <div className="mb-4">
                      <ContentRewriter
                        pitchId={currentPitch.id}
                        contentType="email"
                        currentContent={currentPitch.content.email_pitch.body}
                        onRewriteComplete={(content) => handleRewriteComplete('email', content)}
                        onClose={() => setShowRewriter(prev => ({ ...prev, email: false }))}
                      />
                    </div>
                  )}

                  {/* Editable Email Subject */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-muted-foreground">Subject:</div>
                      {!editingState.email_subject ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2"
                          onClick={() => startEditing('email_subject')}
                          disabled={isAnyEditingInProgress() || isAnyRewriteLoading('email')}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-green-600"
                            onClick={() => saveEdit('email_subject')}
                            disabled={savingEdit === 'email_subject'}
                          >
                            {savingEdit === 'email_subject' ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-red-600"
                            onClick={() => cancelEditing('email_subject')}
                            disabled={savingEdit === 'email_subject'}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {editingState.email_subject ? (
                      <Input
                        value={editingContent.email_subject}
                        onChange={(e) => setEditingContent(prev => ({ 
                          ...prev, 
                          email_subject: e.target.value 
                        }))}
                        className="font-semibold text-sm"
                        disabled={savingEdit === 'email_subject'}
                      />
                    ) : (
                      <div className="font-semibold text-sm p-2 bg-muted/50 rounded cursor-pointer hover:bg-muted/70"
                           onClick={() => startEditing('email_subject')}>
                        {currentPitch.content.email_pitch.subject}
                      </div>
                    )}
                  </div>

                  {/* Editable Email Body */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-muted-foreground">Body:</div>
                      {!editingState.email_body ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2"
                          onClick={() => startEditing('email_body')}
                          disabled={isAnyEditingInProgress() || isAnyRewriteLoading('email')}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-green-600"
                            onClick={() => saveEdit('email_body')}
                            disabled={savingEdit === 'email_body'}
                          >
                            {savingEdit === 'email_body' ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-red-600"
                            onClick={() => cancelEditing('email_body')}
                            disabled={savingEdit === 'email_body'}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {editingState.email_body ? (
                      <Textarea
                        value={editingContent.email_body}
                        onChange={(e) => setEditingContent(prev => ({ 
                          ...prev, 
                          email_body: e.target.value 
                        }))}
                        className="min-h-[160px] text-sm"
                        disabled={savingEdit === 'email_body'}
                      />
                    ) : (
                      <ScrollArea className="h-40 p-3 bg-muted/50 rounded cursor-pointer hover:bg-muted/70"
                                  onClick={() => startEditing('email_body')}>
                        <div className="text-sm whitespace-pre-wrap">
                          {currentPitch.content.email_pitch.body}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics - keep existing */}
            {currentPitch.performance.emails_sent > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">{currentPitch.performance.emails_sent}</div>
                      <div className="text-xs text-blue-700">Emails Sent</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">{currentPitch.performance.emails_opened}</div>
                      <div className="text-xs text-green-700">Emails Opened</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-xl font-bold text-purple-600">{currentPitch.performance.responses_received}</div>
                      <div className="text-xs text-purple-700">Responses</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-xl font-bold text-orange-600">{currentPitch.performance.articles_published}</div>
                      <div className="text-xs text-orange-700">Articles</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Created: {formatDate(currentPitch.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Updated: {formatDate(currentPitch.updated_at)}</span>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
