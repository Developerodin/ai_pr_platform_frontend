"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Sparkles, FileText, Mail } from "lucide-react";
import { pitchApi } from "@/lib/api";
import { toast } from "sonner";
import { Pitch } from "@/lib/types";

const pitchSchema = z.object({
  headline: z.string().min(10, "Headline must be at least 10 characters").max(200, "Headline must be less than 200 characters"),
  company_name: z.string().min(2, "Company name must be at least 2 characters"),
  key_points: z.string().min(10, "Please provide at least one key point"),
  industry: z.string().min(2, "Industry must be at least 2 characters"),
  announcement_type: z.enum(['product_launch', 'funding', 'partnership', 'executive_hire', 'award', 'research', 'other']),
});

type PitchFormData = z.infer<typeof pitchSchema>;

interface PitchGeneratorProps {
  onPitchGenerated?: (pitch: Pitch) => void;
}

export function PitchGenerator({ onPitchGenerated }: PitchGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState<Pitch | null>(null);

  const form = useForm<PitchFormData>({
    resolver: zodResolver(pitchSchema),
    defaultValues: {
      headline: "",
      company_name: "",
      key_points: "",
      industry: "",
      announcement_type: "product_launch",
    },
  });

  const onSubmit = async (data: PitchFormData) => {
    setIsGenerating(true);

    try {
      // Convert key_points string to array
      const keyPointsArray = data.key_points
        .split('\n')
        .map(point => point.trim())
        .filter(Boolean);

      const pitchData = {
        ...data,
        key_points: keyPointsArray,
      };

      const response = await pitchApi.create(pitchData);
      const newPitch = response.data;
      
      setGeneratedPitch(newPitch);
      onPitchGenerated?.(newPitch);
      
      toast.success(`AI Pitch generated successfully! Quality score: ${newPitch.generation_info.quality_score}/10`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to generate pitch";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!generatedPitch) return;
    
    setIsGenerating(true);
    try {
      const response = await pitchApi.regenerate(generatedPitch.id);
      const updatedPitch = response.data;
      
      setGeneratedPitch(updatedPitch);
      onPitchGenerated?.(updatedPitch);
      
      toast.success(`Pitch regenerated! New quality score: ${updatedPitch.generation_info.quality_score}/10`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to regenerate pitch";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Pitch Generator
          </CardTitle>
          <CardDescription>
            Provide details about your announcement and let AI create professional PR content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                placeholder="Revolutionary AI Platform Launches to Transform PR Industry"
                {...form.register("headline")}
                disabled={isGenerating}
              />
              {form.formState.errors.headline && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.headline.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  placeholder="Stellix AI LLP"
                  {...form.register("company_name")}
                  disabled={isGenerating}
                />
                {form.formState.errors.company_name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.company_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="Technology"
                  {...form.register("industry")}
                  disabled={isGenerating}
                />
                {form.formState.errors.industry && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.industry.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="announcement_type">Announcement Type</Label>
              <Select
                value={form.watch("announcement_type")}
                onValueChange={(value) => form.setValue("announcement_type", value as any)}
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select announcement type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product_launch">Product Launch</SelectItem>
                  <SelectItem value="funding">Funding Round</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="executive_hire">Executive Hire</SelectItem>
                  <SelectItem value="award">Award/Recognition</SelectItem>
                  <SelectItem value="research">Research/Study</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="key_points">Key Points (one per line)</Label>
              <Textarea
                id="key_points"
                placeholder="80% reduction in manual PR tasks&#10;AI-powered journalist matching&#10;Real-time performance analytics&#10;Comprehensive journalist database"
                rows={4}
                {...form.register("key_points")}
                disabled={isGenerating}
              />
              <p className="text-xs text-muted-foreground">
                Enter each key point on a separate line
              </p>
              {form.formState.errors.key_points && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.key_points.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isGenerating}>
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isGenerating ? "Generating AI Content..." : "Generate AI Pitch"}
            </Button>

            {generatedPitch && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={handleRegenerate}
                disabled={isGenerating}
              >
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Regenerate Content (1 credit)
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Generated Content */}
      {generatedPitch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Content</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  Quality: {generatedPitch.generation_info.quality_score}/10
                </Badge>
                <Badge variant="outline">
                  {generatedPitch.generation_info.generation_time_ms}ms
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Professional PR content generated by AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Press Release */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4" />
                <h3 className="font-semibold">Press Release</h3>
                <Badge variant="outline" className="text-xs">
                  {generatedPitch.content.press_release.word_count} words
                </Badge>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-bold text-lg leading-tight">
                  {generatedPitch.content.press_release.headline}
                </h4>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {generatedPitch.content.press_release.body}
                </div>
              </div>
            </div>

            <Separator />

            {/* Email Pitch */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-4 w-4" />
                <h3 className="font-semibold">Email Pitch</h3>
                <Badge variant="outline" className="text-xs">
                  {generatedPitch.content.email_pitch.word_count} words
                </Badge>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Subject:</Label>
                  <p className="font-semibold">
                    {generatedPitch.content.email_pitch.subject}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Body:</Label>
                  <div className="text-sm mt-1 whitespace-pre-wrap">
                    {generatedPitch.content.email_pitch.body}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="flex-1">
                Send to Journalists
              </Button>
              <Button size="sm" variant="outline">
                Save Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
