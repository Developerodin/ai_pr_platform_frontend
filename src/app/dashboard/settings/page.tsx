"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Building,
  Mail,
  Sparkles,
  Shield,
  Bell,
  Loader2,
  Save,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { authApi, profileApi } from "@/lib/api";
import { User as UserType } from "@/lib/types";
import { toast } from "sonner";
import { EmailVerification } from "@/components/auth/email-verification";
import { ChangePassword } from "@/components/settings/change-password";

const profileSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  company_name: z.string().min(2, "Company name must be at least 2 characters"),
});

const preferencesSchema = z.object({
  default_tone: z.string().min(1, "Please select a tone"),
  email_signature: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PreferencesFormData = z.infer<typeof preferencesSchema>;

export default function SettingsPage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      company_name: "",
    },
  });

  const preferencesForm = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      default_tone: "professional",
      email_signature: "",
    },
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authApi.profile();
      const userData = response.data;
      
      setUser(userData);
      
      // Populate profile form
      profileForm.reset({
        first_name: userData.first_name,
        last_name: userData.last_name,
        company_name: userData.company_name,
      });

      // Populate preferences form
      preferencesForm.reset({
        default_tone: userData.preferences?.default_tone || "professional",
        email_signature: userData.preferences?.email_signature || "",
      });

    } catch (error: unknown) {
      console.error("Failed to load user profile:", error);
      toast.error("Failed to load profile information");
      
      // Fallback to localStorage data if API fails
      const localUserData = localStorage.getItem('user_data');
      if (localUserData) {
        const userData = JSON.parse(localUserData);
        setUser(userData);
        profileForm.reset({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          company_name: userData.company_name || "",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmitProfile = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      const response = await profileApi.updateProfile(data);
      
      // Update local user data
      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      toast.success("Profile updated successfully!");
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const onSubmitPreferences = async (data: PreferencesFormData) => {
    setSaving(true);
    try {
      const response = await profileApi.updatePreferences(data);
      
      // Update local preferences
      if (user) {
        const updatedUser = {
          ...user,
          preferences: response.data.preferences,
        };
        setUser(updatedUser);
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
      }
      
      toast.success("Preferences updated successfully!");
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to update preferences";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleEmailVerified = () => {
    // Reload user data after email verification
    loadUserProfile();
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

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Email Verification Alert */}
      {user && !user.email_verified && (
        <EmailVerification 
          email={user.email} 
          onVerified={handleEmailVerified}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Account
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal and company information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      {...profileForm.register("first_name")}
                      disabled={saving}
                    />
                    {profileForm.formState.errors.first_name && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.first_name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      {...profileForm.register("last_name")}
                      disabled={saving}
                    />
                    {profileForm.formState.errors.last_name && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.last_name.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    {...profileForm.register("company_name")}
                    disabled={saving}
                  />
                  {profileForm.formState.errors.company_name && (
                    <p className="text-sm text-destructive">
                      {profileForm.formState.errors.company_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled={true}
                    />
                    {user?.email_verified ? (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email address cannot be changed. Contact support if needed.
                  </p>
                </div>

                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Preferences
              </CardTitle>
              <CardDescription>
                Customize how AI generates your PR content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={preferencesForm.handleSubmit(onSubmitPreferences)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default_tone">Default Tone</Label>
                  <Select
                    value={preferencesForm.watch("default_tone")}
                    onValueChange={(value) => preferencesForm.setValue("default_tone", value)}
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select default tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="authoritative">Authoritative</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    This tone will be used by default when generating PR content
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email_signature">Email Signature</Label>
                  <Textarea
                    id="email_signature"
                    rows={4}
                    placeholder="Best regards,&#10;Your Name&#10;Your Company&#10;Phone: +1234567890&#10;Website: yourcompany.com"
                    {...preferencesForm.register("email_signature")}
                    disabled={saving}
                  />
                  <p className="text-xs text-muted-foreground">
                    This signature will be automatically added to your email campaigns
                  </p>
                </div>

                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <ChangePassword />
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                View your account details and subscription information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <Badge variant={user?.status === 'active' ? 'default' : 'secondary'}>
                    {user?.status?.toUpperCase() || 'ACTIVE'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>Subscription Plan</Label>
                  <Badge variant={user?.plan === 'pro' ? 'default' : 'secondary'}>
                    {user?.plan?.toUpperCase() || 'FREE'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Credits Remaining</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={user && user.credits_remaining < 20 ? 'destructive' : 'outline'}>
                      {user?.credits_remaining || 0} credits
                    </Badge>
                    {user && user.credits_remaining < 20 && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <p className="text-sm text-muted-foreground">
                    {user?.created_at ? formatDate(user.created_at) : 'Unknown'}
                  </p>
                </div>
              </div>

              {user?.last_login && (
                <div className="space-y-2">
                  <Label>Last Login</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(user.last_login)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
