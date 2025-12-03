// components/newsroom/newsroom-setup.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Building2 } from "lucide-react";
import { Newsroom } from "@/lib/types";
import { newsroomApi } from "@/lib/api";
import { toast } from "sonner";

const newsroomSchema = z.object({
  name: z.string().min(1, "Company name is required").max(200),
  description: z.string().max(1000).optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  address: z.string().max(300).optional(),
  founded_year: z.number().min(1800).max(2030).optional(),
  industry: z.string().max(100).optional(),
  employee_count: z.string().max(50).optional(),
  is_public: z.boolean().default(false),
});

type NewsroomFormData = z.infer<typeof newsroomSchema>;

interface NewsroomSetupProps {
  onNewsroomCreated: (newsroom: Newsroom) => void;
}

export function NewsroomSetup({ onNewsroomCreated }: NewsroomSetupProps) {
  const [creating, setCreating] = useState(false);

  const form = useForm<NewsroomFormData>({
    resolver: zodResolver(newsroomSchema),
    defaultValues: {
      name: "",
      description: "",
      website: "",
      email: "",
      phone: "",
      address: "",
      industry: "",
      employee_count: "",
      is_public: false,
    },
  });

  const onSubmit = async (data: NewsroomFormData) => {
    setCreating(true);

    try {
      const newsroomData = {
        company_info: {
          name: data.name,
          description: data.description || undefined,
          website: data.website || undefined,
          email: data.email || undefined,
          phone: data.phone || undefined,
          address: data.address || undefined,
          founded_year: data.founded_year || undefined,
          industry: data.industry || undefined,
          employee_count: data.employee_count || undefined,
        },
        is_public: data.is_public,
      };

      const response = await newsroomApi.create(newsroomData);
      
      // Get the created newsroom
      const newsroomResponse = await newsroomApi.getMy();
      if (newsroomResponse.data.exists) {
        onNewsroomCreated(newsroomResponse.data.newsroom);
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to create newsroom";
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <Building2 className="h-12 w-12 mx-auto text-primary mb-4" />
        <h1 className="text-3xl font-bold tracking-tight">Create Your Digital Newsroom</h1>
        <p className="text-muted-foreground mt-2">
          Set up your company's digital newsroom to share press releases and media assets with journalists
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Provide details about your company for the newsroom
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  disabled={creating}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="e.g., Technology"
                  {...form.register("industry")}
                  disabled={creating}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your company..."
                rows={3}
                {...form.register("description")}
                disabled={creating}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  {...form.register("website")}
                  disabled={creating}
                />
                {form.formState.errors.website && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.website.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@example.com"
                  {...form.register("email")}
                  disabled={creating}
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
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+1-555-0123"
                  {...form.register("phone")}
                  disabled={creating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="founded_year">Founded Year</Label>
                <Input
                  id="founded_year"
                  type="number"
                  min="1800"
                  max="2030"
                  {...form.register("founded_year", { valueAsNumber: true })}
                  disabled={creating}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Business St, City, State, ZIP"
                {...form.register("address")}
                disabled={creating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee_count">Company Size</Label>
              <Input
                id="employee_count"
                placeholder="e.g., 11-50 employees"
                {...form.register("employee_count")}
                disabled={creating}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_public"
                checked={form.watch("is_public")}
                onCheckedChange={(checked) => form.setValue("is_public", checked)}
                disabled={creating}
              />
              <Label htmlFor="is_public">
                Make newsroom public (journalists can view without login)
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {creating ? "Creating Newsroom..." : "Create Digital Newsroom"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
