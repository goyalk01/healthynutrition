"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-gradient-to-br from-cyan-600 via-teal-500 to-emerald-500 p-12 text-white lg:block">
        <h1 className="text-4xl font-bold">Build Better Food Habits</h1>
        <p className="mt-4 max-w-md text-cyan-50">
          NutriSense helps you track meals, habits, and AI-driven recommendations in one place.
        </p>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
          <h2 className="text-2xl font-semibold">Create your account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Start your personalized health journey.</p>
          <div className="mt-6">
            <RegisterForm
              submitting={register.isPending}
              onSubmit={async (values) => {
                try {
                  await register.mutateAsync(values);
                  router.push("/dashboard");
                } catch (error) {
                  const message =
                    error instanceof Error ? error.message : "Registration failed. Please try again.";
                  toast.error(message);
                }
              }}
            />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
