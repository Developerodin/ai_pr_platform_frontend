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
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Shield, CheckCircle } from "lucide-react";
import { profileApi } from "@/lib/api";
import { toast } from "sonner";
import type { ApiError } from "@/lib/types";

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

type OTPFormData = z.infer<typeof otpSchema>;

interface EmailVerificationProps {
  email: string;
  onVerified?: () => void;
}

export function EmailVerification({ email, onVerified }: EmailVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [expiresIn, setExpiresIn] = useState(0);
  const [verified, setVerified] = useState(false);

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const sendVerificationEmail = async () => {
    setSending(true);
    try {
      const response = await profileApi.sendVerification({ email });
      setOtpSent(true);
      setExpiresIn(response.data.expires_in);
      toast.success("Verification code sent to your email!");
      
      // Show debug OTP in development
      if (response.data.debug_otp) {
        toast.info(`Debug: OTP is ${response.data.debug_otp}`, { duration: 10000 });
      }
    } catch (error: unknown) {
      const errorMessage = (error as ApiError)?.response?.data?.detail || "Failed to send verification code";
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const verifyOTP = async (data: OTPFormData) => {
    setLoading(true);
    try {
      await profileApi.verifyEmail({ email, otp: data.otp });
      setVerified(true);
      toast.success("Email verified successfully!");
      onVerified?.();
    } catch (error: unknown) {
      const errorMessage = (error as ApiError)?.response?.data?.detail || "Invalid verification code";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center gap-3 pt-6">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <h3 className="font-medium text-green-900">Email Verified!</h3>
            <p className="text-sm text-green-700">Your email has been successfully verified.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-900">
          <Mail className="h-5 w-5" />
          Email Verification Required
        </CardTitle>
        <CardDescription className="text-yellow-700">
          Please verify your email address to activate your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!otpSent ? (
          <div className="space-y-3">
            <p className="text-sm text-yellow-700">
              Click the button below to send a verification code to <strong>{email}</strong>
            </p>
            <Button onClick={sendVerificationEmail} disabled={sending} className="w-full">
              {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Verification Code
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                A 6-digit verification code has been sent to <strong>{email}</strong>.
                The code expires in 10 minutes.
              </AlertDescription>
            </Alert>

            <form onSubmit={form.handleSubmit(verifyOTP)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  placeholder="123456"
                  maxLength={6}
                  {...form.register("otp")}
                  disabled={loading}
                  className="text-center text-lg font-mono"
                />
                {form.formState.errors.otp && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify Email
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={sendVerificationEmail}
                  disabled={sending}
                >
                  Resend
                </Button>
              </div>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
