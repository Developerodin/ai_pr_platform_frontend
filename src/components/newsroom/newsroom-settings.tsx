// components/newsroom/newsroom-settings.tsx
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
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Palette, 
  Globe,
  Lock,
  Save,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Newsroom } from "@/lib/types";
import { newsroomApi } from "@/lib/api";
import { toast } from "sonner";

const settingsSchema = z.object({
  name: z.string().min(1, "Company name is required").max(200),
  description: z.string().max(1000).optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  address: z.string().max(300).optional(),
  founded_year: z.number().min(1800).max(2030).optional(),
  industry: z.string().max(100).optional(),
  employee_count: z.string().max(50).optional(),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  accent_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  is_public: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface NewsroomSettingsProps {
  newsroom: Newsroom;
  onUpdate: () => void;
}

export function NewsroomSettings({ newsroom, onUpdate }: NewsroomSettingsProps) {
  const [saving, setSaving] = useState(false);
  const [togglingPublic, setTogglingPublic] = useState(false);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: newsroom.company_info.name,
      description: newsroom.company_info.description || "",
      website: newsroom.company_info.website || "",
      email: newsroom.company_info.email || "",
      phone: newsroom.company_info.phone || "",
      address: newsroom.company_info.address || "",
      founded_year: newsroom.company_info.founded_year,
      industry: newsroom.company_info.industry || "",
      employee_count: newsroom.company_info.employee_count || "",
      primary_color: newsroom.brand_colors.primary,
      secondary_color: newsroom.brand_colors.secondary,
      accent_color: newsroom.brand_colors.accent,
      is_public: newsroom.is_public,
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    setSaving(true);

    try {
      const updateData = {
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
        brand_colors: {
          primary: data.primary_color,
          secondary: data.secondary_color,
          accent: data.accent_color,
        },
        is_public: data.is_public,
      };

      await newsroomApi.update(updateData);
      toast.success("Newsroom settings updated successfully!");
      onUpdate();

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to update settings";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublic = async () => {
    setTogglingPublic(true);

    try {
      const response = await newsroomApi.togglePublic();
      toast.success(response.data.message);
      form.setValue("is_public", response.data.is_public);
      onUpdate();

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to toggle public status";
      toast.error(errorMessage);
    } finally {
      setTogglingPublic(false);
    }
  };

const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/newsroom/${newsroom._id}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Newsroom Settings</h2>
        <p className="text-muted-foreground">
          Manage your newsroom configuration and appearance
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>
              Update your company details displayed in the newsroom
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  disabled={saving}
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
                  disabled={saving}
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
                disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Business St, City, State, ZIP"
                {...form.register("address")}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee_count">Company Size</Label>
              <Input
                id="employee_count"
                placeholder="e.g., 11-50 employees"
                {...form.register("employee_count")}
                disabled={saving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Brand Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Brand Colors
            </CardTitle>
            <CardDescription>
              Customize your newsroom's color scheme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    className="w-16 h-10 p-1 border-2"
                    {...form.register("primary_color")}
                    disabled={saving}
                  />
                  <Input
                    value={form.watch("primary_color")}
                    onChange={(e) => form.setValue("primary_color", e.target.value)}
                    placeholder="#1f2937"
                    disabled={saving}
                  />
                </div>
                {form.formState.errors.primary_color && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.primary_color.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary_color">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary_color"
                    type="color"
                    className="w-16 h-10 p-1 border-2"
                    {...form.register("secondary_color")}
                    disabled={saving}
                  />
                  <Input
                    value={form.watch("secondary_color")}
                    onChange={(e) => form.setValue("secondary_color", e.target.value)}
                    placeholder="#6b7280"
                    disabled={saving}
                  />
                </div>
                {form.formState.errors.secondary_color && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.secondary_color.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accent_color">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accent_color"
                    type="color"
                    className="w-16 h-10 p-1 border-2"
                    {...form.register("accent_color")}
                    disabled={saving}
                  />
                  <Input
                    value={form.watch("accent_color")}
                    onChange={(e) => form.setValue("accent_color", e.target.value)}
                    placeholder="#3b82f6"
                    disabled={saving}
                  />
                </div>
                {form.formState.errors.accent_color && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.accent_color.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visibility Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {form.watch("is_public") ? (
                <Globe className="h-5 w-5" />
              ) : (
                <Lock className="h-5 w-5" />
              )}
              Visibility Settings
            </CardTitle>
            <CardDescription>
              Control who can access your newsroom
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Public Newsroom</div>
                <div className="text-sm text-muted-foreground">
                  Allow journalists and public to view your newsroom without login
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleTogglePublic}
                disabled={togglingPublic}
                className="min-w-[100px]"
              >
                {togglingPublic && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {form.watch("is_public") ? "Make Private" : "Make Public"}
              </Button>
            </div>

{form.watch("is_public") && newsroom?._id && (
  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <div className="flex items-center gap-2 mb-2">
      <Globe className="h-4 w-4 text-blue-600" />
      <span className="font-medium text-blue-900">Public URL</span>
    </div>
    <div className="text-sm text-blue-800 break-all">
      {`${typeof window !== 'undefined' ? window.location.origin : ''}/newsroom/${newsroom._id}/public`}
    </div>
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="mt-2"
      onClick={() => {
        const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/newsroom/${newsroom._id}/public`;
        navigator.clipboard.writeText(url);
        toast.success("Public URL copied to clipboard!");
      }}
    >
      Copy URL
    </Button>
  </div>
)}


            {!form.watch("is_public") && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-amber-900">Private Newsroom</span>
                </div>
                <p className="text-sm text-amber-800 mt-1">
                  Your newsroom is currently private and only accessible to you.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
