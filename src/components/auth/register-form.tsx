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
import { Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  company_name: z.string().min(2, "Company name must be at least 2 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      company_name: "",
    },
  });

const onSubmit = async (data: RegisterFormData) => {
  console.log("=== FRONTEND REGISTRATION DEBUG ===");
  console.log("Form data being sent:", data);
  console.log("Password length:", data.password.length);
  console.log("Password characters:", data.password.split('').map(c => c.charCodeAt(0)));
  
  setIsLoading(true);
  setError("");

  try {
    console.log("Calling register API...");
    const response = await authApi.register(data);
    console.log("Registration API response:", response);
    console.log("Response data:", response.data);
    
    const { access_token, user } = response.data;
    console.log("Token received:", access_token);
    console.log("User received:", user);

    // Store auth data
    localStorage.setItem('auth_token', access_token);
    localStorage.setItem('user_data', JSON.stringify(user));
    
    console.log("Token stored in localStorage:", localStorage.getItem('auth_token'));
    console.log("User stored in localStorage:", localStorage.getItem('user_data'));

    toast.success("Account created successfully! Welcome to the PR Platform.");
    
    console.log("About to redirect to dashboard...");
    router.push('/dashboard');
    console.log("Router.push called");
    
  } catch (err: any) {
    console.error("=== REGISTRATION ERROR ===");
    console.error("Full error:", err);
    console.error("Error response:", err.response);
    console.error("Error data:", err.response?.data);
    
    const errorMessage = err.response?.data?.detail || "Registration failed. Please try again.";
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
    console.log("=== REGISTRATION FINISHED ===");
  }
};

const testLocalStorage = () => {
  console.log("Current auth token:", localStorage.getItem('auth_token'));
  console.log("Current user data:", localStorage.getItem('user_data'));
  
  // Test manual redirect
  console.log("Testing manual redirect...");
  router.push('/dashboard');
};

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Enter your information to create your PR platform account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                placeholder="John"
                {...form.register("first_name")}
                disabled={isLoading}
              />
              {form.formState.errors.first_name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.first_name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                placeholder="Doe"
                {...form.register("last_name")}
                disabled={isLoading}
              />
              {form.formState.errors.last_name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              placeholder="Your Company Inc."
              {...form.register("company_name")}
              disabled={isLoading}
            />
            {form.formState.errors.company_name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.company_name.message}
              </p>
            )}
          </div>
          
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
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
<Button type="button" onClick={testLocalStorage} variant="outline" className="w-full">
  Test Storage & Redirect
</Button>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={() => router.push('/login')}
            disabled={isLoading}
          >
            Sign in
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
