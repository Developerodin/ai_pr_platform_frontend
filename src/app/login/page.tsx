import { LoginForm } from "@/components/auth/login-form";
import { PublicRoute } from "@/components/auth/public-route";


export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            AI-Powered PR Platform
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Generate professional PR content with AI
          </p>
        </div>
        <PublicRoute>
        <LoginForm />
        </PublicRoute>
      </div>
    </div>
  );
}
