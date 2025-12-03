"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, Wand2, X } from "lucide-react";
import { pitchApi } from "@/lib/api";
import { toast } from "sonner";
import { RewriteSettings, REWRITE_OPTIONS } from "@/lib/types";

interface ContentRewriterProps {
  pitchId: string;
  contentType: 'email' | 'press_release';
  currentContent: string;
  onRewriteComplete: (rewrittenContent: string) => void;
  onClose: () => void;
}

export function ContentRewriter({ 
  pitchId, 
  contentType, 
  currentContent, 
  onRewriteComplete,
  onClose 
}: ContentRewriterProps) {
  const [rewriting, setRewriting] = useState(false);
  const [settings, setSettings] = useState<Omit<RewriteSettings, 'content_type'>>({
    mood: 'professional',
    length: 'detailed',
    style: 'grammatical'
  });

  const handleRewrite = async () => {
    try {
      setRewriting(true);
      
      const rewriteSettings: RewriteSettings = {
        content_type: contentType,
        ...settings
      };
      
      const response = await pitchApi.rewriteContent(pitchId, rewriteSettings);
      
      onRewriteComplete(response.data.rewritten_content);
      toast.success(`${contentType === 'email' ? 'Email' : 'Press release'} rewritten successfully!`);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to rewrite content";
      toast.error(errorMessage);
    } finally {
      setRewriting(false);
    }
  };

  return (
    <Card className="border-purple-200 bg-purple-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-purple-600" />
            Rewrite {contentType === 'email' ? 'Email' : 'Press Release'}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Mood Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Mood</Label>
            <Select
              value={settings.mood}
              onValueChange={(value: any) => setSettings({ ...settings, mood: value })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REWRITE_OPTIONS.mood.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.desc}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Length Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Length</Label>
            <Select
              value={settings.length}
              onValueChange={(value: any) => setSettings({ ...settings, length: value })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REWRITE_OPTIONS.length.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.desc}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Style Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Style</Label>
            <Select
              value={settings.style}
              onValueChange={(value: any) => setSettings({ ...settings, style: value })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REWRITE_OPTIONS.style.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.desc}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button
          onClick={handleRewrite}
          disabled={rewriting}
          className="w-full h-8 text-xs"
          size="sm"
        >
          {rewriting ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Rewriting...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-3 w-3" />
              Rewrite Content
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
