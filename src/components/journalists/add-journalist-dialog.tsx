"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, Loader2 } from "lucide-react";
import { journalistApi } from "@/lib/api";
import { toast } from "sonner";

const journalistSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  publication: z.string().min(2, "Publication must be at least 2 characters"),
  category: z.enum(['technology', 'business', 'healthcare', 'finance', 'lifestyle', 'entertainment', 'sports', 'other']),
  country: z.string().min(2, "Country must be at least 2 characters"),
  timezone: z.string().optional(),
  topics: z.string().optional(),
  notes: z.string().optional(),
});

type JournalistFormData = z.infer<typeof journalistSchema>;

interface AddJournalistDialogProps {
  onJournalistAdded?: () => void;
}

export function AddJournalistDialog({ onJournalistAdded }: AddJournalistDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<JournalistFormData>({
    resolver: zodResolver(journalistSchema),
    defaultValues: {
      name: "",
      email: "",
      publication: "",
      category: "technology",
      country: "",
      timezone: "UTC",
      topics: "",
      notes: "",
    },
  });

  const onSubmit = async (data: JournalistFormData) => {
    setIsLoading(true);

    try {
      // Convert topics string to array
      const topicsArray = data.topics 
        ? data.topics.split(',').map(topic => topic.trim()).filter(Boolean)
        : [];

      const journalistData = {
        ...data,
        topics: topicsArray,
      };

      await journalistApi.create(journalistData);
      toast.success("Journalist added successfully!");
      
      form.reset();
      setOpen(false);
      onJournalistAdded?.();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to add journalist";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Journalist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Journalist</DialogTitle>
          <DialogDescription>
            Add a journalist to your database to start building relationships and sending pitches.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Smith"
                {...form.register("name")}
                disabled={isLoading}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@publication.com"
                {...form.register("email")}
                disabled={isLoading}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="publication">Publication</Label>
              <Input
                id="publication"
                placeholder="TechCrunch"
                {...form.register("publication")}
                disabled={isLoading}
              />
              {form.formState.errors.publication && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.publication.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(value) => form.setValue("category", value as any)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="United States"
                {...form.register("country")}
                disabled={isLoading}
              />
              {form.formState.errors.country && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.country.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                placeholder="PST"
                {...form.register("timezone")}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topics">Topics (comma-separated)</Label>
            <Input
              id="topics"
              placeholder="AI, startups, automation, SaaS"
              {...form.register("topics")}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Enter topics this journalist covers, separated by commas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about this journalist..."
              {...form.register("notes")}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Journalist
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
