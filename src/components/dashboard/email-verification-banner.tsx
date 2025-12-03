"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Send, 
  Loader2, 
  X
} from "lucide-react";
import { profileApi } from "@/lib/api";
import { toast } from "sonner";

interface EmailVerificationBannerProps {
  user: {
    id: string;
    email: string;
    email_verified: boolean;
    first_name: string;
  };
  onVerified?: () => void;
}

export function EmailVerificationBanner({ user, onVerified }: EmailVerificationBannerProps) {
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (user.email_verified || dismissed) return null;

  const sendVerificationEmail = async () => {
    setSending(true);
    try {
      const response = await profileApi.sendVerification({ email: user.email });
      toast.success("Verification email sent!");
      
      if (response.data.debug_otp) {
        toast.info(`Debug: OTP is ${response.data.debug_otp}`, { duration: 8000 });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
      <div className="flex items-center gap-3">
        <Mail className="h-4 w-4 text-amber-600" />
        <div>
          <span className="text-sm font-medium text-amber-900">
            Please verify your email
          </span>
          <p className="text-xs text-amber-700">
            {user.email} • Check your inbox for verification code
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          onClick={sendVerificationEmail}
          disabled={sending}
          className="h-7 text-xs"
        >
          {sending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <Send className="mr-1 h-3 w-3" />
              Send Code
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="h-7 w-7 p-0 text-amber-600 hover:bg-amber-100"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
