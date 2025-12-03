"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { authApi, profileApi } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from '@/contexts/auth-context';

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetPasswordSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "OTP must contain only numbers"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

type Step = 'login' | 'forgot-password' | 'verify-otp' | 'success';

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState<Step>('login');
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetPasswordForm = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError("");

    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
    } catch (err: any) {
      console.error("❌ Login error:", err);
      const errorMessage = err.response?.data?.detail || "Login failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotPasswordSubmit = async (data: ForgotPasswordData) => {
    setIsLoading(true);
    setError("");

    try {
      await profileApi.forgotPassword({ email: data.email });
      setResetEmail(data.email);
      setCurrentStep('verify-otp');
      toast.success("OTP sent to your email!");
    } catch (err: any) {
      console.error("❌ Forgot password error:", err);
      const errorMessage = err.response?.data?.detail || "Failed to send OTP. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPasswordSubmit = async (data: ResetPasswordData) => {
    setIsLoading(true);
    setError("");

    try {
      await profileApi.resetPassword({
        email: resetEmail,
        reset_code: data.otp,
        new_password: data.newPassword,
      });
      setCurrentStep('success');
      toast.success("Password reset successfully!");
    } catch (err: any) {
      console.error("❌ Reset password error:", err);
      const errorMessage = err.response?.data?.detail || "Invalid OTP or failed to reset password. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToLogin = () => {
    setCurrentStep('login');
    setError("");
    setResetEmail("");
    forgotPasswordForm.reset();
    resetPasswordForm.reset();
  };

  const resendOTP = async () => {
    if (!resetEmail) return;
    
    setIsLoading(true);
    try {
      await profileApi.forgotPassword({ email: resetEmail });
      toast.success("New OTP sent to your email!");
    } catch (err: any) {
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Login Form
  if (currentStep === 'login') {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>
            Enter your email and password to access your PR platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                {...form.register("email")}
                disabled={isLoading}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm font-normal text-muted-foreground hover:text-primary"
                  onClick={() => setCurrentStep('forgot-password')}
                  disabled={isLoading}
                  type="button"
                >
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...form.register("password")}
                disabled={isLoading}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => router.push('/register')}
              disabled={isLoading}
            >
              Sign up
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  // Forgot Password Form
  if (currentStep === 'forgot-password') {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a 6-digit OTP to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="name@company.com"
                {...forgotPasswordForm.register("email")}
                disabled={isLoading}
              />
              {forgotPasswordForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {forgotPasswordForm.formState.errors.email.message}
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send OTP
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            variant="ghost"
            className="w-full"
            onClick={resetToLogin}
            disabled={isLoading}
          >
            ← Back to Sign In
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Verify OTP and Set New Password
  if (currentStep === 'verify-otp') {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter the 6-digit OTP sent to <strong>{resetEmail}</strong> and create a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">6-Digit OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                maxLength={6}
                {...resetPasswordForm.register("otp")}
                disabled={isLoading}
                className="text-center text-lg tracking-widest"
              />
              {resetPasswordForm.formState.errors.otp && (
                <p className="text-sm text-destructive">
                  {resetPasswordForm.formState.errors.otp.message}
                </p>
              )}
              <div className="text-center">
                <Button
                  variant="link"
                  className="text-sm text-muted-foreground hover:text-primary"
                  onClick={resendOTP}
                  disabled={isLoading}
                  type="button"
                >
                  Didn't receive OTP? Resend
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  {...resetPasswordForm.register("newPassword")}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {resetPasswordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {resetPasswordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...resetPasswordForm.register("confirmPassword")}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {resetPasswordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {resetPasswordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            variant="ghost"
            className="w-full"
            onClick={resetToLogin}
            disabled={isLoading}
          >
            ← Back to Sign In
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Success State
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Password Reset Successful</CardTitle>
        <CardDescription>
          Your password has been successfully reset. You can now sign in with your new password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-muted-foreground">
            Your password has been updated successfully. Please sign in with your new password.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={resetToLogin}
        >
          Sign In Now
        </Button>
      </CardFooter>
    </Card>
  );
}
