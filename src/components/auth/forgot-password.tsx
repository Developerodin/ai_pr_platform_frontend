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
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { profileApi } from "@/lib/api";
import { toast } from "sonner";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetSchema = z.object({
  reset_code: z.string().min(6, "Reset code must be 6 digits").max(6, "Reset code must be 6 digits"),
  new_password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type EmailFormData = z.infer<typeof emailSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

interface ForgotPasswordProps {
  onBackToLogin?: () => void;
  onPasswordReset?: () => void;
}

export function ForgotPassword({ onBackToLogin, onPasswordReset }: ForgotPasswordProps) {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      reset_code: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const sendResetCode = async (data: EmailFormData) => {
    setLoading(true);
    try {
      const response = await profileApi.forgotPassword({ email: data.email });
      setEmail(data.email);
      setStep('reset');
      toast.success("Reset code sent to your email!");
      
      // Show debug code in development
      if (response.data.debug_code) {
        toast.info(`Debug: Reset code is ${response.data.debug_code}`, { duration: 10000 });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to send reset code";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (data: ResetFormData) => {
    setLoading(true);
    try {
      await profileApi.resetPassword({
        email,
        reset_code: data.reset_code,
        new_password: data.new_password,
      });
      toast.success("Password reset successfully!");
      onPasswordReset?.();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to reset password";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {step === 'email' ? 'Forgot Password' : 'Reset Password'}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 'email' 
              ? 'Enter your email address to receive a reset code'
              : 'Enter the 6-digit code sent to your email'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'email' ? (
            <form onSubmit={emailForm.handleSubmit(sendResetCode)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your-email@company.com"
                  {...emailForm.register("email")}
                  disabled={loading}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Mail className="mr-2 h-4 w-4" />
                Send Reset Code
              </Button>
            </form>
          ) : (
            <form onSubmit={resetForm.handleSubmit(resetPassword)} className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Reset code sent to <strong>{email}</strong>. The code expires in 15 minutes.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="reset_code">Reset Code</Label>
                <Input
                  id="reset_code"
                  placeholder="123456"
                  maxLength={6}
                  {...resetForm.register("reset_code")}
                  disabled={loading}
                  className="text-center text-lg font-mono"
                />
                {resetForm.formState.errors.reset_code && (
                  <p className="text-sm text-destructive">
                    {resetForm.formState.errors.reset_code.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  {...resetForm.register("new_password")}
                  disabled={loading}
                />
                {resetForm.formState.errors.new_password && (
                  <p className="text-sm text-destructive">
                    {resetForm.formState.errors.new_password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  {...resetForm.register("confirm_password")}
                  disabled={loading}
                />
                {resetForm.formState.errors.confirm_password && (
                  <p className="text-sm text-destructive">
                    {resetForm.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep('email')}
                  disabled={loading}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reset Password
                </Button>
              </div>
            </form>
          )}

          {onBackToLogin && (
            <Button 
              variant="ghost" 
              onClick={onBackToLogin}
              disabled={loading}
              className="w-full"
            >
              Back to Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
