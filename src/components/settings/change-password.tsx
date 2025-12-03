"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, CheckCircle } from "lucide-react";
import { profileApi } from "@/lib/api";
import { toast } from "sonner";
import type { ApiError } from "@/lib/types";

const passwordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export function ChangePassword() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data: PasswordFormData) => {
    setLoading(true);
    setSuccess(false);
    
    try {
      await profileApi.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      
      setSuccess(true);
      form.reset();
      toast.success("Password changed successfully!");
    } catch (error: unknown) {
      const errorMessage = (error as ApiError)?.response?.data?.detail || "Failed to change password";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Change Password
        </CardTitle>
        <CardDescription>
          Update your account password for better security
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your password has been changed successfully!
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">Current Password</Label>
            <Input
              id="current_password"
              type="password"
              {...form.register("current_password")}
              disabled={loading}
            />
            {form.formState.errors.current_password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.current_password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <Input
              id="new_password"
              type="password"
              {...form.register("new_password")}
              disabled={loading}
            />
            {form.formState.errors.new_password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.new_password.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Password must be at least 6 characters long
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <Input
              id="confirm_password"
              type="password"
              {...form.register("confirm_password")}
              disabled={loading}
            />
            {form.formState.errors.confirm_password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.confirm_password.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Change Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
